import { api } from '../../utils/api';
import { notifyXPGain } from '@/features/gamification/utils/xpNotifications';

export interface User {
  id: string;
  name: string;
  email: string;
  nativeLanguages: string[];
  targetLanguages: string[];
  createdAt: string;
}

export interface Match {
  id: string;
  user1: User;
  user2: User;
  createdAt: string;
}

export interface MatchRequest {
  id: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  sender?: User;
  recipient?: User;
  createdAt: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  other_user?: User;
  last_message?: any;
  unread_count?: number;
}

export class MatchService {
  static async getMatches(): Promise<Match[]> {
    const response = await api.get('/matches');
    // Handle different response structures
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  }

  static async sendMatchRequest(recipientId: string): Promise<{ id: string }> {
    const response = await api.post('/matches/requests', { recipientId });
    // Show XP notification for sending a match request
    notifyXPGain('MATCH_REQUEST');
    // Backend wraps response in 'data' field
    return response.data.data || response.data;
  }

  static async getIncomingRequests(): Promise<MatchRequest[]> {
    const response = await api.get('/matches/requests/incoming');
    return response.data;
  }

  static async getOutgoingRequests(): Promise<MatchRequest[]> {
    const response = await api.get('/matches/requests/outgoing');
    return response.data;
  }

  static async handleRequest(requestId: string, accept: boolean): Promise<void> {
    await api.put(`/matches/requests/${requestId}`, { accept });
    // Show XP notification for accepting a match
    if (accept) {
      notifyXPGain('MATCH_ACCEPTED');
    }
  }

  static async cancelMatchRequest(requestId: string): Promise<void> {
    await api.delete(`/matches/requests/${requestId}`);
  }

  static async startConversationFromMatch(matchId: string): Promise<Conversation> {
    console.log('Calling API to start conversation for match:', matchId);
    const response = await api.post(`/matches/${matchId}/conversation`);
    console.log('API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data.data:', response.data.data);
    // Backend wraps response in 'data' field
    const conversation = response.data.data || response.data;
    console.log('Extracted conversation:', conversation);
    return conversation;
  }
}