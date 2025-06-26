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
  Send as SendIcon,
  Add as AddIcon,
  Close as CloseIcon,
  EmojiEmotions as EmojiEmotionsIcon,
} from "@mui/icons-material";
import { ReplyItem, buildReplyTree, formatReactionTooltip, type Reply, type Post } from "@/features/comments";
import { LinkPreview } from "@/components/ui/LinkPreview";

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
  darkMode = false,
}) => {
  const replyInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [truncateLength, setTruncateLength] = useState(150);
  
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
    <Stack spacing={0}>
      {/* Asking for help header */}
      {post.askingFor && (
        <Box
          sx={{
            backgroundColor: darkMode ? "rgba(251, 191, 36, 0.1)" : "#faf9f8",
            borderRadius: "12px 12px 0 0",
            border: darkMode ? "1px solid rgba(251, 191, 36, 0.2)" : "1px solid rgba(0, 0, 0, 0.08)",
            borderBottom: "none",
            px: 2,
            py: 1,
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

      <Box
        sx={{
          backgroundColor: darkMode ? "rgba(30, 30, 30, 0.5)" : "white",
          border: "1px solid",
          borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
          borderRadius: post.askingFor ? "0 0 12px 12px" : "12px",
          borderTop: post.askingFor ? "none" : undefined,
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: darkMode
              ? "0 0 0 1px #6366f1"
              : "0 0 0 1px #1976d2",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
          <Stack spacing={1}>
            {/* Post Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: post.user.avatarColor,
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {post.user.initials}
                </Avatar>

                <Stack spacing={0.25}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        fontSize: "14px",
                        color: darkMode ? "white" : "#141417",
                        lineHeight: 1.3,
                      }}
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
                      {post.user.department}
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

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography sx={{ fontSize: "13px" }}>
                      {post.category.emoji}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "12px",
                        color: darkMode ? "#9ca3af" : "#6b7280",
                      }}
                    >
                      {post.category.text}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              <IconButton sx={{ p: 0.5 }}>
                <MoreIcon sx={{ fontSize: 16, color: darkMode ? "#9ca3af" : "inherit" }} />
              </IconButton>
            </Stack>

            {/* Post Content */}
            <Stack spacing={0.75}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: darkMode ? "white" : "#1a1a1a",
                  lineHeight: 1.4,
                  cursor: "pointer",
                  "&:hover": {
                    color: darkMode ? "#a5b4fc" : "#1976d2",
                  },
                }}
              >
                {post.title}
              </Typography>

              <Stack spacing={2} sx={{ py: 2 }}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
              {/* Reactions Display */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                {post.reactions && post.reactions.length > 0 && (
                  <>
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
                    ))}
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
                  startIcon={<BookmarkBorderIcon sx={{ fontSize: 16, color: darkMode ? "#9ca3af" : "inherit" }} />}
                  sx={{
                    minWidth: 48,
                    borderColor: darkMode ? "#374151" : "#e9e7e4",
                    color: darkMode ? "#9ca3af" : "inherit",
                    backgroundColor: darkMode ? "transparent" : "white",
                    textTransform: "none",
                    fontSize: "12px",
                    fontWeight: 500,
                    py: 0.5,
                    px: 1,
                    "&:hover": {
                      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
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
            <Box sx={{ width: "100%", position: "relative", pb: 2, mt: 1.5 }}>
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
                    width: 32,
                    height: 32,
                    bgcolor: "#1976d2",
                    fontSize: "14px",
                  }}
                >
                  U
                </Avatar>

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
  );
};