import React from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { Verified } from "@mui/icons-material";

interface ProBadgeProps {
  variant?: "icon" | "text" | "compact";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  sx?: SxProps<Theme>;
}

const variantStyles = {
  icon: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "auto",
    p: 0,
  },
  compact: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "auto",
    p: 0,
  },
  text: {
    px: 1.5,
    py: 0.5,
    fontSize: "11px",
    borderRadius: "14px",
  },
};

const positionStyles = {
  "top-left": {
    top: 8,
    left: 8,
  },
  "top-right": {
    top: 8,
    right: 8,
  },
  "bottom-left": {
    bottom: 8,
    left: 8,
  },
  "bottom-right": {
    bottom: 8,
    right: 8,
  },
};

export const ProBadge: React.FC<ProBadgeProps> = ({
  variant = "compact",
  position = "top-left",
  sx = {},
}) => {
  const renderContent = () => {
    const iconColor = "#6366f1"; // Indigo color for the verified icon
    
    switch (variant) {
      case "icon":
        return <Verified sx={{ fontSize: 16, color: iconColor }} />;
      case "compact":
        return <Verified sx={{ fontSize: 16, color: iconColor }} />;
      case "text":
        return "PRO";
      default:
        return <Verified sx={{ fontSize: 16, color: iconColor }} />;
    }
  };

  const isIconOnly = variant === "icon" || variant === "compact";

  return (
    <Box
      sx={{
        position: "absolute",
        ...positionStyles[position],
        ...(isIconOnly ? {
          // No background for icon-only variants
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
        } : {
          // Background styling for text variants
          backgroundColor: "#6366f1",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }),
        color: "white",
        ...variantStyles[variant],
        fontWeight: 700,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        zIndex: 10,
        ...sx,
      }}
    >
      {renderContent()}
    </Box>
  );
};