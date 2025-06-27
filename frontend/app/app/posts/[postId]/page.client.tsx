"use client";

import { notFound, useRouter } from "next/navigation";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { PostCard } from "@/features/home/components/PostCard";
import AnimatedWrapper from "../../profile/AnimatedWrapper";
import { useEffect, useState } from "react";

// Mock data - replace with actual API call
const mockPosts = [
  {
    id: "user-post-1",
    title: "How do you say 'good morning' in different Spanish dialects?",
    content: {
      greeting: "I'm learning Spanish and noticed that greetings vary by region.",
      paragraphs: ["I've been studying Spanish for 6 months now and I'm curious about regional differences in basic greetings like 'good morning'. I know 'buenos días' is standard, but are there other variations used in different countries or regions?"]
    },
    category: { emoji: "🗣️", text: "Pronunciation" },
    user: {
      name: "You",
      initials: "YO",
      department: "Language Learner", 
      timeAgo: "2 hours ago",
      avatarColor: "#6366f1",
      id: "current-user",
    },
    stats: { bookmarks: 12 },
    isBookmarked: false,
    askingFor: "Regional variations",
    reactions: [
      { emoji: "👍", count: 8, hasReacted: false, users: [] },
      { emoji: "🤔", count: 3, hasReacted: true, users: ["You"] },
    ],
    replies: [
      {
        id: "reply-1",
        user: {
          name: "Maria Rodriguez",
          initials: "MR",
          avatarColor: "#f59e0b",
        },
        content: "In Mexico we say 'buenos días' but in some regions you might hear 'buen día' as well!",
        timeAgo: "1 hour ago",
        reactions: [
          { emoji: "👍", count: 3, hasReacted: false, users: [] },
        ],
      },
      {
        id: "reply-2", 
        user: {
          name: "Carlos Mendez",
          initials: "CM",
          avatarColor: "#10b981",
        },
        content: "In Argentina, we often use 'buen día' more than 'buenos días' in casual conversation.",
        timeAgo: "45 minutes ago",
        reactions: [
          { emoji: "💡", count: 2, hasReacted: true, users: ["You"] },
        ],
      }
    ],
  },
  {
    id: "user-post-2", 
    title: "Looking for a French conversation partner",
    content: {
      greeting: "Bonjour! I'm looking to practice my French conversation skills.",
      paragraphs: ["I've been studying French for about a year and feel comfortable with basic grammar and vocabulary, but I really need to practice speaking. Would love to find someone who's native French or fluent to have regular conversation practice with!"]
    },
    category: { emoji: "💬", text: "Conversation" },
    user: {
      name: "You",
      initials: "YO",
      department: "Language Learner",
      timeAgo: "1 day ago", 
      avatarColor: "#6366f1",
      id: "current-user",
    },
    stats: { bookmarks: 5 },
    isBookmarked: false,
    askingFor: "Conversation partner",
    reactions: [
      { emoji: "👋", count: 6, hasReacted: false, users: [] },
    ],
    replies: [],
  },
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
  }
];

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter();
  const [postId, setPostId] = useState<string | null>(null);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for PostCard interactions
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; } | null>(null);
  const [activeReplyFields, setActiveReplyFields] = useState<{[key: string]: boolean}>({});
  const [collapsedReplies, setCollapsedReplies] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.postId;
      setPostId(id);
      
      // Find the post - in real app, this would be an API call
      const foundPost = mockPosts.find(p => p.id === id);
      setPost(foundPost);
      setLoading(false);
      
      if (!foundPost) {
        notFound();
      }
    };
    
    getParams();
  }, [params]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center", 
          justifyContent: "center",
        }}
      >
        <Typography sx={{ color: "white" }}>Loading post...</Typography>
      </Box>
    );
  }

  if (!post) {
    notFound();
  }

  // Handler functions for PostCard
  const handleReplyTextChange = (postId: string, text: string) => {
    setReplyTexts(prev => ({ ...prev, [postId]: text }));
  };

  const handleReplySubmit = (postId: string) => {
    const text = replyTexts[postId]?.trim();
    if (!text) return;
    
    // Add reply logic here
    console.log("Reply submitted:", { postId, text });
    setReplyTexts(prev => ({ ...prev, [postId]: "" }));
  };

  const handleReplyClick = (postId: string) => {
    setActiveReplyFields(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleToggleReplyCollapse = (postId: string) => {
    setCollapsedReplies(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleBookmarkToggle = () => {
    setPost((prev: any) => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
      stats: {
        ...prev.stats,
        bookmarks: prev.isBookmarked 
          ? prev.stats.bookmarks - 1 
          : prev.stats.bookmarks + 1
      }
    }));
  };

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
            maxWidth: "800px",
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
            <IconButton
              onClick={() => router.back()}
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
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 600,
              }}
            >
              Post
            </Typography>
          </Box>

          {/* Post Content */}
          <Box
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid #374151",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <PostCard
              post={post}
              onEmojiClick={() => {}}
              onReactionToggle={() => {}}
              replyTexts={replyTexts}
              onReplyTextChange={handleReplyTextChange}
              onReplySubmit={handleReplySubmit}
              replyingTo={replyingTo}
              onReplyingToChange={setReplyingTo}
              onReplyClick={handleReplyClick}
              activeReplyFields={activeReplyFields}
              onNestedReplySubmit={() => {}}
              replyFieldRefs={{ current: {} }}
              onPostReactionToggle={() => {}}
              collapsedReplies={collapsedReplies}
              onToggleReplyCollapse={handleToggleReplyCollapse}
              onEditPost={(postId, title, content) => {
                console.log("Edit post:", { postId, title, content });
              }}
              onDeletePost={(postId) => {
                console.log("Delete post:", postId);
              }}
              onBookmarkToggle={handleBookmarkToggle}
              darkMode={true}
            />
          </Box>
        </Box>
      </AnimatedWrapper>
    </Box>
  );
}