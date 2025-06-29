'use client';

import { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertTitle, Box, IconButton } from '@mui/material';
import { Close as CloseIcon, Message as MessageIcon } from '@mui/icons-material';
import { useNotifications, useNotificationActions } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

export const ToastNotificationManager = () => {
  const { notifications } = useNotifications();
  const { markAsRead, removeNotification } = useNotificationActions();
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Show the most recent unread notification
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0 && !currentNotification) {
      const latest = unreadNotifications[0];
      setCurrentNotification(latest);
      setIsOpen(true);
    }
  }, [notifications, currentNotification]);

  const handleClose = () => {
    setIsOpen(false);
    if (currentNotification) {
      markAsRead(currentNotification.id);
      setCurrentNotification(null);
    }
  };

  const handleClick = () => {
    if (currentNotification?.data?.conversationId) {
      router.push(`/app/conversations?id=${currentNotification.data.conversationId}`);
      handleClose();
    }
  };

  const handleExited = () => {
    // Show next notification after current one is closed
    setTimeout(() => {
      const unreadNotifications = notifications.filter(n => !n.read && n.id !== currentNotification?.id);
      if (unreadNotifications.length > 0) {
        const next = unreadNotifications[0];
        setCurrentNotification(next);
        setIsOpen(true);
      }
    }, 500);
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          padding: 0,
        },
      }}
    >
      <Alert
        severity="info"
        variant="filled"
        onClick={currentNotification.data?.conversationId ? handleClick : undefined}
        sx={{
          cursor: currentNotification.data?.conversationId ? 'pointer' : 'default',
          maxWidth: 400,
          '&:hover': currentNotification.data?.conversationId ? {
            backgroundColor: 'primary.dark',
          } : {},
        }}
        icon={<MessageIcon />}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {currentNotification.title}
        </AlertTitle>
        <Box sx={{ fontSize: '0.8rem', opacity: 0.9 }}>
          {currentNotification.message}
        </Box>
      </Alert>
    </Snackbar>
  );
};