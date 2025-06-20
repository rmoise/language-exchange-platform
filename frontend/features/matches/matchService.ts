import { api } from '../../utils/api';

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
    return response.data;
  }

  static async sendMatchRequest(recipientId: string): Promise<void> {
    await api.post('/matches/requests', { recipientId });
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
  }

  static async startConversationFromMatch(matchId: string): Promise<Conversation> {
    const response = await api.post(`/matches/${matchId}/conversation`);
    return response.data;
  }
}