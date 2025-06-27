"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";
import { HighlightedProfileCard } from "./HighlightedProfileCard";
import { highlightedProfiles } from "../data/mockData";
import UserAvatar from "@/components/ui/UserAvatar";

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
  const { mode } = useCustomTheme();
  
  // Show only first 3 profiles
  const displayProfiles = highlightedProfiles.slice(0, 3);
  
  // Get user's first name
  const userFirstName = currentUser?.name?.split(' ')[0] || 'there';
  
  // CTA Card for LinguaConnect Pro
  const ProCTACard = () => (
    <Box
      sx={{
        width: 320,
        minWidth: 320,
        maxWidth: 320,
        height: 320,
        borderRadius: "16px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          boxShadow: "0 16px 40px rgba(99, 102, 241, 0.5)",
          transform: "translateY(-8px)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }
      }}
    >
      {/* User Avatar */}
      {currentUser && (
        <Box sx={{ mb: 2 }}>
          <UserAvatar
            user={currentUser}
            size={80}
            showOnlineStatus={false}
            showBorderForNonImage={true}
          />
        </Box>
      )}
      
      <Typography
        variant="h5"
        sx={{
          color: "white",
          fontWeight: 700,
          mb: 1,
          fontSize: "22px",
        }}
      >
        Hey {userFirstName}!
      </Typography>
      <Typography
        sx={{
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: "14px",
          mb: 3,
          lineHeight: 1.6,
          maxWidth: "250px",
        }}
      >
        Get featured in the spotlight and connect with 3x more language partners. Stand out from the crowd!
      </Typography>
      <Box
        sx={{
          backgroundColor: "white",
          color: "#6366f1",
          width: 129,
          height: 41,
          borderRadius: "14px",
          fontWeight: 500,
          fontSize: "13.7px",
          letterSpacing: "-0.14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          cursor: "pointer",
          transition: "background-color 0.2s",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }
        }}
      >
        Upgrade Now
        <ChevronRightIcon sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      mt: 3, 
      mb: 4, 
      position: 'relative', 
      zIndex: 10,
      maxWidth: 1600,
      mx: "auto",
      px: { xs: 2, lg: 3 },
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 600, 
          fontSize: "20px",
          color: mode === "dark" ? "white" : "#1a1a1a",
          mb: 2.5,
        }}
      >
        Highlighted Profiles
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 2.5,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Static Pro CTA Card */}
        <ProCTACard />
        
        {/* Static profile cards */}
        {displayProfiles.map((profile) => (
          <HighlightedProfileCard
            key={profile.id}
            profile={profile}
            darkMode={mode === "dark"}
            onFollow={() => console.log("Follow", profile.name)}
            onMessage={() => console.log("Message", profile.name)}
          />
        ))}
      </Box>
    </Box>
  );
}