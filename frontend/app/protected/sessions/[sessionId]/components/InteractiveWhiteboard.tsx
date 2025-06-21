'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  Tooltip,
  ButtonGroup,
  Slider,
  Popover,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import {
  Create as PenIcon,
  TextFields as TextIcon,
  Palette as ColorIcon,
  Clear as ClearIcon,
  FormatSize as FontSizeIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon
} from '@mui/icons-material'

interface InteractiveWhiteboardProps {
  sessionId: string
  currentUser: any
  onCanvasOperation?: (operation: any) => void
  onSendCanvasOperation?: (operation: any) => void
}

interface TextElement {
  id: string
  x: number
  y: number
  text: string
  style: {
    fontSize: number
    fontFamily: string
    color: string
    bold: boolean
    italic: boolean
    underline: boolean
  }
  userId: string
  isEditing?: boolean
}

interface Tool {
  type: 'text' | 'pen'
  color: string
  fontSize: number
  bold: boolean
  italic: boolean
  underline: boolean
}

const COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
]

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 84, 96]
const QUICK_FONT_SIZES = [
  { label: 'Small', value: 14 },
  { label: 'Normal', value: 18 },
  { label: 'Large', value: 24 },
  { label: 'XL', value: 32 },
  { label: 'XXL', value: 48 }
]

