'use client';

import { useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 3,
      }}
    >
      <ErrorOutline sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Oops! Something went wrong
      </Typography>
      <Typography sx={{ mb: 4, color: '#6b7280', textAlign: 'center', maxWidth: 400 }}>
        We encountered an error while loading this page. Please try again.
      </Typography>
      <Button
        onClick={reset}
        variant="contained"
        sx={{
          backgroundColor: '#6366f1',
          '&:hover': {
            backgroundColor: '#5558e3',
          },
        }}
      >
        Try Again
      </Button>
    </Box>
  );
}