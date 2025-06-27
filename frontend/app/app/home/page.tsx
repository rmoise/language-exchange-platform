import React from "react";
import { cookies } from 'next/headers';
import { serverPostService } from "@/features/posts/services/postService.server";
import HomeContent from "./HomeContent";

// Server Component - fetches initial data
export default async function HomePage() {
  // Fetch initial posts on the server
  let initialPosts: any[] = [];
  let hasMoreInitial = false;
  let nextCursorInitial: number | null = null;
  
  try {
    const response = await serverPostService.listPosts({ 
      sort: 'created_at',
      limit: 20 
    });
    initialPosts = response?.posts || [];
    hasMoreInitial = response?.has_more || false;
    nextCursorInitial = response?.next_cursor || null;
  } catch (error) {
    console.error('Failed to fetch initial posts:', error);
    // If the backend is not available, use empty array
    initialPosts = [];
    hasMoreInitial = false;
    nextCursorInitial = null;
  }
  
  // Get auth token to check if user is logged in
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isAuthenticated = !!token;

  return (
    <HomeContent
      initialPosts={initialPosts}
      hasMoreInitial={hasMoreInitial}
      nextCursorInitial={nextCursorInitial}
      isAuthenticated={isAuthenticated}
    />
  );
}

