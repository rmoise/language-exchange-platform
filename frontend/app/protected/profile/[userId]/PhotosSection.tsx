"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { PhotoGrid, PhotoCarouselModal } from "./PhotoCarousel";
import EditIconButton from "@/features/users/components/EditIconButton";

interface PhotosSectionProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function PhotosSection({ userId, isOwnProfile = false }: PhotosSectionProps) {
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Static photos for each user - higher resolution for carousel
  // Set to empty array to test empty state, or use the photos below for populated state
  const photos = [1, 2, 3, 4, 5, 6].map((photo) => `https://picsum.photos/1200/800?image=${photo}`)

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setCarouselOpen(true);
  };

  const handleCarouselClose = () => {
    setCarouselOpen(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(10px)",
        border: "1px solid #374151",
        borderRadius: 1.5,
        p: 3,
        color: "white",
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
        {isOwnProfile && <EditIconButton />}
      </Box>

      {photos.length > 0 ? (
        <PhotoGrid photos={photos} onPhotoClick={handlePhotoClick} />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                aspectRatio: "1",
                border: "2px dashed rgba(255, 255, 255, 0.4)",
                borderRadius: 1,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
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
      )}

      <PhotoCarouselModal
        photos={photos}
        currentIndex={selectedPhotoIndex}
        open={carouselOpen}
        onClose={handleCarouselClose}
      />
    </Box>
  );
}
