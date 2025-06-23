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
        backgroundColor: darkMode ? "#1A1A1A" : "#FFFFFF",
        boxShadow: "none",
        border: `1px solid ${darkMode ? "#2A2A2A" : "#dbdbdb"}`,
        borderRadius: "16px",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Inter",
            fontWeight: 400,
            color: "#141417",
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
                bgcolor: "#faf9f8",
                borderRadius: 3,
                p: 1.5,
                justifyContent: "flex-start",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.04)",
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
                <TagIcon sx={{ color: "#666", fontSize: 20 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  color: "#141417",
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