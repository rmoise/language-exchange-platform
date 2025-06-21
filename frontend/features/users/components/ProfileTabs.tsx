"use client";

import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Button,
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Person as PersonIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import SettingsTab from "./SettingsTab";
import AboutMeTab from "./AboutMeTab";
import LanguagesTab from "./LanguagesTab";
import LearningPreferencesTab from "./LearningPreferencesTab";
import FollowingTab from "./FollowingTab";

interface User {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  profileImage?: string;
  city?: string;
  country?: string;
  bio?: string;
  nativeLanguages?: string[];
  targetLanguages?: string[];
  interests?: string[];
  createdAt?: string;
}

interface ProfileTabsProps {
  user: User;
}

// Tab content components

const PlaceholderTab = ({ title }: { title: string }) => (
  <Box
    sx={{
      backgroundColor: "rgba(20, 20, 20, 0.6)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 2,
      p: 4,
      textAlign: "center",
    }}
  >
    <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
      {title}
    </Typography>
    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
      This section is coming soon!
    </Typography>
  </Box>
);

export default function ProfileTabs({ user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: "About me", icon: PersonIcon },
    { label: "Languages", icon: LanguageIcon },
    { label: "Learning Preferences", icon: SchoolIcon },
    { label: "Following", icon: PeopleIcon },
    { label: "Settings", icon: SettingsIcon },
  ];

  return (
    <Box>
      {/* Header with Current Tab Name */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ color: "white", fontWeight: 700, mb: 1 }}
            >
              My Profile
            </Typography>
            <Typography
              sx={{
                color: "#6366f1",
                fontSize: "1.1rem",
                fontWeight: 500,
              }}
            >
              {tabs[activeTab].label}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
                textTransform: "none",
                px: 3,
              }}
            >
              Preview profile
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
                textTransform: "none",
                px: 3,
              }}
            >
              Share profile
            </Button>
          </Box>
        </Box>

        <FormControlLabel
          control={
            <Switch
              defaultChecked
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#6366f1",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#6366f1",
                },
              }}
            />
          }
          label={
            <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Show me in the Community
            </Typography>
          }
        />
      </Box>

      {/* Tab Navigation */}
      <Box
        sx={{ borderBottom: 1, borderColor: "rgba(255, 255, 255, 0.2)", mb: 4 }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
              minWidth: "auto",
              px: 3,
              py: 2,
              color: "rgba(255, 255, 255, 0.6)",
              "&.Mui-selected": {
                color: "#6366f1",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#6366f1",
            },
            "& .MuiTabs-scrollButtons": {
              color: "rgba(255, 255, 255, 0.6)",
            },
          }}
        >
          {tabs.map((tab, index) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconComponent sx={{ fontSize: 18 }} />
                    <span>{tab.label}</span>
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && <AboutMeTab user={user} />}
        {activeTab === 1 && <LanguagesTab user={user} />}
        {activeTab === 2 && <LearningPreferencesTab user={user} />}
        {activeTab === 3 && <FollowingTab user={user} />}
        {activeTab === 4 && <SettingsTab user={user} />}
      </Box>
    </Box>
  );
}
