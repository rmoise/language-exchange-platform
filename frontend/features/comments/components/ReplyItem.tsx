import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuth } from '@/hooks/useAuth';

export interface Reply {
  id: string;
  user: {
    id?: string;
    name: string;
    initials: string;
    avatarColor: string;
    profileImage?: string;
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
  collapsedReplies: { [replyId: string]: boolean };
  onToggleReplyCollapse: (replyId: string) => void;
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
  collapsedReplies,
  onToggleReplyCollapse,
  darkMode = false,
}) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isNested = level > 0;
  const maxNestingLevel = 2; // Limit nesting depth
  const canReply = level < maxNestingLevel;
  const hasChildren = reply.children && reply.children.length > 0;
  const isCollapsed = collapsedReplies[reply.id] || false;

  const handleUserClick = () => {
    if (reply.user.id) {
      router.push(`/app/profile/${reply.user.id}`);
    }
  };

  return (
    <Box sx={{ position: "relative", overflow: "visible" }}>
      <Stack spacing={0.5} sx={{ pl: isNested ? 4 : 0, position: "relative" }}>
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="flex-start"
          sx={{ 
            position: "relative",
            minHeight: isNested ? 24 : 28,
          }}
        >
          
          <Box 
            onClick={handleUserClick}
            sx={{ 
              cursor: reply.user.id ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            <UserAvatar
              user={{
                id: reply.user.id || 'default',
                name: reply.user.name,
                profileImage: reply.user.profileImage
              }}
              size={isNested ? 28 : 32}
              showOnlineStatus={false}
            />
          </Box>
          <Stack spacing={0.25} sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "14px", lineHeight: 1.3 }}>
                {reply.user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: darkMode ? "#9ca3af" : "#141417", fontSize: "13px" }}>
                {reply.timeAgo}
              </Typography>
            </Stack>
            <Box sx={{ 
              backgroundColor: "transparent", 
              borderRadius: 0,
              p: 0,
              mt: 0,
            }}
            data-post-content="true"
            >
              <Typography variant="body2" sx={{ fontSize: isNested ? "13px" : "14px", lineHeight: 1.5, color: darkMode ? "#e5e7eb" : "#3b3b3b" }}>
                {reply.content}
              </Typography>
            </Box>
          
            {/* Reply Actions and Reactions */}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
              {hasChildren && (
                <Button
                  size="small"
                  startIcon={isCollapsed ? <ExpandMoreIcon sx={{ fontSize: 16 }} /> : <ExpandLessIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onToggleReplyCollapse(reply.id)}
                  sx={{
                    textTransform: "none",
                    color: darkMode ? "#a5b4fc" : "#1976d2",
                    fontSize: "12px",
                    fontWeight: 500,
                    px: 1,
                    py: 0.25,
                    minWidth: "auto",
                    "&:hover": {
                      backgroundColor: darkMode ? "rgba(99, 102, 241, 0.1)" : "rgba(25, 118, 210, 0.1)",
                      color: darkMode ? "#a5b4fc" : "#1976d2",
                    },
                  }}
                >
                  {isCollapsed ? `Show ${reply.children.length} ${reply.children.length === 1 ? 'reply' : 'replies'}` : 'Hide replies'}
                </Button>
              )}
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
                startIcon={<EmojiEmotionsIcon sx={{ fontSize: 14 }} />}
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
                        onClick={() => onReactionToggle(postId, reply.id, reaction)}
                        sx={{
                          backgroundColor: reaction.hasReacted ? "rgba(88, 101, 242, 0.1)" : darkMode ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
                          border: reaction.hasReacted ? "1px solid #5865F2" : "1px solid transparent",
                          color: reaction.hasReacted ? "#5865F2" : darkMode ? "#9ca3af" : "#141417",
                          cursor: "pointer",
                          fontSize: "12px",
                          height: "22px",
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
                spacing={0.75} 
                alignItems="flex-start" 
                sx={{ 
                  mt: 0.75,
                  ml: -0.5,
                }}
              >
                <UserAvatar
                  user={currentUser || { 
                    id: 'default',
                    name: 'User'
                  }}
                  size={24}
                  showOnlineStatus={false}
                />
                <Stack 
                  direction="row" 
                  spacing={0.75} 
                  sx={{ 
                    flex: 1,
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "transparent",
                    border: `1px solid ${darkMode ? "#374151" : "#dbdbdb"}`,
                    borderRadius: "16px",
                    px: 1.5,
                    py: 0.5,
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
                        fontSize: "12px",
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
                  
                  {/* Photo Attachment Button for nested replies */}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`nested-photo-upload-${postId}-${reply.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Handle photo upload for nested reply
                        console.log('Nested reply photo selected:', file.name);
                      }
                    }}
                  />
                  <label htmlFor={`nested-photo-upload-${postId}-${reply.id}`}>
                    <IconButton
                      component="span"
                      size="small"
                      sx={{
                        p: 0.5,
                        color: darkMode ? "#9ca3af" : "#666666",
                        "&:hover": {
                          backgroundColor: darkMode ? "rgba(156, 163, 175, 0.1)" : "rgba(0, 0, 0, 0.04)",
                          color: darkMode ? "#6366f1" : "#141417",
                        },
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </label>
                  
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
                    <SendIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
      
      {/* Render child replies */}
      {reply.children && reply.children.length > 0 && !isCollapsed && (
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
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
              collapsedReplies={collapsedReplies}
              onToggleReplyCollapse={onToggleReplyCollapse}
              darkMode={darkMode}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};