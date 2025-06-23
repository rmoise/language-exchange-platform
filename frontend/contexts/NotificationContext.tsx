"use client";

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'match_request';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'read' | 'createdAt'> }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' };

const NotificationContext = createContext<NotificationState | null>(null);
const NotificationDispatchContext = createContext<React.Dispatch<NotificationAction> | null>(null);

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date(),
      };
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    }
    case 'MARK_AS_READ': {
      return {
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }
    case 'MARK_ALL_AS_READ': {
      return {
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    }
    case 'REMOVE_NOTIFICATION': {
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      };
    }
    case 'CLEAR_ALL': {
      return {
        notifications: [],
        unreadCount: 0,
      };
    }
    default:
      throw new Error(`Unknown action: ${(action as any).type}`);
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
  });

  return (
    <NotificationContext.Provider value={state}>
      <NotificationDispatchContext.Provider value={dispatch}>
        {children}
      </NotificationDispatchContext.Provider>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function useNotificationDispatch() {
  const context = useContext(NotificationDispatchContext);
  if (!context) {
    throw new Error('useNotificationDispatch must be used within a NotificationProvider');
  }
  return context;
}

// Custom hook for common notification operations
export function useNotificationActions() {
  const dispatch = useNotificationDispatch();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, [dispatch]);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, [dispatch]);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, [dispatch]);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, [dispatch]);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);

  return {
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}