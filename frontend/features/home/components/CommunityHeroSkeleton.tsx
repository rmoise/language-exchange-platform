"use client";

import React from 'react';
import { Box, Stack, Skeleton } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

export const CommunityHeroSkeleton: React.FC = () => {
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';

  return (
    <Box
      sx={{
        mb: 4,
        p: { xs: 3, sm: 4, md: 5 },
        background: darkMode
          ? "linear-gradient(135deg, rgba(17, 17, 17, 0.9) 0%, rgba(30, 30, 30, 0.7) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
        position: "relative",
        overflow: "hidden",
        boxShadow: darkMode
          ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Community Header Skeleton */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: "12px" }} />
          <Stack spacing={0.5}>
            <Skeleton variant="text" width={250} height={32} />
            <Skeleton variant="text" width={180} height={20} />
          </Stack>
        </Stack>
        <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: "12px" }} />
      </Stack>

      {/* User Progress Section Skeleton */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
        {/* Avatar Skeleton */}
        <Skeleton variant="circular" width={{ xs: 80, sm: 100 }} height={{ xs: 80, sm: 100 }} />

        {/* Progress and Stats Skeleton */}
        <Box sx={{ flex: 1, width: '100%' }}>
          {/* Name and Title */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: "16px" }} />
          </Stack>

          {/* XP Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Skeleton variant="text" width={120} height={16} />
              <Skeleton variant="text" width={80} height={16} />
            </Stack>
            <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4 }} />
          </Box>

          {/* Quick Stats */}
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} flexWrap="wrap">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={90}
                height={60}
                sx={{ borderRadius: '8px' }}
              />
            ))}
          </Stack>
        </Box>

        {/* Rank Badge Skeleton */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Skeleton variant="rectangular" width={80} height={100} sx={{ borderRadius: '12px' }} />
        </Box>
      </Stack>

      {/* Weekly/Monthly XP Trend Skeleton */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mt: 2,
          pt: 2,
          borderTop: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
        }}
      >
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="text" width={150} height={20} />
      </Stack>
    </Box>
  );
};