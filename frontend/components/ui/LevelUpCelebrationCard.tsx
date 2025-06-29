"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Chip,
  TextField,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  KeyboardArrowUp as ArrowUpIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Add as AddIcon,
  Send as SendIcon,
  BookmarkBorder as BookmarkBorderIcon,
  MoreHoriz as MoreIcon,
} from "@mui/icons-material";
import { useColorScheme } from '@mui/material/styles';
import UserAvatar from "@/components/ui/UserAvatar";

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users: string[];
}

interface Reply {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  content: string;
  timeAgo: string;
}

interface LevelUpCelebrationCardProps {
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
  newLevel: number;
  xpGained: number;
  currentUser?: {
    id: string;
    name: string;
    profileImage?: string;
  };
  onDismiss?: () => void;
  onShare?: () => void;
  onEmojiClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onReactionToggle?: (reaction: Reaction) => void;
  onReplySubmit?: (replyText: string) => void;
  reactions?: Reaction[];
  replies?: Reply[];
  darkMode?: boolean;
}

export const LevelUpCelebrationCard: React.FC<LevelUpCelebrationCardProps> = ({
  user,
  newLevel,
  xpGained,
  currentUser,
  onDismiss,
  onShare,
  onEmojiClick,
  onReactionToggle,
  onReplySubmit,
  reactions = [],
  replies = [],
  darkMode = false,
}) => {
  const { mode } = useColorScheme();
  const isDark = mode === "dark" || darkMode;
  const [isVisible, setIsVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getLevelTitle = (level: number) => {
    if (level <= 5) return "Beginner";
    if (level <= 10) return "Explorer";
    if (level <= 20) return "Adventurer";
    if (level <= 35) return "Expert";
    if (level <= 50) return "Master";
    return "Legend";
  };

  const handleReplySubmit = () => {
    if (!replyText.trim() || !onReplySubmit) return;
    onReplySubmit(replyText);
    setReplyText("");
  };

  const getLevelEmoji = (level: number) => {
    if (level <= 5) return "🌱";
    if (level <= 10) return "🌟";
    if (level <= 20) return "🚀";
    if (level <= 35) return "🏆";
    if (level <= 50) return "👑";
    return "✨";
  };

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "12px",
        willChange: "transform",
        transform: isVisible ? "translateY(0) translateZ(0)" : "translateY(8px) translateZ(0)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        backfaceVisibility: "hidden",
      }}
    >
      <Stack spacing={0}>
        {/* Achievement category header */}
        <Box
          sx={{
            background: isDark 
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.08))",
            borderRadius: "12px 12px 0 0",
            border: isDark ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid rgba(99, 102, 241, 0.2)",
            borderBottom: "none",
            px: 2,
            py: 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body1">{getLevelEmoji(newLevel)}</Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "12.7px",
                letterSpacing: "0.12px",
                color: isDark ? "#a78bfa" : "#5b21b6",
                fontWeight: 500,
              }}
            >
              Achievement Unlocked
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            backgroundColor: isDark ? "rgba(30, 30, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
            borderRadius: "0 0 12px 12px",
            borderTop: "none",
            boxShadow: isDark
              ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
              : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
            <Stack spacing={2}>
              {/* Post Header - System Generated */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
                  {/* System/Platform Avatar */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid",
                      borderColor: isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 20, color: "white" }} />
                  </Box>

                  <Stack spacing={0.25}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          fontSize: "14px",
                          color: isDark ? "white" : "#141417",
                          lineHeight: 1.3,
                        }}
                      >
                        Language Exchange Platform
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? "#9ca3af" : "#767676",
                          fontSize: "13px",
                        }}
                      >
                        ·
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? "#9ca3af" : "#767676",
                          fontSize: "13px",
                        }}
                      >
                        just now
                      </Typography>
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "12px",
                        color: isDark ? "#9ca3af" : "#6b7280",
                      }}
                    >
                      System • Achievement Update
                    </Typography>
                  </Stack>
                </Stack>

                {onDismiss && (
                  <IconButton sx={{ p: 0.5 }} onClick={onDismiss}>
                    <MoreIcon sx={{ fontSize: 16, color: isDark ? "#9ca3af" : "inherit" }} />
                  </IconButton>
                )}
              </Stack>

              {/* Achievement Content */}
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    background: isDark 
                      ? "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))"
                      : "linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))",
                    borderRadius: "12px",
                    p: 3,
                    border: "1px solid",
                    borderColor: isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(99, 102, 241, 0.15)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Animated background elements */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      opacity: 0.1,
                      animation: "float 3s ease-in-out infinite",
                      "@keyframes float": {
                        "0%, 100%": { transform: "translateY(0)" },
                        "50%": { transform: "translateY(-8px)" },
                      },
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: 48, color: isDark ? "#8b5cf6" : "#6366f1" }} />
                  </Box>

                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {/* User Avatar */}
                      <UserAvatar
                        user={user}
                        size={56}
                        showOnlineStatus={false}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: isDark ? "white" : "#1a1a1a",
                            mb: 0.5,
                          }}
                        >
                          {user.name.split(' ')[0]} reached Level {newLevel}! 🎉
                        </Typography>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={getLevelTitle(newLevel)}
                            size="small"
                            sx={{
                              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                              color: "white",
                              fontWeight: 500,
                              fontSize: "12px",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              px: 1,
                              py: 0.25,
                              borderRadius: "6px",
                              background: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
                            }}
                          >
                            <TrendingUpIcon sx={{ fontSize: 12, color: "#10b981" }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "11px",
                                fontWeight: 500,
                                color: "#10b981",
                              }}
                            >
                              +{xpGained} XP
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Level Badge */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "16px",
                          background: isDark 
                            ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                            : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          animation: "pulse 2s ease-in-out infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { transform: "scale(1)" },
                            "50%": { transform: "scale(1.05)" },
                          },
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontSize: "24px",
                            fontWeight: 700,
                            color: "white",
                          }}
                        >
                          {newLevel}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? "#e5e7eb" : "#374151",
                        lineHeight: 1.6,
                      }}
                    >
                      Share congratulations on their new level with Language Exchange Platform. 
                      Every level brings them closer to fluency! 🌟
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              {/* Post Actions and Reactions */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                {/* Reactions Display */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {reactions && reactions.length > 0 && (
                    <>
                      {reactions.map((reaction, index) => (
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
                            onClick={() => onReactionToggle?.(reaction)}
                            sx={{
                              backgroundColor: reaction.hasReacted ? "rgba(139, 92, 246, 0.1)" : isDark ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                              border: reaction.hasReacted ? "1px solid #8b5cf6" : "1px solid transparent",
                              color: reaction.hasReacted ? "#8b5cf6" : isDark ? "#9ca3af" : "#666",
                              cursor: "pointer",
                              fontSize: "12px",
                              height: "24px",
                              "&:hover": {
                                backgroundColor: reaction.hasReacted ? "rgba(139, 92, 246, 0.2)" : isDark ? "rgba(255, 255, 255, 0.1)" : "#e8e8e8",
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                      {onEmojiClick && (
                        <IconButton
                          size="small"
                          onClick={onEmojiClick}
                          sx={{
                            p: 0.25,
                            ml: 0.5,
                            "&:hover": {
                              backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                            },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 16, color: isDark ? "#9ca3af" : "#999" }} />
                        </IconButton>
                      )}
                    </>
                  )}

                  {(!reactions || reactions.length === 0) && onEmojiClick && (
                    <IconButton
                      size="small"
                      onClick={onEmojiClick}
                      sx={{
                        "&:hover": {
                          backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                        },
                      }}
                    >
                      <EmojiEmotionsIcon sx={{ fontSize: 18, color: isDark ? "#9ca3af" : "inherit" }} />
                    </IconButton>
                  )}
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" spacing={0.75}>
                  <IconButton
                    size="small"
                    sx={{
                      border: `1px solid ${isDark ? "#374151" : "#e9e7e4"}`,
                      borderRadius: 1,
                      backgroundColor: isDark ? "transparent" : "white",
                      color: isDark ? "#9ca3af" : "inherit",
                      p: 0.75,
                      "&:hover": {
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                      },
                    }}
                  >
                    <BookmarkBorderIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  {onShare && (
                    <IconButton
                      size="small"
                      onClick={onShare}
                      sx={{
                        border: `1px solid ${isDark ? "#374151" : "#e9e7e4"}`,
                        borderRadius: 1,
                        backgroundColor: isDark ? "transparent" : "white",
                        color: isDark ? "#9ca3af" : "inherit",
                        p: 0.75,
                        "&:hover": {
                          backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                        },
                      }}
                    >
                      <ShareIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}

                  {onEmojiClick && (
                    <IconButton
                      size="small"
                      onClick={onEmojiClick}
                      sx={{
                        border: `1px solid ${isDark ? "#374151" : "#e9e7e4"}`,
                        borderRadius: 1,
                        backgroundColor: isDark ? "transparent" : "white",
                        color: isDark ? "#9ca3af" : "inherit",
                        p: 0.75,
                        "&:hover": {
                          backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                        },
                      }}
                    >
                      <EmojiEmotionsIcon sx={{ fontSize: 18, color: isDark ? "#9ca3af" : "inherit" }} />
                    </IconButton>
                  )}
                </Stack>
              </Stack>

              {/* Reply Input Section */}
              <Box sx={{ width: "100%", position: "relative", pb: 2, mt: 2.5 }}>
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
                      border: `1px solid ${isDark ? "#374151" : "#dbdbdb"}`,
                      borderRadius: 1,
                      pl: 1.5,
                      pr: 0.75,
                      py: 0.5,
                    }}
                  >
                    <TextField
                      placeholder="Congratulate on this achievement..."
                      variant="standard"
                      fullWidth
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      inputRef={replyInputRef}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReplySubmit();
                        }
                      }}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: "13px",
                          color: isDark ? "white" : "#141417",
                          fontFamily: "Inter-Regular, Helvetica",
                          "& input::placeholder": {
                            color: isDark ? "#6b7280" : "#999999",
                            opacity: 1,
                          },
                        },
                      }}
                    />
                    
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim()}
                      sx={{
                        minWidth: 56,
                        backgroundColor: isDark ? "#8b5cf6 !important" : "#6366f1 !important",
                        color: "white !important",
                        borderRadius: 1,
                        py: 0.5,
                        px: 1.5,
                        fontSize: "13px",
                        fontWeight: 500,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: isDark ? "#7c3aed !important" : "#5b21b6 !important",
                          boxShadow: "none",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: isDark ? "#374151 !important" : "#e0e0e0 !important",
                          color: isDark ? "#6b7280 !important" : "#999999 !important",
                        },
                      }}
                    >
                      <SendIcon sx={{ fontSize: 16 }} />
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              {/* Replies Display */}
              {replies && replies.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 1, mb: 0.5 }}>
                  <Divider sx={{ borderColor: isDark ? "#374151" : "#e9e7e4" }} />
                  
                  <Box sx={{ pt: 1.5 }}>
                    {replies.map((reply) => (
                      <Stack key={reply.id} direction="row" spacing={1.5} sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            backgroundColor: reply.user.avatarColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              fontSize: "10px",
                            }}
                          >
                            {reply.user.initials}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: "13px",
                                color: isDark ? "#e5e7eb" : "#374151",
                              }}
                            >
                              {reply.user.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isDark ? "#9ca3af" : "#6b7280",
                                fontSize: "11px",
                              }}
                            >
                              {reply.timeAgo}
                            </Typography>
                          </Stack>
                          
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "13px",
                              color: isDark ? "#d1d5db" : "#4b5563",
                              lineHeight: 1.4,
                            }}
                          >
                            {reply.content}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Box>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Box>
      </Stack>
    </Box>
  );
};

export default LevelUpCelebrationCard;