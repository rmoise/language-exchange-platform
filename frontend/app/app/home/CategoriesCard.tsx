"use client";

import React from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { useColorScheme } from '@mui/material/styles';

interface CategoriesCardProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoriesCard({ selectedCategory, onCategorySelect }: CategoriesCardProps) {
  const { mode } = useColorScheme();
  
  const categoryMap = [
    { name: "General Discussion", value: "general", count: 234, color: "#6366f1", icon: "💡" },
    { name: "Grammar Help", value: "grammar", count: 156, color: "#2563eb", icon: "📝" },
    { name: "Vocabulary", value: "vocabulary", count: 89, color: "#16a34a", icon: "📚" },
    { name: "Pronunciation", value: "pronunciation", count: 67, color: "#9333ea", icon: "🗣️" },
    { name: "Conversation", value: "conversation", count: 83, color: "#f59e0b", icon: "💬" },
    { name: "Writing", value: "writing", count: 45, color: "#ec4899", icon: "✍️" },
  ];
  
  return (
    <Box
      sx={{
        mb: 3,
        backgroundColor: mode === "dark" ? "rgba(30, 30, 30, 0.5)" : "white",
        border: "1px solid",
        borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
        borderRadius: "12px",
        p: 2.5,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 400 }}>
          Categories
        </Typography>
        {selectedCategory && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: mode === "dark" ? "#60a5fa" : "#2563eb",
              cursor: "pointer",
              fontSize: "13px",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
            onClick={() => onCategorySelect(null)}
          >
            Clear filter
          </Typography>
        )}
      </Stack>
      <Stack spacing={1}>
        {categoryMap.map((category, index) => {
          const isSelected = selectedCategory === category.value;
          return (
          <Box
            key={index}
            onClick={() => onCategorySelect(isSelected ? null : category.value)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: isSelected 
                ? (mode === "dark" ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.08)")
                : "transparent",
              border: "1px solid",
              borderColor: isSelected 
                ? (mode === "dark" ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)")
                : "transparent",
              "&:hover": {
                backgroundColor: isSelected
                  ? (mode === "dark" ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.12)")
                  : (mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"),
                transform: "translateX(4px)",
              },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography sx={{ fontSize: "18px" }}>{category.icon}</Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: mode === "dark" ? "white" : "#1a1a1a",
                }}
              >
                {category.name}
              </Typography>
            </Stack>
            <Chip 
              label={category.count} 
              size="small"
              sx={{
                backgroundColor: `${category.color}15`,
                color: category.color,
                fontSize: "12px",
                height: "24px",
                fontWeight: 600,
              }}
            />
          </Box>
        );
        })}
      </Stack>
    </Box>
  );
}