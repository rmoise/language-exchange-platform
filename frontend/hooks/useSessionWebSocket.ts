"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface CanvasOperation {
  operation_type: 'text' | 'draw' | 'erase' | 'clear' | 'move' | 'delete' | 'excalidraw_update' | 'text_update';
  data: any;
  user_id?: string;
}

interface SessionMessage {
  content: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
  };
}

interface UseSessionWebSocketProps {
  sessionId: string;
  currentUser: any;
  onCanvasOperation?: (operation: CanvasOperation) => void;
  onSessionMessage?: (message: SessionMessage) => void;
  onUserJoined?: (user: { id: string; name: string }) => void;
  onUserLeft?: (user: { id: string; name: string }) => void;
  onCursorPosition?: (position: {
    user_id: string;
    x: number;
    y: number;
  }) => void;
}

interface UseSessionWebSocketReturn {
  isConnected: boolean;
  sendCanvasOperation: (operation: CanvasOperation) => void;
  sendSessionMessage: (content: string) => void;
  sendCursorPosition: (x: number, y: number) => void;
  connectionError: string | null;
  reconnect: () => void;
}

export function useSessionWebSocket({
  sessionId,
  currentUser,
  onCanvasOperation,
  onSessionMessage,
  onUserJoined,
  onUserLeft,
  onCursorPosition,
}: UseSessionWebSocketProps): UseSessionWebSocketReturn {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Extract the stable user ID to prevent unnecessary re-renders
  const currentUserId = currentUser?.id;

  const socketUrl = useMemo(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return null;
    }
    
    if (!sessionId || !currentUserId) {
      return null;
    }
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // Extract host from API_URL, handling both with and without /api suffix
    let host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "") || "localhost:8080";
    
    // Remove /api suffix if present to avoid double /api in WebSocket URL
    if (host.endsWith('/api')) {
      host = host.slice(0, -4);
    }
    
    // Get auth token from cookie or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || localStorage.getItem('token');
    
    const url = `${protocol}//${host}/api/ws/sessions/${sessionId}`;
    const finalUrl = token ? `${url}?token=${token}` : url;
    
    // Only log when URL actually changes
    if (process.env.NODE_ENV === 'development') {
      console.log("WebSocket URL generated for session:", sessionId);
    }
    return finalUrl;
  }, [sessionId, currentUserId]);

  const handleMessage = useCallback(
    (message: MessageEvent) => {
      try {
        const wsMessage: WebSocketMessage = JSON.parse(message.data);
        
        switch (wsMessage.type) {
          case "canvas_operation":
            onCanvasOperation?.(wsMessage.data);
            break;

          case "session_message":
            onSessionMessage?.(wsMessage.data);
            break;

          case "user_joined":
            if (wsMessage.data?.user && wsMessage.data.user.id !== currentUserId) {
              onUserJoined?.(wsMessage.data.user);
            }
            break;

          case "user_left":
            if (wsMessage.data?.user && wsMessage.data.user.id !== currentUserId) {
              onUserLeft?.(wsMessage.data.user);
            }
            break;

          case "cursor_position":
            if (wsMessage.data?.user_id !== currentUserId) {
              onCursorPosition?.(wsMessage.data);
            }
            break;

          case "user_online":
            if (process.env.NODE_ENV === 'development') {
              console.log("User came online:", wsMessage.data);
            }
            break;

          case "user_offline":
            if (process.env.NODE_ENV === 'development') {
              console.log("User went offline:", wsMessage.data);
            }
            break;

          default:
            if (process.env.NODE_ENV === 'development') {
              console.log("Unknown WebSocket message type:", wsMessage.type);
            }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
    [
      currentUserId,
      onCanvasOperation,
      onSessionMessage,
      onUserJoined,
      onUserLeft,
      onCursorPosition,
    ]
  );

  const shouldConnect = Boolean(sessionId && currentUserId && socketUrl);

  const { sendJsonMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    shouldConnect ? socketUrl : null,
    {
      onOpen: () => {
        if (process.env.NODE_ENV === 'development') {
          console.log("WebSocket connected to session:", sessionId);
        }
        setConnectionError(null);
        
        // Join the session
        const joinMessage: WebSocketMessage = {
          type: "session_join",
          data: {
            session_id: sessionId,
            user_id: currentUserId,
          },
        };
        sendJsonMessage(joinMessage);
      },
      onClose: (event) => {
        if (process.env.NODE_ENV === 'development') {
          console.log("WebSocket disconnected - Code:", event.code, "Reason:", event.reason);
        }
      },
      onError: (event) => {
        console.error("WebSocket connection error");
        setConnectionError("Connection error occurred");
      },
      onMessage: handleMessage,
      shouldReconnect: (closeEvent) => {
        // Only reconnect on unexpected disconnections
        const shouldReconnect = closeEvent.code !== 1000 && closeEvent.code !== 1001 && closeEvent.code !== 1005;
        if (process.env.NODE_ENV === 'development') {
          console.log("Should reconnect:", shouldReconnect, "Close code:", closeEvent.code);
        }
        return shouldReconnect;
      },
      reconnectAttempts: 3,
      reconnectInterval: (attemptNumber) => Math.min(Math.pow(2, attemptNumber) * 1000, 5000),
      share: true, // This prevents multiple connections in React StrictMode
    },
    shouldConnect
  );

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      handleMessage(lastMessage);
    }
  }, [lastMessage, handleMessage]);

  const sendCanvasOperation = useCallback(
    (operation: CanvasOperation) => {
      const message: WebSocketMessage = {
        type: "canvas_operation",
        data: {
          ...operation,
          session_id: sessionId,
          user_id: currentUserId,
        },
      };
      sendJsonMessage(message);
    },
    [sendJsonMessage, sessionId, currentUserId]
  );

  const sendSessionMessage = useCallback(
    (content: string) => {
      const message: WebSocketMessage = {
        type: "session_message",
        data: {
          content,
          session_id: sessionId,
          user_id: currentUserId,
          user: {
            id: currentUserId,
            name: currentUser?.name,
          },
        },
      };
      sendJsonMessage(message);
    },
    [sendJsonMessage, sessionId, currentUserId, currentUser?.name]
  );

  const sendCursorPosition = useCallback(
    (x: number, y: number) => {
      const message: WebSocketMessage = {
        type: "cursor_position",
        data: {
          session_id: sessionId,
          user_id: currentUserId,
          x,
          y,
        },
      };
      sendJsonMessage(message);
    },
    [sendJsonMessage, sessionId, currentUserId]
  );

  const reconnect = useCallback(() => {
    setConnectionError(null);
    // The library handles reconnection automatically
    const ws = getWebSocket();
    if (ws && ws.readyState !== WebSocket.OPEN) {
      ws.close();
    }
  }, [getWebSocket]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const ws = getWebSocket();
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          const leaveMessage: WebSocketMessage = {
            type: "session_leave",
            data: {
              session_id: sessionId,
              user_id: currentUserId,
            },
          };
          sendJsonMessage(leaveMessage);
        } catch (error) {
          console.error("Error sending leave message:", error);
        }
      }
    };
  }, [sessionId, currentUserId, getWebSocket, sendJsonMessage]);

  return {
    isConnected: readyState === ReadyState.OPEN,
    sendCanvasOperation,
    sendSessionMessage,
    sendCursorPosition,
    connectionError,
    reconnect,
  };
}