'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Paper, Typography, CircularProgress } from '@mui/material'
import dynamic from 'next/dynamic'
import type { 
  ExcalidrawImperativeAPI,
  ExcalidrawElement,
  AppState,
  BinaryFiles
} from '@excalidraw/excalidraw/types'
import '@excalidraw/excalidraw/index.css'

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress />
      </Box>
    ),
  }
)


interface ExcalidrawWhiteboardProps {
  sessionId: string
  currentUser: any
  onCanvasOperation?: (operation: any) => void
  onSendCanvasOperation?: (operation: any) => void
}

interface ExcalidrawSceneData {
  elements: ExcalidrawElement[]
  appState: Partial<AppState>
  files?: BinaryFiles
}

export default function ExcalidrawWhiteboard({ 
  sessionId, 
  currentUser, 
  onCanvasOperation,
  onSendCanvasOperation 
}: ExcalidrawWhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [collaborators, setCollaborators] = useState<Map<string, any>>(new Map())
  const lastSceneVersion = useRef<number>(0)
  const isRemoteUpdate = useRef(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Handle incoming canvas operations from other users
  const handleRemoteCanvasOperation = useCallback((operation: any) => {
    if (operation.user_id === currentUser?.id || !excalidrawAPI) {
      return // Don't apply our own operations
    }

    isRemoteUpdate.current = true

    switch (operation.operation_type) {
      case 'excalidraw_update':
        const sceneData = operation.data as ExcalidrawSceneData
        
        // Update the Excalidraw scene with remote changes
        excalidrawAPI.updateScene({
          elements: sceneData.elements,
          appState: sceneData.appState,
          collaborators: collaborators
        })
        
        lastSceneVersion.current = Date.now()
        break
      
      case 'clear':
        if (operation.data.action === 'clear_all') {
          excalidrawAPI.resetScene()
          lastSceneVersion.current = Date.now()
        }
        break
        
      // Handle legacy text operations from old whiteboard
      case 'text_update':
        const element = operation.data.element
        if (element && element.text) {
          // Convert old text element to Excalidraw text element
          const newTextElement: ExcalidrawElement = {
            id: element.id || `text_${Date.now()}`,
            type: 'text',
            x: element.x || 100,
            y: element.y || 100,
            width: 200,
            height: 50,
            angle: 0,
            strokeColor: element.style?.color || '#000000',
            backgroundColor: 'transparent',
            fillStyle: 'hachure',
            strokeWidth: 1,
            strokeStyle: 'solid',
            roughness: 1,
            opacity: 100,
            text: element.text,
            fontSize: element.style?.fontSize || 20,
            fontFamily: 1,
            textAlign: 'left',
            verticalAlign: 'top',
            baseline: 0,
            isDeleted: false,
            boundElements: null,
            updated: Date.now(),
            link: null,
            locked: false,
            versionNonce: 0,
            seed: Math.floor(Math.random() * 2 ** 31)
          }
          
          const currentElements = excalidrawAPI.getSceneElements()
          excalidrawAPI.updateScene({
            elements: [...currentElements, newTextElement]
          })
        }
        break
    }

    isRemoteUpdate.current = false
  }, [currentUser?.id, excalidrawAPI, collaborators])

  useEffect(() => {
    if (onCanvasOperation) {
      onCanvasOperation(handleRemoteCanvasOperation)
    }
  }, [onCanvasOperation, handleRemoteCanvasOperation])

  // Load existing canvas operations when component mounts
  useEffect(() => {
    const loadCanvasOperations = async () => {
      if (!excalidrawAPI) return

      try {
        const { SessionService } = await import('@/services/sessionService')
        const operations = await SessionService.getCanvasOperations(sessionId, 0)
        
        // Find the most recent excalidraw_update operation
        let latestScene: ExcalidrawSceneData | null = null
        
        if (operations && Array.isArray(operations)) {
          for (const op of operations.reverse()) {
            if (op.operation_type === 'excalidraw_update' && op.operation_data) {
              try {
                const data = typeof op.operation_data === 'string' 
                  ? JSON.parse(op.operation_data) 
                  : op.operation_data
                
                if (data.elements) {
                  latestScene = data
                  break
                }
              } catch (err) {
                console.warn('Failed to parse canvas operation:', err)
              }
            }
          }
        }
        
        if (latestScene) {
          isRemoteUpdate.current = true
          excalidrawAPI.updateScene({
            elements: latestScene.elements,
            appState: latestScene.appState || {}
          })
          isRemoteUpdate.current = false
          lastSceneVersion.current = Date.now()
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load canvas operations:', err)
        setIsLoading(false)
      }
    }

    loadCanvasOperations()
  }, [sessionId, excalidrawAPI])

  // Handle local changes and broadcast them
  const handleChange = useCallback((
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    // Skip if this is a remote update or no real changes
    if (isRemoteUpdate.current || !excalidrawAPI) {
      return
    }

    // Debounce updates to avoid overwhelming the server
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(async () => {
      const sceneData: ExcalidrawSceneData = {
        elements: elements as ExcalidrawElement[],
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemFontFamily: appState.currentItemFontFamily,
          currentItemFontSize: appState.currentItemFontSize,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
          currentItemFillStyle: appState.currentItemFillStyle,
          currentItemStrokeWidth: appState.currentItemStrokeWidth,
          currentItemStrokeStyle: appState.currentItemStrokeStyle,
          currentItemRoughness: appState.currentItemRoughness,
          currentItemOpacity: appState.currentItemOpacity,
          currentItemTextAlign: appState.currentItemTextAlign,
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY
        },
        files: files
      }

      // Save to backend for persistence
      try {
        const { SessionService } = await import('@/services/sessionService')
        await SessionService.saveCanvasOperation(sessionId, {
          operation_type: 'excalidraw_update',
          operation_data: sceneData
        })
      } catch (err) {
        console.error('Failed to save canvas operation:', err)
      }
      
      // Send canvas operation via WebSocket for real-time updates
      if (onSendCanvasOperation) {
        onSendCanvasOperation({
          operation_type: 'excalidraw_update',
          data: sceneData
        })
      }
      
      lastSceneVersion.current = Date.now()
    }, 500) // 500ms debounce
  }, [sessionId, onSendCanvasOperation, excalidrawAPI])

  return (
    <Box 
      sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        '& .excalidraw': {
          height: '100%',
          width: '100%'
        },
        '& .excalidraw-container': {
          height: '100%',
          width: '100%'
        },
        '& .excalidraw__canvas': {
          touchAction: 'pan-x pan-y pinch-zoom'
        },
        '& .excalidraw .Island > button:empty': {
          display: 'none !important'
        },
        '& .excalidraw .Island > div:empty': {
          display: 'none !important'
        },
        '& .excalidraw .excalidraw-top-right-ui': {
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        },
        '& .excalidraw .collaboration-button': {
          margin: '0 !important'
        }
      }}
    >
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={handleChange}
        viewModeEnabled={false}
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme="light"
        name="Language Exchange Whiteboard"
        isCollaborating={true}
        detectScroll={false}
        handleKeyboardGlobally={true}
        autoFocus={true}
        UIOptions={{
          canvasActions: {
            export: {
              saveFileToDisk: true
            }
          }
        }}
        initialData={{
          appState: {
            viewBackgroundColor: "#ffffff",
            zoom: { value: 1 },
            scrollX: 0,
            scrollY: 0
          },
          scrollToContent: false
        }}
        renderTopRightUI={() => 
          collaborators.size > 0 ? (
            <Box sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              px: 1.5,
              py: 0.25,
              borderRadius: 0.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              mr: 1
            }}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, fontSize: '0.7rem' }}>
                {collaborators.size + 1} users
              </Typography>
            </Box>
          ) : null
        }
      />
    </Box>
  )
}