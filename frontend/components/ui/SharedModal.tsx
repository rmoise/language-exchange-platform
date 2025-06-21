"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  DialogProps,
  SxProps,
  Theme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface SharedModalProps extends Omit<DialogProps, 'title'> {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  titleSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  showCloseButton?: boolean;
}

const SharedModal: React.FC<SharedModalProps> = ({
  title,
  onClose,
  children,
  actions,
  maxWidth = "sm",
  titleSx,
  contentSx,
  actionsSx,
  showCloseButton = true,
  ...dialogProps
}) => {
  return (
    <Dialog
      {...dialogProps}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          border: "1px solid #374151",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          maxHeight: "85vh",
          ...dialogProps.PaperProps?.sx,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "white",
          borderBottom: "1px solid #374151",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 600,
          py: 2,
          px: 2.5,
          fontSize: "1.1rem",
          ...titleSx,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          px: 2.5,
          py: 0,
          "&.MuiDialogContent-root": {
            paddingTop: "16px !important",
            paddingBottom: "16px !important",
          },
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderTop: "1px solid #374151",
            p: 1.5,
            gap: 1,
            ...actionsSx,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default SharedModal;