"use client";

import React, { useState, useEffect } from "react";
import MembersModal from "@/components/ui/MembersModal";
import { EmojiPicker } from "@/features/emoji";
import { TextSelectionHandler } from "@/features/flashcards";
import { ImageTranslationFAB, ImageTranslationModal } from "@/features/image-translation";
import { CreateSessionModal } from "@/features/booking/components/CreateSessionModal";
import { getLanguageCode } from "@/utils/languageMapping";
import { useAuth } from "@/hooks/useAuth";
import { useTheme as useCustomTheme } from "@/contexts/ThemeContext";

export default function GlobalInteractiveComponents() {
  const { mode } = useCustomTheme();
  const { user } = useAuth();
  
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [imageTranslationOpen, setImageTranslationOpen] = useState(false);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');

  const handleEmojiClose = () => {
    setEmojiPickerAnchor(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    // This will be handled by the PostsFeed component
    handleEmojiClose();
  };

  const handleCreateSession = async (session: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  // Store these functions globally so other components can access them
  useEffect(() => {
    (window as any).__openMembersModal = () => setMembersModalOpen(true);
    (window as any).__openCreateSession = (date?: Date, time?: string) => {
      if (date) setSelectedDate(date);
      if (time) setSelectedTime(time);
      setCreateSessionOpen(true);
    };
    return () => {
      delete (window as any).__openMembersModal;
      delete (window as any).__openCreateSession;
    };
  }, []);

  return (
    <>
      {/* Members Modal */}
      <MembersModal 
        open={membersModalOpen} 
        onClose={() => setMembersModalOpen(false)} 
      />
      
      {/* Emoji Picker */}
      <EmojiPicker
        anchorEl={emojiPickerAnchor}
        open={Boolean(emojiPickerAnchor)}
        onClose={handleEmojiClose}
        onSelectEmoji={handleEmojiSelect}
      />
      
      {/* Text Selection Handler for word capture */}
      <TextSelectionHandler 
        darkMode={mode === "dark"}
        targetLanguage={getLanguageCode(user?.targetLanguages?.[0] || "en")}
        nativeLanguage={getLanguageCode(user?.nativeLanguages?.[0] || "es")}
      />
      
      {/* Image Translation FAB */}
      <ImageTranslationFAB 
        onClick={() => setImageTranslationOpen(true)}
        darkMode={mode === "dark"}
      />
      
      {/* Image Translation Modal */}
      <ImageTranslationModal
        open={imageTranslationOpen}
        onClose={() => setImageTranslationOpen(false)}
        darkMode={mode === "dark"}
        nativeLanguage={getLanguageCode(user?.nativeLanguages?.[0] || "en")}
      />
      
      {/* Create Session Modal */}
      <CreateSessionModal
        open={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onCreateSession={handleCreateSession}
        darkMode={mode === "dark"}
      />
    </>
  );
}