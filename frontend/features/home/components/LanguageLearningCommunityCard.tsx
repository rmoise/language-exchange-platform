import React from "react";
import { Box, Typography, Avatar, Button, IconButton } from "@mui/material";
import {
  Forum as ForumIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

interface LanguageLearningCommunityCardProps {
  memberCount: number;
  onMembersClick: () => void;
  darkMode?: boolean;
}

export const LanguageLearningCommunityCard: React.FC<LanguageLearningCommunityCardProps> = ({ 
  memberCount, 
  onMembersClick,
  darkMode = false 
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "#E3F2FD",
        backdropFilter: darkMode ? "blur(10px)" : "none",
        border: darkMode ? "1px solid #374151" : "1px solid #90CAF9",
        borderRadius: "12px",
        p: 3,
        py: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        "&:hover": darkMode ? {
          borderColor: "#6366f1",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        } : {},
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            backgroundColor: darkMode ? "#6366f1" : "#2196F3",
          }}
        >
          <ForumIcon sx={{ fontSize: 40, color: "#FFFFFF" }} />
        </Avatar>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 400, 
              color: darkMode ? "white" : "#000000",
              fontSize: "24px",
              lineHeight: "28px",
              mb: 0.75 
            }}
          >
            Language Learning Community
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PublicIcon sx={{ fontSize: 20, color: darkMode ? "#9ca3af" : "#666666" }} />
              <Typography variant="body2" sx={{ color: darkMode ? "#9ca3af" : "#666666", fontSize: "15px" }}>
                Public
              </Typography>
            </Box>
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 0.5,
                cursor: "pointer",
                "&:hover": {
                  "& .MuiTypography-root": {
                    textDecoration: "underline",
                  },
                },
              }}
              onClick={onMembersClick}
            >
              <PeopleIcon sx={{ fontSize: 20, color: darkMode ? "#9ca3af" : "#666666" }} />
              <Typography variant="body2" sx={{ color: darkMode ? "#9ca3af" : "#666666", fontSize: "15px" }}>
                {memberCount.toLocaleString()} members
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: darkMode ? "#6366f1" : "#141417",
            color: "white",
            textTransform: "none",
            borderRadius: "100px",
            px: 2.5,
            py: 1,
            fontSize: "16px",
            fontWeight: 500,
            letterSpacing: "-0.08px",
            lineHeight: "26px",
            minWidth: "auto",
            "&:hover": {
              backgroundColor: "#2c2c2c",
            },
          }}
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 20 }} />}
        >
          Invite
        </Button>
        <IconButton 
          size="small" 
          sx={{ 
            p: 1,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <MoreVertIcon sx={{ color: "#000000", fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
};