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
    console.log('Starting conversation for match:', matchId);
    startTransition(async () => {
      try {
        const conversation = await MatchService.startConversationFromMatch(matchId);
        console.log('Conversation created/found:', conversation);
        
        if (!conversation?.id) {
          console.error('No conversation ID in response:', conversation);
          throw new Error('Invalid conversation response - no ID');
        }
        
        // Call success callback if provided (this triggers refetch in MatchList)
        onSuccess?.(conversation.id);
        
        // Add a longer delay to ensure state updates and refetch are complete
        setTimeout(() => {
          // Navigate to the conversation with query parameter
          console.log('Navigating to:', `/app/conversations?id=${conversation.id}`);
          router.push(`/app/conversations?id=${conversation.id}`);
        }, 800);
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