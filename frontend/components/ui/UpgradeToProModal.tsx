'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { motion } from 'framer-motion'

interface UpgradeToProModalProps {
  open: boolean
  onClose: () => void
  preview?: string
  originalText?: string
  usageInfo?: {
    used: number
    limit: number
  }
}

export function UpgradeToProModal({
  open,
  onClose,
  preview,
  originalText,
  usageInfo
}: UpgradeToProModalProps) {
  const theme = useTheme()
  const darkMode = theme.palette.mode === 'dark'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: darkMode
            ? 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Gradient background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            opacity: 0.1,
          }}
        />

        <Box sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🌟 Unlock Unlimited AI Improvements
            </Typography>
          </motion.div>

          {/* Preview section */}
          {preview && originalText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Box
                sx={{
                  bgcolor: darkMode
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  p: 3,
                  borderRadius: 2,
                  mb: 3,
                  textAlign: 'left',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Your message could be improved to:
                </Typography>
                <Typography
                  sx={{
                    fontStyle: 'italic',
                    color: 'primary.main',
                    fontWeight: 500,
                  }}
                >
                  "{preview}"
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Pro members get:
            </Typography>
            <Box sx={{ mb: 4, textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
              {[
                '✨ Unlimited message improvements',
                '🎯 Advanced grammar suggestions',
                '🌍 Cultural context tips',
                '📚 Vocabulary enhancements',
                '💬 Multiple style options (formal/casual/native)',
                '⚡ Priority processing',
                '🎓 Language learning insights',
              ].map((feature, index) => (
                <Typography
                  key={index}
                  sx={{
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.05rem',
                  }}
                >
                  {feature}
                </Typography>
              ))}
            </Box>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25)',
                '&:hover': {
                  boxShadow: '0 12px 48px rgba(99, 102, 241, 0.35)',
                },
                mb: 2,
              }}
            >
              Upgrade to Pro - $9.99/month
            </Button>
          </motion.div>

          {/* Usage info */}
          {usageInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  mt: 2,
                }}
              >
                You've used {usageInfo.used}/{usageInfo.limit} free improvements this month
              </Typography>
            </motion.div>
          )}

          {/* Limited time offer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'success.main',
                  fontWeight: 600,
                }}
              >
                🎉 Limited time: Get 50% off your first month!
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </DialogContent>
    </Dialog>
  )
}