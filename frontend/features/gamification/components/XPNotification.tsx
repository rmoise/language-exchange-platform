"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, Slide } from '@mui/material';
import { keyframes } from '@mui/system';
import { useAppSelector } from '@/lib/hooks';
import { selectRecentXPGains } from '../gamificationSlice';

const floatUp = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-60px);
    opacity: 0;
  }
`;

const glow = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.6);
  }
  100% {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
  }
`;

interface XPNotificationProps {
  amount: number;
  description: string;
  id: string;
  onComplete: () => void;
}

const XPNotificationItem: React.FC<XPNotificationProps> = ({ amount, description, id, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: 9999,
        animation: `${floatUp} 3s ease-out forwards`,
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: '12px',
          padding: '12px 20px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          animation: `${glow} 1.5s ease-in-out infinite`,
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          +{amount}
        </Typography>
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 700,
            opacity: 0.9,
          }}
        >
          XP
        </Typography>
        <Typography
          sx={{
            fontSize: '14px',
            opacity: 0.8,
            ml: 1,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

export const XPNotificationContainer: React.FC = () => {
  const recentXPGains = useAppSelector(selectRecentXPGains);
  const [displayedGains, setDisplayedGains] = useState<Set<string>>(new Set());
  const [activeNotifications, setActiveNotifications] = useState<typeof recentXPGains>([]);

  useEffect(() => {
    // Find new XP gains that haven't been displayed yet
    const newGains = recentXPGains.filter(gain => !displayedGains.has(gain.id));
    
    if (newGains.length > 0) {
      // Add new gains to displayed set
      setDisplayedGains(prev => {
        const newSet = new Set(prev);
        newGains.forEach(gain => newSet.add(gain.id));
        return newSet;
      });
      
      // Add to active notifications
      setActiveNotifications(prev => [...prev, ...newGains]);
    }
  }, [recentXPGains, displayedGains]);

  const handleComplete = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {activeNotifications.map((gain, index) => (
        <div
          key={gain.id}
          style={{
            position: 'fixed',
            bottom: `${100 + index * 80}px`,
            right: '20px',
            zIndex: 9999 - index,
          }}
        >
          <XPNotificationItem
            id={gain.id}
            amount={gain.amount}
            description={gain.description}
            onComplete={() => handleComplete(gain.id)}
          />
        </div>
      ))}
    </>
  );
};