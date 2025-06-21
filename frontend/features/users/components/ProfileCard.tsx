import React, { useState } from "react";
import { 
    Box, 
    Stack, 
    Typography, 
    Button, 
    Avatar, 
    Divider,
    Collapse,
    IconButton
} from "@mui/material";
import { LocationOn, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  profile_picture?: string;
  bio?: string;
  location?: string;
  age?: number;
  native_languages?: string[];
  learning_languages?: string[];
  interests?: string[];
  is_verified?: boolean;
  followers_count?: number;
  projects_count?: number;
}

interface ProfileCardProps {
  user: User;
  onFollow?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  matchPercentage?: number;
  distance?: string;
  isFollowing?: boolean;
  darkMode?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onFollow,
  onViewProfile,
  isFollowing = false,
  darkMode = false,
}) => {
  const router = useRouter();
  const [followExpanded, setFollowExpanded] = useState(false);
  
  const profileData = {
    name: user.name || "Jay Vaughn",
    description: user.bio || "Friendly language learner seeking conversation practice. I love talking about food, music, movies, and travel adventures.",
    location: user.location || "Zurich, Switzerland",
    profileImage: user.profile_picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=94&h=94&fit=crop&crop=face",
    languages: {
      fluent: {
        flag: "🇩🇪",
        count: user.native_languages?.length || 2
      },
      learning: {
        flag: "🇦🇺", 
        count: user.learning_languages?.length || 1
      }
    }
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      // If already following, show unfollow confirmation
      setFollowExpanded(true);
    } else {
      // If not following, show follow confirmation
      setFollowExpanded(true);
    }
  };

  const handleConfirmAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow?.(user.id);
    setFollowExpanded(false);
  };

  const handleCancelAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowExpanded(false);
  };

  const handleCardClick = () => {
    // Use router to navigate to user profile
    router.push(`/protected/profile/${user.id}`);
    
    // Also call the optional onViewProfile callback if provided
    onViewProfile?.(user.id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Box
        onClick={handleCardClick}
        sx={{
          backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "white",
          backdropFilter: darkMode ? "blur(10px)" : "none",
          width: 322,
          height: 360,
          p: 3.5,
          borderRadius: "16px",
          border: darkMode ? "1px solid #374151" : "none",
          boxShadow: darkMode ? "0 4px 20px rgba(99, 102, 241, 0.2)" : "0 2px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          cursor: 'pointer',
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          "&:hover": {
            backgroundColor: darkMode ? "rgba(0, 0, 0, 0.6)" : "white",
            boxShadow: darkMode ? "0 16px 40px rgba(99, 102, 241, 0.4)" : "0 8px 32px rgba(99, 102, 241, 0.3)",
            borderColor: darkMode ? "#6366f1" : "transparent",
            transform: "translate3d(0, -8px, 0)",
          },
        }}
      >
        <Stack spacing={3.5}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              src={profileData.profileImage}
              sx={{
                width: 94,
                height: 94,
              }}
            />

            <Stack spacing={1.5} sx={{ flex: 1 }}>
              <Stack spacing={0.5}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "18.7px",
                    color: darkMode ? "#ffffff" : "black",
                    letterSpacing: "-0.19px",
                  }}
                >
                  {profileData.name}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "11px",
                    color: darkMode ? "#b0b0b0" : "#303030",
                    letterSpacing: "-0.11px",
                    width: 142,
                    lineHeight: 1.6,
                  }}
                >
                  {profileData.description}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOn
                  sx={{
                    width: 12,
                    height: 12,
                    color: darkMode ? "#888" : "#9e9ea2",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: darkMode ? "#888" : "#9e9ea2",
                    letterSpacing: "-0.10px",
                  }}
                >
                  {profileData.location}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack spacing={3} alignItems="center">
            <Divider sx={{ width: "100%", borderColor: darkMode ? "#444" : "#e0e0e0" }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: darkMode ? "#888" : "#9e9ea2",
                  letterSpacing: "-0.11px",
                }}
              >
                Fluent
              </Typography>

              <Typography sx={{ fontSize: "16px" }}>
                {profileData.languages.fluent.flag}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: darkMode ? "#888" : "#9e9ea2",
                  letterSpacing: "-0.11px",
                }}
              >
                +{profileData.languages.fluent.count}
              </Typography>

              <Box
                sx={{
                  width: "1.5px",
                  height: "11px",
                  backgroundColor: darkMode ? "#555" : "#9e9ea2",
                }}
              />

              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: darkMode ? "#888" : "#9e9ea2",
                  letterSpacing: "-0.11px",
                }}
              >
                Learns
              </Typography>

              <Typography sx={{ fontSize: "16px" }}>
                {profileData.languages.learning.flag}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: darkMode ? "#888" : "#9e9ea2",
                  letterSpacing: "-0.11px",
                }}
              >
                +{profileData.languages.learning.count}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={handleFollow}
              variant="outlined"
              sx={{
                width: 129,
                height: 41,
                borderRadius: "14px",
                borderColor: darkMode ? "#555" : "#d6d7dd",
                color: darkMode ? "#ccc" : "#5e5d66",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "13.7px",
                letterSpacing: "-0.14px",
                textTransform: "none",
                "&:hover": {
                  borderColor: darkMode ? "#666" : "#d6d7dd",
                  backgroundColor: darkMode ? "rgba(85, 85, 85, 0.1)" : "rgba(214, 215, 221, 0.04)",
                },
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>

            <Button
              variant="contained"
              sx={{
                width: 129,
                height: 41,
                borderRadius: "14px",
                backgroundColor: darkMode ? "#ffffff" : "#151515",
                color: darkMode ? "#151515" : "#d6d7dd",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "13.7px",
                letterSpacing: "-0.14px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: darkMode ? "#f0f0f0" : "#2a2a2a",
                },
              }}
            >
              Message
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Expandable Follow Confirmation */}
      <Collapse in={followExpanded}>
        <Box
          sx={{
            mt: 1,
            backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "white",
            backdropFilter: darkMode ? "blur(10px)" : "none",
            border: darkMode ? "1px solid #374151" : "1px solid #e0e0e0",
            borderRadius: "16px",
            p: 2.5,
            width: 322,
            boxShadow: darkMode ? "0 4px 20px rgba(99, 102, 241, 0.2)" : "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <Stack spacing={2}>
            {/* Header with close button */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: darkMode ? "#ffffff" : "#151515",
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"} {profileData.name}?
              </Typography>
              <IconButton
                onClick={handleCancelAction}
                size="small"
                sx={{
                  color: darkMode ? "#888" : "#666",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>

            {/* Confirmation message */}
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                color: darkMode ? "#b0b0b0" : "#666",
                lineHeight: 1.5,
              }}
            >
              {isFollowing 
                ? `You will stop seeing ${profileData.name}'s posts in your feed and they won't be notified of your activity.`
                : `You'll see ${profileData.name}'s posts in your feed and they'll be notified that you followed them.`
              }
            </Typography>

            {/* Action buttons */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                onClick={handleCancelAction}
                sx={{
                  minWidth: 80,
                  height: 36,
                  borderRadius: "12px",
                  color: darkMode ? "#ccc" : "#666",
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "13px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                variant="contained"
                sx={{
                  minWidth: 80,
                  height: 36,
                  borderRadius: "12px",
                  backgroundColor: isFollowing 
                    ? (darkMode ? "#dc2626" : "#ef4444")
                    : (darkMode ? "#ffffff" : "#151515"),
                  color: isFollowing 
                    ? "#ffffff"
                    : (darkMode ? "#151515" : "#ffffff"),
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "13px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: isFollowing 
                      ? (darkMode ? "#b91c1c" : "#dc2626")
                      : (darkMode ? "#f0f0f0" : "#2a2a2a"),
                  },
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProfileCard;