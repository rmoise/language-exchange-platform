"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import Link from "next/link";
import AnimatedWrapper from "../AnimatedWrapper";
import MyPostsTab from "@/features/users/components/MyPostsTab";
import { useAuth } from "@/hooks/useAuth";

export default function AllPostsPage() {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      <AnimatedWrapper>
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1000px",
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: 4,
          }}
        >
          {/* Header with back button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 4,
            }}
          >
            <Link href="/app/profile" style={{ textDecoration: "none" }}>
              <IconButton
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Link>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 600,
              }}
            >
              My Posts
            </Typography>
          </Box>

          {/* Posts Content */}
          {user ? (
            <MyPostsTab userId={user.id} />
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "white" }}>Loading...</Typography>
            </Box>
          )}
        </Box>
      </AnimatedWrapper>
    </Box>
  );
}