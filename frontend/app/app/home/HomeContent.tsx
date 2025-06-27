"use client";

import React, { useRef, useState } from "react";
import { Box, Stack } from "@mui/material";
import {
  CommunityHeroMerged,
  mockUserProgress,
} from "@/features/home";
import { PostsFeed, PostsFeedRef } from "@/features/home/components/PostsFeed";
import { AskMembersQuestion } from "@/features/posts";
import { CompactScheduler } from "@/features/booking/components/CompactScheduler";
import { SidebarLearningWidget } from "@/features/flashcards";
import { CategoriesCard } from "./CategoriesCard";
import { LearningPrompt } from "./LearningPrompt";
import GlobalInteractiveComponents from "./GlobalInteractiveComponents";
import { Post as ApiPost, postService } from "@/features/posts/services/postService";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";

interface HomeContentProps {
  initialPosts: ApiPost[];
  hasMoreInitial: boolean;
  nextCursorInitial: number | null;
  isAuthenticated: boolean;
}

export default function HomeContent({ 
  initialPosts, 
  hasMoreInitial, 
  nextCursorInitial,
  isAuthenticated 
}: HomeContentProps) {
  const router = useRouter();
  const postsFeedRef = useRef<PostsFeedRef>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const user = useAppSelector((state) => state.auth.user);

  const handleCreatePost = async (title: string, text: string, category: string) => {
    try {
      // Validate and trim title to max 100 chars
      let processedTitle = title.trim();
      if (processedTitle.length > 100) {
        processedTitle = processedTitle.substring(0, 100);
      }
      
      const categoryEmoji = getCategoryEmoji(category);
      
      const postData = {
        title: processedTitle,
        content: text,
        category,
        category_emoji: categoryEmoji,
      };
      
      const newPost = await postService.createPost(postData);
      
      // Add the new post to the feed without refreshing
      if (postsFeedRef.current) {
        postsFeedRef.current.addPost(newPost);
      }
    } catch (error: any) {
      console.error('Failed to create post:', error);
      console.error('Error response:', error.response?.data);
      // Just log the error, don't show alert
      console.error('Post creation error:', error.response?.data?.error || 'Failed to create post');
    }
  };

  const getCategoryEmoji = (category: string) => {
    const categoryMap: Record<string, string> = {
      general: "💡",
      grammar: "📝",
      vocabulary: "📚",
      pronunciation: "🗣️",
      conversation: "💬",
      writing: "✍️",
      culture: "🌍",
      resources: "📖",
    };
    return categoryMap[category] || "💡";
  };

  return (
    <>
      <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, lg: 3 }, py: { xs: 2, lg: 3 } }}>
        {/* Merged Community Banner and User Progress */}
        <CommunityHeroMerged
          userProgress={{
            ...mockUserProgress,
            username: user?.name || 'there',
            avatar: user?.profileImage || user?.avatar || user?.profile_picture,
          }}
          memberCount={26905}
        />
      </Box>
      
      <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, lg: 3 } }}>

      {/* Main Content Grid */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mt: 2 }}>
        {/* Left Sidebar */}
        <Box sx={{ 
          width: { xs: '100%', lg: 280, xl: 320 }, 
          flexShrink: 0, 
          display: { xs: 'none', lg: 'block' } 
        }}>
          <CategoriesCard 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          <Box sx={{ mt: 3 }}>
            <CompactScheduler />
          </Box>
          <Box sx={{ mt: 3 }}>
            {isAuthenticated ? (
              <SidebarLearningWidget />
            ) : (
              <LearningPrompt />
            )}
          </Box>
        </Box>

        {/* Main Content - Center Feed */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          px: { xs: 0, lg: 3 }
        }}>
          <Box sx={{ mb: 3 }}>
            <AskMembersQuestion onPost={handleCreatePost} />
          </Box>
          <PostsFeed 
            ref={postsFeedRef}
            initialPosts={initialPosts}
            hasMoreInitial={hasMoreInitial}
            nextCursorInitial={nextCursorInitial ?? undefined}
            categoryFilter={selectedCategory}
          />
        </Box>
      </Stack>
      
        {/* Global Interactive Components */}
        <GlobalInteractiveComponents />
      </Box>
    </>
  );
}