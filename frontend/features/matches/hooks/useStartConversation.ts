'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MatchService } from '../matchService';

interface UseStartConversationOptions {
  onError?: (error: string) => void;
  onSuccess?: (conversationId: string) => void;
}

export const useStartConversation = (options: UseStartConversationOptions = {}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const { onError, onSuccess } = options;

  const startConversation = async (matchId: string) => {
    startTransition(async () => {
      try {
        const conversation = await MatchService.startConversationFromMatch(matchId);
        
        // Call success callback if provided
        onSuccess?.(conversation.id);
        
        // Navigate to the conversation
        router.push(`/protected/conversations/${conversation.id}` as any);
      } catch (error) {
        console.error('Failed to start conversation:', error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to start conversation. Please try again.';
        
        onError?.(errorMessage);
      }
    });
  };

  return {
    startConversation,
    isPending,
  };
};