"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, Stack } from '@mui/material';
import { keyframes } from '@mui/system';
import { useColorScheme } from '@mui/material/styles';
import { 
  AutoAwesome as SparkleIcon,
  Stars as StarsIcon,
  EmojiEvents as TrophyIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';

interface XPNotificationProps {
  xpAmount: number;
  message: string;
  onComplete?: () => void;
}

// Complex keyframe animations
const portalOpen = keyframes`
  0% {
    transform: scale(0) rotate(180deg);
    opacity: 0;
    filter: blur(10px);
  }
  50% {
    transform: scale(1.1) rotate(90deg);
    opacity: 0.8;
    filter: blur(0px);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0px);
  }
`;

const energyPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) translateX(5px) rotate(5deg);
  }
  66% {
    transform: translateY(-5px) translateX(-5px) rotate(-5deg);
  }
`;

const shimmerWave = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const particleFloat = keyframes`
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(var(--x), var(--y)) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(var(--x2), var(--y2)) scale(0);
    opacity: 0;
  }
`;

const numberCountUp = keyframes`
  0% {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(139, 92, 246, 0.4),
      0 0 40px rgba(139, 92, 246, 0.2),
      0 0 60px rgba(139, 92, 246, 0.1);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(139, 92, 246, 0.6),
      0 0 60px rgba(139, 92, 246, 0.3),
      0 0 90px rgba(139, 92, 246, 0.15);
  }
`;

// Particle component
const Particle: React.FC<{ delay: number; x: number; y: number }> = ({ delay, x, y }) => {
  const x2 = x + (Math.random() - 0.5) * 50;
  const y2 = y + Math.random() * 30;
  
  return (
    <Box
      sx={{
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        boxShadow: '0 0 6px rgba(251, 191, 36, 0.8)',
        '--x': `${x}px`,
        '--y': `${y}px`,
        '--x2': `${x2}px`,
        '--y2': `${y2}px`,
        animation: `${particleFloat} 2s ease-out ${delay}s`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const XPNotificationPremium: React.FC<XPNotificationProps> = ({ xpAmount, message, onComplete }) => {
  const [show, setShow] = useState(true);
  const [displayNumber, setDisplayNumber] = useState(0);
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';

  // Animate number counting up
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = xpAmount / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= xpAmount) {
        setDisplayNumber(xpAmount);
        clearInterval(timer);
      } else {
        setDisplayNumber(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [xpAmount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Fade in={show} timeout={500}>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-block',
          animation: `${portalOpen} 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
        }}
      >
        {/* Outer glow effect */}
        <Box
          sx={{
            position: 'absolute',
            inset: -20,
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(20px)',
            animation: `${energyPulse} 2s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Main container */}
        <Box
          sx={{
            position: 'relative',
            background: darkMode
              ? 'linear-gradient(135deg, rgba(17, 17, 17, 0.98) 0%, rgba(30, 24, 40, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 255, 0.98) 100%)',
            backdropFilter: 'blur(20px) saturate(200%)',
            borderRadius: '24px',
            padding: '20px 32px',
            border: '1px solid',
            borderColor: darkMode
              ? 'rgba(139, 92, 246, 0.3)'
              : 'rgba(139, 92, 246, 0.2)',
            boxShadow: darkMode
              ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : '0 20px 60px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            overflow: 'hidden',
            animation: `${glowPulse} 3s ease-in-out infinite, ${float} 4s ease-in-out infinite`,
          }}
        >
          {/* Animated background gradient */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.1) 25%, rgba(236, 72, 153, 0.1) 50%, rgba(251, 191, 36, 0.1) 75%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: `${shimmerWave} 3s linear infinite`,
              pointerEvents: 'none',
            }}
          />

          {/* Top decorative icons */}
          <Box sx={{ position: 'absolute', top: -12, left: 20 }}>
            <StarsIcon sx={{ fontSize: 20, color: '#fbbf24', opacity: 0.8 }} />
          </Box>
          <Box sx={{ position: 'absolute', top: -8, right: 25 }}>
            <SparkleIcon sx={{ fontSize: 16, color: '#ec4899', opacity: 0.8 }} />
          </Box>

          {/* Content */}
          <Stack direction="row" spacing={3} alignItems="center" position="relative">
            {/* XP amount section */}
            <Box sx={{ position: 'relative' }}>
              {/* Trophy icon background */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                  animation: `${energyPulse} 1.5s ease-in-out infinite`,
                }}
              />
              
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                }}
              >
                <TrophyIcon sx={{ fontSize: 32, color: 'white', mb: 0.5 }} />
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: -8,
                    fontSize: '24px',
                    fontWeight: 900,
                    color: darkMode ? '#fbbf24' : '#f59e0b',
                    textShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                    animation: `${numberCountUp} 0.6s ease-out`,
                  }}
                >
                  +{displayNumber}
                </Typography>
              </Box>
            </Box>

            {/* Message section */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: darkMode ? 'rgba(139, 92, 246, 0.8)' : 'rgba(99, 102, 241, 0.8)',
                  mb: 0.5,
                }}
              >
                Experience Gained
              </Typography>
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                {message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <BoltIcon sx={{ fontSize: 14, color: '#fbbf24' }} />
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  }}
                >
                  Level progress updated
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <Particle
              key={i}
              delay={i * 0.2}
              x={20 + i * 60}
              y={-10}
            />
          ))}

          {/* Bottom accent line */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 25%, #ec4899 50%, #fbbf24 75%, #6366f1 100%)',
              backgroundSize: '200% 100%',
              animation: `${shimmerWave} 2s linear infinite`,
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
};

// Premium XP Notification Manager
export const XPNotificationManagerPremium: React.FC = () => {
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
        bottom: 60,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        gap: 2,
        pointerEvents: 'none',
      }}
    >
      {activeNotifications.slice(0, 1).map((notification) => (
        <Box
          key={notification.id}
          sx={{
            pointerEvents: 'auto',
          }}
        >
          <XPNotificationPremium
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