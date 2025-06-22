"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ConfirmationModal from "./ConfirmationModal";

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

interface FollowingTabProps {
  user: User;
}

// TODO: Replace with real data from API
const mockFollowingUsers: any[] = [];
const mockFollowers: any[] = [];
const mockBlocked: any[] = [];

export default function FollowingTab({ user }: FollowingTabProps) {
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [unfollowModalOpen, setUnfollowModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleSubTabChange = (newValue: number) => {
    setActiveSubTab(newValue);
  };

  const handleFollowToggle = (userData: any) => {
    if (userData.isFollowing) {
      // Show confirmation modal for unfollow
      setSelectedUser(userData);
      setUnfollowModalOpen(true);
    } else {
      // Direct follow action
      console.log("Follow user:", userData.id);
      // TODO: Implement follow API call
    }
  };

  const handleUnfollowConfirm = () => {
    if (selectedUser) {
      console.log("Unfollow user:", selectedUser.id);
      // TODO: Implement unfollow API call
    }
    setUnfollowModalOpen(false);
    setSelectedUser(null);
  };

  const handleUnfollowCancel = () => {
    setUnfollowModalOpen(false);
    setSelectedUser(null);
  };

  const handleUnblock = (userId: string) => {
    // TODO: Implement unblock API call
    console.log("Unblock user:", userId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserCard = (
    userData: any,
    showFollowButton = true,
    showUnblockButton = false
  ) => (
    <Card
      key={userData.id}
      sx={{
        backgroundColor: "rgba(20, 20, 20, 0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 2,
        mb: 2,
        "&:hover": {
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar
              src={userData.profileImage}
              sx={{
                width: 60,
                height: 60,
                border: "2px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {getInitials(userData.name)}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  mb: 0.5,
                }}
              >
                {userData.name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showFollowButton && (
              <Button
                variant={userData.isFollowing ? "outlined" : "contained"}
                size="small"
                onClick={() => handleFollowToggle(userData)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  backgroundColor: userData.isFollowing
                    ? "transparent"
                    : "#6366f1",
                  color: userData.isFollowing ? "#6366f1" : "white",
                  borderColor: "#6366f1",
                  "&:hover": {
                    backgroundColor: userData.isFollowing
                      ? "rgba(0, 188, 212, 0.1)"
                      : "#00acc1",
                    borderColor: "#6366f1",
                  },
                }}
              >
                {userData.isFollowing ? "Following" : "Follow"}
              </Button>
            )}

            {showUnblockButton && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleUnblock(userData.id)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  color: "#ef4444",
                  borderColor: "#ef4444",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "#dc2626",
                  },
                }}
              >
                Unblock
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (title: string, description: string) => (
    <Box
      sx={{
        textAlign: "center",
        py: 8,
        px: 4,
      }}
    >
      <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Typography
        sx={{ color: "rgba(255, 255, 255, 0.6)", maxWidth: 400, mx: "auto" }}
      >
        {description}
      </Typography>
    </Box>
  );

  const subTabs = [
    { label: "Following", count: mockFollowingUsers.length },
    { label: "Followers", count: mockFollowers.length },
    { label: "Blocked", count: mockBlocked.length },
  ];

  return (
    <Box>
      {/* Secondary Navigation - Visually Separated */}
      <Box sx={{ mb: 6 }}>
        {/* Small spacing from main content */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
            }}
          >
            {subTabs.map((tab, index) => (
              <Button
                key={index}
                variant={activeSubTab === index ? "contained" : "outlined"}
                onClick={() => handleSubTabChange(index)}
                sx={{
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  backgroundColor:
                    activeSubTab === index ? "#6366f1" : "transparent",
                  color:
                    activeSubTab === index
                      ? "white"
                      : "rgba(255, 255, 255, 0.7)",
                  borderColor:
                    activeSubTab === index
                      ? "#6366f1"
                      : "rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    backgroundColor:
                      activeSubTab === index
                        ? "#00acc1"
                        : "rgba(0, 188, 212, 0.1)",
                    borderColor: "#6366f1",
                    color: activeSubTab === index ? "white" : "#6366f1",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Chip
                      label={tab.count}
                      size="small"
                      sx={{
                        backgroundColor:
                          activeSubTab === index
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(255, 255, 255, 0.1)",
                        color:
                          activeSubTab === index
                            ? "white"
                            : "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.75rem",
                        height: 18,
                        minWidth: 18,
                        "& .MuiChip-label": {
                          px: 1,
                        },
                      }}
                    />
                  )}
                </Box>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Tab Content */}
        <Box>
          {/* Following Tab */}
          {activeSubTab === 0 && (
            <Box>
              {mockFollowingUsers.length > 0
                ? mockFollowingUsers.map((userData) =>
                    renderUserCard(userData, true, false)
                  )
                : renderEmptyState(
                    "No Following Yet",
                    "Start following other language learners to see them here!"
                  )}
            </Box>
          )}

          {/* Followers Tab */}
          {activeSubTab === 1 && (
            <Box>
              {mockFollowers.length > 0
                ? mockFollowers.map((userData) =>
                    renderUserCard(userData, true, false)
                  )
                : renderEmptyState(
                    "No Followers Yet",
                    "Other users who follow you will appear here."
                  )}
            </Box>
          )}

          {/* Blocked Tab */}
          {activeSubTab === 2 && (
            <Box>
              {mockBlocked.length > 0
                ? mockBlocked.map((userData) =>
                    renderUserCard(userData, false, true)
                  )
                : renderEmptyState(
                    "No Blocked Users",
                    "Users you've blocked will appear here."
                  )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Unfollow Confirmation Modal */}
      <ConfirmationModal
        open={unfollowModalOpen}
        onClose={handleUnfollowCancel}
        onConfirm={handleUnfollowConfirm}
        title={`Unfollow ${selectedUser?.name || ""}?`}
        description="Their posts will no longer show up in your feed. You can still view their profile and follow them again."
        confirmText="Unfollow"
        confirmColor="error"
        showAvatar={true}
        avatarSrc={selectedUser?.profileImage}
        avatarName={selectedUser?.name || ""}
      />
    </Box>
  );
}
