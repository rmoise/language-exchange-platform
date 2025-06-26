import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  Stack,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Box,
  Button,
  Link,
  TextField,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  MoreHoriz as MoreIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkBorderIcon,
  SentimentSatisfied as SentimentSatisfiedIcon,
  Send as SendIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { ReplyItem, buildReplyTree, formatReactionTooltip, type Reply, type Post } from "@/features/comments";

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
  darkMode = false,
}) => {
  const replyInputRef = useRef<HTMLInputElement>(null);

  return (
    <Stack spacing={0}>
      {/* Asking for help header */}
      {post.askingFor && (
        <Box
          sx={{
            backgroundColor: darkMode ? "rgba(251, 191, 36, 0.1)" : "#faf9f8",
            borderRadius: "16px 16px 0 0",
            border: `1px solid ${darkMode ? "rgba(251, 191, 36, 0.3)" : "#efefee"}`,
            borderBottom: "none",
            px: 2,
            py: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body1">🔥</Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "12.7px",
                letterSpacing: "0.12px",
                color: darkMode ? "#fbbf24" : "#141417",
              }}
            >
              Asking for {post.askingFor}
            </Typography>
          </Stack>
        </Box>
      )}

      <Card
        sx={{
          borderRadius: post.askingFor ? "0 0 16px 16px" : "16px",
          backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "white",
          backdropFilter: darkMode ? "blur(10px)" : "none",
          border: `1px solid ${darkMode ? "#374151" : "#efefee"}`,
          boxShadow: "none",
          color: darkMode ? "white" : "inherit",
          transition: "all 0.3s ease",
          "&:hover": darkMode ? {
            borderColor: "#6366f1",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          } : {},
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            {/* Post Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: post.user.avatarColor,
                    fontSize: "15.8px",
                    fontWeight: 400,
                  }}
                >
                  {post.user.initials}
                </Avatar>

                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        fontSize: "15.9px",
                        color: darkMode ? "white" : "#141417",
                      }}
                    >
                      {post.user.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#9ca3af" : "#767676",
                        fontSize: "16px",
                      }}
                    >
                      ·
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#9ca3af" : "#767676",
                        fontSize: "16px",
                      }}
                    >
                      {post.user.department}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#9ca3af" : "#767676",
                        fontSize: "16px",
                      }}
                    >
                      ·
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: darkMode ? "#9ca3af" : "#767676",
                        fontSize: "15.9px",
                      }}
                    >
                      {post.user.timeAgo}
                    </Typography>
                  </Stack>

                  <Chip
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2">{post.category.emoji}</Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "15.6px",
                            color: darkMode ? "#a5b4fc" : "#003742",
                          }}
                        >
                          {post.category.text}
                        </Typography>
                      </Stack>
                    }
                    sx={{
                      backgroundColor: darkMode ? "rgba(99, 102, 241, 0.2)" : "#d7fbfc",
                      color: darkMode ? "#a5b4fc" : "#003742",
                      height: "auto",
                      py: 0.5,
                      px: 2,
                      "& .MuiChip-label": {
                        px: 0,
                      },
                    }}
                  />
                </Stack>
              </Stack>

              <IconButton sx={{ p: 1 }}>
                <MoreIcon sx={{ fontSize: 18, color: darkMode ? "#9ca3af" : "inherit" }} />
              </IconButton>
            </Stack>

            {/* Post Content */}
            <Stack spacing={1}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "18px",
                  fontWeight: 500,
                  textDecoration: "underline",
                  color: darkMode ? "white" : "#141417",
                  lineHeight: 1.5,
                }}
              >
                {post.title}
              </Typography>

              <Stack spacing={2} sx={{ py: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "16px",
                    color: darkMode ? "#e5e7eb" : "#141417",
                    lineHeight: 1.6,
                  }}
                >
                  {post.content.greeting}
                </Typography>

                {post.content.paragraphs.map((paragraph, index) => (
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{
                      fontSize: "16px",
                      color: darkMode ? "#e5e7eb" : "#141417",
                      lineHeight: 1.6,
                    }}
                  >
                    {paragraph}
                  </Typography>
                ))}

                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "16px",
                      color: darkMode ? "#e5e7eb" : "#141417",
                    }}
                  >
                    ·
                  </Typography>
                  <Link
                    href="#"
                    underline="always"
                    sx={{
                      fontSize: "16px",
                      color: darkMode ? "#e5e7eb" : "#141417",
                      textDecorationColor: darkMode ? "#e5e7eb" : "#141417",
                      cursor: "pointer",
                    }}
                  >
                    Read more
                  </Link>
                </Stack>
              </Stack>

              {/* Attachment */}
              {post.attachment && (
                <Box
                  sx={{
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#faf9f8",
                    borderRadius: 2,
                    p: 2,
                    maxWidth: 260,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#faf9f8",
                        borderRadius: 1,
                      }}
                    />
                    <Stack spacing={0.5}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          fontSize: "16px",
                          color: darkMode ? "white" : "#141417",
                        }}
                      >
                        {post.attachment.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "13px",
                          color: darkMode ? "#9ca3af" : "#3b3b3b",
                        }}
                      >
                        {post.attachment.url}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Stack>

            {/* Post Actions */}
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<BookmarkBorderIcon />}
                sx={{
                  minWidth: 58,
                  borderColor: darkMode ? "#374151" : "#e9e7e4",
                  color: darkMode ? "white" : "#141417",
                  backgroundColor: darkMode ? "transparent" : "white",
                  textTransform: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                {post.stats.bookmarks}
              </Button>

              <IconButton
                sx={{
                  minWidth: 58,
                  border: `1px solid ${darkMode ? "#374151" : "#e9e7e4"}`,
                  borderRadius: 1,
                  backgroundColor: darkMode ? "transparent" : "white",
                  color: darkMode ? "#9ca3af" : "inherit",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                  },
                }}
              >
                <ShareIcon sx={{ color: darkMode ? "#9ca3af" : "inherit" }} />
              </IconButton>

              <IconButton
                onClick={(e) => onEmojiClick(e, `post-${post.id}`)}
                sx={{
                  minWidth: 58,
                  border: `1px solid ${darkMode ? "#374151" : "#e9e7e4"}`,
                  borderRadius: 1,
                  backgroundColor: darkMode ? "transparent" : "white",
                  color: darkMode ? "#9ca3af" : "inherit",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                  },
                }}
              >
                <SentimentSatisfiedIcon sx={{ color: darkMode ? "#9ca3af" : "inherit" }} />
              </IconButton>
            </Stack>

            {/* Reactions Display */}
            {post.reactions && post.reactions.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1, mb: 1 }}>
                {post.reactions.map((reaction, index) => (
                  <Tooltip
                    key={index}
                    title={formatReactionTooltip(reaction.users || [])}
                    placement="top"
                    arrow
                    PopperProps={{
                      keepMounted: false,
                      popperOptions: {
                        strategy: 'fixed',
                      },
                    }}
                  >
                    <Chip
                      label={`${reaction.emoji} ${reaction.count}`}
                      size="small"
                      onClick={() => onPostReactionToggle(post, reaction)}
                      sx={{
                        backgroundColor: reaction.hasReacted ? "rgba(88, 101, 242, 0.1)" : darkMode ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                        border: reaction.hasReacted ? "1px solid #5865F2" : "1px solid transparent",
                        color: reaction.hasReacted ? "#5865F2" : darkMode ? "#9ca3af" : "#666",
                        cursor: "pointer",
                        fontSize: "14px",
                        height: "28px",
                        "&:hover": {
                          backgroundColor: reaction.hasReacted ? "rgba(88, 101, 242, 0.2)" : darkMode ? "rgba(255, 255, 255, 0.1)" : "#e8e8e8",
                        },
                        "& .MuiChip-label": {
                          px: 1.5,
                        },
                      }}
                    />
                  </Tooltip>
                ))}
                <IconButton
                  size="small"
                  onClick={(e) => onEmojiClick(e, `post-${post.id}`)}
                  sx={{
                    p: 0.5,
                    ml: 0.5,
                    "&:hover": {
                      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 18, color: darkMode ? "#9ca3af" : "#999" }} />
                </IconButton>
              </Stack>
            )}

            {/* Reply Input Section */}
            <Box sx={{ width: "100%", position: "relative" }}>
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
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "#1976d2",
                    fontSize: "20px",
                  }}
                >
                  U
                </Avatar>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    flex: 1,
                    height: 60,
                    border: `1px solid ${darkMode ? "#374151" : "#dbdbdb"}`,
                    borderRadius: 1,
                    px: 1,
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
                        fontSize: "15.5px",
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

                  <Button
                    variant="contained"
                    onClick={() => onReplySubmit(post.id)}
                    disabled={!replyTexts[post.id]?.trim()}
                    sx={{
                      minWidth: 64,
                      backgroundColor: darkMode ? "#6366f1 !important" : "#141417 !important",
                      color: "white !important",
                      borderRadius: "10px",
                      px: 2,
                      py: 1,
                      fontSize: "16px",
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
              <Stack spacing={2} sx={{ mt: 2, mb: 2, position: "relative", overflow: "visible" }}>
                <Divider sx={{ borderColor: darkMode ? "#374151" : "#e9e7e4" }} />
                
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
                    darkMode={darkMode}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};