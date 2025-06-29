import { api } from '@/utils/api';
import { 
  Conversation, 
  Message, 
  ConversationListResponse, 
  MessageListResponse,
  SendMessageRequest,
  CreateConversationRequest,
  UpdateMessageStatusRequest
} from './types';

export class MessagingService {
  // Conversation endpoints
  static async getConversations(limit = 50, offset = 0): Promise<ConversationListResponse> {
    const response = await api.get(`/conversations?limit=${limit}&offset=${offset}`);
    // Backend might wrap response in 'data' field
    return response.data.data || response.data;
  }

  static async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    const response = await api.post('/conversations', request);
    // Backend might wrap response in 'data' field
    return response.data.data || response.data;
  }

  static async getConversation(conversationId: string): Promise<Conversation> {
    const response = await api.get(`/conversations/${conversationId}`);
    // Backend might wrap response in 'data' field
    return response.data.data || response.data;
  }

  // Message endpoints
  static async getMessages(
    conversationId: string, 
    limit = 50, 
    offset = 0
  ): Promise<MessageListResponse> {
    const response = await api.get(
      `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    );
    // Backend might wrap response in 'data' field
    return response.data.data || response.data;
  }

  static async sendMessage(
    conversationId: string, 
    request: SendMessageRequest
  ): Promise<Message> {
    const response = await api.post(`/conversations/${conversationId}/messages`, request);
    // Backend might wrap response in 'data' field
    return response.data.data || response.data;
  }

  static async markAsRead(conversationId: string): Promise<void> {
    await api.put(`/conversations/${conversationId}/messages/read`);
  }

  static async updateMessageStatus(
    messageId: string, 
    request: UpdateMessageStatusRequest
  ): Promise<void> {
    await api.put(`/messages/${messageId}/status`, request);
  }

  static async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  }

  // Online status endpoints
  static async getOnlineUsers(): Promise<{ online_users: string[]; count: number }> {
    const response = await api.get('/ws/online');
    return response.data;
  }

  static async checkUserOnline(userId: string): Promise<{ user_id: string; is_online: boolean }> {
    const response = await api.get(`/ws/online/${userId}`);
    return response.data;
  }

  // WebSocket connection helper
  static createWebSocketConnection(): WebSocket | null {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws').replace('/api', '') || 'ws://localhost:8080';
      // Get token from cookie
      const cookies = document.cookie.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;
      
      if (!token) {
        console.error('No authentication token found');
        return null;
      }

      const ws = new WebSocket(`${wsUrl}/api/ws?token=${token}`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  }
}