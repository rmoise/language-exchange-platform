import { api } from '@/utils/api';
import { 
  UserGamificationData, 
  Badge, 
  UserBadge, 
  UserDailyChallenge, 
  LeaderboardEntry,
  LeaderboardType 
} from '../types/gamification';

export interface GetLeaderboardParams {
  type?: LeaderboardType;
  limit?: number;
  offset?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  type: LeaderboardType;
  limit: number;
  offset: number;
}

export interface UserLeaderboardPositions {
  weekly?: number;
  monthly?: number;
  allTime?: number;
}

class GamificationService {
  private readonly basePath = '/api/gamification';

  /**
   * Get complete gamification data for the current user
   */
  async getUserGamificationData(): Promise<UserGamificationData> {
    const response = await api.get(`${this.basePath}/me`);
    return response.data;
  }

  /**
   * Get all available badges
   */
  async getAllBadges(): Promise<Badge[]> {
    const response = await api.get(`${this.basePath}/badges`);
    return response.data.badges;
  }

  /**
   * Get badges earned by the current user
   */
  async getUserBadges(): Promise<UserBadge[]> {
    const response = await api.get(`${this.basePath}/me/badges`);
    return response.data.badges;
  }

  /**
   * Get daily challenges for the current user
   */
  async getDailyChallenges(): Promise<UserDailyChallenge[]> {
    const response = await api.get(`${this.basePath}/me/challenges`);
    return response.data.challenges;
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(params: GetLeaderboardParams = {}): Promise<LeaderboardResponse> {
    const { type = 'all_time', limit = 20, offset = 0 } = params;
    const response = await api.get(`${this.basePath}/leaderboard`, {
      params: { type, limit, offset }
    });
    return response.data;
  }

  /**
   * Get current user's position on various leaderboards
   */
  async getUserLeaderboardPositions(): Promise<UserLeaderboardPositions> {
    const response = await api.get(`${this.basePath}/me/position`);
    return response.data.positions;
  }
}

export const gamificationService = new GamificationService();