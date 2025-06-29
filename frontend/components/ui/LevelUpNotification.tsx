"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { keyframes } from '@mui/system';
import { useColorScheme } from '@mui/material/styles';
import { AutoAwesome as SparkleIcon } from '@mui/icons-material';

interface LevelUpNotificationProps {
  level: number;
  levelTitle: string;
  onComplete?: () => void;
}

const scaleIn = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const sparkleRotate = keyframes`
  0% {
    transform: rotate(0deg) scale(0);
    opacity: 0;
  }
  50% {
    transform: rotate(180deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotate(360deg) scale(0);
    opacity: 0;
  }
`;

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({ 
  level, 
  levelTitle, 
  onComplete 
}) => {
  const [show, setShow] = useState(true);
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onComplete?.(), 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Fade in={show} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          animation: `${scaleIn} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            backgroundColor: darkMode 
              ? 'rgba(17, 17, 17, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px 48px',
            border: '1px solid',
            borderColor: darkMode 
              ? 'rgba(139, 92, 246, 0.3)' 
              : 'rgba(139, 92, 246, 0.2)',
            boxShadow: darkMode 
              ? '0 25px 50px rgba(0, 0, 0, 0.5)' 
              : '0 25px 50px rgba(99, 102, 241, 0.15)',
            overflow: 'hidden',
            textAlign: 'center',
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
              background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)',
              animation: `${shimmer} 1.5s ease-out`,
              pointerEvents: 'none',
            }}
          />

          {/* Sparkle decorations */}
          <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
            <SparkleIcon 
              sx={{ 
                fontSize: 16, 
                color: '#8b5cf6',
                animation: `${sparkleRotate} 2s ease-in-out 0.2s`,
              }} 
            />
          </Box>
          <Box sx={{ position: 'absolute', top: 30, right: 25 }}>
            <SparkleIcon 
              sx={{ 
                fontSize: 20, 
                color: '#6366f1',
                animation: `${sparkleRotate} 2s ease-in-out 0.5s`,
              }} 
            />
          </Box>
          <Box sx={{ position: 'absolute', bottom: 20, left: 30 }}>
            <SparkleIcon 
              sx={{ 
                fontSize: 14, 
                color: '#ec4899',
                animation: `${sparkleRotate} 2s ease-in-out 0.8s`,
              }} 
            />
          </Box>

          {/* Content */}
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: darkMode ? 'rgba(139, 92, 246, 0.8)' : 'rgba(99, 102, 241, 0.8)',
              mb: 1,
            }}
          >
            Level Up!
          </Typography>

          <Typography
            sx={{
              fontSize: '48px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              lineHeight: 1,
            }}
          >
            {level}
          </Typography>

          <Typography
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
              letterSpacing: '-0.01em',
            }}
          >
            {levelTitle}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

// Level Up Manager
export const LevelUpManager: React.FC = () => {
  const [levelUpData, setLevelUpData] = useState<{
    level: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      const { level, title } = event.detail;
      setLevelUpData({ level, title });
    };

    window.addEventListener('levelUp', handleLevelUp as EventListener);
    return () => {
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
    };
  }, []);

  const handleComplete = () => {
    setLevelUpData(null);
  };

  if (!levelUpData) return null;

  return (
    <LevelUpNotification
      level={levelUpData.level}
      levelTitle={levelUpData.title}
      onComplete={handleComplete}
    />
  );
};

// Helper function to trigger level up notification
export const showLevelUpNotification = (level: number, title: string) => {
  window.dispatchEvent(new CustomEvent('levelUp', {
    detail: { level, title }
  }));
};