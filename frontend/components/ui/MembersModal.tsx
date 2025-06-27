"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import SharedModal from "./SharedModal";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  city?: string;
  country?: string;
  nativeLanguages?: string[];
  targetLanguages?: string[];
  bio?: string;
  isOnline?: boolean;
  lastActive?: string;
}

interface MembersModalProps {
  open: boolean;
  onClose: () => void;
  initialUsers?: User[];
  totalCount?: number;
}

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const MembersModal: React.FC<MembersModalProps> = ({
  open,
  onClose,
  initialUsers = [],
  totalCount = 26899,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [displayCount, setDisplayCount] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Generate mock users if none provided
  useEffect(() => {
    if (users.length === 0 && open) {
      generateMockUsers();
    }
  }, [open]);

  const generateMockUsers = () => {
    const mockUsers: User[] = [];
    const languages = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Italian", "Portuguese", "Russian"];
    const cities = ["New York", "London", "Paris", "Tokyo", "Berlin", "Madrid", "Rome", "Beijing", "Seoul", "Moscow"];
    const countries = ["USA", "UK", "France", "Japan", "Germany", "Spain", "Italy", "China", "South Korea", "Russia"];

    for (let i = 0; i < 100; i++) {
      mockUsers.push({
        id: `user-${i}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        city: cities[Math.floor(Math.random() * cities.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        nativeLanguages: [languages[Math.floor(Math.random() * languages.length)]],
        targetLanguages: [languages[Math.floor(Math.random() * languages.length)]],
        bio: "Language enthusiast looking to practice and make friends!",
        isOnline: Math.random() > 0.5,
        lastActive: "2 hours ago",
      });
    }
    setUsers(mockUsers);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setDisplayCount(20);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    debouncedSearch(event.target.value);
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      // Filter users based on search query
      if (query) {
        const filtered = users.filter(
          (user) =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.city?.toLowerCase().includes(query.toLowerCase()) ||
            user.country?.toLowerCase().includes(query.toLowerCase()) ||
            user.nativeLanguages?.some((lang) =>
              lang.toLowerCase().includes(query.toLowerCase())
            ) ||
            user.targetLanguages?.some((lang) =>
              lang.toLowerCase().includes(query.toLowerCase())
            )
        );
        setUsers(filtered);
      } else if (initialUsers.length > 0) {
        setUsers(initialUsers);
      } else {
        generateMockUsers();
      }
    }, 300),
    [users, initialUsers]
  );

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + 20, users.length));
  }, [users.length]);

  const handleViewProfile = (userId: string) => {
    router.push(`/app/profile/${userId}`);
    onClose();
  };

  const handleViewAllMembers = () => {
    router.push("/app/connect");
    onClose();
  };

  const filteredUsers = activeTab === 0 
    ? users 
    : users.filter(user => user.isOnline);

  const displayedUsers = filteredUsers.slice(0, displayCount);

  useEffect(() => {
    setHasMore(displayCount < filteredUsers.length);
  }, [displayCount, filteredUsers.length]);

  return (
    <SharedModal
      title="Community Members"
      open={open}
      onClose={onClose}
      maxWidth="md"
      contentSx={{
        height: "70vh",
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
    >
      {/* Header with stats */}
      <Box sx={{ p: 2.5, borderBottom: "1px solid #374151" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
            {totalCount.toLocaleString()} Total Members
          </Typography>
          <Chip
            label={`${users.filter(u => u.isOnline).length} Online`}
            color="success"
            size="small"
            sx={{ backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}
          />
        </Stack>

        {/* Search bar */}
        <TextField
          fullWidth
          placeholder="Search by name, location, or language..."
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid #374151",
                borderRadius: 1,
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              },
            },
          }}
        />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            mt: 2,
            "& .MuiTabs-indicator": {
              backgroundColor: "#6366f1",
            },
            "& .MuiTab-root": {
              color: "#9ca3af",
              textTransform: "none",
              "&.Mui-selected": {
                color: "#6366f1",
              },
            },
          }}
        >
          <Tab label="All Members" />
          <Tab label="Online Now" />
        </Tabs>
      </Box>

      {/* Members list */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {displayedUsers.length > 0 ? (
          <>
            <Stack spacing={1.5}>
              {displayedUsers.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(99, 102, 241, 0.3)",
                    },
                  }}
                  onClick={() => handleViewProfile(user.id)}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: user.avatar ? undefined : "#6366f1",
                        }}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                      {user.isOnline && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            bgcolor: "#22c55e",
                            borderRadius: "50%",
                            border: "2px solid #000",
                          }}
                        />
                      )}
                    </Box>
                    <Box>
                      <Typography sx={{ color: "white", fontWeight: 500 }}>
                        {user.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {user.city && user.country && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LocationIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
                            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                              {user.city}, {user.country}
                            </Typography>
                          </Stack>
                        )}
                        {user.nativeLanguages && user.nativeLanguages.length > 0 && (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LanguageIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
                            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                              {user.nativeLanguages[0]}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "#6b7280" }}>
                    {user.isOnline ? "Online" : user.lastActive}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Load more */}
            {hasMore && (
              <Box ref={loadMoreRef} sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  sx={{
                    color: "white",
                    borderColor: "#374151",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                      borderColor: "#6366f1",
                    },
                  }}
                >
                  Load More
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ fontSize: "3rem", mb: 2 }}>🔍</Typography>
            <Typography sx={{ color: "white", fontWeight: 500, mb: 1 }}>
              No members found
            </Typography>
            <Typography sx={{ color: "#9ca3af" }}>
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid #374151" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleViewAllMembers}
          sx={{
            backgroundColor: "#6366f1",
            color: "white",
            textTransform: "none",
            py: 1.5,
            "&:hover": {
              backgroundColor: "#5855eb",
            },
          }}
        >
          View All Members in Community
        </Button>
      </Box>
    </SharedModal>
  );
};

export default MembersModal;