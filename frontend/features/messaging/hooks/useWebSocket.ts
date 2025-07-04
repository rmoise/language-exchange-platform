'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketMessage, WSMessageType, Message, TypingIndicator, OnlineStatus } from '../types';

interface UseWebSocketOptions {
  onNewMessage?: (message: Message) => void;
  onMessageRead?: (data: { conversation_id: string; user_id: string }) => void;
  onTyping?: (indicator: TypingIndicator) => void;
  onUserOnline?: (status: OnlineStatus) => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    onNewMessage,
    onMessageRead,
    onTyping,
    onUserOnline,
    onError,
    autoReconnect = true
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(() => {
    // Check if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return; // Already connected or connecting
    }

    setIsConnecting(true);

    try {
      // Get token from cookie
      const cookies = document.cookie.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;
      
      if (!token) {
        console.error('No authentication token found for WebSocket connection');
        setIsConnecting(false);
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws').replace('/api', '') || 'ws://localhost:8080';
      // WebSocket doesn't support custom headers in browser environment
      // Token should be passed via query parameter or handled by the server differently
      const ws = new WebSocket(`${wsUrl}/api/ws?token=${encodeURIComponent(token)}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Auto-reconnect if enabled and not a normal closure
        if (autoReconnect && event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        // Only log errors if we're still trying to connect
        if (isConnecting) {
          console.warn('WebSocket connection failed, will retry if enabled');
        }
        setIsConnecting(false);
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const wsMessage: WebSocketMessage = JSON.parse(event.data);
          
          switch (wsMessage.type) {
            case WSMessageType.NEW_MESSAGE:
              onNewMessage?.(wsMessage.data as Message);
              break;
            case WSMessageType.MESSAGE_READ:
              onMessageRead?.(wsMessage.data);
              break;
            case WSMessageType.TYPING:
            case WSMessageType.STOP_TYPING:
              onTyping?.(wsMessage.data as TypingIndicator);
              break;
            case WSMessageType.USER_ONLINE:
            case WSMessageType.USER_OFFLINE:
              onUserOnline?.(wsMessage.data as OnlineStatus);
              break;
            default:
              console.log('Unknown WebSocket message type:', wsMessage.type);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
    }
  }, [onNewMessage, onMessageRead, onTyping, onUserOnline, onError, autoReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, []);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    sendMessage({
      type: isTyping ? WSMessageType.TYPING : WSMessageType.STOP_TYPING,
      data: {
        conversation_id: conversationId,
        is_typing: isTyping
      }
    });
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // Empty dependency array - only run on mount/unmount

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
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator
  };
};