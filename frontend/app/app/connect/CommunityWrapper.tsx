'use client'

import { useCallback } from 'react'
import CommunityTabs from './CommunityTabs'
import { refreshCommunityData } from './actions'

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  city?: string;
  country?: string;
  nativeLanguages: string[];
  targetLanguages: string[];
  bio?: string;
  matchPercentage?: number | null;
  distance?: number;
  isOnline?: boolean;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
  hasExistingRequest?: boolean;
  existingRequestId?: string;
}

interface CommunityWrapperProps {
  users: User[];
  currentUser: User | null;
}

export default function CommunityWrapper({ users, currentUser }: CommunityWrapperProps) {
  const handleRequestUpdate = useCallback(async () => {
    // Call the server action to refresh the data
    await refreshCommunityData()
  }, [])

  return (
    <CommunityTabs 
      users={users} 
      currentUser={currentUser}
      onRequestUpdate={handleRequestUpdate}
    />
  )
}