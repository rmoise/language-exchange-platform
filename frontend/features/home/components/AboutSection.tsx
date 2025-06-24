import React from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Button,
  IconButton,
  AvatarGroup,
  Avatar,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  Public as PublicIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  MoreHoriz as MoreIcon,
} from "@mui/icons-material";

interface AboutSectionProps {
  memberCount: number;
  onMembersClick: () => void;
  darkMode?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  memberCount, 
  onMembersClick,
  darkMode = false 
}) => {
  const spaceStats = [
    {
      icon: <PublicIcon sx={{ color: "#4caf50" }} />,
      iconBg: "#e8f5e8",
      title: "Public space",
      description: "Everyone can see posts in this\nspace",
    },
    {
      icon: <ChatBubbleOutlineIcon sx={{ color: "#9c27b0" }} />,
      iconBg: "#f3e5f5",
      title: "32 new posts last week",
      description: "161 posts last month",
    },
    {
      icon: <CalendarTodayIcon sx={{ color: "#ff9800" }} />,
      iconBg: "#fff3e0",
      title: "Created 01/30/2024",
      description: "",
    },
  ];

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "#FFFFFF",
        backdropFilter: darkMode ? "blur(10px)" : "none",
        boxShadow: "none",
        border: `1px solid ${darkMode ? "#374151" : "#dbdbdb"}`,
        borderRadius: "16px",
        transition: "all 0.3s ease",
        "&:hover": darkMode ? {
          borderColor: "#6366f1",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "19.7px",
              fontWeight: 400,
              color: darkMode ? "white" : "#141417",
              letterSpacing: "-0.04px",
              lineHeight: "32px",
            }}
          >
            About this space
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: "15.9px",
              fontWeight: 400,
              color: darkMode ? "white" : "#141417",
              letterSpacing: "-0.08px",
              lineHeight: "26px",
            }}
          >
            A supportive community where
            <br />
            language learners can ask questions,
            <br />
            share resources, and practice
            <br />
            together...
          </Typography>

          <Box sx={{ pb: 2 }}>
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon sx={{ width: 25, height: 25 }} />}
              sx={{
                p: 0,
                justifyContent: "flex-start",
                textTransform: "none",
                color: darkMode ? "white" : "#141417",
                fontSize: "16px",
                fontWeight: 500,
                letterSpacing: "-0.08px",
                lineHeight: "26px",
              }}
            >
              Read more
            </Button>
          </Box>

          <Stack spacing={2} sx={{ pb: 3 }}>
            {spaceStats.map((item, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : item.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {item.icon}
                </Box>
                <Stack>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "15.9px",
                      fontWeight: 400,
                      color: darkMode ? "white" : "#141417",
                      letterSpacing: "-0.08px",
                      lineHeight: "26px",
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "12.7px",
                        fontWeight: 400,
                        color: darkMode ? "white" : "#141417",
                        letterSpacing: "0.12px",
                        lineHeight: "24px",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {item.description}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            ))}

            <Stack spacing={1.5} alignItems="flex-end">
              <Typography
                variant="h6"
                sx={{
                  fontSize: "15.9px",
                  fontWeight: 500,
                  color: darkMode ? "white" : "#141417",
                  letterSpacing: "-0.08px",
                  lineHeight: "26px",
                  alignSelf: "flex-start",
                }}
              >
                Members
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1}>
                <AvatarGroup
                  max={4}
                  sx={{
                    "& .MuiAvatar-root": {
                      width: 36,
                      height: 36,
                      border: darkMode ? "2px solid #000000" : "2px solid white",
                      marginLeft: "-8px",
                    },
                  }}
                >
                  {[...Array(4)].map((_, i) => (
                    <Avatar 
                      key={i} 
                      sx={{ 
                        bgcolor: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"][i],
                        fontSize: 14
                      }}
                    >
                      {["P", "V", "S", "R"][i]}
                    </Avatar>
                  ))}
                </AvatarGroup>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "15.8px",
                    fontWeight: 400,
                    color: darkMode ? "white" : "#141417",
                    letterSpacing: "-0.08px",
                    lineHeight: "26px",
                    textDecoration: "underline",
                    ml: 1,
                    cursor: "pointer",
                    "&:hover": {
                      color: "#6366f1",
                    },
                  }}
                  onClick={onMembersClick}
                >
                  {memberCount.toLocaleString()} members
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                flex: 1,
                backgroundColor: darkMode ? "#6366f1" : "#141417",
                color: "white",
                borderRadius: "100px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 500,
                letterSpacing: "-0.08px",
                lineHeight: "26px",
                py: 1,
                px: 2,
                "&:hover": {
                  backgroundColor: darkMode ? "#5a5cf8" : "#2c2c2c",
                },
              }}
            >
              Invite members
            </Button>

            <IconButton
              sx={{
                p: 1.5,
                borderRadius: 1.25,
              }}
            >
              <MoreIcon sx={{ width: 20, height: 20 }} />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};