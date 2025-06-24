import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";

interface Rule {
  id: number;
  title: string;
  description: string;
}

interface RulesSectionProps {
  rules: Rule[];
  darkMode?: boolean;
}

export const RulesSection: React.FC<RulesSectionProps> = ({ rules, darkMode = false }) => {
  return (
    <Card
      sx={{
        backgroundColor: darkMode ? "rgba(0, 0, 0, 0.4)" : "#FFFFFF",
        backdropFilter: darkMode ? "blur(10px)" : "none",
        boxShadow: "none",
        border: `1px solid ${darkMode ? "#374151" : "#E0E0E0"}`,
        borderRadius: "16px",
        transition: "all 0.3s ease",
        "&:hover": darkMode ? {
          borderColor: "#6366f1",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        } : {},
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: darkMode ? "white" : "inherit" }}>
          Rules
        </Typography>
        {rules.map((rule) => (
          <Box key={rule.id} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: darkMode ? "white" : "inherit" }}>
                {rule.id}. {rule.title}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: darkMode ? "#9ca3af" : "#6B7280" }}>
              {rule.description}
            </Typography>
          </Box>
        ))}
        <Button
          size="small"
          sx={{
            textTransform: "none",
            color: darkMode ? "#a5b4fc" : "#8B5CF6",
            p: 0,
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
        >
          Read more →
        </Button>
      </CardContent>
    </Card>
  );
};