import { 
    AttachFile,
    Image as ImageIcon,
    Link as LinkIcon,
    Send,
    EmojiEmotions,
    Poll,
    GifBox,
    FormatBold,
    FormatItalic,
    Code,
} from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
    Typography,
    Divider,
    Tooltip,
} from "@mui/material";
import React, { useState } from "react";

interface AskMembersQuestionProps {
    onPost?: (text: string) => void;
    userAvatar?: string;
    placeholder?: string;
    darkMode?: boolean;
    compact?: boolean;
}

export const AskMembersQuestion: React.FC<AskMembersQuestionProps> = ({ 
    onPost,
    userAvatar = "/user-avatar.png",
    placeholder = "What's on your mind? Ask the community...",
    darkMode = false,
    compact = false
}) => {
    const [text, setText] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handlePost = () => {
        if (text.trim() && onPost) {
            onPost(text);
            setText("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePost();
        }
    };

    return (
        <Box
            sx={{
                bgcolor: darkMode ? "rgba(30, 30, 30, 0.5)" : "white",
                border: "1px solid",
                borderColor: isFocused 
                    ? (darkMode ? "#6366f1" : "#1976d2")
                    : (darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"),
                borderRadius: "16px",
                overflow: "hidden",
                transition: "all 0.2s ease",
                boxShadow: isFocused
                    ? darkMode 
                        ? "0 0 0 3px rgba(99, 102, 241, 0.1)" 
                        : "0 0 0 3px rgba(25, 118, 210, 0.1)"
                    : "none",
                "&:hover": {
                    boxShadow: isFocused
                        ? darkMode 
                            ? "0 0 0 3px rgba(99, 102, 241, 0.1)" 
                            : "0 0 0 3px rgba(25, 118, 210, 0.1)"
                        : darkMode
                            ? "0 0 0 1px #6366f1"
                            : "0 0 0 1px #1976d2",
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2.5, pb: 0 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        sx={{
                            width: 44,
                            height: 44,
                            bgcolor: darkMode ? "#6366f1" : "#1976d2",
                            fontSize: "18px",
                            fontWeight: 600,
                            border: "2px solid",
                            borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
                        }}
                    >
                        U
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                        <TextField
                            placeholder={placeholder}
                            variant="standard"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            multiline
                            minRows={2}
                            maxRows={10}
                            fullWidth
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    fontSize: "16px",
                                    color: darkMode ? "white" : "#1a1a1a",
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    lineHeight: "24px",
                                    "& textarea": {
                                        "&::placeholder": {
                                            color: darkMode ? "#9ca3af" : "#6b7280",
                                            opacity: 1,
                                        },
                                    },
                                },
                            }}
                        />
                    </Box>
                </Stack>
            </Box>

            {/* Divider */}
            <Divider sx={{ borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)" }} />
            
            {/* Footer with actions */}
            <Box sx={{ p: 2, bgcolor: darkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={0.5}>
                        {/* Format buttons */}
                        <Tooltip title="Bold" arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: darkMode ? "#9ca3af" : "#6b7280",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <FormatBold sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Italic" arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: darkMode ? "#9ca3af" : "#6b7280",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <FormatItalic sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Code" arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: darkMode ? "#9ca3af" : "#6b7280",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <Code sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        
                        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }} />
                        
                        {/* Media buttons */}
                        <Tooltip title="Add image" arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: darkMode ? "#9ca3af" : "#6b7280",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <ImageIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add GIF" arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: darkMode ? "#9ca3af" : "#6b7280",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <GifBox sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add poll" arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: darkMode ? "#9ca3af" : "#6b7280",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <Poll sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Add emoji" arrow>
                            <IconButton 
                                size="small"
                                sx={{
                                    color: darkMode ? "#9ca3af" : "#6b7280",
                                    "&:hover": {
                                        bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <EmojiEmotions sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    
                    {/* Post button */}
                    <Button
                        variant="contained"
                        onClick={handlePost}
                        disabled={!text.trim()}
                        endIcon={<Send sx={{ fontSize: 18 }} />}
                        sx={{
                            bgcolor: darkMode ? "#6366f1" : "#1976d2",
                            color: "white",
                            borderRadius: "8px",
                            px: 2.5,
                            py: 1,
                            fontSize: "14px",
                            fontWeight: 600,
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: darkMode ? "#5558d9" : "#1565c0",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            },
                            "&.Mui-disabled": {
                                bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                color: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                            },
                        }}
                    >
                        Post
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};