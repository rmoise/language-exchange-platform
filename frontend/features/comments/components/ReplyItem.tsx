import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Avatar,
  Button,
  Chip,
  Tooltip,
  TextField,
  IconButton,
} from '@mui/material';
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Send as SendIcon,
} from '@mui/icons-material';

export interface Reply {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  content: string;
  timeAgo: string;
  reactions?: {
    emoji: string;
    count: number;
    hasReacted: boolean;
    users?: string[];
  }[];
  parentReplyId?: string | null;
  children?: Reply[];
}

interface ReplyItemProps {
  reply: Reply;
  postId: string;
  level: number;
  isLast?: boolean;
  onReplyClick: (postId: string, replyId: string, replyUserName: string) => void;
  onEmojiClick: (event: React.MouseEvent<HTMLElement>, target: string) => void;
  onReactionToggle: (postId: string, replyId: string, reaction: any) => void;
  activeReplyFields: { [key: string]: boolean };
  replyTexts: { [key: string]: string };
  onReplyTextChange: (key: string, text: string) => void;
  onNestedReplySubmit: (postId: string, parentReplyId: string) => void;
  replyFieldRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  formatReactionTooltip: (users: string[]) => string;
  darkMode?: boolean;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  postId,
  level,
  isLast = false,
  onReplyClick,
  onEmojiClick,
  onReactionToggle,
  activeReplyFields,
  replyTexts,
  onReplyTextChange,
  onNestedReplySubmit,
  replyFieldRefs,
  formatReactionTooltip,
  darkMode = false,
}) => {
  const isNested = level > 0;
  const maxNestingLevel = 2; // Limit nesting depth
  const canReply = level < maxNestingLevel;
  const hasChildren = reply.children && reply.children.length > 0;

  return (
    <Box sx={{ position: "relative", overflow: "visible" }}>
      <Stack spacing={1} sx={{ pl: isNested ? 6 : 0, position: "relative" }}>
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="flex-start"
          sx={{ 
            position: "relative",
            minHeight: isNested ? 32 : 40, // Ensure minimum height for proper line alignment
          }}
        >
          
          <Avatar
            sx={{
              width: isNested ? 32 : 40,
              height: isNested ? 32 : 40,
              backgroundColor: reply.user.avatarColor,
              fontSize: isNested ? "12px" : "14px",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {reply.user.initials}
          </Avatar>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "14px" }}>
                {reply.user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: darkMode ? "#9ca3af" : "#141417", fontSize: "14px" }}>
                {reply.timeAgo}
              </Typography>
            </Stack>
            <Box sx={{ 
              backgroundColor: "transparent", 
              borderRadius: 0,
              p: 0,
              mt: 0.5,
            }}>
              <Typography variant="body2" sx={{ fontSize: isNested ? "14px" : "15px", lineHeight: 1.5 }}>
                {reply.content}
              </Typography>
            </Box>
          
            {/* Reply Actions and Reactions */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              {canReply && (
                <Button
                  size="small"
                  startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onReplyClick(postId, reply.id, reply.user.name)}
                  sx={{
                    textTransform: "none",
                    color: darkMode ? "#e5e7eb" : "#141417",
                    fontSize: "13px",
                    fontWeight: 500,
                    px: 1.5,
                    py: 0.5,
                    minWidth: "auto",
                    "&:hover": {
                      backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                      color: darkMode ? "white" : "#141417",
                    },
                  }}
                >
                  Reply
                </Button>
              )}
              
              <Button
                size="small"
                startIcon={<EmojiEmotionsIcon sx={{ fontSize: 16 }} />}
                onClick={(e) => onEmojiClick(e, `reply-${postId}-${reply.id}`)}
                sx={{
                  textTransform: "none",
                  color: darkMode ? "#e5e7eb" : "#141417",
                  fontSize: "13px",
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  minWidth: "auto",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "#f5f5f5",
                    color: darkMode ? "white" : "#141417",
                  },
                }}
              >
                React
              </Button>
              
              {/* Reactions Display */}
              {reply.reactions && reply.reactions.length > 0 && (
                <>
                  <Box sx={{ width: "1px", height: 20, backgroundColor: darkMode ? "#374151" : "#e0e0e0", mx: 0.5 }} />
                  {reply.reactions.map((reaction, index) => (
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
                        onClick={() => onReactionToggle(postId, reply.id, reaction)}
                        sx={{
                          backgroundColor: reaction.hasReacted ? "rgba(88, 101, 242, 0.1)" : darkMode ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                          border: reaction.hasReacted ? "1px solid #5865F2" : "1px solid transparent",
                          color: reaction.hasReacted ? "#5865F2" : darkMode ? "#9ca3af" : "#141417",
                          cursor: "pointer",
                          fontSize: "12px",
                          height: "24px",
                          "&:hover": {
                            backgroundColor: reaction.hasReacted ? "rgba(88, 101, 242, 0.2)" : darkMode ? "rgba(255, 255, 255, 0.1)" : "#e8e8e8",
                          },
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </>
              )}
            </Stack>
            
            {/* Nested Reply Input Field */}
            {canReply && activeReplyFields[`${postId}-${reply.id}`] && (
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="flex-start" 
                sx={{ 
                  mt: 1,
                  ml: -0.5,
                }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>Y</Avatar>
                <Stack 
                  direction="row" 
                  spacing={1} 
                  sx={{ 
                    flex: 1,
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "transparent",
                    border: `1px solid ${darkMode ? "#374151" : "#dbdbdb"}`,
                    borderRadius: "20px",
                    px: 2,
                    py: 1,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    size="small"
                    placeholder="Write a reply..."
                    value={replyTexts[`${postId}-${reply.id}`] || ""}
                    onChange={(e) => onReplyTextChange(`${postId}-${reply.id}`, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onNestedReplySubmit(postId, reply.id);
                      }
                    }}
                    inputRef={(el) => {
                      if (el) {
                        replyFieldRefs.current[`${postId}-${reply.id}`] = el;
                      }
                    }}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: "14px",
                        color: darkMode ? "white" : "inherit",
                        "& input::placeholder": {
                          color: darkMode ? "#6b7280" : "#999999",
                          opacity: 1,
                        },
                      },
                    }}
                    sx={{
                      "& .MuiInputBase-root": {
                        padding: 0,
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => onNestedReplySubmit(postId, reply.id)}
                    disabled={!replyTexts[`${postId}-${reply.id}`]?.trim()}
                    sx={{
                      p: 0.5,
                      color: replyTexts[`${postId}-${reply.id}`]?.trim() ? "#5865F2" : darkMode ? "#6b7280" : "#999",
                      "&:hover": {
                        backgroundColor: "rgba(88, 101, 242, 0.1)",
                      },
                      "&:disabled": {
                        color: darkMode ? "#6b7280" : "#999",
                      },
                    }}
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
      
      {/* Render child replies */}
      {reply.children && reply.children.length > 0 && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {reply.children.map((childReply, index) => (
            <ReplyItem
              key={childReply.id}
              reply={childReply}
              postId={postId}
              level={level + 1}
              isLast={index === reply.children.length - 1}
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
    </Box>
  );
};