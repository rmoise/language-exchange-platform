"use client";

import React from "react";
import { 
  Box, 
  Typography, 
} from "@mui/material";
import { Verified } from "@mui/icons-material";
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
    router.push(`/app/profile/${profile.id}`);
  };

  return (
    <Box
      onClick={handleCardClick}
      sx={{
        width: 320,
        minWidth: 320,
        maxWidth: 320,
        height: 320,
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        backgroundColor: darkMode ? "rgba(30, 30, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: darkMode
          ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
        flexShrink: 0,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        "&:hover": {
          backgroundColor: darkMode ? "rgba(30, 30, 30, 0.7)" : "rgba(255, 255, 255, 0.95)",
          boxShadow: darkMode
            ? "0 24px 48px -12px rgba(0, 0, 0, 0.4)"
            : "0 24px 48px -12px rgba(0, 0, 0, 0.12)",
          borderColor: darkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
          transform: "translateY(-8px) translateZ(0)",
        },
      }}
    >
      {/* New User Badge */}
      {profile.isNew && <NewUserBadge variant="default" darkMode={darkMode} />}
      
      {/* Cover image section - centered with avatar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 120,
          background: (profile.coverPhoto || profile.coverImage) 
            ? `url(${profile.coverPhoto || profile.coverImage})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: (profile.coverPhoto || profile.coverImage)
              ? "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7))"
              : "none",
          }
        }}
      />
      
      {/* Profile image with blur shadow */}
      <Box
        sx={{
          position: "absolute",
          top: 45,
          left: "50%",
          transform: "translateX(-50%)",
          width: 96,
          height: 96,
        }}
      >
        {/* Blurred shadow */}
        <Box
          sx={{
            position: "absolute",
            top: 15,
            left: 0,
            width: 96,
            height: 96,
            borderRadius: "50%",
            opacity: 0.1,
            filter: "blur(12px)",
            overflow: "hidden",
          }}
        >
          <UserAvatar
            user={{
              id: profile.id,
              name: profile.name,
              profileImage: profile.profileImage
            }}
            size={96}
            showOnlineStatus={false}
            showBorderForNonImage={true}
          />
        </Box>
        
        {/* Actual profile image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 96,
            height: 96,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <UserAvatar
            user={{
              id: profile.id,
              name: profile.name,
              profileImage: profile.profileImage
            }}
            size={96}
            showOnlineStatus={false}
            showBorderForNonImage={true}
          />
        </Box>
      </Box>

      
      {/* Name */}
      <Box
        sx={{
          position: "absolute",
          top: 155,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Typography
          sx={{
            color: darkMode ? "#ffffff" : "black",
            fontSize: "20px",
            fontWeight: 500,
            fontFamily: "Inter, -apple-system, sans-serif",
            lineHeight: 1,
          }}
        >
          {profile.name.split(' ')[0]}
        </Typography>
        <Verified sx={{ fontSize: 18, color: "#6366f1", ml: 0.5 }} />
      </Box>
      
      {/* Location and Languages */}
      <Box
        sx={{
          position: "absolute",
          top: 185,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          width: "80%",
        }}
      >
        <Typography
          sx={{
            color: darkMode ? "#888" : "#9e9ea2",
            fontSize: "12px",
            fontWeight: 400,
            fontFamily: "Inter, -apple-system, sans-serif",
            mb: 1,
          }}
        >
          {profile.location}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75, mb: 3.5 }}>
          <Typography
            sx={{
              color: darkMode ? "#b0b0b0" : "#303030",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            Fluent
          </Typography>
          <Typography sx={{ fontSize: "16px", px: 0.5 }}>
            {profile.languages.fluent.flags[0]}
          </Typography>
          <Typography
            sx={{
              color: darkMode ? "#b0b0b0" : "#303030",
              fontSize: "11px",
              fontWeight: 500,
              mr: 1,
            }}
          >
            +{profile.languages.fluent.count}
          </Typography>
          <Box
            sx={{
              width: "1.5px",
              height: "11px",
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",
              mx: 0.5,
            }}
          />
          <Typography
            sx={{
              color: darkMode ? "#b0b0b0" : "#303030",
              fontSize: "11px",
              fontWeight: 500,
              ml: 1,
            }}
          >
            Learns
          </Typography>
          <Typography sx={{ fontSize: "16px", px: 0.5 }}>
            {profile.languages.learns.flags[0]}
          </Typography>
          <Typography
            sx={{
              color: darkMode ? "#b0b0b0" : "#303030",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            +{profile.languages.learns.count}
          </Typography>
        </Box>
      </Box>
      
      {/* Description */}
      <Box
        sx={{
          position: "absolute",
          top: 245,
          left: "50%",
          transform: "translateX(-50%)",
          width: "85%",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            color: darkMode ? "#b0b0b0" : "#303030",
            fontSize: "13px",
            fontWeight: 400,
            fontFamily: "Inter, -apple-system, sans-serif",
            lineHeight: 1.5,
          }}
        >
          {truncateText(profile.description, 90)}
        </Typography>
      </Box>
    </Box>
  );
};

export const HighlightedProfileCard = React.memo(HighlightedProfileCardComponent);