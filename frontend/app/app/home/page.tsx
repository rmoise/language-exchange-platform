"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Stack } from "@mui/material";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import MembersModal from "@/components/ui/MembersModal";
import { EmojiPicker } from "@/features/emoji";
import { ReplyItem, buildReplyTree, formatReactionTooltip, type Reply, type Post } from "@/features/comments";
import { AskMembersQuestion } from "@/features/posts";
import {
  AboutSection,
  LanguageLearningCommunityCard,
  PostCard,
  RulesSection,
  TrendingTopics,
  mockPosts,
  aboutData,
  trendingTopics,
} from "@/features/home";


export default function HomePage() {
  const { mode } = useCustomTheme();
  const [mounted, setMounted] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);
  const [activeEmojiTarget, setActiveEmojiTarget] = useState<'main' | string>('main');
  const [postsState, setPostsState] = useState<Post[]>(mockPosts as Post[]);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ [postId: string]: { id: string; name: string } | null }>({});
  const [hiddenReplies, setHiddenReplies] = useState<{ [postId: string]: boolean }>({});
  const [activeReplyFields, setActiveReplyFields] = useState<{ [key: string]: boolean }>({});
  const replyFieldRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>, target: 'main' | string = 'main') => {
    setEmojiPickerAnchor(event.currentTarget);
    setActiveEmojiTarget(target);
  };

  const handleEmojiClose = () => {
    setEmojiPickerAnchor(null);
  };


  const handleReactionToggle = (postId: string, replyId: string, reaction: any) => {
    setPostsState(prevPosts => 
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
                            ? react.users?.filter(u => u !== "You") || []
                            : ["You", ...(react.users || [])]
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
    
    setPostsState(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReply = {
            id: `r${Date.now()}`,
            user: {
              name: "Current User",
              initials: "CU",
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

  const toggleReplies = (postId: string) => {
    setHiddenReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleNestedReplySubmit = (postId: string, parentReplyId: string) => {
    const replyKey = `${postId}-${parentReplyId}`;
    const text = replyTexts[replyKey]?.trim();
    
    if (!text) return;
    
    setPostsState(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newReply = {
            id: `r${Date.now()}`,
            user: {
              name: "You",
              initials: "Y",
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

  const handlePostReactionToggle = (post: Post, reaction: any) => {
    setPostsState(prevPosts => 
      prevPosts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            reactions: p.reactions?.map(r => 
              r.emoji === reaction.emoji 
                ? { 
                    ...r, 
                    count: r.hasReacted ? r.count - 1 : r.count + 1, 
                    hasReacted: !r.hasReacted,
                    users: r.hasReacted 
                      ? r.users?.filter(u => u !== "You") || []
                      : ["You", ...(r.users || [])]
                  }
                : r
            ).filter(r => r.count > 0)
          };
        }
        return p;
      })
    );
  };

  const handleEmojiSelect = (emoji: string) => {
    if (activeEmojiTarget.startsWith('post-')) {
      // Add reaction to post
      const postId = activeEmojiTarget.replace('post-', '');
      setPostsState(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const existingReaction = post.reactions?.find(r => r.emoji === emoji);
            if (existingReaction) {
              // Toggle existing reaction
              return {
                ...post,
                reactions: post.reactions?.map(r => 
                  r.emoji === emoji 
                    ? { 
                        ...r, 
                        count: r.hasReacted ? r.count - 1 : r.count + 1, 
                        hasReacted: !r.hasReacted,
                        users: r.hasReacted 
                          ? r.users.filter(u => u !== "You")
                          : ["You", ...r.users]
                      }
                    : r
                ).filter(r => r.count > 0)
              };
            } else {
              // Add new reaction
              return {
                ...post,
                reactions: [...(post.reactions || []), { emoji, count: 1, hasReacted: true, users: ["You"] }]
              };
            }
          }
          return post;
        })
      );
      handleEmojiClose();
    } else if (activeEmojiTarget.startsWith('reply-')) {
      // Add reaction to reply
      const parts = activeEmojiTarget.split('-');
      const postId = parts[1];
      const replyId = parts[2];
      setPostsState(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              replies: post.replies?.map(reply => {
                if (reply.id === replyId) {
                  const existingReaction = reply.reactions?.find(r => r.emoji === emoji);
                  if (existingReaction) {
                    // Toggle existing reaction
                    return {
                      ...reply,
                      reactions: reply.reactions?.map(r => 
                        r.emoji === emoji 
                          ? { 
                              ...r, 
                              count: r.hasReacted ? r.count - 1 : r.count + 1, 
                              hasReacted: !r.hasReacted,
                              users: r.hasReacted 
                                ? r.users?.filter(u => u !== "You") || []
                                : ["You", ...(r.users || [])]
                            }
                          : r
                      ).filter(r => r.count > 0)
                    };
                  } else {
                    // Add new reaction
                    return {
                      ...reply,
                      reactions: [...(reply.reactions || []), { emoji, count: 1, hasReacted: true, users: ["You"] }]
                    };
                  }
                }
                return reply;
              })
            };
          }
          return post;
        })
      );
      handleEmojiClose();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: mode === "dark" ? "#000000" : "#FFFFFF",
        color: mode === "dark" ? "white" : "inherit",
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
        {/* Language Learning Community Card - Full Width */}
        <LanguageLearningCommunityCard 
          memberCount={26905}
          onMembersClick={() => setMembersModalOpen(true)}
          darkMode={mode === "dark"}
        />

        <Stack direction="row" spacing={3}>
          {/* Left Sidebar */}
          <Box sx={{ width: 280, flexShrink: 0 }}>
            {/* About Section */}
            <AboutSection 
              memberCount={aboutData.memberCount}
              onMembersClick={() => setMembersModalOpen(true)}
              darkMode={mode === "dark"}
            />

            {/* Trending Topics */}
            <TrendingTopics 
              topics={trendingTopics}
              darkMode={mode === "dark"}
            />

            {/* Rules Section */}
            <RulesSection 
              rules={aboutData.rules}
              darkMode={mode === "dark"}
            />
          </Box>

          {/* Main Content - Center Column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Create Post Area */}
            <Box sx={{ mb: 3 }}>
              <AskMembersQuestion 
                onPost={(text) => {
                  // Handle post submission
                  console.log("Posting:", text);
                }}
                darkMode={mode === "dark"}
              />
            </Box>

            {/* Posts Feed */}
            <Stack spacing={2}>
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
                  darkMode={mode === "dark"}
                />
              ))}
            </Stack>
          </Box>

        </Stack>
      </Box>
      
      {/* Members Modal */}
      <MembersModal 
        open={membersModalOpen} 
        onClose={() => setMembersModalOpen(false)} 
      />
      
      {/* Emoji Picker */}
      <EmojiPicker
        anchorEl={emojiPickerAnchor}
        open={Boolean(emojiPickerAnchor)}
        onClose={handleEmojiClose}
        onSelectEmoji={handleEmojiSelect}
      />
    </Box>
  );
}