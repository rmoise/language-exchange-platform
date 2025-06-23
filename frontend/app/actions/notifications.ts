'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'match_request';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export async function getNotifications(): Promise<Notification[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    console.log('No token found in cookies');
    return [];
  }

  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
    const url = `${apiUrl}/matches/requests/incoming`;
    console.log('Fetching notifications from:', url);
    
    // Fetch real match requests and convert them to notifications
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch notifications:', response.status, response.statusText);
      return [];
    }

    const responseData = await response.json();
    console.log('API response:', responseData);
    
    // The API wraps the data in a "data" field
    const matchRequests = responseData.data || [];
    console.log('Match requests:', matchRequests);
    
    // Convert match requests to notifications
    const notifications: Notification[] = matchRequests
      .filter((request: any) => request.status === 'pending')
      .map((request: any) => ({
        id: request.id,
        type: 'match_request' as const,
        title: 'New Match Request',
        message: `${request.sender?.name || 'Someone'} wants to connect with you for language exchange!`,
        read: false,
        createdAt: request.createdAt,
        data: { 
          requestId: request.id, 
          userId: request.senderId,
          senderName: request.sender?.name,
          senderNativeLanguages: request.sender?.nativeLanguages,
          senderTargetLanguages: request.sender?.targetLanguages,
        },
      }));
    
    return notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  // Since we're using match requests as notifications, 
  // marking as read is handled client-side for now
  // In a real implementation, this would update a notification status in the backend
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  // Since we're using match requests as notifications, 
  // marking all as read is handled client-side for now
  return { success: true };
}

export async function deleteNotification(notificationId: string) {
  // Since notifications are based on match requests,
  // deleting would mean declining the request
  // For now, we'll just return success and handle it client-side
  return { success: true };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return 0;
  }

  try {
    // Get all notifications and count unread ones
    const notifications = await getNotifications();
    return notifications.filter(n => !n.read).length;
  } catch (error) {
    console.error('Failed to fetch unread notification count:', error);
    return 0;
  }
}