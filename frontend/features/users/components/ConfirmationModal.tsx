"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
} from "@mui/material";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  confirmColor?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
  showAvatar?: boolean;
  avatarSrc?: string;
  avatarName?: string;
  severity?: "warning" | "error" | "info";
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  confirmColor = "error",
  showAvatar = false,
  avatarSrc,
  avatarName,
  severity = "warning",
}: ConfirmationModalProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getConfirmButtonStyles = () => {
    switch (confirmColor) {
      case "error":
        return {
          backgroundColor: "#ef4444",
          "&:hover": { backgroundColor: "#dc2626" },
        };
      case "warning":
        return {
          backgroundColor: "#f59e0b",
          "&:hover": { backgroundColor: "#d97706" },
        };
      case "primary":
        return {
          backgroundColor: "#6366f1",
          "&:hover": { backgroundColor: "#00acc1" },
        };
      default:
        return {
          backgroundColor: "#ef4444",
          "&:hover": { backgroundColor: "#dc2626" },
        };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          minWidth: 400,
          maxWidth: 500,
        },
      }}
    >
      <DialogTitle sx={{ color: "white", fontWeight: 600, pb: 2 }}>
        {title}
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {showAvatar && avatarName && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar
              src={avatarSrc}
              sx={{
                width: 50,
                height: 50,
                border: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {getInitials(avatarName)}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "white", fontWeight: 600, fontSize: "1.1rem" }}
              >
                {avatarName}
              </Typography>
            </Box>
          </Box>
        )}

        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            whiteSpace: "pre-line", // Allows line breaks in description
          }}
        >
          {description}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.8)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          p: 3,
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.5)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
            textTransform: "none",
            px: 4,
            py: 1,
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            color: "white",
            textTransform: "none",
            px: 4,
            py: 1,
            ...getConfirmButtonStyles(),
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
