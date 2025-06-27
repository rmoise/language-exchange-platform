"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import { PostsFeed } from "@/features/home/components/PostsFeed";
import { bookmarkService, BookmarksListResponse } from "@/features/bookmarks/services/bookmarkService";
import { Post as ApiPost } from "@/features/posts/services/postService";
import { useRouter } from "next/navigation";

interface BookmarksListProps {
  user: {
    id: string;
    name: string;
  };
}

export default function BookmarksList({ user }: BookmarksListProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBookmarks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch bookmarked posts by the current user
        const response: BookmarksListResponse = await bookmarkService.getUserBookmarks(50, 0);
        setBookmarks(response.posts);
      } catch (err: any) {
        console.error('Failed to fetch user bookmarks:', err);
        setError(err.message || 'Failed to load bookmarks');
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchUserBookmarks();
    }
  }, [user.id]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "grammar", label: "Grammar Help" },
    { value: "vocabulary", label: "Vocabulary" },
    { value: "pronunciation", label: "Pronunciation" },
    { value: "conversation", label: "Conversation" },
    { value: "writing", label: "Writing" },
  ];

  // Filter bookmarks by category if needed
  const filteredBookmarks = categoryFilter === "all" 
    ? bookmarks 
    : bookmarks.filter(post => post.category === categoryFilter);

  return (
    <Box
      sx={{
        backgroundColor: "rgba(20, 20, 20, 0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 2,
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <BookmarkIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
          <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
            Bookmarks
          </Typography>
          {bookmarks && bookmarks.length > 0 && (
            <Chip 
              label={`${bookmarks.length} saved`}
              size="small"
              sx={{
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                color: "#fbbf24",
                fontSize: "12px",
              }}
            />
          )}
        </Box>

        <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", mb: 2 }}>
          Posts you've saved for later reference
        </Typography>

        {/* Filter */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel 
              sx={{ 
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: "#fbbf24",
                }
              }}
            >
              Filter by category
            </InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Filter by category"
              sx={{
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#fbbf24",
                },
                "& .MuiSvgIcon-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
                "& .MuiInputBase-input": {
                  color: "white",
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    "& .MuiMenuItem-root": {
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(245, 158, 11, 0.2)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(245, 158, 11, 0.3)",
                        "&:hover": {
                          backgroundColor: "rgba(245, 158, 11, 0.4)",
                        }
                      }
                    }
                  }
                }
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Bookmarks Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#f59e0b" }} />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <BookmarkIcon sx={{ fontSize: 64, color: "rgba(255, 100, 100, 0.5)", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "rgba(255, 100, 100, 0.8)", mb: 1 }}>
            Error Loading Bookmarks
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#f59e0b",
              "&:hover": { backgroundColor: "#d97706" },
              textTransform: "none",
            }}
            onClick={() => router.push("/app/home")}
          >
            Explore Posts
          </Button>
        </Box>
      ) : filteredBookmarks && filteredBookmarks.length > 0 ? (
        <PostsFeed 
          initialPosts={filteredBookmarks}
          hasMoreInitial={false}
          nextCursorInitial={undefined}
          categoryFilter={categoryFilter === "all" ? null : categoryFilter}
        />
      ) : (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <BookmarkIcon sx={{ fontSize: 64, color: "rgba(255, 255, 255, 0.3)", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}>
            {categoryFilter === "all" ? "No bookmarks yet" : "No bookmarks in this category"}
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", mb: 3 }}>
            {categoryFilter === "all" 
              ? "Start bookmarking posts you want to save for later!"
              : "Try selecting a different category"
            }
          </Typography>
          {categoryFilter === "all" && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f59e0b",
                "&:hover": { backgroundColor: "#d97706" },
                textTransform: "none",
              }}
              onClick={() => {
                // Navigate to home page to find posts to bookmark
                router.push("/app/home");
              }}
            >
              Explore posts
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}