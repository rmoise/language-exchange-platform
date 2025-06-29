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
  Article as ArticleIcon,
} from "@mui/icons-material";
import { PostsFeed } from "@/features/home/components/PostsFeed";
import { postService, Post as ApiPost } from "@/features/posts/services/postService";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";

interface PostsListProps {
  user: {
    id: string;
    name: string;
  };
}

export default function PostsList({ user }: PostsListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch posts by the current user
        const response = await api.get('/posts', {
          params: {
            user_id: user.id,
            limit: 50
          }
        });
        setPosts(response.data.posts || []);
      } catch (err: any) {
        console.error('Failed to fetch user posts:', err);
        setError('Failed to load your posts. Please try again.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchUserPosts();
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

  // Filter posts by category if needed
  const filteredPosts = categoryFilter === "all" 
    ? posts 
    : posts.filter(post => post.category === categoryFilter);

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
          <ArticleIcon sx={{ color: "#6366f1", fontSize: 28 }} />
          <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
            My Posts
          </Typography>
        </Box>

        <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", mb: 2 }}>
          All your posts and contributions
        </Typography>

        {/* Filter */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel 
              sx={{ 
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: "#a5b4fc",
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
                  borderColor: "#a5b4fc",
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
                        backgroundColor: "rgba(99, 102, 241, 0.2)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(99, 102, 241, 0.3)",
                        "&:hover": {
                          backgroundColor: "rgba(99, 102, 241, 0.4)",
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

      {/* Posts Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <ArticleIcon sx={{ fontSize: 64, color: "rgba(255, 100, 100, 0.5)", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "rgba(255, 100, 100, 0.8)", mb: 1 }}>
            Error Loading Posts
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#6366f1",
              "&:hover": { backgroundColor: "#5a5cf8" },
              textTransform: "none",
            }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Box>
      ) : filteredPosts.length > 0 ? (
        <PostsFeed 
          initialPosts={filteredPosts}
          hasMoreInitial={false}
          nextCursorInitial={undefined}
          categoryFilter={categoryFilter === "all" ? null : categoryFilter}
        />
      ) : (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <ArticleIcon sx={{ fontSize: 64, color: "rgba(255, 255, 255, 0.3)", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}>
            {categoryFilter === "all" ? "No posts yet" : "No posts in this category"}
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", mb: 3 }}>
            {categoryFilter === "all" 
              ? "Start sharing your language learning journey!"
              : "Try selecting a different category"
            }
          </Typography>
          {categoryFilter === "all" && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#6366f1",
                "&:hover": { backgroundColor: "#5a5cf8" },
                textTransform: "none",
              }}
              onClick={() => {
                // Navigate to home page to create post
                router.push("/app/home");
              }}
            >
              Create your first post
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}