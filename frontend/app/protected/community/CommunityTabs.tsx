"use client";

import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import ProfileCard from "../../../features/users/components/ProfileCard";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  city?: string;
  country?: string;
  nativeLanguages: string[];
  targetLanguages: string[];
  bio?: string;
  matchPercentage?: number | null;
  distance?: number;
  isOnline?: boolean;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CommunityTabsProps {
  users: User[];
  currentUser: User | null;
}


export default function CommunityTabs({
  users,
}: CommunityTabsProps) {
  const [activeTab, setActiveTab] = useState(0);


  console.log("CommunityTabs - users received:", users.length, users);

  // Use all users directly (search now handled by main header)
  const filteredUsers = users;

  // Separate nearby users (those with distance data)
  const nearbyUsers = filteredUsers.filter(
    (user) => user.distance !== undefined
  );
  const allUsers = filteredUsers;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Use ProfileCard instead of custom UserCard

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 300, mb: 2, color: "white" }}
        >
          Language Partners
        </Typography>
        <Typography variant="body1" sx={{ color: "#9ca3af", mb: 3 }}>
          Find people to practice languages with around the world
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#6366f1",
            },
            "& .MuiTab-root": {
              color: "#9ca3af",
              "&.Mui-selected": {
                color: "#6366f1",
              },
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon sx={{ fontSize: 20 }} />
                All Members
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon sx={{ fontSize: 20 }} />
                Nearby
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {activeTab === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {allUsers.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(322px, 322px))",
                  gap: "24px",
                  maxWidth: "1400px",
                  justifyContent: "center",
                  justifyItems: "center",
                }}
              >
                {allUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      width: "322px",
                      height: "360px",
                    }}
                  >
                    <ProfileCard
                      user={{
                        ...user,
                        age: 25,
                        profile_picture:
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=6366f1&color=fff&size=400`,
                        bio:
                          user.bio ||
                          "Learning languages and connecting with people around the world!",
                        location:
                          user.city && user.country
                            ? `${user.city}, ${user.country}`
                            : user.city || user.country,
                        native_languages: user.nativeLanguages,
                        learning_languages: user.targetLanguages,
                        is_verified: true,
                      }}
                      matchPercentage={user.matchPercentage || 85}
                      distance={user.distance ? `${user.distance}km` : "2.1km"}
                      isFollowing={false}
                      darkMode={true}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ fontSize: "3rem", mb: 2 }}>🔍</Typography>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    color: "white",
                    mb: 1,
                  }}
                >
                  No members found
                </Typography>
                <Typography sx={{ color: "#9ca3af" }}>
                  Try adjusting your search criteria
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {nearbyUsers.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(322px, 322px))",
                  gap: "24px",
                  maxWidth: "1400px",
                  justifyContent: "center",
                  justifyItems: "center",
                }}
              >
                {nearbyUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      width: "322px",
                      height: "360px",
                    }}
                  >
                    <ProfileCard
                      user={{
                        ...user,
                        age: 25,
                        profile_picture:
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=6366f1&color=fff&size=400`,
                        bio:
                          user.bio ||
                          "Learning languages and connecting with people around the world!",
                        location:
                          user.city && user.country
                            ? `${user.city}, ${user.country}`
                            : user.city || user.country,
                        native_languages: user.nativeLanguages,
                        learning_languages: user.targetLanguages,
                        is_verified: true,
                      }}
                      matchPercentage={user.matchPercentage || 85}
                      distance={user.distance ? `${user.distance}km` : "2.1km"}
                      isFollowing={false}
                      darkMode={true}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ fontSize: "3rem", mb: 2 }}>📍</Typography>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    color: "white",
                    mb: 1,
                  }}
                >
                  No nearby members found
                </Typography>
                <Typography sx={{ color: "#9ca3af", mb: 3 }}>
                  Enable location sharing to find language partners near you
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<LocationIcon />}
                  sx={{
                    backgroundColor: "#6366f1",
                    color: "white",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#5855eb",
                    },
                  }}
                >
                  Enable Location
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Load More Button */}
      {((activeTab === 0 && allUsers.length > 0) ||
        (activeTab === 1 && nearbyUsers.length > 0)) && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "#374151",
              textTransform: "none",
              px: 4,
              py: 1.5,
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                borderColor: "#6366f1",
              },
            }}
          >
            Load More Members
          </Button>
        </Box>
      )}
    </Box>
  );
}
