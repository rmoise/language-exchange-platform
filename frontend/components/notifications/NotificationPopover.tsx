"use client";

import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Button,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FavoriteBorder as MatchRequestIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "@/app/actions/notifications";

interface NotificationPopoverProps {
  anchorEl: HTMLButtonElement | null;
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationsUpdate: (notifications: Notification[]) => void;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <SuccessIcon sx={{ color: '#10b981' }} />;
    case 'warning':
      return <WarningIcon sx={{ color: '#f59e0b' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: '#ef4444' }} />;
    case 'match_request':
      return <MatchRequestIcon sx={{ color: '#a855f7' }} />;
    default:
      return <InfoIcon sx={{ color: '#3b82f6' }} />;
  }
};

export default function NotificationPopover({
  anchorEl,
  open,
  onClose,
  notifications,
  onNotificationsUpdate,
  isPending,
  startTransition,
}: NotificationPopoverProps) {
  const router = useRouter();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      startTransition(async () => {
        const result = await markNotificationAsRead(notification.id);
        if (result.success) {
          const updatedNotifications = notifications.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          );
          onNotificationsUpdate(updatedNotifications);
        }
      });
    }
    
    // Navigate based on notification type
    if (notification.type === 'match_request') {
      // Navigate to matches page with incoming requests tab selected
      // The tab=1 parameter will select the "Incoming Requests" tab
      router.push('/app/matches?tab=1');
      onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        onNotificationsUpdate(updatedNotifications);
      }
    });
  };

  const handleRemoveNotification = (notificationId: string) => {
    startTransition(async () => {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        onNotificationsUpdate(updatedNotifications);
      }
    });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 380,
          maxHeight: 480,
          backgroundColor: 'rgba(17, 17, 17, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #374151',
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #374151',
        }}
      >
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'white' }}>
          Notifications
        </Typography>
        {notifications.length > 0 && (
          <Button
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={isPending}
            sx={{
              color: '#9ca3af',
              textTransform: 'none',
              fontSize: '0.75rem',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
              },
            }}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      <List
        sx={{
          p: 0,
          maxHeight: 380,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#374151',
            borderRadius: '3px',
          },
        }}
      >
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              color: '#6b7280',
            }}
          >
            <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography sx={{ fontSize: '0.875rem' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.map((notification, index) => (
            <Box key={notification.id}>
              <ListItem
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  backgroundColor: !notification.read
                    ? 'rgba(99, 102, 241, 0.05)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  pr: 5,
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: notification.read ? 400 : 500,
                        color: notification.read ? '#e5e7eb' : 'white',
                        mb: 0.5,
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.6875rem',
                          color: '#6b7280',
                        }}
                      >
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </>
                  }
                />
                {!notification.read && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#6366f1',
                    }}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveNotification(notification.id);
                  }}
                  disabled={isPending}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: '#6b7280',
                    '&:hover': {
                      color: '#9ca3af',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </ListItem>
              {index < notifications.length - 1 && (
                <Divider sx={{ borderColor: '#374151' }} />
              )}
            </Box>
          ))
        )}
      </List>
    </Popover>
  );
}