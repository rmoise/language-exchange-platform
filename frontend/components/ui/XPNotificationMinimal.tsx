"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { keyframes } from '@mui/system';
import { useColorScheme } from '@mui/material/styles';
import { AutoAwesome as SparkleIcon } from '@mui/icons-material';

interface XPNotificationProps {
  xpAmount: number;
  message: string;
  onComplete?: () => void;
}

const slideUp = keyframes`
  0% {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }
  20% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  80% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
`;

export const XPNotificationMinimal: React.FC<XPNotificationProps> = ({ xpAmount, message, onComplete }) => {
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
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          animation: `${slideUp} 2.5s cubic-bezier(0.16, 1, 0.3, 1)`,
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: darkMode 
            ? 'rgba(17, 17, 17, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '16px',
          padding: '16px 24px',
          border: '1px solid',
          borderColor: darkMode 
            ? 'rgba(139, 92, 246, 0.2)' 
            : 'rgba(139, 92, 246, 0.15)',
          boxShadow: darkMode 
            ? '0 10px 40px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(139, 92, 246, 0.2)' 
            : '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(139, 92, 246, 0.1)',
          overflow: 'visible',
          animation: `${slideUp} 2.5s cubic-bezier(0.16, 1, 0.3, 1), ${glow} 2s ease-in-out`,
        }}
      >
        {/* Sparkle decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            animation: `${sparkle} 1.5s ease-in-out`,
          }}
        >
          <SparkleIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: -6,
            left: 20,
            animation: `${sparkle} 1.5s ease-in-out 0.3s`,
          }}
        >
          <SparkleIcon sx={{ fontSize: 12, color: '#6366f1' }} />
        </Box>
        
        {/* XP Amount */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '28px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2))',
            }}
          >
            +{xpAmount}
          </Typography>
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: darkMode ? 'rgba(139, 92, 246, 0.8)' : 'rgba(99, 102, 241, 0.8)',
              ml: 0.5,
              mt: 0.5,
            }}
          >
            XP
          </Typography>
        </Box>
        
        {/* Divider */}
        <Box
          sx={{
            width: 1,
            height: 24,
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          }}
        />
        
        {/* Message */}
        <Typography
          sx={{
            color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            fontSize: '15px',
            fontWeight: 500,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

// XP Notification Manager for minimal design
export const XPNotificationManagerMinimal: React.FC = () => {
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
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: 1.5,
        pointerEvents: 'none',
      }}
    >
      {activeNotifications.slice(0, 3).map((notification, index) => (
        <Box
          key={notification.id}
          sx={{
            transform: `scale(${1 - (activeNotifications.length - 1 - index) * 0.05})`,
            opacity: 1 - (activeNotifications.length - 1 - index) * 0.15,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'auto',
          }}
        >
          <XPNotificationMinimal
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