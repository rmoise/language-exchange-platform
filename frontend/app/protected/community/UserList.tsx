"use client";

import { useState } from "react";
import { Grid, Typography, Button, Box, Alert } from "@mui/material";
import { Person } from "@mui/icons-material";
import { api } from "@/utils/api";
import { ProfileCard } from "@/features/users/components";

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  profileImage?: string;
  bio?: string;
  city?: string;
  country?: string;
  nativeLanguages: string[];
  targetLanguages: string[];
  createdAt: string;
  matchPercentage?: number;
  distance?: number;
  isVerified?: boolean;
  followerCount?: number;
  postCount?: number;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async (userId: string) => {
    setError(null);

    try {
      await api.post("/matches/requests", { recipientId: userId });
      setSentRequests((prev) => new Set(prev).add(userId));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send match request");
    }
  };

  if (users.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Person
          sx={{
            fontSize: 48,
            color: "text.secondary",
            mb: 3,
            opacity: 0.6,
          }}
        />
        <Typography
          variant="h5"
          color="text.primary"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          No language partners found
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400, mx: "auto" }}
        >
          Try adjusting your search filters or check back later for new language
          exchange partners.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 0 } }}>
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "error.light",
            "& .MuiAlert-icon": {
              color: "error.main",
            },
          }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "2rem" },
            color: "white",
          }}
        >
          Language Partners
        </Typography>
        <Typography
          variant="body1"
          color="rgba(255, 255, 255, 0.7)"
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          Found {users.length} language partner{users.length !== 1 ? "s" : ""}{" "}
          ready to connect
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {users.map((user) => {
          const requestSent = sentRequests.has(user.id);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
              <ProfileCard
                user={{
                  ...user,
                  bio:
                    user.bio ||
                    `Language enthusiast learning ${user.targetLanguages?.join(
                      ", "
                    )} and teaching ${user.nativeLanguages?.join(", ")}.`,
                  is_verified: true,
                }}
                onFollow={handleSendRequest}
                isFollowing={requestSent}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
