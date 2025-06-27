"use client";

import { useState } from "react";
import { PostCard } from "@/features/home/components/PostCard";

interface PostCardWrapperProps {
  post: any;
}

export default function PostCardWrapper({ post }: PostCardWrapperProps) {
  // State for PostCard interactions
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; } | null>(null);
  const [activeReplyFields, setActiveReplyFields] = useState<{[key: string]: boolean}>({});
  const [collapsedReplies, setCollapsedReplies] = useState<{[key: string]: boolean}>({});
  const [postState, setPostState] = useState(post);

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
    setPostState((prev: any) => ({
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
    <PostCard
      post={postState}
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
  );
}