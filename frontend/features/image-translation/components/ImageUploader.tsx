"use client";

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Image as ImageIcon,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  darkMode?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  darkMode = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload an image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClear = useCallback(() => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              elevation={0}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sx={{
                p: 4,
                border: `2px dashed ${isDragging ? '#6366f1' : (darkMode ? '#444' : '#ccc')}`,
                borderRadius: 2,
                backgroundColor: isDragging 
                  ? (darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)')
                  : (darkMode ? '#0f0f0f' : '#fafafa'),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={handleButtonClick}
            >
              <motion.div
                animate={{ scale: isDragging ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <CloudUpload
                  sx={{
                    fontSize: 64,
                    color: isDragging ? '#6366f1' : (darkMode ? '#666' : '#999'),
                    mb: 2,
                  }}
                />
              </motion.div>

              <Typography variant="h6" gutterBottom>
                {isDragging ? 'Drop your image here' : 'Drag and drop an image'}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                or
              </Typography>

              <Button
                variant="contained"
                startIcon={<ImageIcon />}
                sx={{
                  mt: 2,
                  backgroundColor: '#6366f1',
                  '&:hover': { backgroundColor: '#5558d9' },
                }}
              >
                Choose Image
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Supports JPEG, PNG, WebP, GIF • Max 10MB
              </Typography>
            </Paper>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Box position="relative">
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: darkMode ? '#0f0f0f' : '#fafafa',
                }}
              >
                <Box
                  component="img"
                  src={preview}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 400,
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              </Paper>

              <IconButton
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,1)',
                  },
                }}
              >
                <Clear />
              </IconButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </motion.div>
      )}
    </Box>
  );
};