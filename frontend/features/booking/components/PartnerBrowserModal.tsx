"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { PartnerBrowser } from './PartnerBrowser';

interface PartnerBrowserModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPartner: (partner: any) => void;
  darkMode?: boolean;
}

export const PartnerBrowserModal: React.FC<PartnerBrowserModalProps> = ({
  open,
  onClose,
  onSelectPartner,
  darkMode = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Find a Language Partner
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Book a session with native speakers and fellow learners
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <PartnerBrowser
          onSelectPartner={onSelectPartner}
          darkMode={darkMode}
        />
      </DialogContent>
    </Dialog>
  );
};