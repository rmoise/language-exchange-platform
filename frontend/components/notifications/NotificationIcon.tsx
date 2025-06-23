"use client";

import { useState, useTransition } from "react";
import { IconButton, Badge } from "@mui/material";
import { NotificationsOutlined as NotificationsIcon } from "@mui/icons-material";
import NotificationPopover from "./NotificationPopover";
import type { Notification } from "@/app/actions/notifications";

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
  const [isPending, startTransition] = useTransition();

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    const newUnreadCount = newNotifications.filter(n => !n.read).length;
    setUnreadCount(newUnreadCount);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
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
        onClose={handleClose}
        notifications={notifications}
        onNotificationsUpdate={updateNotifications}
        isPending={isPending}
        startTransition={startTransition}
      />
    </>
  );
}