'use client';

import { useEffect } from 'react';
import { Button } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-6">An error occurred while loading this page.</p>
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
        Try again
      </Button>
    </div>
  );
}