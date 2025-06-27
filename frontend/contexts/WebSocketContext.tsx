"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket, WebSocketMessage } from '@/lib/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (messageType: string, handler: (data: any) => void) => () => void;
  send: (message: any) => void;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(false);

  const { subscribe, send, getConnectionStatus } = useWebSocket({
    onConnect: () => {
      console.log('WebSocket connected');
      setConnectionStatus(true);
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
      setConnectionStatus(false);
    },
    onMessage: (message: WebSocketMessage) => {
      console.log('WebSocket message received:', message);
      setLastMessage(message);
    },
    onError: (error: Event) => {
      console.error('WebSocket error:', error);
    }
  });

  // Periodic connection status check
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getConnectionStatus();
      if (status !== connectionStatus) {
        setConnectionStatus(status);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionStatus, getConnectionStatus]);

  const contextValue: WebSocketContextType = {
    isConnected: connectionStatus,
    subscribe,
    send,
    lastMessage
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook for post-related WebSocket events
export function usePostWebSocketEvents() {
  const { subscribe } = useWebSocketContext();

  const subscribeToPostEvents = (callbacks: {
    onPostCreated?: (data: any) => void;
    onPostUpdated?: (data: any) => void;
    onPostDeleted?: (data: any) => void;
    onPostReaction?: (data: any) => void;
    onPostBookmark?: (data: any) => void;
  }) => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onPostCreated) {
      unsubscribers.push(subscribe('post_created', callbacks.onPostCreated));
    }
    if (callbacks.onPostUpdated) {
      unsubscribers.push(subscribe('post_updated', callbacks.onPostUpdated));
    }
    if (callbacks.onPostDeleted) {
      unsubscribers.push(subscribe('post_deleted', callbacks.onPostDeleted));
    }
    if (callbacks.onPostReaction) {
      unsubscribers.push(subscribe('post_reaction', callbacks.onPostReaction));
    }
    if (callbacks.onPostBookmark) {
      unsubscribers.push(subscribe('post_bookmark', callbacks.onPostBookmark));
    }

    // Return cleanup function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  };

  return { subscribeToPostEvents };
}

// Hook for user status events
export function useUserStatusEvents() {
  const { subscribe } = useWebSocketContext();

  const subscribeToUserStatus = (callbacks: {
    onUserOnline?: (data: any) => void;
    onUserOffline?: (data: any) => void;
  }) => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onUserOnline) {
      unsubscribers.push(subscribe('user_online', callbacks.onUserOnline));
    }
    if (callbacks.onUserOffline) {
      unsubscribers.push(subscribe('user_offline', callbacks.onUserOffline));
    }

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  };

  return { subscribeToUserStatus };
}