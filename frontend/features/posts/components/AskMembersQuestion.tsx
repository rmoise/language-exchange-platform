"use client";

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
} from "@mui/icons-material";
import {
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
    Typography,
    Divider,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    Chip,
} from "@mui/material";
import React, { useState } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";

interface AskMembersQuestionProps {
    onPost?: (title: string, text: string, category: string) => void;
    userAvatar?: string;
    placeholder?: string;
    darkMode?: boolean;
    compact?: boolean;
}

const categories = [
    { value: "general", label: "General Discussion", icon: "💡" },
    { value: "grammar", label: "Grammar Help", icon: "📝" },
    { value: "vocabulary", label: "Vocabulary", icon: "📚" },
    { value: "pronunciation", label: "Pronunciation", icon: "🗣️" },
    { value: "conversation", label: "Conversation Practice", icon: "💬" },
    { value: "writing", label: "Writing", icon: "✍️" },
    { value: "culture", label: "Culture & Travel", icon: "🌍" },
    { value: "resources", label: "Resources & Tips", icon: "📖" },
];

export const AskMembersQuestion: React.FC<AskMembersQuestionProps> = React.memo(({ 
    onPost,
    userAvatar,
    placeholder = "What's on your mind? Ask the community...",
    darkMode: darkModeProp,
    compact = false
}) => {
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [category, setCategory] = useState("general");
    const [isFocused, setIsFocused] = useState(false);
    const { user } = useAuth();
    const { mode } = useCustomTheme();
    const darkMode = darkModeProp ?? (mode === "dark");

    const handlePost = () => {
        if (title.trim() && text.trim() && onPost) {
            onPost(title, text, category);
            setTitle("");
            setText("");
            setCategory("general");
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
                backgroundColor: darkMode ? "rgba(30, 30, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                border: "0.5px solid",
                borderColor: isFocused 
                    ? (darkMode ? "#6366f1" : "#6366f1")
                    : (darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"),
                borderRadius: "16px",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                transform: isFocused ? "translateY(-1px)" : "translateY(0)",
                boxShadow: isFocused
                    ? darkMode 
                        ? "0 0 0 3px rgba(99, 102, 241, 0.2), 0 10px 24px -8px rgba(0, 0, 0, 0.3)" 
                        : "0 0 0 3px rgba(99, 102, 241, 0.15), 0 10px 24px -8px rgba(0, 0, 0, 0.08)"
                    : darkMode
                        ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
                        : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
                "&:hover": {
                    borderColor: isFocused 
                        ? (darkMode ? "#6366f1" : "#6366f1")
                        : (darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"),
                    transform: "translateY(-2px)",
                    boxShadow: isFocused
                        ? darkMode 
                            ? "0 0 0 3px rgba(99, 102, 241, 0.25), 0 12px 28px -8px rgba(99, 102, 241, 0.2)" 
                            : "0 0 0 3px rgba(99, 102, 241, 0.2), 0 12px 28px -8px rgba(99, 102, 241, 0.15)"
                        : darkMode
                            ? "0 20px 40px -12px rgba(0, 0, 0, 0.35)"
                            : "0 20px 40px -12px rgba(0, 0, 0, 0.1)",
                },
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2.5, pb: 0 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <UserAvatar
                        user={user || { 
                            id: 'default',
                            name: 'User',
                            profileImage: null 
                        }}
                        size={44}
                        showOnlineStatus={false}
                    />

                    <Box sx={{ flex: 1 }}>
                        <TextField
                            placeholder="Add a title..."
                            variant="standard"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            fullWidth
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    color: darkMode ? "white" : "#1a1a1a",
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    mb: 1.5,
                                    "& input": {
                                        "&::placeholder": {
                                            color: darkMode ? "#9ca3af" : "#6b7280",
                                            opacity: 1,
                                            fontWeight: 400,
                                        },
                                    },
                                },
                            }}
                        />
                        <Divider sx={{ 
                            borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
                            my: 1.5
                        }} />
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
            <Box sx={{ p: 2, bgcolor: "transparent" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                        {/* Category selector */}
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <Select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                sx={{
                                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#6366f1",
                                    },
                                    "& .MuiSelect-select": {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        py: 1,
                                    },
                                }}
                                renderValue={(value) => {
                                    const selected = categories.find(cat => cat.value === value);
                                    return (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography>{selected?.icon}</Typography>
                                            <Typography sx={{ fontSize: "14px" }}>{selected?.label}</Typography>
                                        </Stack>
                                    );
                                }}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography>{cat.icon}</Typography>
                                            <Typography sx={{ fontSize: "14px" }}>{cat.label}</Typography>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }} />
                        
                        {/* Media buttons */}
                        <Tooltip title="Add image" placement="bottom" arrow>
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
                        <Tooltip title="Add GIF" placement="bottom" arrow>
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
                        <Tooltip title="Create poll" placement="bottom" arrow>
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
                        <Tooltip title="Add emoji" placement="bottom" arrow>
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
                        disabled={!title.trim() || !text.trim()}
                        endIcon={<Send sx={{ fontSize: 18 }} />}
                        sx={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            color: "white",
                            borderRadius: "8px",
                            px: 2.5,
                            py: 1,
                            fontSize: "14px",
                            fontWeight: 600,
                            textTransform: "none",
                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #5558d9 0%, #7c3aed 100%)",
                                boxShadow: "0 6px 16px rgba(99, 102, 241, 0.35)",
                                transform: "translateY(-1px)",
                            },
                            "&.Mui-disabled": {
                                background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                                color: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Post
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
});

AskMembersQuestion.displayName = 'AskMembersQuestion';