"use client";

import React from "react";
import { Box } from "@mui/material";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";

interface ThemeBoxProps {
  children: React.ReactNode;
  sx?: any;
}

export function ThemeBox({ children, sx }: ThemeBoxProps) {
  const { mode } = useCustomTheme();
  
  // If sx is a function, call it with the mode
  const computedSx = typeof sx === 'function' ? sx(mode) : sx;
  
  // Process sx object to handle functions
  const processedSx = computedSx ? Object.entries(computedSx).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      acc[key] = value(mode);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as any) : {};
  
  return (
    <Box sx={processedSx}>
      {children}
    </Box>
  );
}