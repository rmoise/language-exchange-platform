"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
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
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { PostCard } from "@/features/home/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Post as ApiPost } from "@/features/posts/services/postService";
import { transformPost } from "@/features/posts/utils/postAdapter";
import { api } from "@/utils/api";

interface MyPostsTabProps {
  userId: string;
}

export default function MyPostsTab({ userId }: MyPostsTabProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        // Fetch posts by the current user
        const response = await api.get('/posts', {
          params: {
            user_id: userId,
            limit: 50
          }
        });
        const apiPosts: ApiPost[] = response.data.posts || [];
        // Transform API posts to UI posts format
        const transformedPosts = apiPosts.map(transformPost);
        setPosts(transformedPosts);
      } catch (err: any) {
        console.error('Failed to fetch user posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  const filteredPosts = categoryFilter === "all" 
    ? posts 
    : posts.filter(post => post.category?.text?.toLowerCase() === categoryFilter);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "grammar", label: "Grammar Help" },
    { value: "vocabulary", label: "Vocabulary" },
    { value: "pronunciation", label: "Pronunciation" },
    { value: "conversation", label: "Conversation" },
    { value: "writing", label: "Writing" },
  ];

  const handleEditPost = (postId: string, title: string, content: string) => {
    console.log("Edit post:", { postId, title, content });
    // TODO: Update post via API
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    // TODO: Delete post via API
  };

  const handleBookmarkToggle = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked,
          stats: {
            ...post.stats,
            bookmarks: post.isBookmarked 
              ? post.stats.bookmarks - 1 
              : post.stats.bookmarks + 1
          }
        };
      }
      return post;
    }));
  };

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
          <Chip 
            label={`${posts.length} post${posts.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              color: "#a5b4fc",
              fontSize: "12px",
            }}
          />
        </Box>

        {/* Filter */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Filter by category
            </InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "& .MuiSvgIcon-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                },
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

      {/* Posts List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : filteredPosts.length > 0 ? (
        <Stack spacing={3}>
          {filteredPosts.map((post) => (
            <Box
              key={post.id}
              onClick={() => {
                // Navigate to individual post page
                router.push(`/app/posts/${post.id}`);
              }}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: 2,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(99, 102, 241, 0.3)",
                },
              }}
            >
              <PostCard
                post={post}
                onEmojiClick={() => {}}
                onReactionToggle={() => {}}
                replyTexts={{}}
                onReplyTextChange={() => {}}
                onReplySubmit={() => {}}
                replyingTo={null}
                onReplyingToChange={() => {}}
                onReplyClick={() => {}}
                activeReplyFields={{}}
                onNestedReplySubmit={() => {}}
                replyFieldRefs={{ current: {} }}
                onPostReactionToggle={() => {}}
                collapsedReplies={{}}
                onToggleReplyCollapse={() => {}}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onBookmarkToggle={handleBookmarkToggle}
                darkMode={true}
              />
            </Box>
          ))}
        </Stack>
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