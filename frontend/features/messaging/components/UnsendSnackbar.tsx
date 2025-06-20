'use client';

import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  LinearProgress,
  Box,
  Typography
} from '@mui/material';
import { Undo as UnsendIcon } from '@mui/icons-material';

interface UnsendSnackbarProps {
  messageId: string | null;
  isVisible: boolean;
  timeRemainingMs: number;
  totalTimeMs: number;
  onUnsend: () => void;
  onClose: () => void;
  isPending?: boolean;
}

export const UnsendSnackbar: React.FC<UnsendSnackbarProps> = ({
  messageId,
  isVisible,
  timeRemainingMs,
  totalTimeMs,
  onUnsend,
  onClose,
  isPending = false
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible && timeRemainingMs > 0) {
      const progressPercent = (timeRemainingMs / totalTimeMs) * 100;
      setProgress(progressPercent);
    }
  }, [timeRemainingMs, totalTimeMs, isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
    }
  }, [isVisible]);

  if (!messageId) return null;

  const secondsRemaining = Math.ceil(timeRemainingMs / 1000);

  return (
    <Snackbar
      open={isVisible}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={onClose}
      sx={{ 
        mb: 2,
        '& .MuiSnackbarContent-root': {
          padding: 0
        }
      }}
    >
      <Alert
        severity="info"
        sx={{ 
          width: '100%',
          alignItems: 'flex-start',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={onUnsend}
            disabled={isPending}
            startIcon={<UnsendIcon />}
            sx={{ 
              minWidth: 'auto',
              ml: 1,
              fontWeight: 'medium'
            }}
          >
            Unsend
          </Button>
        }
      >
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Message sent • {secondsRemaining}s to unsend
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 3,
              borderRadius: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                backgroundColor: 'currentColor'
              }
            }}
          />
        </Box>
      </Alert>
    </Snackbar>
  );
};