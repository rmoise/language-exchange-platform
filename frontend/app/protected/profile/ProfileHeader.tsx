"use client";

import { useState } from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import EditIconButton from "@/features/users/components/EditIconButton";
import { PhotoCarouselModal } from "./[userId]/PhotoCarousel";

interface ProfileHeaderProps {
  user: {
    name?: string;
    avatar?: string;
    city?: string;
    country?: string;
    coverImage?: string;
    age?: number;
    isOnline?: boolean;
  };
  onEditName?: () => void;
  onEditAvatar?: () => void;
  onEditCover?: () => void;
  actionButtons?: React.ReactNode;
  isUserProfile?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditName,
  onEditAvatar,
  onEditCover,
  actionButtons,
  isUserProfile = false,
}) => {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // User profile photo - single high-resolution image
  const profilePhoto = user.avatar || "https://randomuser.me/api/portraits/men/1.jpg";
  
  // Convert to high-res version for modal viewing
  let highResPhoto = profilePhoto;
  if (profilePhoto.includes('randomuser.me')) {
    // For randomuser.me, just use the original URL - it should work fine
    highResPhoto = profilePhoto;
  }
  
  const userPhotos = [highResPhoto];

  const handleAvatarClick = () => {
    setSelectedPhotoIndex(0); // Start with avatar photo
    setCarouselOpen(true);
  };

  const handleCarouselClose = () => {
    setCarouselOpen(false);
  };
  return (
    <>
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      }}
    >
      {/* Cover Image Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "180px", sm: "200px" },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          overflow: "hidden",
        }}
      >
        {/* Geometric Pattern Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%),
              linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)
            `,
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 20px,
                  rgba(255,255,255,0.03) 20px,
                  rgba(255,255,255,0.03) 40px
                )
              `,
            },
          }}
        />

        {/* Cover Image Upload Button */}
        {onEditCover && (
          <EditIconButton
            onClick={onEditCover}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 3,
            }}
          />
        )}

        {/* Cover Image */}
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          alt="Cover Image"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      </Box>

      {/* User Details Section */}
      <Box
        sx={{
          position: "relative",
          backgroundColor: "transparent",
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          mt: { xs: "-40px", sm: "-30px" },
          zIndex: 2,
        }}
      >
        {/* Avatar and Info Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "flex-start" },
            gap: { xs: 2, sm: 3 },
            mb: 2,
          }}
        >
          {/* Avatar with Edit Button */}
          <Box
            sx={{
              position: "relative",
              alignSelf: { xs: "center", sm: "flex-start" },
            }}
          >
            <Avatar
              src={user.avatar}
              onClick={handleAvatarClick}
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
                },
                border: "3px solid white",
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontWeight: 500,
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            {/* Online Status Dot for user profiles */}
            {isUserProfile && user.isOnline && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  width: 16,
                  height: 16,
                  backgroundColor: "#22c55e",
                  borderRadius: "50%",
                  border: "3px solid white",
                  zIndex: 1,
                }}
              />
            )}
            {onEditAvatar && (
              <EditIconButton
                onClick={onEditAvatar}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                }}
              />
            )}
          </Box>

          {/* Name and Info Section */}
          <Box
            sx={{
              flex: 1,
              pt: { xs: 0, sm: 6 },
              textAlign: { xs: "center", sm: "left" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {/* Name with Edit Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", sm: "flex-start" },
                gap: 1,
                mb: 0,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 400,
                  color: "white",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {isUserProfile && user.age 
                  ? `${user.name}, ${user.age}` 
                  : user.name || "Your Name"}
              </Typography>
              {onEditName && <EditIconButton onClick={onEditName} size="small" />}
            </Box>

            {/* Location and Action Buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", sm: "space-between" },
                flexDirection: { xs: "column", sm: "row" },
                flexWrap: "wrap",
                gap: { xs: 1, sm: 2 },
              }}
            >
              {/* Location */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "rgba(255, 255, 255, 0.9)",
                  mb: { xs: 0.5, sm: 0 },
                }}
              >
                <LocationIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.city && user.country
                    ? `${user.city}, ${user.country}`
                    : "Berlin, DE"}
                </Typography>
              </Box>

              {/* Action Buttons */}
              {actionButtons ? (
                actionButtons
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "white",
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      px: 2,
                      py: 0.5,
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "#6366f1",
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      px: 2,
                      py: 0.5,
                      minWidth: "auto",
                      "&:hover": { backgroundColor: "#5855eb" },
                    }}
                  >
                    Share
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>

    {/* Photo Carousel Modal */}
    <PhotoCarouselModal
      open={carouselOpen}
      photos={userPhotos}
      currentIndex={selectedPhotoIndex}
      onClose={handleCarouselClose}
    />
  </>
  );
};

export default ProfileHeader;
