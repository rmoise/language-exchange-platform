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
  Bookmark as BookmarkIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { PostCard } from "@/features/home/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface BookmarksTabProps {
  userId: string;
}

export default function BookmarksTab({ userId }: BookmarksTabProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Mock bookmarked posts - replace with actual API call
  const mockBookmarks = [
    {
      id: "bookmark-1",
      title: "Best resources for learning German grammar",
      content: {
        greeting: "I've been collecting the best German grammar resources.",
        paragraphs: ["After studying German for 2 years, I wanted to share some of the most helpful grammar resources I've found. These have really helped me understand the complexities of German cases and verb conjugations."]
      },
      category: { emoji: "📝", text: "Grammar" },
      user: {
        name: "Maria Schmidt",
        initials: "MS",
        department: "German Teacher",
        timeAgo: "3 days ago",
        avatarColor: "#f59e0b",
        id: "user-123",
      },
      stats: { bookmarks: 45 },
      isBookmarked: true,
      askingFor: "Resource sharing",
      reactions: [
        { emoji: "📚", count: 22, hasReacted: true, users: ["You"] },
        { emoji: "👍", count: 18, hasReacted: false, users: [] },
      ],
      replies: [],
      bookmarkedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "bookmark-2",
      title: "Common mistakes in Spanish pronunciation",
      content: {
        greeting: "Let me help you avoid these common Spanish pronunciation errors.",
        paragraphs: ["As a native Spanish speaker, I've noticed several pronunciation mistakes that English speakers commonly make. Here are the most important ones to watch out for and how to fix them."]
      },
      category: { emoji: "🗣️", text: "Pronunciation" },
      user: {
        name: "Carlos Rodriguez",
        initials: "CR",
        department: "Spanish Tutor",
        timeAgo: "1 week ago",
        avatarColor: "#10b981",
        id: "user-456",
      },
      stats: { bookmarks: 67 },
      isBookmarked: true,
      askingFor: "Pronunciation tips",
      reactions: [
        { emoji: "🎯", count: 31, hasReacted: false, users: [] },
        { emoji: "👨‍🏫", count: 15, hasReacted: true, users: ["You"] },
      ],
      replies: [],
      bookmarkedAt: "2024-01-12T14:20:00Z",
    }
  ];

  useEffect(() => {
    // TODO: Fetch user's bookmarked posts from API
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBookmarks(mockBookmarks);
      setLoading(false);
    }, 800);
  }, [userId]);

  const filteredBookmarks = categoryFilter === "all" 
    ? bookmarks 
    : bookmarks.filter(post => post.category.text.toLowerCase() === categoryFilter);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "grammar", label: "Grammar Help" },
    { value: "vocabulary", label: "Vocabulary" },
    { value: "pronunciation", label: "Pronunciation" },
    { value: "conversation", label: "Conversation" },
    { value: "writing", label: "Writing" },
  ];

  const handleRemoveBookmark = (postId: string) => {
    setBookmarks(prev => prev.filter(post => post.id !== postId));
    // TODO: Remove bookmark via API
  };

  const handleBookmarkToggle = (postId: string) => {
    // This will remove the bookmark since we're in bookmarks view
    handleRemoveBookmark(postId);
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

      {/* Bookmarks List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#f59e0b" }} />
        </Box>
      ) : filteredBookmarks.length > 0 ? (
        <Stack spacing={3}>
          {filteredBookmarks.map((post) => (
            <Box 
              key={post.id} 
              onClick={() => {
                // Navigate to individual post page
                router.push(`/app/posts/${post.id}`);
              }}
              sx={{ 
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: 2,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(245, 158, 11, 0.3)",
                },
              }}
            >
              {/* Bookmark indicator */}
              <Box
                sx={{
                  position: "absolute",
                  top: -8,
                  right: 16,
                  zIndex: 1,
                  backgroundColor: "#f59e0b",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <BookmarkIcon sx={{ fontSize: 12 }} />
                Saved
              </Box>
              
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
                onBookmarkToggle={handleBookmarkToggle}
                darkMode={true}
              />
            </Box>
          ))}
        </Stack>
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
                window.location.href = "/app/home";
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