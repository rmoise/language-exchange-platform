"use client";

import React from 'react';
import { Box, Stack, Skeleton } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

export const AskMembersQuestionSkeleton: React.FC = () => {
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? "rgba(30, 30, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        border: "0.5px solid",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: darkMode
          ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" width="100%" height={1} sx={{ my: 1.5 }} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        </Stack>
      </Box>

      {/* Divider */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={1} />
      </Box>
      
      {/* Footer with actions */}
      <Box sx={{ p: 2, bgcolor: "transparent" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            {/* Category selector skeleton */}
            <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: "8px" }} />
            
            {/* Divider */}
            <Box sx={{ width: 1, height: 24, mx: 1 }}>
              <Skeleton variant="rectangular" width={1} height="100%" />
            </Box>
            
            {/* Media buttons skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="circular" width={32} height={32} />
            ))}
          </Stack>
          
          {/* Post button skeleton */}
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: "8px" }} />
        </Stack>
      </Box>
    </Box>
  );
};