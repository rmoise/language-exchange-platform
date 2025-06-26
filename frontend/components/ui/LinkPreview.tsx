import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { 
  Language as LanguageIcon,
  Link as LinkIcon,
  CalendarMonth as CalendarIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

interface LinkPreviewProps {
  title: string;
  url: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  darkMode?: boolean;
  onClick?: () => void;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  title,
  url,
  icon,
  imageUrl,
  darkMode = false,
  onClick,
}) => {
  // Determine icon based on URL if no icon provided
  const getDefaultIcon = () => {
    if (url.includes('calendly') || url.includes('calendar')) {
      return <CalendarIcon sx={{ fontSize: 24, color: darkMode ? "#9ca3af" : "#6b7280" }} />;
    }
    if (url.includes('youtube') || url.includes('video')) {
      return <ImageIcon sx={{ fontSize: 24, color: darkMode ? "#9ca3af" : "#6b7280" }} />;
    }
    if (url.includes('article') || url.includes('blog') || url.includes('medium')) {
      return <ArticleIcon sx={{ fontSize: 24, color: darkMode ? "#9ca3af" : "#6b7280" }} />;
    }
    return <LinkIcon sx={{ fontSize: 24, color: darkMode ? "#9ca3af" : "#6b7280" }} />;
  };

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#faf9f8",
        borderRadius: 2,
        p: 1.5,
        maxWidth: 260,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        border: '1px solid',
        borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
        '&:hover': onClick ? {
          backgroundColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "#f5f5f5",
          borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.12)",
        } : {},
      }}
      onClick={onClick}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {imageUrl ? (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              flexShrink: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "#f0f0f0",
            }}
          />
        ) : icon || (
          <Box
            sx={{
              width: 48,
              height: 48,
              background: url.includes('calendly') || url.includes('calendar') 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : darkMode ? "rgba(99, 102, 241, 0.1)" : "rgba(25, 118, 210, 0.08)",
              borderRadius: 1,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(getDefaultIcon() as React.ReactElement, {
              sx: { 
                fontSize: 24, 
                color: (url.includes('calendly') || url.includes('calendar')) 
                  ? 'white' 
                  : darkMode ? "#9ca3af" : "#6b7280" 
              }
            })}
          </Box>
        )}
        <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              fontSize: "14px",
              color: darkMode ? "white" : "#141417",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "12px",
              color: darkMode ? "#9ca3af" : "#3b3b3b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {url}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};