"use client";

import { useState } from "react";
import { Box, Typography, Avatar, Button, Badge, IconButton } from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  LocationOn as LocationIcon,
  CameraAlt,
} from "@mui/icons-material";
import EditIconButton from "@/features/users/components/EditIconButton";
import { PhotoCarouselModal } from "./[userId]/PhotoCarousel";
import { getAbsoluteImageUrl } from '@/utils/imageUrl';
import SimpleImageUpload from "./SimpleImageUpload";
import UserAvatar from "@/components/ui/UserAvatar";

interface ProfileHeaderProps {
  user: {
    name?: string;
    avatar?: string;
    profileImage?: string;
    profile_image?: string;
    city?: string;
    country?: string;
    coverImage?: string;
    coverPhoto?: string;
    age?: number;
    isOnline?: boolean;
  };
  onEditName?: () => void;
  onEditAvatar?: (imageUrl: string) => void;
  onEditCover?: (imageUrl: string) => void;
  actionButtons?: React.ReactNode;
  isUserProfile?: boolean;
  onPreviewToggle?: () => void;
  isPreviewMode?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditName,
  onEditAvatar,
  onEditCover,
  actionButtons,
  isUserProfile = false,
  onPreviewToggle,
  isPreviewMode = false,
}) => {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [carouselPhotos, setCarouselPhotos] = useState<string[]>([]);
  const [photoType, setPhotoType] = useState<'profile' | 'cover'>('profile');

  // User profile photo - check multiple possible field names (same as onboarding)
  const currentProfileImage = user.profileImage || (user as any).avatar || (user as any).profile_image || undefined;
  const displayImage = getAbsoluteImageUrl(currentProfileImage);
  
  // User cover photo
  const currentCoverPhoto = user.coverPhoto || user.coverImage;
  const displayCoverPhoto = getAbsoluteImageUrl(currentCoverPhoto);

  const handleAvatarClick = () => {
    // Only open carousel if user has an avatar image
    if (displayImage) {
      setCarouselPhotos([displayImage]);
      setSelectedPhotoIndex(0);
      setPhotoType('profile');
      setCarouselOpen(true);
    }
  };

  const handleCoverClick = () => {
    // Only open carousel if user has a cover photo
    if (displayCoverPhoto) {
      setCarouselPhotos([displayCoverPhoto]);
      setSelectedPhotoIndex(0);
      setPhotoType('cover');
      setCarouselOpen(true);
    }
  };

  const handleCarouselClose = () => {
    setCarouselOpen(false);
  };

  const handlePhotoDelete = (photoUrl: string) => {
    if (photoType === 'profile' && onEditAvatar) {
      // Call with empty string to remove profile image
      onEditAvatar('');
    } else if (photoType === 'cover' && onEditCover) {
      // Call with empty string to remove cover image
      onEditCover('');
    }
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
      {/* Cover Image Section - Container */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "180px", sm: "200px" },
          overflow: "hidden",
        }}
      >
        {/* Scaling Image Box */}
        <Box
          onClick={displayCoverPhoto ? handleCoverClick : undefined}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: displayCoverPhoto 
              ? `url(${displayCoverPhoto})`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            cursor: displayCoverPhoto ? "pointer" : "default",
            transition: "all 0.2s ease",
            "&:hover": displayCoverPhoto ? {
              transform: "scale(1.05)",
              filter: "brightness(1.1)",
            } : {},
          }}
        >
          {/* Geometric Pattern Overlay - only show if no cover photo */}
          {!displayCoverPhoto && (
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
          )}

          {/* Dark overlay for better text readability */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: displayCoverPhoto 
                ? "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)"
                : "none",
              zIndex: 1,
            }}
          />
        </Box>

        {/* Cover Image Upload Button - Outside scaling box */}
        {onEditCover && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 3,
              pointerEvents: "none", // Disable pointer events on container
            }}
          >
            <Box sx={{ pointerEvents: "auto", position: "absolute", top: 16, right: 16 }}>
              <SimpleImageUpload
                currentImage={displayCoverPhoto || undefined}
                userName={user.name || 'User'}
                isProfilePicture={false}
                onImageUpdate={onEditCover}
                isOwnProfile={isUserProfile}
              />
            </Box>
          </Box>
        )}
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
            {onEditAvatar ? (
              // Editable avatar using SimpleImageUpload component
              <SimpleImageUpload
                currentImage={displayImage || undefined}
                userName={user.name || 'User'}
                size={{ xs: 100, sm: 120 }}
                isProfilePicture={true}
                onImageUpdate={onEditAvatar}
                onImageClick={handleAvatarClick}
                isOwnProfile={isUserProfile}
              />
            ) : (
              // Non-editable avatar (for viewing other profiles) - using UserAvatar for consistency
              <UserAvatar
                user={{ ...user, profileImage: displayImage || undefined } as any}
                size={{ xs: 100, sm: 120 }}
                onClick={handleAvatarClick}
                showOnlineStatus={false}
                showBorderForNonImage={true}
              />
            )}
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
                  border: "2px solid white",
                  zIndex: 1,
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
                {user.age 
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
                  {onPreviewToggle && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={onPreviewToggle}
                      sx={{
                        backgroundColor: isPreviewMode 
                          ? "#6366f1" 
                          : "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: isPreviewMode 
                          ? "1px solid #6366f1" 
                          : "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        px: 2,
                        py: 0.5,
                        minWidth: "auto",
                        "&:hover": {
                          backgroundColor: isPreviewMode 
                            ? "#5855eb" 
                            : "rgba(255, 255, 255, 0.3)",
                        },
                      }}
                    >
                      {isPreviewMode ? "Exit Preview" : "Preview"}
                    </Button>
                  )}
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
      photos={carouselPhotos}
      currentIndex={selectedPhotoIndex}
      onClose={handleCarouselClose}
      canDelete={isUserProfile} // Only allow delete on own profile
      onDelete={isUserProfile ? handlePhotoDelete : undefined}
      buttonPosition={
        photoType === 'profile' 
          ? { top: 8, right: -60 }  // Profile photos: buttons moved even further right
          : { top: 8, left: 'calc(100% + 20px)' }  // Cover photos: buttons moved a bit to the right
      }
    />
  </>
  );
};

export default ProfileHeader;