export default function InteractiveWhiteboard({ 
  sessionId, 
  currentUser, 
  onCanvasOperation,
  onSendCanvasOperation 
}: InteractiveWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [tool, setTool] = useState<Tool>({
    type: 'text',
    color: '#000000',
    fontSize: 18,
    bold: false,
    italic: false,
    underline: false
  })
  
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [remoteTextElements, setRemoteTextElements] = useState<TextElement[]>([])
  const [currentText, setCurrentText] = useState<TextElement | null>(null)
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null)
  const [sizeAnchor, setSizeAnchor] = useState<HTMLElement | null>(null)

  // Handle incoming canvas operations from other users
  const handleRemoteCanvasOperation = useCallback((operation: any) => {
    if (operation.user_id === currentUser?.id) {
      return // Don't apply our own operations
    }

    switch (operation.operation_type) {
      case 'text_update':
        const element = operation.data.element
        if (operation.data.action === 'create_or_update') {
          setRemoteTextElements(prev => {
            const existing = prev.find(el => el.id === element.id)
            if (existing) {
              return prev.map(el => el.id === element.id ? element : el)
            } else {
              return [...prev, element]
            }
          })
        }
        break
      
      case 'clear':
        if (operation.data.action === 'clear_all') {
          setTextElements([])
          setRemoteTextElements([])
          setCurrentText(null)
        }
        break
    }
  }, [currentUser?.id])

  useEffect(() => {
    if (onCanvasOperation) {
      onCanvasOperation(handleRemoteCanvasOperation)
    }
  }, [onCanvasOperation, handleRemoteCanvasOperation])

  // Load existing canvas operations when component mounts
  useEffect(() => {
    const loadCanvasOperations = async () => {
      try {
        const { SessionService } = await import('@/services/sessionService')
        const operations = await SessionService.getCanvasOperations(sessionId, 0)
        
        // Convert canvas operations to text elements
        const loadedElements: TextElement[] = []
        if (operations && Array.isArray(operations)) {
          operations.forEach(op => {
            if (op.operation_type === 'text' && op.operation_data) {
              try {
                const data = typeof op.operation_data === 'string' 
                  ? JSON.parse(op.operation_data) 
                  : op.operation_data
                
                if (data.element) {
                  loadedElements.push({
                    ...data.element,
                    userId: op.user_id,
                    isEditing: false
                  })
                }
              } catch (err) {
                console.warn('Failed to parse canvas operation:', err)
              }
            }
          })
        }
        
        setRemoteTextElements(loadedElements)
      } catch (err) {
        console.error('Failed to load canvas operations:', err)
      }
    }

    loadCanvasOperations()
  }, [sessionId])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      // Set actual canvas size in memory (scaled for high-DPI)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // Set display size (CSS pixels)
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      
      // Scale the drawing context to match device pixel ratio
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
      
      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [textElements, remoteTextElements])

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Clear canvas with proper scaling
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Enable high-quality text rendering
    ctx.textAlign = 'start'
    ctx.textBaseline = 'top'
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw all text elements (local and remote)
    const allElements = [...textElements, ...remoteTextElements]
    allElements.forEach(element => {
      if (element.isEditing) return // Skip elements being edited

      // Set font with proper scaling for crisp text
      const fontSize = element.style.fontSize
      ctx.font = `${element.style.italic ? 'italic ' : ''}${element.style.bold ? 'bold ' : ''}${fontSize}px ${element.style.fontFamily}`
      ctx.fillStyle = element.style.color

      const lines = element.text.split('\n')
      lines.forEach((line, index) => {
        const y = element.y + (index * fontSize * 1.2)
        
        // Use subpixel positioning for crisp text
        const x = Math.round(element.x)
        const yPos = Math.round(y)
        
        ctx.fillText(line, x, yPos)
        
        // Draw underline if needed
        if (element.style.underline) {
          const textWidth = ctx.measureText(line).width
          ctx.strokeStyle = element.style.color
          ctx.lineWidth = Math.max(1, fontSize * 0.05) // Scale line width with font size
          ctx.beginPath()
          ctx.moveTo(x, yPos + fontSize)
          ctx.lineTo(x + textWidth, yPos + fontSize)
          ctx.stroke()
        }
      })
    })
  }, [textElements, remoteTextElements])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool.type !== 'text') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Calculate position in CSS pixels (not canvas pixels)
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if clicking on existing text
    const clickedElement = textElements.find(element => {
      const elementWidth = element.text.length * element.style.fontSize * 0.6 // Rough estimate
      const elementHeight = element.style.fontSize * 1.2
      return x >= element.x && x <= element.x + elementWidth &&
             y >= element.y && y <= element.y + elementHeight
    })

    if (clickedElement) {
      // Edit existing text
      startEditingText(clickedElement)
    } else {
      // Create new text
      createNewText(x, y)
    }
  }

  const createNewText = (x: number, y: number) => {
    const newText: TextElement = {
      id: `text_${Date.now()}_${Math.random()}`,
      x,
      y,
      text: '',
      style: {
        fontSize: tool.fontSize,
        fontFamily: 'Arial, sans-serif',
        color: tool.color,
        bold: tool.bold,
        italic: tool.italic,
        underline: tool.underline
      },
      userId: currentUser?.id || 'unknown',
      isEditing: true
    }

    setCurrentText(newText)
    setTextElements(prev => [...prev, newText])
    
    // Focus the input after a short delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 10)
  }

  const startEditingText = (element: TextElement) => {
    const updatedElements = textElements.map(el => 
      el.id === element.id ? { ...el, isEditing: true } : el
    )
    setTextElements(updatedElements)
    setCurrentText({ ...element, isEditing: true })
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = element.text
        inputRef.current.focus()
      }
    }, 10)
  }

  const handleTextInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentText) return

    const updatedText = { ...currentText, text: event.target.value }
    setCurrentText(updatedText)
    
    const updatedElements = textElements.map(el => 
      el.id === updatedText.id ? updatedText : el
    )
    setTextElements(updatedElements)
  }

  const handleTextInputBlur = async () => {
    if (!currentText) return

    const finalText = { ...currentText, isEditing: false }
    
    if (finalText.text.trim() === '') {
      // Remove empty text elements
      setTextElements(prev => prev.filter(el => el.id !== finalText.id))
    } else {
      // Update the text element
      setTextElements(prev => prev.map(el => 
        el.id === finalText.id ? finalText : el
      ))
      
      // Save to backend for persistence
      try {
        const { SessionService } = await import('@/services/sessionService')
        await SessionService.saveCanvasOperation(sessionId, {
          operation_type: 'text',
          operation_data: {
            element: finalText,
            action: 'create_or_update'
          }
        })
      } catch (err) {
        console.error('Failed to save canvas operation:', err)
      }
      
      // Send canvas operation via WebSocket for real-time updates
      if (onSendCanvasOperation) {
        onSendCanvasOperation({
          operation_type: 'text_update',
          data: {
            element: finalText,
            action: 'create_or_update'
          }
        })
      }
    }
    
    setCurrentText(null)
  }

  const handleTextInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (inputRef.current) {
        inputRef.current.blur()
      }
    } else if (event.key === 'Escape') {
      // Cancel editing
      if (currentText) {
        if (currentText.text.trim() === '') {
          setTextElements(prev => prev.filter(el => el.id !== currentText.id))
        } else {
          setTextElements(prev => prev.map(el => 
            el.id === currentText.id ? { ...el, isEditing: false } : el
          ))
        }
        setCurrentText(null)
      }
    }
  }

  const clearCanvas = async () => {
    if (confirm('Are you sure you want to clear the whiteboard?')) {
      setTextElements([])
      setRemoteTextElements([])
      setCurrentText(null)
      redrawCanvas()
      
      // Save clear operation to backend
      try {
        const { SessionService } = await import('@/services/sessionService')
        await SessionService.saveCanvasOperation(sessionId, {
          operation_type: 'clear',
          operation_data: {
            action: 'clear_all'
          }
        })
      } catch (err) {
        console.error('Failed to save clear operation:', err)
      }
      
      // Send clear operation via WebSocket for real-time updates
      if (onSendCanvasOperation) {
        onSendCanvasOperation({
          operation_type: 'clear',
          data: {
            action: 'clear_all'
          }
        })
      }
    }
  }

  const handleToolChange = (newTool: 'text' | 'pen') => {
    setTool(prev => ({ ...prev, type: newTool }))
  }

  const handleColorChange = (color: string) => {
    setTool(prev => ({ ...prev, color }))
    setColorAnchor(null)
  }

  const handleFontSizeChange = (fontSize: number) => {
    setTool(prev => ({ ...prev, fontSize }))
    setSizeAnchor(null)
  }

  const toggleTextStyle = (style: 'bold' | 'italic' | 'underline') => {
    setTool(prev => ({ ...prev, [style]: !prev[style] }))
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(30, 30, 30, 0.9)',
          borderRadius: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: '48px', gap: 1 }}>
          {/* Tool Selection */}
          <ToggleButtonGroup
            value={tool.type}
            exclusive
            onChange={(_, value) => value && handleToolChange(value)}
            size="small"
          >
            <ToggleButton value="text" sx={{ color: 'white' }}>
              <TextIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="pen" sx={{ color: 'white' }} disabled>
              <PenIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', mx: 1 }} />

          {/* Color Picker */}
          <Tooltip title="Text Color">
            <IconButton 
              size="small" 
              onClick={(e) => setColorAnchor(e.currentTarget)}
              sx={{ color: 'white' }}
            >
              <ColorIcon fontSize="small" />
              <Box 
                sx={{ 
                  width: 4, 
                  height: 4, 
                  backgroundColor: tool.color, 
                  borderRadius: '50%',
                  position: 'absolute',
                  bottom: 2,
                  right: 2
                }} 
              />
            </IconButton>
          </Tooltip>

          {/* Font Size */}
          <Tooltip title="Font Size">
            <IconButton 
              size="small" 
              onClick={(e) => setSizeAnchor(e.currentTarget)}
              sx={{ color: 'white' }}
            >
              <FontSizeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box 
            sx={{ 
              px: 1,
              py: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 0.5,
              minWidth: 40,
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
              {tool.fontSize}px
            </Typography>
          </Box>

          <Box sx={{ width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', mx: 1 }} />

          {/* Text Formatting */}
          <ToggleButtonGroup size="small">
            <ToggleButton 
              value="bold" 
              selected={tool.bold}
              onChange={() => toggleTextStyle('bold')}
              sx={{ color: 'white' }}
            >
              <BoldIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton 
              value="italic" 
              selected={tool.italic}
              onChange={() => toggleTextStyle('italic')}
              sx={{ color: 'white' }}
            >
              <ItalicIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton 
              value="underline" 
              selected={tool.underline}
              onChange={() => toggleTextStyle('underline')}
              sx={{ color: 'white' }}
            >
              <UnderlineIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ flexGrow: 1 }} />

          {/* Clear Button */}
          <Tooltip title="Clear Whiteboard">
            <IconButton 
              size="small" 
              onClick={clearCanvas}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>

      {/* Canvas Container */}
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          position: 'relative',
          backgroundColor: '#ffffff',
          overflow: 'hidden'
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            width: '100%',
            height: '100%',
            cursor: tool.type === 'text' ? 'text' : 'crosshair'
          }}
        />

        {/* Text Input Overlay */}
        {currentText && (
          <input
            ref={inputRef}
            type="text"
            value={currentText.text}
            onChange={handleTextInput}
            onBlur={handleTextInputBlur}
            onKeyDown={handleTextInputKeyDown}
            style={{
              position: 'absolute',
              left: currentText.x,
              top: currentText.y,
              border: '1px dashed #999',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              fontSize: `${currentText.style.fontSize}px`,
              fontFamily: currentText.style.fontFamily,
              fontWeight: currentText.style.bold ? 'bold' : 'normal',
              fontStyle: currentText.style.italic ? 'italic' : 'normal',
              textDecoration: currentText.style.underline ? 'underline' : 'none',
              color: currentText.style.color,
              outline: 'none',
              minWidth: '100px',
              zIndex: 10
            }}
            placeholder="Type here..."
          />
        )}
      </Box>

      {/* Color Popover */}
      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5 }}>
          {COLORS.map((color) => (
            <IconButton
              key={color}
              onClick={() => handleColorChange(color)}
              sx={{
                width: 32,
                height: 32,
                backgroundColor: color,
                border: '1px solid #ccc',
                '&:hover': { transform: 'scale(1.1)' }
              }}
            />
          ))}
        </Box>
      </Popover>

      {/* Font Size Popover */}
      <Popover
        open={Boolean(sizeAnchor)}
        anchorEl={sizeAnchor}
        onClose={() => setSizeAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Font Size: {tool.fontSize}px
          </Typography>
          
          {/* Quick Size Buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
              Quick Sizes
            </Typography>
            <ButtonGroup variant="outlined" size="small" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {QUICK_FONT_SIZES.map((size) => (
                <IconButton
                  key={size.value}
                  onClick={() => handleFontSizeChange(size.value)}
                  sx={{
                    minWidth: 50,
                    height: 32,
                    fontSize: '0.75rem',
                    fontWeight: tool.fontSize === size.value ? 600 : 400,
                    backgroundColor: tool.fontSize === size.value ? 'primary.main' : 'transparent',
                    color: tool.fontSize === size.value ? 'primary.contrastText' : 'text.primary',
                    border: '1px solid',
                    borderColor: tool.fontSize === size.value ? 'primary.main' : 'divider',
                    '&:hover': {
                      backgroundColor: tool.fontSize === size.value ? 'primary.dark' : 'action.hover',
                    }
                  }}
                >
                  {size.label}
                </IconButton>
              ))}
            </ButtonGroup>
          </Box>

          {/* Custom Size Slider */}
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
              Custom Size
            </Typography>
            <Slider
              value={tool.fontSize}
              onChange={(_, value) => setTool(prev => ({ ...prev, fontSize: value as number }))}
              onChangeCommitted={(_, value) => handleFontSizeChange(value as number)}
              min={10}
              max={96}
              step={2}
              marks={[
                { value: 10, label: '10' },
                { value: 18, label: '18' },
                { value: 32, label: '32' },
                { value: 48, label: '48' },
                { value: 72, label: '72' },
                { value: 96, label: '96' }
              ]}
              valueLabelDisplay="auto"
              sx={{
                color: 'primary.main',
                '& .MuiSlider-markLabel': {
                  fontSize: '0.65rem'
                }
              }}
            />
          </Box>

          {/* Preview Text */}
          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
            <Typography 
              sx={{ 
                fontSize: `${Math.min(tool.fontSize, 24)}px`,
                fontWeight: tool.bold ? 'bold' : 'normal',
                fontStyle: tool.italic ? 'italic' : 'normal',
                textDecoration: tool.underline ? 'underline' : 'none',
                color: tool.color,
                lineHeight: 1.2
              }}
            >
              Preview Text
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              {tool.fontSize}px sample
            </Typography>
          </Box>
        </Box>
      </Popover>
    </Box>
  )
}