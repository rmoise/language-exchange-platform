"use client";

import { useEffect, useRef, useCallback, useState } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number;
  private reconnectInterval: number;
  private currentReconnectAttempts: number = 0;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected: boolean = false;
  private shouldReconnect: boolean = true;

  // Callbacks
  public onConnect?: () => void;
  public onDisconnect?: () => void;
  public onMessage?: (message: WebSocketMessage) => void;
  public onError?: (error: Event) => void;

  constructor(options: WebSocketOptions = {}) {
    this.url = options.url || this.getWebSocketUrl();
    this.reconnectAttempts = options.reconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.onConnect = options.onConnect;
    this.onDisconnect = options.onDisconnect;
    this.onMessage = options.onMessage;
    this.onError = options.onError;
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Handle NEXT_PUBLIC_API_URL which might include /api path
    let host: string;
    let wsPath = '/api/ws';
    
    if (process.env.NEXT_PUBLIC_WS_URL) {
      // Use explicit WebSocket URL if provided
      return process.env.NEXT_PUBLIC_WS_URL;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      // Parse the API URL to extract host
      const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
      host = apiUrl.host;
      // Always use /api/ws path
      wsPath = '/api/ws';
    } else {
      // Fallback to current host
      host = window.location.host;
      wsPath = '/api/ws';
    }
    
    // Get token from cookie
    const cookies = document.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;
    
    const baseUrl = `${protocol}//${host}${wsPath}`;
    return token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.currentReconnectAttempts = 0;
        this.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.onDisconnect?.();

        if (this.shouldReconnect && this.currentReconnectAttempts < this.reconnectAttempts) {
          setTimeout(() => {
            this.currentReconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.currentReconnectAttempts}/${this.reconnectAttempts}`);
            this.connect();
          }, this.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        // Don't log the error object directly as it doesn't serialize well
        // The connection status is already logged in onclose
        this.onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    console.log('WebSocketManager - Received message:', message);
    
    // Call global message handler
    this.onMessage?.(message);

    // Call specific type handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`Error in WebSocket handler for ${message.type}:`, error);
        }
      });
    }
  }

  // Subscribe to specific message types
  subscribe(messageType: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    
    const handlers = this.messageHandlers.get(messageType)!;
    handlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  // Send message
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Global WebSocket instance
let globalWebSocketManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!globalWebSocketManager) {
    globalWebSocketManager = new WebSocketManager();
  }
  return globalWebSocketManager;
}

// React hook for WebSocket
export function useWebSocket(options: WebSocketOptions = {}) {
  const wsManager = useRef<WebSocketManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Use the global WebSocket manager
    wsManager.current = getWebSocketManager();
    
    // Set up event handlers for this component
    const originalOnConnect = wsManager.current.onConnect;
    const originalOnDisconnect = wsManager.current.onDisconnect;
    const originalOnMessage = wsManager.current.onMessage;
    const originalOnError = wsManager.current.onError;
    
    wsManager.current.onConnect = () => {
      setIsConnected(true);
      originalOnConnect?.();
      options.onConnect?.();
    };
    
    wsManager.current.onDisconnect = () => {
      setIsConnected(false);
      originalOnDisconnect?.();
      options.onDisconnect?.();
    };
    
    wsManager.current.onMessage = (message: WebSocketMessage) => {
      originalOnMessage?.(message);
      options.onMessage?.(message);
    };
    
    wsManager.current.onError = (error: Event) => {
      originalOnError?.(error);
      options.onError?.(error);
    };
    
    // Connect if not already connected
    if (!wsManager.current.getConnectionStatus()) {
      wsManager.current.connect();
    } else {
      setIsConnected(true);
    }

    // Cleanup - restore original handlers but don't disconnect
    return () => {
      if (wsManager.current) {
        wsManager.current.onConnect = originalOnConnect;
        wsManager.current.onDisconnect = originalOnDisconnect;
        wsManager.current.onMessage = originalOnMessage;
        wsManager.current.onError = originalOnError;
      }
    };
  }, []);

  const subscribe = useCallback((messageType: string, handler: (data: any) => void) => {
    return wsManager.current?.subscribe(messageType, handler) || (() => {});
  }, []);

  const send = useCallback((message: any) => {
    wsManager.current?.send(message);
  }, []);

  const getConnectionStatus = useCallback(() => {
    return wsManager.current?.getConnectionStatus() || false;
  }, []);

  return {
    subscribe,
    send,
    getConnectionStatus,
    isConnected
  };
}