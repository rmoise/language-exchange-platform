import { cookies } from 'next/headers';
import { Post, PostListResponse, PostFilters } from './postService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export class ServerPostService {
  private async makeRequest<T>(
    path: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API request failed: ${path}`, error);
      throw error;
    }
  }
  
  async listPosts(filters: PostFilters = {}): Promise<PostListResponse> {
    const params = new URLSearchParams();
    
    if (filters.cursor) params.append('cursor', filters.cursor.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    
    return this.makeRequest<PostListResponse>(`/posts?${params.toString()}`);
  }
  
  async getPost(postId: string): Promise<Post> {
    return this.makeRequest<Post>(`/posts/${postId}`);
  }
}

export const serverPostService = new ServerPostService();