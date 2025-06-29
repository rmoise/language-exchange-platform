"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { useColorScheme } from '@mui/material/styles';

export function LearningPrompt() {
  const { mode } = useColorScheme();
  
  return (
    <Box
      sx={{
        backgroundColor: mode === "dark" ? "rgba(30, 30, 30, 0.5)" : "white",
        border: "1px solid",
        borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
        borderRadius: "12px",
        p: 2.5,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px", mb: 2 }}>
        📚 Your Learning
      </Typography>
      <Typography variant="body2" sx={{ color: mode === "dark" ? "#9ca3af" : "#6b7280" }}>
        Sign in to track your learning progress
      </Typography>
    </Box>
  );
}