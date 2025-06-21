"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface WebSocketMessage {
  type: string;
  data: any;
}

interface CanvasOperation {
  operation_type: string;
  data: any;
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
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host =
      process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "") ||
      "localhost:8080";
    
    // Get auth token from cookie or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1] || localStorage.getItem('token');
    
    const url = `${protocol}//${host}/ws/sessions/${sessionId}`;
    return token ? `${url}?token=${token}` : url;
  }, [sessionId]);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log("Connecting to WebSocket:", wsUrl);

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected to session:", sessionId);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Join the session
        const joinMessage: WebSocketMessage = {
          type: "session_join",
          data: {
            session_id: sessionId,
            user_id: currentUser?.id,
          },
        };
        ws.current?.send(JSON.stringify(joinMessage));
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect if not a clean close and under max attempts
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${
              reconnectAttempts.current + 1
            })`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError(
            "Connection lost. Please refresh the page to reconnect."
          );
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("Connection error occurred");
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setConnectionError("Failed to establish connection");
    }
  }, [sessionId, currentUser?.id, getWebSocketUrl]);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case "canvas_operation":
          onCanvasOperation?.(message.data);
          break;

        case "session_message":
          onSessionMessage?.(message.data);
          break;

        case "user_joined":
          if (message.data?.user && message.data.user.id !== currentUser?.id) {
            onUserJoined?.(message.data.user);
          }
          break;

        case "user_left":
          if (message.data?.user && message.data.user.id !== currentUser?.id) {
            onUserLeft?.(message.data.user);
          }
          break;

        case "cursor_position":
          if (message.data?.user_id !== currentUser?.id) {
            onCursorPosition?.(message.data);
          }
          break;

        case "user_online":
          // Handle user coming online - could trigger participant list refresh
          if (process.env.NODE_ENV === 'development') {
            console.log("User came online:", message.data);
          }
          // Could call onUserJoined if we have that callback
          break;

        case "user_offline":
          // Handle user going offline - could trigger participant list refresh  
          if (process.env.NODE_ENV === 'development') {
            console.log("User went offline:", message.data);
          }
          // Could call onUserLeft if we have that callback
          break;

        default:
          console.log("Unknown WebSocket message type:", message.type);
      }
    },
    [
      currentUser?.id,
      onCanvasOperation,
      onSessionMessage,
      onUserJoined,
      onUserLeft,
      onCursorPosition,
    ]
  );

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected, message not sent:", message);
    }
  }, []);

  const sendCanvasOperation = useCallback(
    (operation: CanvasOperation) => {
      sendMessage({
        type: "canvas_operation",
        data: {
          ...operation,
          session_id: sessionId,
          user_id: currentUser?.id,
        },
      });
    },
    [sendMessage, sessionId, currentUser?.id]
  );

  const sendSessionMessage = useCallback(
    (content: string) => {
      sendMessage({
        type: "session_message",
        data: {
          content,
          session_id: sessionId,
          user_id: currentUser?.id,
          user: {
            id: currentUser?.id,
            name: currentUser?.name,
          },
        },
      });
    },
    [sendMessage, sessionId, currentUser]
  );

  const sendCursorPosition = useCallback(
    (x: number, y: number) => {
      sendMessage({
        type: "cursor_position",
        data: {
          session_id: sessionId,
          user_id: currentUser?.id,
          x,
          y,
        },
      });
    },
    [sendMessage, sessionId, currentUser?.id]
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    if (ws.current) {
      // Send leave message only if connection is open
      if (ws.current.readyState === WebSocket.OPEN) {
        try {
          const leaveMessage: WebSocketMessage = {
            type: "session_leave",
            data: {
              session_id: sessionId,
              user_id: currentUser?.id,
            },
          };
          ws.current.send(JSON.stringify(leaveMessage));
        } catch (error) {
          console.error("Error sending leave message:", error);
        }
      }

      // Remove event listeners to prevent callbacks after cleanup
      ws.current.onopen = null;
      ws.current.onmessage = null;
      ws.current.onclose = null;
      ws.current.onerror = null;

      // Close connection
      try {
        ws.current.close(1000, "User left session");
      } catch (error) {
        console.error("Error closing WebSocket:", error);
      }
      
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
  }, [sessionId, currentUser?.id]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    setConnectionError(null);
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Connect on mount and when session/user changes
  useEffect(() => {
    if (sessionId && currentUser?.id) {
      // Disconnect any existing connection first
      if (ws.current) {
        disconnect();
      }
      // Small delay to ensure cleanup is complete
      const timeoutId = setTimeout(() => {
        connect();
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        disconnect();
      };
    }
    
    return () => {
      disconnect();
    };
  }, [sessionId, currentUser?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    sendCanvasOperation,
    sendSessionMessage,
    sendCursorPosition,
    connectionError,
    reconnect,
  };
}
