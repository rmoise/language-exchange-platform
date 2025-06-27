"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Stack, Box, Typography } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import { PostCard } from "./PostCard";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { transformPost } from "@/features/posts/utils/postAdapter";
import { Post as ApiPost, postService } from "@/features/posts/services/postService";
import { Post as UIPost } from "@/features/comments/types";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import ConfirmationModal from "@/features/users/components/ConfirmationModal";
import { EmojiPicker } from "@/features/emoji";
import { useAuth } from "@/hooks/useAuth";

interface PostsFeedProps {
  initialPosts: ApiPost[];
  hasMoreInitial: boolean;
  nextCursorInitial?: number;
  categoryFilter?: string | null;
}

export interface PostsFeedRef {
  addPost: (post: ApiPost) => void;
}

export const PostsFeed = forwardRef<PostsFeedRef, PostsFeedProps>(
  ({ initialPosts, hasMoreInitial, nextCursorInitial, categoryFilter }, ref) => {
  const { mode } = useCustomTheme();
  const { user } = useAuth();
  const [allPosts, setAllPosts] = useState<UIPost[]>(() => 
    (initialPosts || []).map(transformPost)
  );
  const [hasMoreState, setHasMoreState] = useState(hasMoreInitial);
  const [newlyCreatedPosts, setNewlyCreatedPosts] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  // Compute filtered posts based on category filter
  const postsState = React.useMemo(() => {
    if (!categoryFilter) {
      return allPosts;
    }
    
    return allPosts.filter(post => {
      // Show newly created posts regardless of category
      if (newlyCreatedPosts.has(post.id)) {
        return true;
      }
      
      // For existing posts, check category from initial data
      const originalPost = initialPosts.find(p => p.id === post.id);
      return originalPost?.category === categoryFilter;
    });
  }, [allPosts, categoryFilter, newlyCreatedPosts, initialPosts]);
  
  // State for reply interactions
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ [postId: string]: { id: string; name: string } | null }>({});
  const [hiddenReplies, setHiddenReplies] = useState<{ [postId: string]: boolean }>({});
  const [collapsedReplies, setCollapsedReplies] = useState<{ [replyId: string]: boolean }>({});
  const [activeReplyFields, setActiveReplyFields] = useState<{ [key: string]: boolean }>({});
  const replyFieldRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);
  const [activeEmojiTarget, setActiveEmojiTarget] = useState<'main' | string>('main');

  // Use the posts hook with initial data
  const { 
    posts: apiPosts, 
    loading: postsLoading, 
    error: postsError,
    hasMore,
    loadMore,
    toggleReaction,
  } = usePosts({ 
    filters: { 
      sort: 'created_at',
      category: categoryFilter || undefined 
    },
    autoLoad: false // Don't auto-load since we have initial data
  });

  // Update allPosts when apiPosts change
  useEffect(() => {
    if (apiPosts.length > 0) {
      setAllPosts(apiPosts.map(transformPost));
      setHasMoreState(hasMore);
    }
  }, [apiPosts, hasMore]);

  // Expose method to add a new post
  useImperativeHandle(ref, () => ({
    addPost: (newPost: ApiPost) => {
      const transformedPost = transformPost(newPost);
      setAllPosts(prev => [transformedPost, ...prev]);
      
      // Mark this post as newly created so it won't be filtered out
      setNewlyCreatedPosts(prev => new Set([...prev, newPost.id]));
    }
  }), []);

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>, target: 'main' | string = 'main') => {
    setEmojiPickerAnchor(event.currentTarget);
    setActiveEmojiTarget(target);
  };

  const handleEmojiSelect = async (emoji: string) => {
    if (activeEmojiTarget && activeEmojiTarget.startsWith('post-')) {
      const postId = activeEmojiTarget.replace('post-', '');
      const post = allPosts.find(p => p.id === postId);
      if (post) {
        // Check if user already reacted with this emoji
        const existingReaction = post.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Use the existing reaction (which has the correct hasReacted state)
          await handlePostReactionToggle(post, existingReaction);
        } else {
          // Create a new reaction object
          const reaction = { emoji, count: 1, hasReacted: true, users: [user?.name || "Anonymous"] };
          await handlePostReactionToggle(post, reaction);
        }
      }
    }
    // Close emoji picker
    setEmojiPickerAnchor(null);
    setActiveEmojiTarget('main');
  };

  const handleReactionToggle = (postId: string, replyId: string, reaction: any) => {
    setAllPosts(prevPosts => 
      prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            replies: p.replies?.map(r => {
              if (r.id === replyId) {
                return {
                  ...r,
                  reactions: r.reactions?.map(react => 
                    react.emoji === reaction.emoji 
                      ? { 
                          ...react, 
                          count: react.hasReacted ? react.count - 1 : react.count + 1, 
                          hasReacted: !react.hasReacted,
                          users: react.hasReacted 
                            ? react.users?.filter(u => u !== user?.name) || []
                            : [user?.name || "Anonymous", ...(react.users || [])]
                        }
                      : react
                  ).filter(react => react.count > 0)
                };
              }
              return r;
            })
          };
        }
        return p;
      })
    );
  };

  const handleReplyTextChange = (key: string, text: string) => {
    setReplyTexts(prev => ({ ...prev, [key]: text }));
  };

  const handleReplySubmit = (postId: string) => {
    const replyText = replyTexts[postId];
    if (!replyText?.trim()) return;
    
    const replyingToUser = replyingTo[postId];
    
    setAllPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReply = {
            id: `r${Date.now()}`,
            user: {
              name: user?.name || "Anonymous",
              initials: user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "AN",
              avatarColor: "#1976d2",
            },
            content: replyText,
            timeAgo: "just now",
            reactions: [],
            parentReplyId: replyingToUser?.id || null,
          };
          return {
            ...post,
            replies: [...(post.replies || []), newReply]
          };
        }
        return post;
      })
    );
    
    setReplyTexts(prev => ({ ...prev, [postId]: "" }));
    setReplyingTo(prev => ({ ...prev, [postId]: null }));
  };

  const handleReplyClick = (postId: string, replyId: string, replyUserName: string) => {
    const replyKey = `${postId}-${replyId}`;
    
    // Toggle the reply field visibility
    setActiveReplyFields(prev => ({ ...prev, [replyKey]: !prev[replyKey] }));
    
    // If opening the reply field, set up the mention
    if (!activeReplyFields[replyKey]) {
      const mention = `@${replyUserName} `;
      setReplyTexts(prev => ({ ...prev, [replyKey]: mention }));
      
      // Focus the input after a short delay
      setTimeout(() => {
        const input = replyFieldRefs.current[replyKey];
        if (input) {
          input.focus();
          input.setSelectionRange(mention.length, mention.length);
        }
      }, 100);
    }
  };

  const toggleReplyCollapse = (replyId: string) => {
    setCollapsedReplies(prev => ({ ...prev, [replyId]: !prev[replyId] }));
  };

  const handleNestedReplySubmit = (postId: string, parentReplyId: string) => {
    const replyKey = `${postId}-${parentReplyId}`;
    const text = replyTexts[replyKey]?.trim();
    
    if (!text) return;
    
    setAllPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReply = {
            id: `r${Date.now()}`,
            user: {
              name: user?.name || "Anonymous",
              initials: user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "AN",
              avatarColor: "#6366f1",
            },
            content: text,
            timeAgo: "Just now",
            reactions: [],
            parentReplyId: parentReplyId,
          };
          return {
            ...post,
            replies: [...(post.replies || []), newReply]
          };
        }
        return post;
      })
    );
    
    // Clear the text and hide the reply field
    setReplyTexts(prev => ({ ...prev, [replyKey]: "" }));
    setActiveReplyFields(prev => ({ ...prev, [replyKey]: false }));
  };

  const handlePostReactionToggle = async (post: UIPost, reaction: any) => {
    
    // If we have apiPosts (autoLoad: true), use the hook's toggleReaction
    if (apiPosts.length > 0) {
      try {
        await toggleReaction(post.id, reaction.emoji);
      } catch (error) {
        console.error('Failed to toggle reaction:', error);
      }
    } else {
      // For initialPosts (autoLoad: false), update local state
      setAllPosts(prevPosts => 
        prevPosts.map(p => {
          if (p.id === post.id) {
            const existingReaction = p.reactions?.find(r => r.emoji === reaction.emoji);
            
            if (existingReaction) {
              // Toggle existing reaction
              const updatedReactions = p.reactions?.map(r => 
                r.emoji === reaction.emoji 
                  ? { 
                      ...r, 
                      count: r.hasReacted ? r.count - 1 : r.count + 1, 
                      hasReacted: !r.hasReacted,
                      users: r.hasReacted 
                        ? r.users?.filter(u => u !== user?.name) || []
                        : [user?.name || "Anonymous", ...(r.users || [])]
                    }
                  : r
              ).filter(r => r.count > 0) || [];
              
              return {
                ...p,
                reactions: updatedReactions
              };
            } else {
              // Add new reaction
              return {
                ...p,
                reactions: [...(p.reactions || []), {
                  emoji: reaction.emoji,
                  count: 1,
                  hasReacted: true,
                  users: [user?.name || "Anonymous"]
                }]
              };
            }
          }
          return p;
        })
      );
      
      // Call the API directly
      try {
        await postService.toggleReaction(post.id, reaction.emoji);
      } catch (error) {
        console.error('Failed to toggle reaction:', error);
        // TODO: Revert the optimistic update on error
      }
    }
  };

  const handleEditPost = (postId: string, title: string, content: string) => {
    // TODO: Implement edit post API call
    
    // For now, update the post in local state immediately for better UX
    setAllPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          title,
          content: {
            greeting: content.split('\n\n')[0] || content,
            paragraphs: content.split('\n\n').slice(1)
          }
        };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      // TODO: Call delete API
      
      // Remove post from local state immediately for better UX
      setAllPosts(prev => prev.filter(post => post.id !== postToDelete));
      
      // Also remove from newly created posts if it exists there
      setNewlyCreatedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postToDelete);
        return newSet;
      });
      
      // Close modal and reset state
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      // TODO: Show error message to user
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const handleBookmarkToggle = (postId: string) => {
    // Update post bookmark state immediately for better UX
    setAllPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newBookmarkCount = post.isBookmarked 
          ? post.stats.bookmarks - 1 
          : post.stats.bookmarks + 1;
        
        return {
          ...post,
          isBookmarked: !post.isBookmarked,
          stats: {
            ...post.stats,
            bookmarks: newBookmarkCount
          }
        };
      }
      return post;
    }));
    
    // TODO: Call bookmark API
  };

  // Show empty state if no posts and not loading more
  if (postsState.length === 0 && !hasMoreState) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No posts yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Be the first to share something with the community!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {categoryFilter && (
        <Box sx={{ 
          mb: 2, 
          p: 1.5, 
          backgroundColor: mode === "dark" ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: 1
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Showing posts in: {categoryFilter}
          </Typography>
        </Box>
      )}
      <InfiniteScroll
        dataLength={postsState.length}
        next={loadMore}
        hasMore={hasMoreState}
        loader={
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Loading more posts...
              </Typography>
            </Box>
          }
          endMessage={
            postsState.length > 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No more posts to load
                </Typography>
              </Box>
            ) : null
          }
        >
          <Stack spacing={3}>
          {postsState.map((post) => {
            return (
            <PostCard
              key={post.id}
              post={post}
              onEmojiClick={handleEmojiClick}
              onReactionToggle={handleReactionToggle}
              replyTexts={replyTexts}
              onReplyTextChange={handleReplyTextChange}
              onReplySubmit={handleReplySubmit}
              replyingTo={replyingTo[post.id]}
              onReplyingToChange={(value) => setReplyingTo(prev => ({ ...prev, [post.id]: value }))}
              onReplyClick={handleReplyClick}
              activeReplyFields={activeReplyFields}
              onNestedReplySubmit={handleNestedReplySubmit}
              replyFieldRefs={replyFieldRefs}
              onPostReactionToggle={handlePostReactionToggle}
              collapsedReplies={collapsedReplies}
              onToggleReplyCollapse={toggleReplyCollapse}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onBookmarkToggle={handleBookmarkToggle}
              darkMode={mode === "dark"}
            />
            );
          })}
      </Stack>
    </InfiniteScroll>
    
    {/* Delete Confirmation Modal */}
    <ConfirmationModal
      open={deleteModalOpen}
      onClose={handleCancelDelete}
      onConfirm={handleConfirmDelete}
      title="Delete Post"
      description="Are you sure you want to delete this post? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      confirmColor="error"
    />
    
    {/* Emoji Picker */}
    <EmojiPicker
      anchorEl={emojiPickerAnchor}
      open={Boolean(emojiPickerAnchor)}
      onClose={() => {
        setEmojiPickerAnchor(null);
        setActiveEmojiTarget('main');
      }}
      onSelectEmoji={handleEmojiSelect}
    />
    </Box>
  );
});

PostsFeed.displayName = 'PostsFeed';