import { useState, useEffect, useCallback, useRef } from 'react';
import { postService, Post, PostFilters, PostListResponse } from '../services/postService';
import { useAuth } from '@/hooks/useAuth';

interface UsePostsOptions {
  filters?: PostFilters;
  autoLoad?: boolean;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const loadingRef = useRef(false);

  // Load initial posts
  const loadPosts = useCallback(async (reset = false) => {
    if (loadingRef.current || (!hasMore && !reset)) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const filters: PostFilters = {
        ...options.filters,
        limit: 20,
      };

      if (!reset && nextCursor) {
        filters.cursor = nextCursor;
      }

      const response = await postService.listPosts(filters);

      if (reset) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }

      setHasMore(response.has_more);
      setNextCursor(response.next_cursor || null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [options.filters, nextCursor, hasMore]);

  // Create a new post
  const createPost = useCallback(async (
    title: string,
    content: string,
    category: string,
    categoryEmoji?: string,
    askingFor?: string
  ) => {
    try {
      const newPost = await postService.createPost({
        title,
        content,
        category,
        category_emoji: categoryEmoji,
        asking_for: askingFor,
      });

      // Add the new post to the beginning of the list
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create post');
    }
  }, []);

  // Toggle reaction on a post
  const toggleReaction = useCallback(async (postId: string, emoji: string) => {
    try {
      await postService.toggleReaction(postId, emoji);
      
      // Optimistically update the UI
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const existingReaction = post.reactions?.find(r => r.emoji === emoji);
          
          if (existingReaction) {
            // Toggle existing reaction
            const updatedReactions = post.reactions?.map(r => 
              r.emoji === emoji 
                ? {
                    ...r,
                    count: r.has_reacted ? r.count - 1 : r.count + 1,
                    has_reacted: !r.has_reacted,
                    users: r.has_reacted 
                      ? r.users.filter(u => u !== (user?.name || 'You'))
                      : [user?.name || 'You', ...r.users]
                  }
                : r
            ).filter(r => r.count > 0);
            
            return {
              ...post,
              reactions: updatedReactions,
              reaction_count: post.reaction_count + (existingReaction.has_reacted ? -1 : 1)
            };
          } else {
            // Add new reaction
            return {
              ...post,
              reactions: [...(post.reactions || []), {
                emoji,
                count: 1,
                has_reacted: true,
                users: [user?.name || 'You']
              }],
              reaction_count: post.reaction_count + 1
            };
          }
        }
        return post;
      }));
    } catch (err: any) {
      // Revert on error by refetching
      await refreshPost(postId);
      throw new Error(err.response?.data?.error || 'Failed to toggle reaction');
    }
  }, [user]);

  // Refresh a single post
  const refreshPost = useCallback(async (postId: string) => {
    try {
      const updatedPost = await postService.getPost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId ? updatedPost : post
      ));
    } catch (err: any) {
      console.error('Failed to refresh post:', err);
    }
  }, []);

  // Delete a post
  const deletePost = useCallback(async (postId: string) => {
    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete post');
    }
  }, []);

  // Load posts on mount if autoLoad is true
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadPosts(true);
    }
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore: () => loadPosts(false),
    refresh: () => loadPosts(true),
    createPost,
    toggleReaction,
    deletePost,
    refreshPost,
  };
}

// Hook for managing comments
export function useComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await postService.getComments(postId);
      setComments(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string, parentCommentId?: string) => {
    try {
      const newComment = await postService.addComment(postId, content, parentCommentId);
      
      // Reload comments to get proper tree structure
      await loadComments();
      
      return newComment;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to add comment');
    }
  }, [postId, loadComments]);

  const toggleReaction = useCallback(async (commentId: string, emoji: string) => {
    try {
      await postService.toggleCommentReaction(commentId, emoji);
      // Reload comments to get updated reactions
      await loadComments();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to toggle reaction');
    }
  }, [loadComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await postService.deleteComment(commentId);
      // Reload comments
      await loadComments();
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete comment');
    }
  }, [loadComments]);

  useEffect(() => {
    loadComments();
  }, [postId]);

  return {
    comments,
    loading,
    error,
    addComment,
    toggleReaction,
    deleteComment,
    refresh: loadComments,
  };
}