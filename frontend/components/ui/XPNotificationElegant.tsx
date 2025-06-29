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

const slideUp = keyframes`
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  10% {
    transform: translateY(0);
    opacity: 1;
  }
  90% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-10px);
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

export const XPNotificationElegant: React.FC<XPNotificationProps> = ({ xpAmount, message, onComplete }) => {
  const [show, setShow] = useState(true);
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Fade in={show} timeout={200}>
      <Box
        sx={{
          animation: `${slideUp} 2s ease-out`,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: darkMode 
            ? 'rgba(255, 255, 255, 0.04)' 
            : 'rgba(0, 0, 0, 0.02)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '10px 16px',
          border: '1px solid',
          borderColor: darkMode 
            ? 'rgba(255, 255, 255, 0.06)' 
            : 'rgba(0, 0, 0, 0.03)',
          boxShadow: darkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* XP Circle */}
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: darkMode
              ? 'rgba(139, 92, 246, 0.1)'
              : 'rgba(99, 102, 241, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              padding: '1px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              opacity: 0.3,
            }
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${fadeIn} 0.5s ease-out`,
            }}
          >
            +{xpAmount}
          </Typography>
        </Box>
        
        {/* Message */}
        <Typography
          sx={{
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

// Elegant XP Notification Manager
export const XPNotificationManagerElegant: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<Array<{
    id: string;
    xpAmount: number;
    message: string;
  }>>([]);

  useEffect(() => {
    const handleXPGain = (event: CustomEvent) => {
      const { xpAmount, message } = event.detail;
      const id = `${Date.now()}-${Math.random()}`;
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
    <Box
      sx={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: 1,
        pointerEvents: 'none',
      }}
    >
      {activeNotifications.slice(0, 3).map((notification, index) => (
        <Box
          key={notification.id}
          sx={{
            pointerEvents: 'auto',
            opacity: 1 - index * 0.2,
            transform: `scale(${1 - index * 0.05})`,
            transition: 'all 0.2s ease-out',
          }}
        >
          <XPNotificationElegant
            xpAmount={notification.xpAmount}
            message={notification.message}
            onComplete={() => handleComplete(notification.id)}
          />
        </Box>
      ))}
    </Box>
  );
};

// Helper function remains the same
export const showXPNotification = (xpAmount: number, message: string) => {
  window.dispatchEvent(new CustomEvent('xpGained', {
    detail: { xpAmount, message }
  }));
};