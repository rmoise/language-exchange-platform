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
        backgroundColor: darkMode ? "#1A1A1A" : "#FFFFFF",
        boxShadow: "none",
        border: `1px solid ${darkMode ? "#2A2A2A" : "#E0E0E0"}`,
        borderRadius: "16px",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Rules
        </Typography>
        {rules.map((rule) => (
          <Box key={rule.id} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {rule.id}. {rule.title}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {rule.description}
            </Typography>
          </Box>
        ))}
        <Button
          size="small"
          sx={{
            textTransform: "none",
            color: "#8B5CF6",
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