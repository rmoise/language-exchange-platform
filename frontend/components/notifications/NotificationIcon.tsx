"use client";

import { useState, useTransition, useEffect } from "react";
import { IconButton, Badge } from "@mui/material";
import { NotificationsOutlined as NotificationsIcon } from "@mui/icons-material";
import NotificationPopover from "./NotificationPopover";
import type { Notification } from "@/app/actions/notifications";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useAppSelector } from "@/lib/hooks";

interface NotificationIconProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export default function NotificationIcon({
  initialNotifications,
  initialUnreadCount,
}: NotificationIconProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [messageNotifications, setMessageNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();
  const { lastMessage, subscribe } = useWebSocketContext();
  const currentUser = useAppSelector((state) => state.auth.user);
  
  // Update total unread count when message notifications change
  useEffect(() => {
    const totalUnread = notifications.filter(n => !n.read).length + messageNotifications.length;
    setUnreadCount(totalUnread);
  }, [notifications, messageNotifications]);

  const open = Boolean(anchorEl);


  const updateNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
  };

  // Listen for new messages via WebSocket
  useEffect(() => {
    console.log('NotificationIcon - Setting up WebSocket listener, currentUser:', currentUser);
    if (!currentUser) return;

    const unsubscribe = subscribe('new_message', (messageData) => {
      console.log('NotificationIcon - Received new_message:', messageData);
      // Only create notification for messages from other users
      if (messageData.sender_id !== currentUser.id) {
        const newNotification: Notification = {
          id: `msg-${messageData.id}`,
          type: 'message',
          title: 'New Message',
          message: `${messageData.sender?.name || 'Someone'} sent you a message`,
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: `/app/conversations/${messageData.conversation_id}`,
          metadata: {
            messageId: messageData.id,
            conversationId: messageData.conversation_id,
            senderId: messageData.sender_id,
            senderName: messageData.sender?.name
          }
        };

        setMessageNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === newNotification.id);
          if (exists) {
            return prev;
          }
          return [newNotification, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser, subscribe]);

  // Handle popover open
  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle popover close
  const handlePopoverClose = () => {
    setAnchorEl(null);
    // Clear message notifications when closing popover (after user has seen them)
    if (messageNotifications.length > 0) {
      setMessageNotifications([]);
    }
  };

  return (
    <>
      <IconButton
        onClick={handlePopoverOpen}
        sx={{
          position: "relative",
          color: "#9ca3af",
          "&:hover": {
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            color: "#6366f1",
          },
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.625rem",
              height: 16,
              minWidth: 16,
              backgroundColor: "#ef4444",
            },
          }}
        >
          <NotificationsIcon sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>
      
      <NotificationPopover
        anchorEl={anchorEl}
        open={open}
        onClose={handlePopoverClose}
        notifications={[...messageNotifications, ...notifications]}
        onNotificationsUpdate={updateNotifications}
        isPending={isPending}
        startTransition={startTransition}
      />
    </>
  );
}