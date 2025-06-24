import AttachFile from "@mui/icons-material/AttachFile";
import Image from "@mui/icons-material/Image";
import Link from "@mui/icons-material/Link";
import Send from "@mui/icons-material/Send";
import {
    Avatar,
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
} from "@mui/material";
import React, { useState } from "react";

interface AskMembersQuestionProps {
    onPost?: (text: string) => void;
    userAvatar?: string;
    placeholder?: string;
    darkMode?: boolean;
}

export const AskMembersQuestion: React.FC<AskMembersQuestionProps> = ({ 
    onPost,
    userAvatar = "/user-avatar.png",
    placeholder = "Ask the members a question...",
    darkMode = false
}) => {
    const [text, setText] = useState("");

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
                display: "flex",
                alignItems: "flex-start",
                p: 3,
                bgcolor: darkMode ? "rgba(0, 0, 0, 0.4)" : "white",
                backdropFilter: darkMode ? "blur(10px)" : "none",
                borderRadius: 2,
                border: 1,
                borderColor: darkMode ? "#374151" : "#dbdbdb",
                overflow: "hidden",
                gap: 2,
                transition: "all 0.3s ease",
                "&:hover": darkMode ? {
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                } : {},
            }}
        >
            <Avatar
                sx={{
                    width: 40,
                    height: 40,
                    backgroundImage: `url(${userAvatar})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                U
            </Avatar>

            <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ flex: 1 }}>
                <TextField
                    placeholder={placeholder}
                    variant="standard"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    multiline
                    minRows={1}
                    maxRows={10}
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            fontSize: "19.7px",
                            color: darkMode ? "white" : "#3b3b3b",
                            fontFamily: "Inter-Regular, Helvetica",
                            letterSpacing: "-0.04px",
                            lineHeight: "32px",
                            alignItems: "flex-start",
                            py: 0,
                        },
                    }}
                    sx={{ 
                        flex: 1,
                        "& .MuiInputBase-root": {
                            alignItems: "flex-start",
                        },
                        "& textarea": {
                            resize: "vertical",
                            minHeight: "32px",
                            scrollbarWidth: "thin",
                            "&::-webkit-scrollbar": {
                                width: "8px",
                            },
                            "&::-webkit-scrollbar-track": {
                                backgroundColor: "#f1f1f1",
                                borderRadius: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                backgroundColor: "#888",
                                borderRadius: "4px",
                                "&:hover": {
                                    backgroundColor: "#555",
                                },
                            },
                        },
                    }}
                />

                <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <IconButton size="small">
                        <AttachFile sx={{ width: 25, height: 25 }} />
                    </IconButton>
                    <IconButton size="small">
                        <Image sx={{ width: 25, height: 25 }} />
                    </IconButton>
                    <IconButton size="small">
                        <Link sx={{ width: 25, height: 25 }} />
                    </IconButton>
                </Stack>
            </Stack>

            <Box sx={{ ml: 3, mt: 0.5 }}>
                <Button
                    variant="contained"
                    endIcon={<Send sx={{ width: 25, height: 25 }} />}
                    onClick={handlePost}
                    disabled={!text.trim()}
                    sx={{
                        bgcolor: "#141417",
                        color: "white",
                        borderRadius: 1.5,
                        px: 2.5,
                        py: 1.375,
                        fontSize: "15.4px",
                        fontFamily: "Inter-Medium, Helvetica",
                        fontWeight: 500,
                        letterSpacing: "-0.08px",
                        lineHeight: "26px",
                        textTransform: "none",
                        "&:hover": {
                            bgcolor: "#141417",
                        },
                        "&.Mui-disabled": {
                            bgcolor: "#e0e0e0",
                            color: "#999999",
                        },
                    }}
                >
                    Post
                </Button>
            </Box>
        </Box>
    );
};