import { api } from '@/utils/api';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  category_emoji: string;
  asking_for: string;
  comment_count: number;
  reaction_count: number;
  cursor_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    city?: string;
    country?: string;
    nativeLanguages?: string[];
    targetLanguages?: string[];
  };
  reactions?: ReactionGroup[];
  comments?: Comment[];
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  has_reacted: boolean;
  users: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profile_image?: string;
  };
  reactions?: any[];
  children?: Comment[];
}

export interface CreatePostInput {
  title: string;
  content: string;
  category: string;
  category_emoji?: string;
  asking_for?: string;
}

export interface PostListResponse {
  posts: Post[];
  next_cursor?: number;
  has_more: boolean;
  total?: number;
}

export interface PostFilters {
  cursor?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: 'created_at' | 'reactions' | 'comments' | 'trending';
}

class PostService {
  // Posts
  async createPost(input: CreatePostInput): Promise<Post> {
    const response = await api.post('/posts', input);
    return response.data;
  }

  async getPost(postId: string): Promise<Post> {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  }

  async updatePost(postId: string, input: Partial<CreatePostInput>): Promise<Post> {
    const response = await api.put(`/posts/${postId}`, input);
    return response.data;
  }

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`);
  }

  async listPosts(filters: PostFilters = {}): Promise<PostListResponse> {
    const params = new URLSearchParams();
    
    if (filters.cursor) params.append('cursor', filters.cursor.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);

    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  }

  // Comments
  async addComment(postId: string, content: string, parentCommentId?: string): Promise<Comment> {
    const response = await api.post('/posts/comments', {
      post_id: postId,
      content,
      parent_comment_id: parentCommentId,
    });
    return response.data;
  }

  async getComments(postId: string): Promise<Comment[]> {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/posts/comments/${commentId}`);
  }

  // Reactions
  async toggleReaction(postId: string, emoji: string): Promise<void> {
    await api.post(`/posts/${postId}/reactions`, { emoji });
  }

  async toggleCommentReaction(commentId: string, emoji: string): Promise<void> {
    await api.post(`/posts/comments/${commentId}/reactions`, { emoji });
  }
}

export const postService = new PostService();