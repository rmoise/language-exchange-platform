import { api } from "@/utils/api";

export interface BookmarkResponse {
  post_id: string;
  is_bookmarked: boolean;
  message: string;
}

export interface BookmarksListResponse {
  posts: any[];
  total_count: number;
  has_more: boolean;
  next_offset: number;
  limit: number;
}

export const bookmarkService = {
  /**
   * Toggle bookmark status for a post
   */
  async toggleBookmark(postId: string): Promise<BookmarkResponse> {
    try {
      const response = await api.post('/bookmarks', {
        post_id: postId
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to toggle bookmark:', error);
      throw new Error(error.response?.data?.error || 'Failed to toggle bookmark');
    }
  },

  /**
   * Get user's bookmarked posts with pagination
   */
  async getUserBookmarks(limit: number = 20, offset: number = 0): Promise<BookmarksListResponse> {
    try {
      const response = await api.get('/bookmarks', {
        params: { limit, offset }
      });
      
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to get bookmarks:', error);
      throw new Error(error.response?.data?.error || 'Failed to get bookmarks');
    }
  },

  /**
   * Check if a post is bookmarked
   */
  async checkBookmarkStatus(postId: string): Promise<boolean> {
    try {
      const response = await api.get(`/bookmarks/status/${postId}`);
      return response.data.data.is_bookmarked;
    } catch (error: any) {
      console.error('Failed to check bookmark status:', error);
      return false; // Default to not bookmarked on error
    }
  },

  /**
   * Get bookmark status for multiple posts
   */
  async getBookmarkStatusForPosts(postIds: string[]): Promise<Record<string, boolean>> {
    try {
      // If the API doesn't support batch checking, check individually
      const results: Record<string, boolean> = {};
      
      await Promise.all(
        postIds.map(async (postId) => {
          try {
            results[postId] = await this.checkBookmarkStatus(postId);
          } catch (error) {
            results[postId] = false;
          }
        })
      );
      
      return results;
    } catch (error: any) {
      console.error('Failed to get bookmark statuses:', error);
      // Return all false on error
      return postIds.reduce((acc, postId) => {
        acc[postId] = false;
        return acc;
      }, {} as Record<string, boolean>);
    }
  }
};