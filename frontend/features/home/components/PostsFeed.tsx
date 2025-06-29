"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Stack, Box, Typography } from "@mui/material";
import { useInView } from "react-intersection-observer";
import { PostCard } from "./PostCard";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { transformPost } from "@/features/posts/utils/postAdapter";
import { Post as ApiPost, postService } from "@/features/posts/services/postService";
import { Post as UIPost } from "@/features/comments/types";
import { useColorScheme } from '@mui/material/styles';
import ConfirmationModal from "@/features/users/components/ConfirmationModal";
import { EmojiPicker } from "@/features/emoji";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { selectRecentLevelUps, clearLevelUpEvent, type LevelUpEvent } from "@/features/gamification/gamificationSlice";
import LevelUpCelebrationCard from "@/components/ui/LevelUpCelebrationCard";

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
  const { mode } = useColorScheme();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const recentLevelUps = useAppSelector(selectRecentLevelUps);
  const [allPosts, setAllPosts] = useState<UIPost[]>(() => 
    (initialPosts || []).map(transformPost)
  );
  const [hasMoreState, setHasMoreState] = useState(hasMoreInitial);
  const [newlyCreatedPosts, setNewlyCreatedPosts] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
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
    refresh,
  } = usePosts({ 
    filters: { 
      sort: 'created_at',
      category: categoryFilter || undefined 
    },
    autoLoad: false // Don't auto-load since we have initial data
  });

  // Initialize allPosts only once with initial data
  useEffect(() => {
    if (!categoryFilter && allPosts.length === 0 && initialPosts.length > 0) {
      setAllPosts(initialPosts.map(transformPost));
      setHasMoreState(hasMoreInitial);
    }
  }, [initialPosts.length, hasMoreInitial]); // Only depend on the length to avoid re-running

  // Update posts when apiPosts change (after filtering)
  useEffect(() => {
    if (categoryFilter && apiPosts.length >= 0) {
      setAllPosts(apiPosts.map(transformPost));
      setHasMoreState(hasMore);
    }
  }, [apiPosts, hasMore, categoryFilter]);

  // When category filter changes, fetch new data
  const prevCategoryRef = useRef(categoryFilter);
  useEffect(() => {
    if (prevCategoryRef.current !== categoryFilter) {
      prevCategoryRef.current = categoryFilter;
      
      if (categoryFilter) {
        refresh();
      } else {
        // Reset to initial posts when clearing filter
        setAllPosts((initialPosts || []).map(transformPost));
        setHasMoreState(hasMoreInitial);
      }
    }
  }, [categoryFilter, refresh, initialPosts, hasMoreInitial]);

  // Use allPosts directly as postsState
  const postsState = allPosts;

  // Expose method to add a new post
  useImperativeHandle(ref, () => ({
    addPost: (newPost: ApiPost) => {
      const transformedPost = transformPost(newPost);
      
      // If we have a category filter and the new post matches, refresh to get it from API
      if (categoryFilter && newPost.category === categoryFilter) {
        refresh();
      } else if (!categoryFilter) {
        // No filter, add to the beginning
        setAllPosts(prev => [transformedPost, ...prev]);
      }
      // If category doesn't match, don't add it to the view
    }
  }), [categoryFilter, refresh]);

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

  // Handle level up celebration dismissal
  const handleDismissLevelUp = (timestamp: string) => {
    dispatch(clearLevelUpEvent(timestamp));
  };

  // Handle level up sharing
  const handleShareLevelUp = (levelUpEvent: LevelUpEvent) => {
    // TODO: Implement sharing functionality
    console.log('Sharing level up:', levelUpEvent);
  };

  // Handle level up reactions
  const handleLevelUpReaction = (timestamp: string, reaction: any) => {
    // TODO: Implement level up reaction functionality
    console.log('Level up reaction:', timestamp, reaction);
  };

  // Handle level up replies
  const handleLevelUpReply = (timestamp: string, replyText: string) => {
    // TODO: Implement level up reply functionality
    console.log('Level up reply:', timestamp, replyText);
  };

  // Set up intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Load more posts when the loader comes into view
  useEffect(() => {
    if (inView && hasMoreState && !postsLoading) {
      loadMore();
    }
  }, [inView, hasMoreState, postsLoading, loadMore]);

  // Show empty state if no posts and not loading more
  if (postsState.length === 0 && !hasMoreState && !postsLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {categoryFilter ? `No ${categoryFilter} posts yet` : 'No posts yet'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {categoryFilter 
            ? `Be the first to share something about ${categoryFilter}!`
            : 'Be the first to share something with the community!'}
        </Typography>
      </Box>
    );
  }

  // Show loading state if loading and no posts yet
  if (postsState.length === 0 && postsLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          Loading posts...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        // Container optimizations for smooth scrolling
        isolation: 'isolate', // Create new stacking context
        position: 'relative',
        zIndex: 0,
      }}
    >
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
      <Stack 
        spacing={3}
        sx={{
          // Optimize for scrolling performance
          contain: 'layout style paint',
          willChange: 'contents',
        }}
      >
        {/* Level Up Celebration Cards */}
        {recentLevelUps.map((levelUpEvent) => (
          user && levelUpEvent.userId === user.id && (
            <LevelUpCelebrationCard
              key={levelUpEvent.timestamp}
              user={{
                id: user.id,
                name: user.name,
                profileImage: user.profileImage,
              }}
              currentUser={user}
              newLevel={levelUpEvent.newLevel}
              xpGained={levelUpEvent.xpGained}
              onDismiss={() => handleDismissLevelUp(levelUpEvent.timestamp)}
              onShare={() => handleShareLevelUp(levelUpEvent)}
              onEmojiClick={(e) => handleEmojiClick(e, `levelup-${levelUpEvent.timestamp}`)}
              onReactionToggle={(reaction) => handleLevelUpReaction(levelUpEvent.timestamp, reaction)}
              onReplySubmit={(replyText) => handleLevelUpReply(levelUpEvent.timestamp, replyText)}
              reactions={[
                // Mock reactions for demo - replace with real data
                { emoji: "🎉", count: 3, hasReacted: false, users: ["Alice", "Bob", "Charlie"] },
                { emoji: "👏", count: 2, hasReacted: true, users: ["Dave", "Eve"] },
              ]}
              replies={[
                // Mock replies for demo - replace with real data
                {
                  id: "reply1",
                  user: { name: "Alice", initials: "AL", avatarColor: "#6366f1" },
                  content: "Congratulations! Well deserved! 🎉",
                  timeAgo: "2m ago"
                },
                {
                  id: "reply2", 
                  user: { name: "Bob", initials: "BO", avatarColor: "#10b981" },
                  content: "Amazing progress, keep it up!",
                  timeAgo: "5m ago"
                }
              ]}
              darkMode={mode === "dark"}
            />
          )
        ))}
        
        {postsState.map((post) => (
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
        ))}
        
        {/* Loading indicator and intersection observer target */}
        {hasMoreState && (
          <Box 
            ref={loadMoreRef} 
            sx={{ 
              textAlign: 'center', 
              py: 2,
              minHeight: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {postsLoading ? (
              <Typography variant="body2" color="text.secondary">
                Loading more posts...
              </Typography>
            ) : (
              <Box sx={{ height: 1 }} /> // Invisible trigger element
            )}
          </Box>
        )}
        
        {/* End message */}
        {postsState.length > 0 && !hasMoreState && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No more posts to load
            </Typography>
          </Box>
        )}
      </Stack>
    
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