"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { keyframes } from '@mui/system';
import { useColorScheme } from '@mui/material/styles';

interface XPNotificationProps {
  xpAmount: number;
  message: string;
  onComplete?: () => void;
}

const slideIn = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  10% {
    transform: translateX(0);
    opacity: 1;
  }
  90% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

export const XPNotification: React.FC<XPNotificationProps> = ({ xpAmount, message, onComplete }) => {
  const [show, setShow] = useState(true);
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Fade in={show}>
      <Box
        sx={{
          animation: `${slideIn} 2.5s ease-out`,
          position: 'relative',
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: darkMode 
            ? '0 4px 24px rgba(0, 0, 0, 0.4)' 
            : '0 4px 24px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          minWidth: 200,
          overflow: 'hidden',
        }}
      >
          {/* Shimmer effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: darkMode
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.05) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: `${shimmer} 2s linear`,
              pointerEvents: 'none',
            }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* XP amount with accent color */}
            <Typography
              sx={{
                fontSize: '24px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}
            >
              +{xpAmount}
            </Typography>
            
            {/* Message */}
            <Typography
              sx={{
                color: darkMode ? '#e5e5e5' : '#1a1a1a',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {message}
            </Typography>
          </Box>
          
          {/* Progress bar */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 2,
              width: '100%',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              animation: `${keyframes`
                0% { width: 100%; }
                100% { width: 0%; }
              `} 2.5s linear`,
            }}
          />
      </Box>
    </Fade>
  );
};

// XP Notification Manager to handle multiple notifications
interface Notification {
  id: string;
  xpAmount: number;
  message: string;
}

export const XPNotificationManager: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listen for XP gain events
    const handleXPGain = (event: CustomEvent) => {
      const { xpAmount, message } = event.detail;
      const id = Date.now().toString();
      setActiveNotifications(prev => [...prev, { id, xpAmount, message }]);
    };

    window.addEventListener('xpGained', handleXPGain as EventListener);
    return () => {
      window.removeEventListener('xpGained', handleXPGain as EventListener);
    };
  }, []);

  const handleComplete = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {activeNotifications.map((notification, index) => (
        <Box
          key={notification.id}
          sx={{
            position: 'fixed',
            top: 24 + (index * 60),
            right: 24,
            zIndex: 9999 - index,
          }}
        >
          <XPNotification
            xpAmount={notification.xpAmount}
            message={notification.message}
            onComplete={() => handleComplete(notification.id)}
          />
        </Box>
      ))}
    </>
  );
};

// Helper function to trigger XP notifications
export const showXPNotification = (xpAmount: number, message: string) => {
  window.dispatchEvent(new CustomEvent('xpGained', {
    detail: { xpAmount, message }
  }));
};