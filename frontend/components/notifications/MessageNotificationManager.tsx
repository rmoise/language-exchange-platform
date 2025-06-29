'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { useNotificationActions } from '@/contexts/NotificationContext';
import { useAppSelector } from '@/lib/hooks';

export const MessageNotificationManager = () => {
  const { lastMessage } = useWebSocketContext();
  const { addNotification } = useNotificationActions();
  const currentUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const pathname = usePathname();

  // Request notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = useCallback((title: string, body: string, conversationId: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `message-${conversationId}`, // Prevent duplicate notifications
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        router.push(`/app/conversations?id=${conversationId}`);
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }, [router]);

  const showInAppNotification = useCallback((senderName: string, messageContent: string, conversationId: string) => {
    addNotification({
      type: 'info',
      title: `New message from ${senderName}`,
      message: messageContent,
      data: { conversationId, type: 'message' }
    });
  }, [addNotification]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    console.log('MessageNotificationManager - lastMessage:', lastMessage);
    console.log('MessageNotificationManager - currentUser:', currentUser);
    
    if (!lastMessage || !currentUser) return;

    // Only handle new message events
    if (lastMessage.type === 'new_message') {
      const messageData = lastMessage.data;
      console.log('MessageNotificationManager - Received new_message event:', messageData);
      
      // Don't notify for messages from the current user
      if (messageData.sender_id === currentUser.id) {
        console.log('MessageNotificationManager - Skipping notification for own message');
        return;
      }

      const senderName = messageData.sender?.name || 'Someone';
      const messageContent = messageData.content.length > 50 
        ? messageData.content.substring(0, 50) + '...' 
        : messageData.content;

      // Check if user is currently viewing this conversation
      const isViewingConversation = pathname === '/app/conversations' && 
        window.location.search.includes(`id=${messageData.conversation_id}`);

      // Only show notifications if user is not currently viewing the conversation
      if (!isViewingConversation) {
        // Show browser notification
        showBrowserNotification(
          `New message from ${senderName}`, 
          messageContent,
          messageData.conversation_id
        );

        // Show in-app notification
        showInAppNotification(senderName, messageContent, messageData.conversation_id);
      }

      // Play notification sound (optional)
      try {
        const audio = new Audio('/sounds/notification.mp3'); // You'll need to add this sound file
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Ignore audio play errors (user might not have interacted with page yet)
        });
      } catch (error) {
        // Audio not available, ignore
      }
    }
  }, [lastMessage, currentUser, pathname, showBrowserNotification, showInAppNotification]);

  // This component doesn't render anything visible
  return null;
};