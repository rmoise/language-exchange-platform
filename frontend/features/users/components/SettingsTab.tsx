"use client";

import React, { useState } from "react";
import { Box, Typography, Switch, Button } from "@mui/material";
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

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const [showLocation, setShowLocation] = useState(true);
  const [showTandemId, setShowTandemId] = useState(true);
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

  const handleDeleteAccount = () => {
    setDeleteAccountModalOpen(true);
  };

  const handleDeleteAccountConfirm = () => {
    console.log("Delete account confirmed");
    // TODO: Implement account deletion API call
    setDeleteAccountModalOpen(false);
  };

  const handleDeleteAccountCancel = () => {
    setDeleteAccountModalOpen(false);
  };

  return (
    <Box>
      {/* Privacy Section */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "white", fontWeight: 600, mb: 3 }}
        >
          Privacy
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Show my location
            </Typography>
            <Switch
              checked={showLocation}
              onChange={(e) => setShowLocation(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#6366f1",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#6366f1",
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Show my Tandem ID
            </Typography>
            <Switch
              checked={showTandemId}
              onChange={(e) => setShowTandemId(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#6366f1",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#6366f1",
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
              Manage Cookies
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#6366f1",
                color: "white",
                textTransform: "none",
                borderRadius: 1,
                px: 2,
                "&:hover": {
                  backgroundColor: "#00acc1",
                },
              }}
            >
              Manage Cookies
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Notifications Section */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "white", fontWeight: 600, mb: 3 }}
        >
          Notifications
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Receive notifications for messages or calls
          </Typography>
          <Switch
            checked={receiveNotifications}
            onChange={(e) => setReceiveNotifications(e.target.checked)}
            sx={{
              "& .MuiSwitch-switchBase": {
                color: "rgba(255, 255, 255, 0.4)",
              },
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          />
        </Box>
      </Box>

      {/* Download your data Section */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "white", fontWeight: 600, mb: 2 }}
        >
          Download your data
        </Typography>

        <Typography
          sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3, fontSize: "0.95rem" }}
        >
          You can download your Tandem personal data here
        </Typography>

        <Button
          variant="outlined"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            textTransform: "none",
            borderRadius: 1,
            px: 3,
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.5)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          Request data
        </Button>
      </Box>

      {/* Delete account Section */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "white", fontWeight: 600, mb: 2 }}
        >
          Delete account
        </Typography>

        <Typography
          sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3, fontSize: "0.95rem" }}
        >
          Are you sure that you want to delete your account? This is what will
          happen:
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mb: 2,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <Box component="span" sx={{ mr: 1, fontWeight: 600 }}>
              1.
            </Box>
            You won't be able to practice languages with our community anymore
            😔
          </Typography>

          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mb: 2,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <Box component="span" sx={{ mr: 1, fontWeight: 600 }}>
              2.
            </Box>
            All your data on Tandem will be deleted from our servers completely,
            with no option to recover it later. You will have to submit a new
            application and wait for approval to use Tandem again.
          </Typography>

          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mb: 3,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <Box component="span" sx={{ mr: 1, fontWeight: 600 }}>
              3.
            </Box>
            While your personal conversation history will be gone forever once
            you delete your account, your partners on Tandem may still have some
            of the messages you sent them.
          </Typography>
        </Box>

        <Typography
          sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 3, fontSize: "0.95rem" }}
        >
          I want to permanently delete my Tandem account.
        </Typography>

        <Button
          variant="outlined"
          onClick={handleDeleteAccount}
          sx={{
            color: "#ef4444",
            borderColor: "#ef4444",
            textTransform: "none",
            borderRadius: 1,
            px: 3,
            "&:hover": {
              borderColor: "#dc2626",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
            },
          }}
        >
          Delete account
        </Button>
      </Box>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        open={deleteAccountModalOpen}
        onClose={handleDeleteAccountCancel}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete Account?"
        description={`Are you sure you want to permanently delete your account?\n\nThis action cannot be undone. All your data will be permanently removed from our servers, including:\n\n• Your profile and personal information\n• All conversation history\n• Language learning progress\n• Connections with other users\n\nYou will need to create a new account if you want to use the platform again.`}
        confirmText="Delete Account"
        cancelText="Keep Account"
        confirmColor="error"
        showAvatar={false}
      />
    </Box>
  );
}
