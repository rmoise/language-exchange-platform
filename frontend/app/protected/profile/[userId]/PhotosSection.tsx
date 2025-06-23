"use client";

import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { PhotoGrid, PhotoCarouselModal } from "./PhotoCarousel";
import EditIconButton from "@/features/users/components/EditIconButton";
import ImageUploadModal from "@/features/upload/components/ImageUploadModal";
import MultipleImageUploadModal from "@/features/upload/components/MultipleImageUploadModal";
import { useGetCurrentUserQuery, useUpdateUserProfileMutation } from "@/features/api/apiSlice";
import { getAbsoluteImageUrl } from "@/utils/imageUrl";

interface PhotosSectionProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function PhotosSection({ userId, isOwnProfile = false }: PhotosSectionProps) {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Get current user data from RTK Query
  const { data: currentUser } = useGetCurrentUserQuery();
  const [updateProfile] = useUpdateUserProfileMutation();
  
  // Initialize photos from user data or empty array
  const [photos, setPhotos] = useState<string[]>([]);

  // Load photos from user data
  useEffect(() => {
    const fetchUserPhotos = async () => {
      try {
        if (isOwnProfile && currentUser) {
          // For own profile, use cached current user data
          const userPhotos = (currentUser as any).photos || [];
          console.log('Own profile photos:', userPhotos);
          setPhotos(userPhotos.map((photo: string) => getAbsoluteImageUrl(photo) || photo));
        } else {
          // For other profiles, fetch user data
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
          
          if (token) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('API response for user:', data);
              const user = data.data || data.user;
              const userPhotos = user?.photos || [];
              console.log('Other profile photos:', userPhotos);
              setPhotos(userPhotos.map((photo: string) => getAbsoluteImageUrl(photo) || photo));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user photos:', error);
      }
    };

    fetchUserPhotos();
  }, [currentUser, isOwnProfile, userId]);

  const handlePhotoClick = (index: number) => {
    if (!editMode) {
      setSelectedPhotoIndex(index);
      setCarouselOpen(true);
    }
  };

  const handleCarouselClose = () => {
    setCarouselOpen(false);
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      const newPhotos = [...photos, getAbsoluteImageUrl(imageUrl) || imageUrl];
      setPhotos(newPhotos);
      
      // Update user profile with new photos array
      await updateProfile({
        photos: newPhotos.map(photo => {
          // Convert back to relative URLs for storage
          const url = new URL(photo);
          return url.pathname;
        })
      });
      
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Failed to add photo:', error);
    }
  };

  const handleMultipleImagesUpload = async (imageUrls: string[]) => {
    try {
      const newPhotos = [...photos, ...imageUrls.map(url => getAbsoluteImageUrl(url) || url)];
      
      // Limit to 6 photos
      const limitedPhotos = newPhotos.slice(0, 6);
      setPhotos(limitedPhotos);
      
      // Update user profile with new photos array
      await updateProfile({
        photos: limitedPhotos.map(photo => {
          // Convert back to relative URLs for storage
          try {
            const url = new URL(photo);
            return url.pathname;
          } catch {
            return photo; // Return as-is if not a valid URL
          }
        })
      });
      
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Failed to add photos:', error);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    try {
      const newPhotos = photos.filter((_, i) => i !== index);
      setPhotos(newPhotos);
      
      // Update user profile with new photos array
      await updateProfile({
        photos: newPhotos.map(photo => {
          // Convert back to relative URLs for storage
          const url = new URL(photo);
          return url.pathname;
        })
      });
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const handleAddPhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setUploadModalOpen(true);
  };

  // Don't render the section if there are no photos and it's not the user's own profile
  if (!isOwnProfile && photos.length === 0) {
    return null;
  }

  // Calculate dynamic padding based on content
  const dynamicPadding = photos.length === 0 ? 2 : 3;

  return (
    <Box
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(10px)",
        border: "1px solid #374151",
        borderRadius: 1.5,
        p: 3,
        pb: dynamicPadding,
        color: "white",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 500, color: "white" }}>
          Photos
        </Typography>
        {isOwnProfile && (
          <EditIconButton 
            onClick={() => {
              if (editMode) {
                setEditMode(false);
              } else {
                setUploadModalOpen(true);
              }
            }} 
            sx={{ 
              backgroundColor: editMode ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: editMode ? '#6366f1' : 'inherit'
            }}
          />
        )}
      </Box>

      <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            width: "100%",
            // Only show as many rows as needed
            gridAutoRows: photos.length > 0 || isOwnProfile ? "1fr" : 0,
          }}
        >
          {/* Show existing photos */}
          {photos.map((photo, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              borderRadius: 1,
              overflow: "hidden",
              cursor: editMode ? "default" : "pointer",
              aspectRatio: "1/1",
              width: "100%",
              minHeight: 0,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => handlePhotoClick(index)}
          >
            <Box
              component="img"
              src={photo}
              alt={`Photo ${index + 1}`}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            />
          </Box>
        ))}
        
        {/* Show empty placeholders for remaining slots on user's own profile */}
        {isOwnProfile && photos.length < 6 && Array.from({ length: 6 - photos.length }).map((_, index) => (
          <Box
            key={`empty-${index}`}
            onClick={() => handleAddPhotoClick(photos.length + index)}
            sx={{
              position: "relative",
              aspectRatio: "1/1",
              width: "100%",
              minHeight: 0,
              border: "2px dashed rgba(255, 255, 255, 0.4)",
              borderRadius: 1,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              },
            }}
          >
            <AddIcon
              sx={{
                fontSize: 24,
                color: "rgba(255, 255, 255, 0.5)",
                mb: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.7rem",
                textAlign: "center",
              }}
            >
              Add Photo
            </Typography>
          </Box>
        ))}
      </Box>

      <PhotoCarouselModal
        photos={photos}
        currentIndex={selectedPhotoIndex}
        open={carouselOpen}
        onClose={handleCarouselClose}
        canDelete={isOwnProfile}
        onDelete={async (photoUrl) => {
          const index = photos.findIndex(p => p === photoUrl);
          if (index !== -1) {
            await handleDeletePhoto(index);
          }
        }}
        buttonPosition={{ top: -8, right: 8 }} // Regular photos: buttons moved up a bit
      />

      {/* Multiple Image Upload Modal */}
      {isOwnProfile && (
        <MultipleImageUploadModal
          open={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setEditMode(false);
          }}
          onImagesUpdate={handleMultipleImagesUpload}
          maxFiles={6}
          title="Manage Photos"
          existingPhotos={photos}
          onDeletePhoto={async (photoUrl) => {
            const index = photos.findIndex(p => p === photoUrl);
            if (index !== -1) {
              await handleDeletePhoto(index);
            }
          }}
        />
      )}
    </Box>
  );
}
