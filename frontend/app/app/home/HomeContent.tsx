"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, Stack } from "@mui/material";
import {
  CommunityHeroMerged,
} from "@/features/home";
import { CommunityHeroSkeleton } from "@/features/home/components/CommunityHeroSkeleton";
import { PostsFeed, PostsFeedRef } from "@/features/home/components/PostsFeed";
import { AskMembersQuestion, AskMembersQuestionSkeleton } from "@/features/posts";
import { CompactScheduler } from "@/features/booking/components/CompactScheduler";
import { SidebarLearningWidget } from "@/features/flashcards";
import { CategoriesCard } from "./CategoriesCard";
import { LearningPrompt } from "./LearningPrompt";
import GlobalInteractiveComponents from "./GlobalInteractiveComponents";
import { Post as ApiPost, postService } from "@/features/posts/services/postService";
import { useCreatePostMutation } from "@/features/posts/postsApi";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useGamification } from "@/features/gamification";
import { setGamificationData } from "@/features/gamification/gamificationSlice";
import type { UserProgress } from "@/features/home/types/gamification";

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
  const dispatch = useAppDispatch();
  const postsFeedRef = useRef<PostsFeedRef>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const { gamificationData, isLoadingData } = useGamification();
  const [createPost] = useCreatePostMutation();
  
  // Ensure client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Store gamification data in Redux when it's loaded
  useEffect(() => {
    if (gamificationData) {
      console.log('Gamification data loaded:', gamificationData);
      console.log('Community stats:', gamificationData.communityStats);
      console.log('Total members:', gamificationData.communityStats?.totalMembers);
      dispatch(setGamificationData(gamificationData));
    }
  }, [gamificationData, dispatch]);
  
  // Create UserProgress object from gamification data
  const userProgress: UserProgress | null = gamificationData ? {
    userId: gamificationData.user?.id || '',
    username: gamificationData.user?.name || 'there',
    avatar: gamificationData.user?.profileImage,
    level: gamificationData.level || 1,
    currentXP: gamificationData.totalXP || 0,
    xpToNextLevel: gamificationData.xpToNextLevel || 100,
    totalXP: gamificationData.totalXP || 0,
    currentStreak: gamificationData.currentStreak || 0,
    longestStreak: gamificationData.longestStreak || 0,
    rank: gamificationData.rank || 0,
    badges: gamificationData.badges ? gamificationData.badges.map(ub => ub.badge!).filter(Boolean) : [],
    stats: {
      totalConnections: gamificationData.stats?.totalConnections || 0,
      sessionsCompleted: gamificationData.stats?.sessionsCompleted || 0,
      wordsLearned: gamificationData.stats?.wordsLearned || 0,
      minutesPracticed: gamificationData.stats?.minutesPracticed || 0,
      messagesExchanged: gamificationData.stats?.messagesExchanged || 0,
      helpfulReplies: gamificationData.stats?.helpfulReplies || 0,
    },
    weeklyXP: gamificationData.stats?.weeklyXP || 0,
    monthlyXP: gamificationData.stats?.monthlyXP || 0,
  } : null;

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
      
      // Use RTK Query mutation which will automatically invalidate cache
      const result = await createPost(postData).unwrap();
      
      // Add the new post to the feed without refreshing
      if (postsFeedRef.current && result) {
        postsFeedRef.current.addPost(result);
      }
    } catch (error: any) {
      console.error('Failed to create post:', error);
      console.error('Error response:', error.data);
      // Just log the error, don't show alert
      console.error('Post creation error:', error.data?.error || 'Failed to create post');
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
        {isAuthenticated && mounted ? (
          isLoadingData && !userProgress ? (
            <CommunityHeroSkeleton />
          ) : userProgress ? (
            <CommunityHeroMerged
              userProgress={userProgress}
              memberCount={gamificationData?.communityStats?.totalMembers || 0}
            />
          ) : null
        ) : null}
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
            {mounted && isAuthenticated ? (
              <SidebarLearningWidget />
            ) : mounted ? (
              <LearningPrompt />
            ) : null}
          </Box>
        </Box>

        {/* Main Content - Center Feed */}
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          px: { xs: 0, lg: 3 }
        }}>
          <Box sx={{ mb: 3 }}>
            {mounted && isAuthenticated && !isLoadingData ? (
              <AskMembersQuestion onPost={handleCreatePost} />
            ) : mounted && isAuthenticated ? (
              <AskMembersQuestionSkeleton />
            ) : null}
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