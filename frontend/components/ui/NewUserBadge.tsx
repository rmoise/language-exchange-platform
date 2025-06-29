"use client";

import React from "react";
import { Box } from "@mui/material";

interface NewUserBadgeProps {
  variant?: "default" | "compact";
  position?: "absolute" | "relative";
  darkMode?: boolean;
}

export const NewUserBadge: React.FC<NewUserBadgeProps> = ({ 
  variant = "default",
  position = "absolute",
  darkMode = true
}) => {
  if (variant === "compact") {
    return (
      <Box
        sx={{
          position,
          top: position === "absolute" ? 12 : undefined,
          right: position === "absolute" ? 12 : undefined,
          display: "inline-flex",
          alignItems: "center",
          backgroundColor: "#10b981",
          color: "white",
          px: 1,
          py: 0.25,
          borderRadius: "14px",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          zIndex: 2,
        }}
      >
        NEW
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position,
        top: position === "absolute" ? 12 : undefined,
        right: position === "absolute" ? 12 : undefined,
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "#10b981",
        color: "white",
        px: 1.5,
        py: 0.5,
        borderRadius: "14px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        zIndex: 2,
      }}
    >
      NEW
    </Box>
  );
};