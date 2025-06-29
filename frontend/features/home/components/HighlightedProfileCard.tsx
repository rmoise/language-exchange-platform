"use client";

import React from "react";
import { 
  Box, 
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import { 
  Verified,
  ChatBubbleOutline as ChatIcon,
  PersonAddOutlined as AddIcon,
  StarRounded as StarIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";
import { NewUserBadge } from "@/components/ui/NewUserBadge";

interface ProfileData {
  id: string;
  name: string;
  location: string;
  profileImage?: string;
  coverImage?: string;
  coverPhoto?: string;
  languages: {
    fluent: {
      flags: string[];
      count: number;
    };
    learns: {
      flags: string[];
      count: number;
    };
  };
  description: string;
  level: string;
  isOnline?: boolean;
  isNew?: boolean;
}

interface HighlightedProfileCardProps {
  profile: ProfileData;
  darkMode: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
}

const HighlightedProfileCardComponent: React.FC<HighlightedProfileCardProps> = ({
  profile,
  darkMode,
  onFollow,
  onMessage,
}) => {
  const router = useRouter();

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/app/users/${profile.id}`);
  };

  return (
    <Box
      sx={{
        width: 322,
        height: 420,
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        p: 0,
        backdropFilter: "blur(40px)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          padding: "1px",
          background: `linear-gradient(135deg, 
            rgba(99, 102, 241, 0.3), 
            rgba(139, 92, 246, 0.4), 
            rgba(59, 130, 246, 0.3)
          )`,
          borderRadius: "16px",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "xor",
          WebkitMaskComposite: "xor",
        },
        "&:hover": {
          transform: "translateY(-8px)",
          "&::before": {
            background: `linear-gradient(135deg, 
              rgba(99, 102, 241, 0.5), 
              rgba(139, 92, 246, 0.6), 
              rgba(59, 130, 246, 0.5)
            )`,
          },
          boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.3), 0 0 40px -10px rgba(99, 102, 241, 0.1)",
        },
      }}
      onClick={handleCardClick}
    >
      {/* Inner content container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          p: 3.5,
        }}
      >
      {/* New User Badge */}
      {profile.isNew && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
          }}
        >
          <Chip
            label="NEW"
            size="small"
            sx={{
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              color: "#10b981",
              fontSize: "10px",
              fontWeight: 700,
              height: 20,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          />
        </Box>
      )}
      
      <Stack spacing={3.5} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top section with avatar, name and location - similar to ProfileCard */}
        <Stack direction="row" spacing={2.5} alignItems="center">
          {/* Profile image */}
          <UserAvatar
            user={{
              id: profile.id,
              name: profile.name,
              profileImage: profile.profileImage,
              isOnline: profile.isOnline
            }}
            size={80}
            showOnlineStatus={true}
            showBorderForNonImage={false}
          />
          
          {/* Name and location */}
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Stack spacing={0.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  sx={{
                    color: "#ffffff",
                    fontSize: "18px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {profile.name.split(' ')[0]}
                </Typography>
                <Verified sx={{ fontSize: 16, color: "#6366f1" }} />
              </Box>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  width: 142,
                }}
              >
                {truncateText(profile.description, 70)}
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationIcon sx={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)" }} />
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "12px",
                }}
              >
                {profile.location}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        
        <Stack spacing={3} alignItems="center">
          {/* Divider between location and languages */}
          <Divider sx={{ 
            width: "100%", 
            borderColor: "rgba(255, 255, 255, 0.15)"
          }} />
          
          {/* Languages section - simplified like ProfileCard */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.11px",
              }}
            >
              Fluent
            </Typography>
            <Typography sx={{ fontSize: "16px" }}>
              {profile.languages.fluent.flags[0]}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.11px",
              }}
            >
              +{profile.languages.fluent.count}
            </Typography>
            <Box
              sx={{
                width: "1.5px",
                height: "11px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                mx: 0.5,
              }}
            />
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.11px",
              }}
            >
              Learns
            </Typography>
            <Typography sx={{ fontSize: "16px" }}>
              {profile.languages.learns.flags[0]}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.11px",
              }}
            >
              +{profile.languages.learns.count}
            </Typography>
          </Stack>
        </Stack>
      
        {/* Stats section - simplified */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-around",
          px: 2,
        }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ 
              fontSize: "18px", 
              fontWeight: 600, 
              color: "white",
              lineHeight: 1,
            }}>
              #12
            </Typography>
            <Typography sx={{ 
              fontSize: "10px", 
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mt: 0.5,
            }}>
              Rank
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ 
              fontSize: "18px", 
              fontWeight: 600, 
              color: "white",
              lineHeight: 1,
            }}>
              {profile.level}
            </Typography>
            <Typography sx={{ 
              fontSize: "10px", 
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mt: 0.5,
            }}>
              Level
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ 
              fontSize: "18px", 
              fontWeight: 600, 
              color: "white",
              lineHeight: 1,
            }}>
              128
            </Typography>
            <Typography sx={{ 
              fontSize: "10px", 
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mt: 0.5,
            }}>
              Sessions
            </Typography>
          </Box>
        </Box>
        
        {/* Action buttons - matching ProfileCard style */}
        <Stack direction="row" spacing={1.5} sx={{ mt: "auto" }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onFollow?.();
            }}
            variant="outlined"
            sx={{
              width: 129,
              height: 41,
              borderRadius: "14px",
              borderColor: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.8)",
              backgroundColor: "transparent",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "13.7px",
              letterSpacing: "-0.14px",
              textTransform: "none",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.2)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
              },
            }}
          >
            Connect
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.();
            }}
            variant="contained"
            sx={{
              width: 129,
              height: 41,
              borderRadius: "14px",
              backgroundColor: "#ffffff",
              color: "#151515",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "13.7px",
              letterSpacing: "-0.14px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            View Profile
          </Button>
        </Stack>
      </Stack>
      </Box>
    </Box>
  );
};

export const HighlightedProfileCard = React.memo(HighlightedProfileCardComponent);