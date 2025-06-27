"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  IconButton,
  Box,
  Button,
  Link,
  TextField,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  MoreHoriz as MoreIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Send as SendIcon,
  Add as AddIcon,
  Close as CloseIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { ReplyItem, buildReplyTree, formatReactionTooltip, type Reply, type Post } from "@/features/comments";
import { LinkPreview } from "@/components/ui/LinkPreview";
import UserAvatar from "@/components/ui/UserAvatar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface PostCardProps {
  post: Post;
  onEmojiClick: (event: React.MouseEvent<HTMLElement>, target: string) => void;
  onReactionToggle: (postId: string, replyId: string, reaction: any) => void;
  replyTexts: { [key: string]: string };
  onReplyTextChange: (key: string, text: string) => void;
  onReplySubmit: (postId: string) => void;
  replyingTo: { id: string; name: string } | null;
  onReplyingToChange: (value: { id: string; name: string } | null) => void;
  onReplyClick: (postId: string, replyId: string, replyUserName: string) => void;
  activeReplyFields: { [key: string]: boolean };
  onNestedReplySubmit: (postId: string, parentReplyId: string) => void;
  replyFieldRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  onPostReactionToggle: (post: Post, reaction: any) => void;
  collapsedReplies: { [replyId: string]: boolean };
  onToggleReplyCollapse: (replyId: string) => void;
  onEditPost?: (postId: string, title: string, content: string) => void;
  onDeletePost?: (postId: string) => void;
  onBookmarkToggle?: (postId: string) => void;
  darkMode?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEmojiClick,
  onReactionToggle,
  replyTexts,
  onReplyTextChange,
  onReplySubmit,
  replyingTo,
  onReplyingToChange,
  onReplyClick,
  activeReplyFields,
  onNestedReplySubmit,
  replyFieldRefs,
  onPostReactionToggle,
  collapsedReplies,
  onToggleReplyCollapse,
  onEditPost,
  onDeletePost,
  onBookmarkToggle,
  darkMode = false,
}) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const replyInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [truncateLength, setTruncateLength] = useState(150);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(() => {
    // Convert complex content structure to simple string for editing
    const fullContent = [post.content.greeting, ...post.content.paragraphs].join('\n\n');
    return fullContent;
  });
  
  const handleUserClick = () => {
    if (post.user.id) {
      router.push(`/app/profile/${post.user.id}`);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    setIsEditing(true);
    setEditedTitle(post.title);
    const fullContent = [post.content.greeting, ...post.content.paragraphs].join('\n\n');
    setEditedContent(fullContent);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDeletePost?.(post.id);
  };

  const handleSaveEdit = () => {
    // Call the onEditPost with the edited data
    onEditPost?.(post.id, editedTitle, editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(post.title);
    const fullContent = [post.content.greeting, ...post.content.paragraphs].join('\n\n');
    setEditedContent(fullContent);
  };

  // Check if current user owns this post
  const isOwner = currentUser?.id === post.user.id;
  
  // Make truncation responsive based on viewport width
  React.useEffect(() => {
    const updateTruncateLength = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setTruncateLength(100); // Mobile
      } else if (width < 900) {
        setTruncateLength(150); // Tablet
      } else if (width < 1200) {
        setTruncateLength(200); // Small desktop
      } else {
        setTruncateLength(250); // Large desktop
      }
    };

    updateTruncateLength();
    window.addEventListener('resize', updateTruncateLength);
    return () => window.removeEventListener('resize', updateTruncateLength);
  }, []);

  return (
    <Box
      data-post-id={post.id}
      sx={{
        position: "relative",
        borderRadius: "12px",
      }}
    >
      <Stack spacing={0}>
        {/* Category header with color coding */}
        {post.category && (() => {
          // Define color schemes based on category
          const categoryColors = {
            grammar: {
              bg: darkMode ? "#2a3f5f" : "#f0f7ff",
              border: darkMode ? "#3b5a8f" : "#2563eb",
              text: darkMode ? "#93bbf9" : "#2563eb",
              icon: "📝"
            },
            pronunciation: {
              bg: darkMode ? "#4a3b5a" : "#fdf0ff",
              border: darkMode ? "#5f4b75" : "#9333ea",
              text: darkMode ? "#d8b4fe" : "#9333ea",
              icon: "🗣️"
            },
            vocabulary: {
              bg: darkMode ? "#3b5a4a" : "#f0fdf4",
              border: darkMode ? "#4b7560" : "#16a34a",
              text: darkMode ? "#86efac" : "#16a34a",
              icon: "📚"
            },
            conversation: {
              bg: darkMode ? "#5a4a3b" : "#fffbeb",
              border: darkMode ? "#75604b" : "#f59e0b",
              text: darkMode ? "#fcd34d" : "#f59e0b",
              icon: "💬"
            },
            writing: {
              bg: darkMode ? "#5a3b4a" : "#fff0f6",
              border: darkMode ? "#754b5f" : "#ec4899",
              text: darkMode ? "#f9a8d4" : "#ec4899",
              icon: "✍️"
            },
            culture: {
              bg: darkMode ? "#3b4a5a" : "#f0fbff",
              border: darkMode ? "#4b5f75" : "#0ea5e9",
              text: darkMode ? "#7dd3fc" : "#0ea5e9",
              icon: "🌍"
            },
            resources: {
              bg: darkMode ? "#4a5a3b" : "#fefce8",
              border: darkMode ? "#5f754b" : "#eab308",
              text: darkMode ? "#facc15" : "#eab308",
              icon: "📖"
            },
            general: {
              bg: darkMode ? "#4c4b8b" : "#faf9ff",
              border: darkMode ? "#5a59a5" : "#6366f1",
              text: darkMode ? "#c7d2fe" : "#6366f1",
              icon: "💡"
            },
            // Default for other types
            default: {
              bg: darkMode ? "#4c4b8b" : "#faf9ff",
              border: darkMode ? "#5a59a5" : "#6366f1",
              text: darkMode ? "#c7d2fe" : "#6366f1",
              icon: "💡"
            }
          };

          const categoryLower = post.category.text.toLowerCase();
          let colorScheme = categoryColors.default;

          // Match category
          if (categoryLower === 'grammar' || categoryLower === 'grammar help') colorScheme = categoryColors.grammar;
          else if (categoryLower === 'pronunciation') colorScheme = categoryColors.pronunciation;
          else if (categoryLower === 'vocabulary') colorScheme = categoryColors.vocabulary;
          else if (categoryLower === 'conversation' || categoryLower === 'conversation practice') colorScheme = categoryColors.conversation;
          else if (categoryLower === 'writing') colorScheme = categoryColors.writing;
          else if (categoryLower === 'culture' || categoryLower === 'culture & travel') colorScheme = categoryColors.culture;
          else if (categoryLower === 'resources' || categoryLower === 'resources & tips') colorScheme = categoryColors.resources;
          else if (categoryLower === 'general' || categoryLower === 'general discussion') colorScheme = categoryColors.general;

          return (
            <Box
              sx={{
                backgroundColor: colorScheme.bg,
                borderRadius: "12px 12px 0 0",
                border: darkMode ? `1px solid ${colorScheme.border}` : `1px solid ${colorScheme.border}20`,
                borderBottom: "none",
                px: 2,
                py: 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body1">{post.category.emoji || colorScheme.icon}</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "12.7px",
                    letterSpacing: "0.12px",
                    color: colorScheme.text,
                    fontWeight: 500,
                  }}
                >
                  {post.category.text}
                </Typography>
              </Stack>
            </Box>
          );
        })()}

        <Box
          sx={{
            backgroundColor: darkMode ? "rgba(30, 30, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
            borderRadius: post.category ? "0 0 12px 12px" : "12px",
            borderTop: post.category ? "none" : undefined,
            boxShadow: darkMode
              ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
              : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
          }}
        >
        <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
          <Stack spacing={2}>
            {/* Post Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
                <UserAvatar
                  user={{
                    id: post.user.id || 'default',
                    name: post.user.name,
                    profileImage: post.user.profileImage
                  }}
                  size={36}
                  showOnlineStatus={false}
                  onClick={handleUserClick}
                />

                <Stack spacing={0.25}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        fontSize: "14px",
                        color: darkMode ? "white" : "#141417",
                        lineHeight: 1.3,
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                      onClick={() => router.push(`/app/profile/${post.user.id}`)}
                    >
                      {post.user.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#9ca3af" : "#767676",
                        fontSize: "13px",
                      }}
                    >
                      ·
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#9ca3af" : "#767676",
                        fontSize: "13px",
                      }}
                    >
                      {post.user.timeAgo}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "12px",
                      color: darkMode ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    {post.user.department}
                  </Typography>
                </Stack>
              </Stack>

              {isOwner && (
                <IconButton sx={{ p: 0.5 }} onClick={handleMenuOpen}>
                  <MoreIcon sx={{ fontSize: 16, color: darkMode ? "#9ca3af" : "inherit" }} />
                </IconButton>
              )}
            </Stack>

            {/* Post Content */}
            <Stack spacing={1.5}>
              {isEditing ? (
                // Edit mode - show input fields
                <TextField
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  variant="outlined"
                  placeholder="Post title..."
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      fontSize: "18px",
                      fontWeight: 600,
                      color: darkMode ? "white" : "#1a1a1a",
                      backgroundColor: "transparent",
                      borderRadius: "8px",
                      "& fieldset": {
                        borderColor: darkMode ? "#374151" : "#e0e0e0",
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "#4b5563" : "#d0d0d0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6366f1",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      color: darkMode ? "white" : "#1a1a1a",
                    },
                  }}
                />
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: darkMode ? "white" : "#1a1a1a",
                    lineHeight: 1.4,
                    mb: 0.5,
                  }}
                >
                  {post.title}
                </Typography>
              )}

              {isEditing ? (
                // Edit mode - show content textarea
                <TextField
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  variant="outlined"
                  placeholder="What would you like to share..."
                  multiline
                  rows={4}
                  fullWidth
                  sx={{
                    mt: 1,
                    "& .MuiOutlinedInput-root": {
                      fontSize: "15px",
                      color: darkMode ? "#e5e7eb" : "#141417",
                      backgroundColor: "transparent",
                      borderRadius: "8px",
                      "& fieldset": {
                        borderColor: darkMode ? "#374151" : "#e0e0e0",
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "#4b5563" : "#d0d0d0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6366f1",
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      color: darkMode ? "#e5e7eb" : "#141417",
                    },
                  }}
                />
              ) : (
                <Stack spacing={2} sx={{ pt: 0.5, pb: 2 }} data-post-content="true">
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "15px",
                      color: darkMode ? "#e5e7eb" : "#141417",
                      lineHeight: 1.7,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {post.content.greeting}
                  </Typography>

                  {isExpanded ? (
                    // Show all paragraphs when expanded
                    post.content.paragraphs.map((paragraph, index) => (
                      <Typography
                        key={index}
                        variant="body1"
                        sx={{
                          fontSize: "15px",
                          color: darkMode ? "#e5e7eb" : "#141417",
                          lineHeight: 1.7,
                          letterSpacing: "0.01em",
                          mb: index < post.content.paragraphs.length - 1 ? 2 : 0,
                        }}
                      >
                        {paragraph}
                      </Typography>
                    ))
                  ) : (
                    // Show only first paragraph truncated when collapsed
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "15px",
                        color: darkMode ? "#e5e7eb" : "#141417",
                        lineHeight: 1.7,
                        letterSpacing: "0.01em",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {post.content.paragraphs[0]?.substring(0, truncateLength)}
                      {post.content.paragraphs[0]?.length > truncateLength || post.content.paragraphs.length > 1 ? '...' : ''}
                    </Typography>
                  )}

                  {/* Show Read more/less only if content is long */}
                  {(post.content.paragraphs[0]?.length > truncateLength || post.content.paragraphs.length > 1) && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Link
                        component="button"
                        underline="always"
                        onClick={() => setIsExpanded(!isExpanded)}
                        sx={{
                          fontSize: "13px",
                          color: darkMode ? "#e5e7eb" : "#141417",
                          textDecorationColor: darkMode ? "#e5e7eb" : "#141417",
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: 0,
                          font: "inherit",
                        }}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Link>
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Edit Mode Action Buttons */}
              {isEditing && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSaveEdit}
                    disabled={!editedTitle.trim() || !editedContent.trim()}
                    sx={{
                      backgroundColor: "#6366f1",
                      color: "white",
                      borderRadius: "6px",
                      textTransform: "none",
                      fontSize: "13px",
                      fontWeight: 500,
                      px: 2,
                      py: 0.5,
                      "&:hover": {
                        backgroundColor: "#5a5cf8",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: darkMode ? "#374151" : "#e0e0e0",
                        color: darkMode ? "#6b7280" : "#999999",
                      },
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCancelEdit}
                    sx={{
                      color: darkMode ? "#9ca3af" : "#666666",
                      borderColor: darkMode ? "#374151" : "#d0d0d0",
                      borderRadius: "6px",
                      textTransform: "none",
                      fontSize: "13px",
                      fontWeight: 500,
                      px: 2,
                      py: 0.5,
                      "&:hover": {
                        borderColor: darkMode ? "#4b5563" : "#b0b0b0",
                        backgroundColor: darkMode ? "#374151" : "#f5f5f5",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              )}

              {/* Attachment */}
              {post.attachment && (
                <LinkPreview
                  title={post.attachment.title}
                  url={post.attachment.url}
                  darkMode={darkMode}
                  onClick={() => window.open(post.attachment.url, '_blank')}
                />
              )}
            </Stack>

            {/* Post Actions and Reactions */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              {/* Reactions Display */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                {post.reactions && post.reactions.length > 0 && (
                  <>
                    {post.reactions.map((reaction, index) => {
                      return (
                        <Tooltip
                          key={index}
                          title={
                            reaction.users && reaction.users.length > 0 ? (
                              <Box sx={{ fontSize: '12px' }}>
                                {reaction.users.slice(0, 10).join(', ')}
                                {reaction.users.length > 10 && ` +${reaction.users.length - 10} more`}
                              </Box>
                            ) : (
                              ''
                            )
                          }
                          placement="top"
                          arrow
                        >
                          <Chip
                            label={`${reaction.emoji} ${reaction.count}`}
                            size="small"
                            onClick={() => {
                              if (onPostReactionToggle) {
                                onPostReactionToggle(post, reaction);
                              }
                            }}
                            sx={{
                              backgroundColor: reaction.hasReacted ? "rgba(88, 101, 242, 0.1)" : darkMode ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                              border: reaction.hasReacted ? "1px solid #5865F2" : "1px solid transparent",
                              color: reaction.hasReacted ? "#5865F2" : darkMode ? "#9ca3af" : "#666",
                              cursor: "pointer",
                              fontSize: "12px",
                              height: "24px",
                              "&:hover": {
                                backgroundColor: reaction.hasReacted ? "rgba(88, 101, 242, 0.2)" : darkMode ? "rgba(255, 255, 255, 0.1)" : "#e8e8e8",
                              },
                              "& .MuiChip-label": {
                                px: 1.5,
                              },
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                    <IconButton
                      size="small"
                      onClick={(e) => onEmojiClick(e, `post-${post.id}`)}
                      sx={{
                        p: 0.25,
                        ml: 0.5,
                        "&:hover": {
                          backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                        },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 16, color: darkMode ? "#9ca3af" : "#999" }} />
                    </IconButton>
                  </>
                )}
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={0.75}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onBookmarkToggle?.(post.id)}
                  startIcon={
                    post.isBookmarked ? 
                      <BookmarkIcon sx={{ fontSize: 16, color: "#f59e0b" }} /> :
                      <BookmarkBorderIcon sx={{ fontSize: 16, color: darkMode ? "#9ca3af" : "inherit" }} />
                  }
                  sx={{
                    minWidth: 48,
                    borderColor: post.isBookmarked ? "#f59e0b" : (darkMode ? "#374151" : "#e9e7e4"),
                    color: post.isBookmarked ? "#f59e0b" : (darkMode ? "#9ca3af" : "inherit"),
                    backgroundColor: post.isBookmarked ? "rgba(245, 158, 11, 0.1)" : (darkMode ? "transparent" : "white"),
                    textTransform: "none",
                    fontSize: "12px",
                    fontWeight: 500,
                    py: 0.5,
                    px: 1,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: post.isBookmarked 
                        ? "rgba(245, 158, 11, 0.2)" 
                        : (darkMode ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5"),
                      borderColor: post.isBookmarked ? "#f59e0b" : (darkMode ? "#4b5563" : "#d0d0d0"),
                    },
                  }}
                >
                  {post.stats.bookmarks}
                </Button>

                <IconButton
                  size="small"
                  sx={{
                    border: `1px solid ${darkMode ? "#374151" : "#e9e7e4"}`,
                    borderRadius: 1,
                    backgroundColor: darkMode ? "transparent" : "white",
                    color: darkMode ? "#9ca3af" : "inherit",
                    p: 0.75,
                    "&:hover": {
                      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                    },
                  }}
                >
                  <ShareIcon sx={{ fontSize: 18, color: darkMode ? "#9ca3af" : "inherit" }} />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={(e) => onEmojiClick(e, `post-${post.id}`)}
                  sx={{
                    border: `1px solid ${darkMode ? "#374151" : "#e9e7e4"}`,
                    borderRadius: 1,
                    backgroundColor: darkMode ? "transparent" : "white",
                    color: darkMode ? "#9ca3af" : "inherit",
                    p: 0.75,
                    "&:hover": {
                      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                    },
                  }}
                >
                  <EmojiEmotionsIcon sx={{ fontSize: 18, color: darkMode ? "#9ca3af" : "inherit" }} />
                </IconButton>
              </Stack>
            </Stack>

            {/* Reply Input Section */}
            <Box sx={{ width: "100%", position: "relative", pb: 2, mt: 2.5 }}>
              {replyingTo && (
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1, 
                  mb: 1,
                  color: darkMode ? "white" : "#141417",
                  fontSize: "13px"
                }}>
                  <Typography variant="body2" sx={{ fontSize: "13px" }}>
                    Replying to {replyingTo.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      onReplyingToChange(null);
                      onReplyTextChange(post.id, "");
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <CloseIcon sx={{ fontSize: 16, color: darkMode ? "#9ca3af" : "inherit" }} />
                  </IconButton>
                </Box>
              )}
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <UserAvatar
                  user={currentUser || { 
                    id: 'default',
                    name: 'User'
                  }}
                  size={32}
                  showOnlineStatus={false}
                />

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    flex: 1,
                    minHeight: 40,
                    border: `1px solid ${darkMode ? "#374151" : "#dbdbdb"}`,
                    borderRadius: 1,
                    pl: 1.5,
                    pr: 0.75,
                    py: 0.5,
                  }}
                >
                  <TextField
                    placeholder="Post a reply..."
                    variant="standard"
                    fullWidth
                    value={replyTexts[post.id] || ''}
                    onChange={(e) => onReplyTextChange(post.id, e.target.value)}
                    inputRef={(ref) => { replyFieldRefs.current[post.id] = ref; }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onReplySubmit(post.id);
                      }
                    }}
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: "13px",
                        color: darkMode ? "white" : "#141417",
                        fontFamily: "Inter-Regular, Helvetica",
                        "& input::placeholder": {
                          color: darkMode ? "#6b7280" : "#999999",
                          opacity: 1,
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInput-root": {
                        "&:before": {
                          display: "none",
                        },
                        "&:after": {
                          display: "none",
                        },
                      },
                    }}
                  />
                  
                  {/* Photo Attachment Button */}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`photo-upload-${post.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Handle photo upload
                        console.log('Photo selected:', file.name);
                      }
                    }}
                  />
                  <label htmlFor={`photo-upload-${post.id}`}>
                    <IconButton
                      component="span"
                      size="small"
                      sx={{
                        color: darkMode ? "#9ca3af" : "#666666",
                        "&:hover": {
                          backgroundColor: darkMode ? "rgba(156, 163, 175, 0.1)" : "rgba(0, 0, 0, 0.04)",
                          color: darkMode ? "#6366f1" : "#141417",
                        },
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </label>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onReplySubmit(post.id)}
                    disabled={!replyTexts[post.id]?.trim()}
                    sx={{
                      minWidth: 56,
                      backgroundColor: darkMode ? "#6366f1 !important" : "#141417 !important",
                      color: "white !important",
                      borderRadius: 1,
                      py: 0.5,
                      px: 1.5,
                      fontSize: "13px",
                      fontFamily: "Inter-Medium, Helvetica",
                      fontWeight: 500,
                      letterSpacing: "-0.08px",
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor: darkMode ? "#5a5cf8 !important" : "#141417 !important",
                        boxShadow: "none",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: darkMode ? "#374151 !important" : "#e0e0e0 !important",
                        color: darkMode ? "#6b7280 !important" : "#999999 !important",
                      },
                    }}
                  >
                    Reply
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {/* Replies Display */}
            {post.replies && post.replies.length > 0 && (
              <Stack spacing={0.5} sx={{ mt: 1, mb: 0.5, position: "relative", overflow: "visible" }}>
                <Divider sx={{ borderColor: darkMode ? "#374151" : "#e9e7e4" }} />
                
                <Box sx={{ pt: 1.5 }}>
                  {buildReplyTree(post.replies).map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    postId={post.id}
                    level={0}
                    onReplyClick={onReplyClick}
                    onEmojiClick={onEmojiClick}
                    onReactionToggle={onReactionToggle}
                    activeReplyFields={activeReplyFields}
                    replyTexts={replyTexts}
                    onReplyTextChange={onReplyTextChange}
                    onNestedReplySubmit={onNestedReplySubmit}
                    replyFieldRefs={replyFieldRefs}
                    formatReactionTooltip={formatReactionTooltip}
                    collapsedReplies={collapsedReplies}
                    onToggleReplyCollapse={onToggleReplyCollapse}
                    darkMode={darkMode}
                  />
                  ))}
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
        </Box>
      </Stack>
      
      {/* Post Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: darkMode ? "#1f1f1f" : "white",
            border: "none",
            borderRadius: "6px",
            boxShadow: darkMode 
              ? "0 4px 12px rgba(0, 0, 0, 0.5)"
              : "0 4px 12px rgba(0, 0, 0, 0.15)",
            mt: 0.5,
            minWidth: 120,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ 
          fontSize: "14px",
          color: darkMode ? "#e5e7eb" : "#374151",
          px: 1.5,
          py: 1,
          "&:hover": {
            backgroundColor: darkMode ? "#2d2d2d" : "#f9fafb",
          },
        }}>
          <EditIcon sx={{ fontSize: 16, mr: 1.5 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ 
          fontSize: "14px",
          color: "#ef4444",
          px: 1.5,
          py: 1,
          "&:hover": {
            backgroundColor: darkMode ? "#2d2d2d" : "#f9fafb",
          },
        }}>
          <DeleteIcon sx={{ fontSize: 16, mr: 1.5 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};