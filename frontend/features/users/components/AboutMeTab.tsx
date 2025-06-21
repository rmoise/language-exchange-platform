"use client";

import React from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  Grid,
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";

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

interface AboutMeTabProps {
  user: User;
}

export default function AboutMeTab({ user }: AboutMeTabProps) {
  return (
    <Box>
      {/* Profile Information Card */}
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
        <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={user?.profileImage}
              sx={{
                width: 120,
                height: 120,
                backgroundColor: "#6366f1",
                fontSize: "2rem",
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </Avatar>
            <IconButton
              sx={{
                position: "absolute",
                bottom: -8,
                right: -8,
                backgroundColor: "#6366f1",
                color: "white",
                width: 32,
                height: 32,
                "&:hover": { backgroundColor: "#5855eb" },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "grid", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    minWidth: 100,
                    fontSize: "0.9rem",
                  }}
                >
                  Name
                </Typography>
                <Typography
                  sx={{ color: "white", fontSize: "1.1rem", flex: 1 }}
                >
                  {user?.name || "Not provided"}
                </Typography>
                <IconButton size="small" sx={{ color: "#6366f1" }}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    minWidth: 100,
                    fontSize: "0.9rem",
                  }}
                >
                  Email
                </Typography>
                <Typography
                  sx={{ color: "white", fontSize: "1.1rem", flex: 1 }}
                >
                  {user?.email || "Not provided"}
                </Typography>
                <IconButton size="small" sx={{ color: "#6366f1" }}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    minWidth: 100,
                    fontSize: "0.9rem",
                  }}
                >
                  Location
                </Typography>
                <Typography
                  sx={{ color: "white", fontSize: "1.1rem", flex: 1 }}
                >
                  {user?.city && user?.country
                    ? `${user.city}, ${user.country}`
                    : "Not provided"}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: "#6366f1",
                    textTransform: "none",
                    fontSize: "0.85rem",
                  }}
                >
                  Update
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* About Me Questions */}
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
            About me
          </Typography>
          <IconButton sx={{ color: "#6366f1" }}>
            <EditIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                mb: 1,
                fontWeight: 500,
              }}
            >
              What do you like to talk about?
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.95rem" }}
            >
              {user?.interests?.join(", ") || "Movies, Music and Politics"}
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                mb: 1,
                fontWeight: 500,
              }}
            >
              What's your ideal language exchange partner like?
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.95rem" }}
            >
              Fun, funny and outgoing
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                mb: 1,
                fontWeight: 500,
              }}
            >
              What are your language learning goals?
            </Typography>
            <Typography
              sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.95rem" }}
            >
              {user?.bio ||
                "I hope to be able to understand and speak new languages"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Photos Section */}
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
          sx={{ color: "white", fontWeight: 600, mb: 3 }}
        >
          Photos
        </Typography>

        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
              <Box
                sx={{
                  aspectRatio: "1",
                  border: "2px dashed rgba(255, 255, 255, 0.3)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                  },
                }}
              >
                <AddIcon
                  sx={{
                    fontSize: 32,
                    color: "rgba(255, 255, 255, 0.4)",
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
