"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { AutoAwesome as AutoAwesomeIcon, Stars as StarsIcon } from "@mui/icons-material";
import { useColorScheme } from '@mui/material/styles';
import { HighlightedProfileCard } from "./HighlightedProfileCard";
import { highlightedProfiles } from "../data/mockData";

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  profile_picture?: string;
  profileImage?: string;
}

interface HighlightedProfilesSectionProps {
  currentUser?: User | null;
}

export function HighlightedProfilesSection({ currentUser }: HighlightedProfilesSectionProps) {
  const { mode } = useColorScheme();
  const darkMode = mode === 'dark';
  
  // Show 4 highlighted profiles
  const displayProfiles = highlightedProfiles.slice(0, 4);
  

  return (
    <Box sx={{ 
      mt: 8,
      mb: 6,
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
    }}>
      {/* Premium background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      {/* Content container */}
      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        maxWidth: 1400,
        mx: 'auto',
        px: { xs: 2, lg: 3 },
      }}>
        {/* Premium header */}
        <Box sx={{ 
          textAlign: 'center',
          mb: 5,
        }}>
          <Box sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
          }}>
            <StarsIcon sx={{ 
              fontSize: 28,
              color: '#6366f1',
              filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))',
            }} />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 300,
                fontSize: { xs: '28px', md: '36px' },
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Featured Members
            </Typography>
            <StarsIcon sx={{ 
              fontSize: 28,
              color: '#8b5cf6',
              filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))',
            }} />
          </Box>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '16px',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Connect with our most active language learners who are ready to practice now
          </Typography>
        </Box>
        
        {/* Premium profile cards grid */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(auto-fit, minmax(280px, 1fr))',
            sm: 'repeat(auto-fit, minmax(300px, 1fr))',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          justifyItems: 'center',
          mb: 4,
          minHeight: 400,
        }}>
          {displayProfiles.map((profile, index) => (
            <Box
              key={profile.id}
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 320,
                animation: 'fadeInUp 0.6s ease-out',
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              <HighlightedProfileCard
                profile={profile}
                darkMode={true}
                onFollow={() => console.log("Follow", profile.name)}
                onMessage={() => console.log("Message", profile.name)}
              />
            </Box>
          ))}
        </Box>
        
        {/* Premium CTA */}
        <Box sx={{
          textAlign: 'center',
          mt: 4,
        }}>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              mb: 2,
            }}
          >
            Want to be featured? Upgrade to Pro and get 3x more visibility
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
              },
            }}
          >
            Upgrade to Pro
          </Button>
        </Box>
      </Box>
    </Box>
  );
}