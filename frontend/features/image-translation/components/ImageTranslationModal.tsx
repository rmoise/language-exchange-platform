"use client";

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tab,
  Tabs,
  Typography,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close, PhotoCamera, Collections } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from './ImageUploader';
import { TranslationDisplay } from './TranslationDisplay';
import { TextRegion } from '../types';

interface ImageTranslationModalProps {
  open: boolean;
  onClose: () => void;
  darkMode?: boolean;
  nativeLanguage?: string;
}

type TabValue = 'upload' | 'camera' | 'results';

export const ImageTranslationModal: React.FC<ImageTranslationModalProps> = ({
  open,
  onClose,
  darkMode = false,
  nativeLanguage = 'en',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState<TabValue>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((url: string) => {
    setImageUrl(url);
    setError(null);
    setActiveTab('results');
  }, []);

  const handleClose = () => {
    setImageUrl(null);
    setError(null);
    setActiveTab('upload');
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          color: darkMode ? 'white' : 'inherit',
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: fullScreen ? '100%' : '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
        }}
      >
        <Typography variant="h6" component="div" fontWeight={600}>
          Image Translator
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: darkMode ? '#ccc' : '#666',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {!imageUrl ? (
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
                '& .MuiTab-root': {
                  color: darkMode ? '#999' : '#666',
                  '&.Mui-selected': {
                    color: '#6366f1',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#6366f1',
                },
              }}
            >
              <Tab
                label="Upload Image"
                value="upload"
                icon={<Collections />}
                iconPosition="start"
              />
              <Tab
                label="Take Photo"
                value="camera"
                icon={<PhotoCamera />}
                iconPosition="start"
                disabled // Camera functionality can be added later
              />
            </Tabs>

            <Box sx={{ p: 3, minHeight: 400 }}>
              <AnimatePresence mode="wait">
                {activeTab === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ImageUploader
                      onImageSelect={handleImageSelect}
                      darkMode={darkMode}
                    />
                  </motion.div>
                )}
                {activeTab === 'camera' && (
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 300,
                        color: darkMode ? '#666' : '#999',
                      }}
                    >
                      <Typography variant="body1">
                        Camera feature coming soon...
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {error && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Box>
            )}

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {imageUrl && (
                <TranslationDisplay
                  imageUrl={imageUrl}
                  textRegions={[]}
                  isProcessing={false}
                  darkMode={darkMode}
                  nativeLanguage={nativeLanguage}
                />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};