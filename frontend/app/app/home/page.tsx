"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Stack, Avatar, Typography, Button, Chip } from "@mui/material";
import { 
  Forum as ForumIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  TrendingUp as TrendingUpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import MembersModal from "@/components/ui/MembersModal";
import { EmojiPicker } from "@/features/emoji";
import { ReplyItem, buildReplyTree, formatReactionTooltip, type Reply, type Post } from "@/features/comments";
import { AskMembersQuestion } from "@/features/posts";
import {
  PostCard,
  mockPosts,
  aboutData,
  trendingTopics,
} from "@/features/home";
import { LearningDashboard, TextSelectionHandler, SidebarLearningWidget } from "@/features/flashcards";
import { ImageTranslationFAB, ImageTranslationModal } from "@/features/image-translation";
import { getLanguageCode } from "@/utils/languageMapping";


export default function HomePage() {
  const { mode } = useCustomTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [imageTranslationOpen, setImageTranslationOpen] = useState(false);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);
  const [activeEmojiTarget, setActiveEmojiTarget] = useState<'main' | string>('main');
  const [postsState, setPostsState] = useState<Post[]>(mockPosts as Post[]);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ [postId: string]: { id: string; name: string } | null }>({});
  const [hiddenReplies, setHiddenReplies] = useState<{ [postId: string]: boolean }>({});
  const [collapsedReplies, setCollapsedReplies] = useState<{ [replyId: string]: boolean }>({});
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

  const toggleReplyCollapse = (replyId: string) => {
    setCollapsedReplies(prev => ({ ...prev, [replyId]: !prev[replyId] }));
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

  const isDarkMode = mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#0a0a0a" : "#f5f7fa",
        color: isDarkMode ? "white" : "inherit",
      }}
    >
      <Box sx={{ maxWidth: 1600, mx: "auto", p: { xs: 2, lg: 3 } }}>
        {/* Modern Dashboard Header */}
        <Box sx={{ mb: 3 }}>
          {/* Modern Forum Header */}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2, gap: { xs: 2, sm: 0 } }}>
            <Stack spacing={1}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: "24px", md: "32px", lg: "36px" },
                  background: mode === "dark" 
                    ? "linear-gradient(to right, #fff, #a5b4fc)" 
                    : "linear-gradient(to right, #1a1a1a, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Language Learning Community
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Chip 
                  icon={<PublicIcon sx={{ fontSize: 16 }} />} 
                  label="Public Community" 
                  size="small"
                  sx={{
                    backgroundColor: mode === "dark" ? "rgba(99, 102, 241, 0.1)" : "rgba(25, 118, 210, 0.1)",
                    border: "1px solid",
                    borderColor: mode === "dark" ? "rgba(99, 102, 241, 0.3)" : "rgba(25, 118, 210, 0.3)",
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: mode === "dark" ? "#9ca3af" : "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" }
                  }}
                  onClick={() => setMembersModalOpen(true)}
                >
                  <PeopleIcon sx={{ fontSize: 18 }} />
                  26,905 members
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                  color: mode === "dark" ? "white" : "#1a1a1a",
                  "&:hover": {
                    borderColor: mode === "dark" ? "#6366f1" : "#1976d2",
                    backgroundColor: mode === "dark" ? "rgba(99, 102, 241, 0.05)" : "rgba(25, 118, 210, 0.05)",
                  },
                }}
              >
                Invite Members
              </Button>
            </Stack>
          </Stack>

          {/* Horizontal Trending Topics */}
          <Box sx={{ mt: 3, overflow: 'visible' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                fontSize: "18px",
                mb: 1.5,
                color: mode === "dark" ? "white" : "#1a1a1a",
              }}
            >
              🔥 Trending Now
            </Typography>
            <Box 
              sx={{ 
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 3,
                pt: 1,
                px: 1,
                mx: -1,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              {trendingTopics.slice(0, 8).map((topic, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: 200,
                    backgroundColor: mode === "dark" ? "rgba(30, 30, 30, 0.8)" : "white",
                    border: "1px solid",
                    borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
                    borderRadius: "12px",
                    p: 2.5,
                    cursor: 'pointer',
                    transition: "all 0.3s ease",
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: mode === "dark" 
                        ? "0 8px 24px rgba(99, 102, 241, 0.15)" 
                        : "0 8px 24px rgba(0, 0, 0, 0.08)",
                      borderColor: mode === "dark" ? "#6366f1" : "#1976d2",
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography 
                        sx={{ 
                          fontSize: "24px",
                          lineHeight: 1,
                        }}
                      >
                        {topic.icon || '🌐'}
                      </Typography>
                      <Chip 
                        label={`+${Math.floor(Math.random() * 30 + 10)}%`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(34, 197, 94, 0.1)",
                          color: "#22c55e",
                          fontSize: "11px",
                          height: "20px",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: mode === "dark" ? 'white' : '#1a1a1a',
                        fontSize: "15px",
                      }}
                    >
                      {topic.name}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: mode === "dark" ? '#9ca3af' : '#6b7280',
                          fontSize: '12px',
                        }}
                      >
                        {Math.floor(Math.random() * 100 + 50)} posts
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: mode === "dark" ? '#9ca3af' : '#6b7280',
                          fontSize: '12px',
                        }}
                      >
                        {Math.floor(Math.random() * 50 + 20)} active
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>

        </Box>

        {/* Main Content Grid */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mt: 2 }}>
          {/* Left Sidebar - Modern Categories */}
          <Box sx={{ 
            width: { xs: '100%', lg: 280, xl: 320 }, 
            flexShrink: 0, 
            display: { xs: 'none', lg: 'block' } 
          }}>
            {/* Categories Card */}
            <Box
              sx={{
                mb: 3,
                backgroundColor: mode === "dark" ? "rgba(30, 30, 30, 0.5)" : "white",
                border: "1px solid",
                borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
                borderRadius: "12px",
                p: 2.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: "16px" }}>
                Categories
              </Typography>
              <Stack spacing={1}>
                {[
                  { name: "General Discussion", count: 234, color: "#6366f1", icon: "💬" },
                  { name: "Grammar Help", count: 156, color: "#ec4899", icon: "📝" },
                  { name: "Vocabulary", count: 89, color: "#10b981", icon: "📚" },
                  { name: "Speaking Practice", count: 67, color: "#f59e0b", icon: "🗣️" },
                  { name: "Resources", count: 45, color: "#8b5cf6", icon: "📖" },
                ].map((category, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography sx={{ fontSize: "18px" }}>{category.icon}</Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: mode === "dark" ? "white" : "#1a1a1a",
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Stack>
                    <Chip 
                      label={category.count} 
                      size="small"
                      sx={{
                        backgroundColor: `${category.color}15`,
                        color: category.color,
                        fontSize: "12px",
                        height: "24px",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Active Members */}
            <Box
              sx={{
                mt: 3,
                backgroundColor: mode === "dark" ? "rgba(30, 30, 30, 0.5)" : "white",
                border: "1px solid",
                borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
                borderRadius: "12px",
                p: 2.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px" }}>
                  🟢 Active Now
                </Typography>
                <Chip 
                  label="234 online" 
                  size="small"
                  sx={{
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    color: "#22c55e",
                    fontSize: "11px",
                    height: "20px",
                  }}
                />
              </Stack>
              <Stack spacing={1.5}>
                {[
                  { name: "Sarah Chen", status: "Learning Spanish", avatar: "SC", color: "#ec4899" },
                  { name: "Alex Kim", status: "Native Korean speaker", avatar: "AK", color: "#6366f1" },
                  { name: "Maria Lopez", status: "Teaching English", avatar: "ML", color: "#10b981" },
                  { name: "John Smith", status: "French conversation", avatar: "JS", color: "#f59e0b" },
                ].map((member, index) => (
                  <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        backgroundColor: member.color,
                        fontSize: "12px",
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: "13px",
                          color: mode === "dark" ? "white" : "#1a1a1a",
                        }}
                      >
                        {member.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: mode === "dark" ? "#9ca3af" : "#6b7280",
                          fontSize: "11px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {member.status}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        backgroundColor: "#22c55e",
                        borderRadius: "50%",
                        border: "2px solid",
                        borderColor: mode === "dark" ? "#0a0a0a" : "white",
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>

          </Box>

          {/* Main Content - Center Feed */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            maxWidth: { xs: '100%', lg: 720, xl: 800 },
            mx: { xs: 0, lg: 'auto' }
          }}>
            {/* Create Post Area - Modern Design */}
            <Box sx={{ mb: 3 }}>
              <AskMembersQuestion 
                onPost={(text) => {
                  console.log("Posting:", text);
                }}
                darkMode={mode === "dark"}
                compact={false}
              />
            </Box>

            {/* Posts Feed - Modern Card Design */}
            <Stack spacing={3}>
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
                  darkMode={mode === "dark"}
                />
              ))}
            </Stack>
          </Box>

          {/* Right Sidebar - Active Members & Learning */}
          <Box sx={{ 
            width: { xs: '100%', lg: 320, xl: 380 }, 
            flexShrink: 0, 
            display: { xs: 'none', lg: 'block' } 
          }}>

            {/* Learning Progress Widget */}
            {user ? (
              <SidebarLearningWidget 
                darkMode={mode === "dark"}
              />
            ) : (
              <Box
                sx={{
                  mb: 3,
                  backgroundColor: mode === "dark" ? "rgba(30, 30, 30, 0.5)" : "white",
                  border: "1px solid",
                  borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
                  borderRadius: "12px",
                  p: 2.5,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px", mb: 2 }}>
                  📚 Your Learning
                </Typography>
                <Typography variant="body2" sx={{ color: mode === "dark" ? "#9ca3af" : "#6b7280" }}>
                  Sign in to track your learning progress
                </Typography>
              </Box>
            )}

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
      
      {/* Text Selection Handler for word capture */}
      <TextSelectionHandler 
        darkMode={mode === "dark"}
        targetLanguage={getLanguageCode(user?.targetLanguages?.[0] || "en")}
        nativeLanguage={getLanguageCode(user?.nativeLanguages?.[0] || "es")}
      />
      
      {/* Image Translation FAB */}
      <ImageTranslationFAB 
        onClick={() => setImageTranslationOpen(true)}
        darkMode={mode === "dark"}
      />
      
      {/* Image Translation Modal */}
      <ImageTranslationModal
        open={imageTranslationOpen}
        onClose={() => setImageTranslationOpen(false)}
        darkMode={mode === "dark"}
        nativeLanguage={getLanguageCode(user?.nativeLanguages?.[0] || "en")}
      />
    </Box>
  );
}