"use client";

import { useEffect, useRef, useCallback } from 'react';

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
  private onConnect?: () => void;
  private onDisconnect?: () => void;
  private onMessage?: (message: WebSocketMessage) => void;
  private onError?: (error: Event) => void;

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
    const host = process.env.NEXT_PUBLIC_WS_URL || 
                 process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:/, '') || 
                 window.location.host;
    return `${protocol}//${host}/ws`;
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
        console.error('WebSocket error:', error);
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
  const isConnected = useRef(false);

  useEffect(() => {
    // Create WebSocket manager
    wsManager.current = new WebSocketManager({
      ...options,
      onConnect: () => {
        isConnected.current = true;
        options.onConnect?.();
      },
      onDisconnect: () => {
        isConnected.current = false;
        options.onDisconnect?.();
      }
    });

    // Connect
    wsManager.current.connect();

    // Cleanup on unmount
    return () => {
      if (wsManager.current) {
        wsManager.current.disconnect();
        wsManager.current = null;
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
    isConnected: isConnected.current
  };
}