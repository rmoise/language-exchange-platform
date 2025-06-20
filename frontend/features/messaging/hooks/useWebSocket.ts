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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setIsConnecting(true);

    try {
      // Get token from localStorage or auth context
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found for WebSocket connection');
        setIsConnecting(false);
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws').replace('/api', '') || 'ws://localhost:8080';
      const ws = new WebSocket(`${wsUrl}/api/ws`, [], {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } as any);

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
        console.error('WebSocket error:', error);
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
  }, [connect, disconnect]);

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