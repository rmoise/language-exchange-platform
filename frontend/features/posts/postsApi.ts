import { apiSlice } from '@/features/api/apiSlice';
import type { Post, CreatePostInput, PostListResponse, PostFilters, Comment } from './services/postService';
import { notifyXPGain } from '@/features/gamification/utils/xpNotifications';

// Extend the existing API slice with posts endpoints
export const postsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create post
    createPost: builder.mutation<Post, CreatePostInput>({
      query: (input) => ({
        url: '/posts',
        method: 'POST',
        body: input,
      }),
      // Invalidate user tag to refetch gamification data
      invalidatesTags: ['User', 'Posts'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Show XP notification after successful post creation
          notifyXPGain('POST_CREATED');
        } catch {}
      },
    }),

    // Get posts
    getPosts: builder.query<PostListResponse, PostFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.cursor) params.append('cursor', filters.cursor.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        
        return `/posts?${params.toString()}`;
      },
      providesTags: ['Posts'],
    }),

    // Get single post
    getPost: builder.query<Post, string>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (result, error, id) => [{ type: 'Posts', id }],
    }),

    // Add comment
    addComment: builder.mutation<Comment, { postId: string; content: string; parentCommentId?: string }>({
      query: ({ postId, content, parentCommentId }) => ({
        url: '/posts/comments',
        method: 'POST',
        body: { post_id: postId, content, parent_comment_id: parentCommentId },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Posts', id: postId }],
    }),

    // Toggle reaction
    toggleReaction: builder.mutation<void, { postId: string; emoji: string }>({
      query: ({ postId, emoji }) => ({
        url: `/posts/${postId}/reactions`,
        method: 'POST',
        body: { emoji },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Posts', id: postId }],
    }),
  }),
});

// Export hooks
export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostQuery,
  useAddCommentMutation,
  useToggleReactionMutation,
} = postsApi;