"use client";

import React from 'react';
import { Fab, Tooltip, useTheme, Box } from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ImageTranslationFABProps {
  onClick: () => void;
  darkMode?: boolean;
}

export const ImageTranslationFAB: React.FC<ImageTranslationFABProps> = ({ 
  onClick, 
  darkMode = false 
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2 
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Tooltip title="Translate Image" placement="left" arrow>
          <Fab
            color="primary"
            aria-label="translate image"
            onClick={onClick}
            sx={{
              backgroundColor: '#6366f1',
              color: 'white',
              width: 56,
              height: 56,
              boxShadow: darkMode 
                ? '0 4px 20px rgba(99, 102, 241, 0.4)' 
                : '0 4px 20px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                backgroundColor: '#5558d9',
                boxShadow: darkMode 
                  ? '0 6px 30px rgba(99, 102, 241, 0.6)' 
                  : '0 6px 30px rgba(99, 102, 241, 0.4)',
              },
              '&:active': {
                boxShadow: darkMode 
                  ? '0 2px 10px rgba(99, 102, 241, 0.4)' 
                  : '0 2px 10px rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            <CameraAlt sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>
      </motion.div>
    </Box>
  );
};