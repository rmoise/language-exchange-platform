"use client";

import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Collapse,
  IconButton,
  Stack,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import { Close } from "@mui/icons-material";

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
}

interface SimpleProfileCardProps {
  user: User;
  onFollow?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  matchPercentage?: number;
  distance?: string;
  isFollowing?: boolean;
}

const SimpleProfileCard: React.FC<SimpleProfileCardProps> = ({
  user,
  onFollow,
  onViewProfile,
  matchPercentage = 85,
  distance = "2.1km",
  isFollowing = false,
}) => {
  const [followExpanded, setFollowExpanded] = useState(false);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowExpanded(true);
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
    onViewProfile?.(user.id);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        onClick={handleCardClick}
        sx={{
          width: "100%",
          height: "463px",
          padding: "8px",
          position: "relative",
          boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.10)",
          overflow: "hidden",
          borderRadius: "40px",
          backdropFilter: "blur(16px)",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          display: "flex",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-2px)",
            transition: "transform 0.2s ease-in-out",
          },
        }}
      >
      {/* Main Container */}
      <Box
        sx={{
          alignSelf: "stretch",
          flex: "1 1 0",
          position: "relative",
          overflow: "hidden",
          borderRadius: "32px",
          outline: "1.50px rgba(123.79, 138.73, 136.60, 0.05) solid",
          outlineOffset: "-1.50px",
        }}
      >
        {/* Background Image with Overlays */}
        <Box
          sx={{
            width: "264px",
            height: "463px",
            left: "0px",
            top: "0px",
            position: "absolute",
            background: "linear-gradient(180deg, rgba(31, 37, 39, 0) 60%, rgba(31, 37, 39, 0.70) 100%)",
            backgroundBlendMode: "soft-light, normal",
            boxShadow: "22.3px 22.3px 22.3px",
            overflow: "hidden",
            borderRadius: "32px",
            outline: "1.50px rgba(255, 255, 255, 0.15) solid",
            outlineOffset: "-1.50px",
            filter: "blur(11.15px)",
            backgroundImage: `url(${user.profile_picture || "https://placehold.co/264x463"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Glassmorphism Overlay */}
          <Box
            sx={{
              width: "264px",
              height: "257px",
              left: "-0.50px",
              top: "206px",
              position: "absolute",
              background: "linear-gradient(176deg, rgba(246.61, 252.27, 251.64, 0) 0%, rgba(243.99, 243.99, 243.99, 0.76) 100%)",
              backdropFilter: "blur(6px)",
            }}
          />
          
          {/* Dark Gradient Overlay */}
          <Box
            sx={{
              width: "264px",
              height: "225px",
              left: "0.50px",
              top: "238px",
              position: "absolute",
              background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.01) 8%, rgba(0, 0, 0, 0.02) 16%, rgba(0, 0, 0, 0.05) 22%, rgba(0, 0, 0, 0.08) 29%, rgba(0, 0, 0, 0.13) 35%, rgba(0, 0, 0, 0.18) 41%, rgba(0, 0, 0, 0.25) 47%, rgba(0, 0, 0, 0.32) 53%, rgba(0, 0, 0, 0.40) 59%, rgba(0, 0, 0, 0.48) 65%, rgba(0, 0, 0, 0.58) 71%, rgba(0, 0, 0, 0.67) 78%, rgba(0, 0, 0, 0.78) 84%, rgba(0, 0, 0, 0.79) 92%, rgba(0, 0, 0, 0.88) 100%)",
              backgroundBlendMode: "overlay",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            }}
          />
          
          {/* Complex Multi-layer Overlay */}
          <Box
            sx={{
              width: "264px",
              height: "463px",
              left: "0.50px",
              top: "0px",
              position: "absolute",
              background: `
                linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 8%, rgba(0, 0, 0, 0) 16%, rgba(0, 0, 0, 0) 22%, rgba(0, 0, 0, 0) 29%, rgba(0, 0, 0, 0.01) 35%, rgba(0, 0, 0, 0.01) 41%, rgba(0, 0, 0, 0.01) 47%, rgba(0, 0, 0, 0.02) 53%, rgba(0, 0, 0, 0.02) 59%, rgba(0, 0, 0, 0.02) 65%, rgba(0, 0, 0, 0.03) 71%, rgba(0, 0, 0, 0.03) 78%, rgba(0, 0, 0, 0.04) 84%, rgba(0, 0, 0, 0.04) 92%, rgba(0, 0, 0, 0.04) 100%),
                linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 8%, rgba(0, 0, 0, 0) 16%, rgba(0, 0, 0, 0.01) 22%, rgba(0, 0, 0, 0.01) 29%, rgba(0, 0, 0, 0.02) 35%, rgba(0, 0, 0, 0.03) 41%, rgba(0, 0, 0, 0.04) 47%, rgba(0, 0, 0, 0.05) 53%, rgba(0, 0, 0, 0.06) 59%, rgba(0, 0, 0, 0.07) 65%, rgba(0, 0, 0, 0.09) 71%, rgba(0, 0, 0, 0.10) 78%, rgba(0, 0, 0, 0.12) 84%, rgba(0, 0, 0, 0.12) 92%, rgba(0, 0, 0, 0.13) 100%),
                linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.01) 8%, rgba(0, 0, 0, 0.02) 16%, rgba(0, 0, 0, 0.05) 22%, rgba(0, 0, 0, 0.08) 29%, rgba(0, 0, 0, 0.13) 35%, rgba(0, 0, 0, 0.18) 41%, rgba(0, 0, 0, 0.25) 47%, rgba(0, 0, 0, 0.32) 53%, rgba(0, 0, 0, 0.40) 59%, rgba(0, 0, 0, 0.48) 65%, rgba(0, 0, 0, 0.58) 71%, rgba(0, 0, 0, 0.67) 78%, rgba(0, 0, 0, 0.78) 84%, rgba(0, 0, 0, 0.79) 92%, rgba(0, 0, 0, 0.88) 100%)
              `,
              backgroundBlendMode: "luminosity, linear-burn, overlay",
              backdropFilter: "blur(50px)",
            }}
          />
        </Box>
      </Box>

      {/* Content Section */}
      <Box
        sx={{
          width: "280px",
          left: "0px",
          top: "288px",
          position: "absolute",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          display: "flex",
        }}
      >
        {/* Name and Bio Section */}
        <Box
          sx={{
            alignSelf: "stretch",
            paddingLeft: "28px",
            paddingRight: "28px",
            paddingTop: "20px",
            paddingBottom: "20px",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: "4px",
            display: "flex",
          }}
        >
          {/* Name and Verification */}
          <Box
            sx={{
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "8px",
              display: "flex",
            }}
          >
            <Typography
              sx={{
                color: "#FAFAFA",
                fontSize: "22px",
                fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 500,
                lineHeight: "33px",
                wordWrap: "break-word",
              }}
            >
              {user.name}
            </Typography>
            {user.is_verified && (
              <Box
                sx={{
                  width: "24px",
                  height: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "23.46px",
                    height: "23.18px",
                    left: "0.27px",
                    top: "0.41px",
                    position: "absolute",
                    background: "linear-gradient(180deg, #FDFDFD 0%, #D7D7D7 100%)",
                    borderRadius: "50%",
                  }}
                />
                <Box
                  sx={{
                    width: "16px",
                    height: "16px",
                    left: "4px",
                    top: "4.41px",
                    position: "absolute",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "11px",
                      height: "8.25px",
                      left: "2.50px",
                      top: "3.88px",
                      position: "absolute",
                      background: "#181818",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Bio */}
          <Typography
            sx={{
              alignSelf: "stretch",
              color: "#FAFAFA",
              fontSize: "15px",
              fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
              fontWeight: 400,
              lineHeight: "22.50px",
              wordWrap: "break-word",
            }}
          >
            {user.bio || "A language enthusiast focused on connecting with people around the world."}
          </Typography>
        </Box>

        {/* Stats and Follow Button */}
        <Box
          sx={{
            alignSelf: "stretch",
            paddingBottom: "24px",
            paddingLeft: "24px",
            paddingRight: "24px",
            justifyContent: "space-between",
            alignItems: "center",
            display: "flex",
          }}
        >
          {/* Stats */}
          <Box
            sx={{
              flex: "1 1 0",
              justifyContent: "flex-start",
              alignItems: "center",
              display: "flex",
            }}
          >
            {/* Match Percentage */}
            <Box
              sx={{
                flex: "1 1 0",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "4px",
                display: "flex",
              }}
            >
              <LocationOnIcon
                sx={{
                  width: "18px",
                  height: "18px",
                  color: "#FDFDFD",
                }}
              />
              <Typography
                sx={{
                  color: "#FDFDFD",
                  fontSize: "14px",
                  fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  wordWrap: "break-word",
                }}
              >
                {matchPercentage}%
              </Typography>
            </Box>

            {/* Distance/Connections */}
            <Box
              sx={{
                flex: "1 1 0",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "4px",
                display: "flex",
              }}
            >
              <GroupIcon
                sx={{
                  width: "18px",
                  height: "18px",
                  color: "#FDFDFD",
                }}
              />
              <Typography
                sx={{
                  color: "#FDFDFD",
                  fontSize: "14px",
                  fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  wordWrap: "break-word",
                }}
              >
                {distance}
              </Typography>
            </Box>
          </Box>

          {/* Follow Button */}
          <Button
            onClick={handleFollow}
            sx={{
              height: "44px",
              paddingLeft: "22px",
              paddingRight: "22px",
              paddingTop: "11.50px",
              paddingBottom: "11.50px",
              background: "#E5E5E5",
              boxShadow: "0px 0px 16px -4px rgba(170.03, 174.72, 167.68, 0.86)",
              overflow: "hidden",
              borderRadius: "32px",
              outline: "1px rgba(24, 24, 24, 0.03) solid",
              outlineOffset: "-1px",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px",
              display: "flex",
              "&:hover": {
                background: "#D5D5D5",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Typography
              sx={{
                color: "#181818",
                fontSize: "15px",
                fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 600,
                lineHeight: "22.50px",
                wordWrap: "break-word",
                textTransform: "none",
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Typography>
          </Button>
        </Box>
      </Box>
      </Box>

      {/* Expandable Follow Confirmation */}
      <Collapse in={followExpanded}>
        <Box
          sx={{
            mt: 1,
            width: "100%",
            maxWidth: "280px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(16px)",
            borderRadius: "24px",
            p: 2.5,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Stack spacing={2}>
            {/* Header with close button */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography
                sx={{
                  color: "#FAFAFA",
                  fontSize: "18px",
                  fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  lineHeight: "27px",
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"} {user.name}?
              </Typography>
              <IconButton
                onClick={handleCancelAction}
                size="small"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>

            {/* Confirmation message */}
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "15px",
                fontFamily: "SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 400,
                lineHeight: "22.5px",
              }}
            >
              {isFollowing 
                ? `You will stop seeing ${user.name}'s posts in your feed and they won't be notified of your activity.`
                : `You'll see ${user.name}'s posts in your feed and they'll be notified that you followed them.`
              }
            </Typography>

            {/* Action buttons */}
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                onClick={handleCancelAction}
                sx={{
                  minWidth: 80,
                  height: 40,
                  borderRadius: "20px",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "15px",
                  fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                sx={{
                  minWidth: 80,
                  height: 40,
                  borderRadius: "20px",
                  background: isFollowing 
                    ? "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)"
                    : "#E5E5E5",
                  color: isFollowing ? "#FFFFFF" : "#181818",
                  fontSize: "15px",
                  fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: isFollowing 
                    ? "0px 4px 16px rgba(255, 107, 107, 0.4)"
                    : "0px 4px 16px rgba(229, 229, 229, 0.4)",
                  "&:hover": {
                    background: isFollowing 
                      ? "linear-gradient(135deg, #FF5252 0%, #F44336 100%)"
                      : "#D5D5D5",
                    transform: "translateY(-1px)",
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

export default SimpleProfileCard;