import React from "react";
import { Card, CardContent, Typography, Stack, Button, Box } from "@mui/material";
import { Tag as TagIcon } from "@mui/icons-material";

interface TrendingTopic {
  name: string;
  color: string;
}

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  darkMode?: boolean;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({ topics, darkMode = false }) => {
  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "#FFFFFF",
        backdropFilter: darkMode ? "blur(10px)" : "none",
        boxShadow: "none",
        border: `1px solid ${darkMode ? "#374151" : "#dbdbdb"}`,
        borderRadius: "16px",
        transition: "all 0.3s ease",
        "&:hover": darkMode ? {
          borderColor: "#6366f1",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Inter",
            fontWeight: 400,
            color: darkMode ? "white" : "#141417",
            fontSize: "19.8px",
            letterSpacing: "-0.04px",
            lineHeight: "32px",
            mb: 2,
          }}
        >
          Trending topics
        </Typography>

        <Stack spacing={2}>
          {topics.map((topic, index) => (
            <Button
              key={index}
              variant="text"
              sx={{
                height: 72,
                bgcolor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#faf9f8",
                borderRadius: 3,
                p: 1.5,
                justifyContent: "flex-start",
                textTransform: "none",
                "&:hover": {
                  bgcolor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: topic.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                }}
              >
                <TagIcon sx={{ color: darkMode ? "#9ca3af" : "#666", fontSize: 20 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  color: darkMode ? "white" : "#141417",
                  fontSize: "16px",
                  letterSpacing: "-0.08px",
                  lineHeight: "26px",
                }}
              >
                {topic.name}
              </Typography>
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};