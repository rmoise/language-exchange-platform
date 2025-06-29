import React, { useState } from "react";
import { 
    Box, 
    Stack, 
    Typography, 
    Button, 
    Divider,
    Alert,
    Snackbar
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { getAbsoluteImageUrl } from '@/utils/imageUrl';
import UserAvatar from "@/components/ui/UserAvatar";
import { MatchService } from "@/features/matches/matchService";
import { NewUserBadge } from "@/components/ui/NewUserBadge";

// Helper function to map languages to emoji flags
const getLanguageEmojiFlag = (language: string): string => {
  const languageToEmoji: { [key: string]: string } = {
    English: "🇺🇸",
    Spanish: "🇪🇸",
    French: "🇫🇷",
    German: "🇩🇪",
    Italian: "🇮🇹",
    Portuguese: "🇵🇹",
    Russian: "🇷🇺",
    Chinese: "🇨🇳",
    Japanese: "🇯🇵",
    Korean: "🇰🇷",
    Arabic: "🇸🇦",
    Hindi: "🇮🇳",
    Swedish: "🇸🇪",
    Dutch: "🇳🇱",
    Norwegian: "🇳🇴",
    Danish: "🇩🇰",
    Finnish: "🇫🇮",
    Polish: "🇵🇱",
    Czech: "🇨🇿",
    Hungarian: "🇭🇺",
    Romanian: "🇷🇴",
    Bulgarian: "🇧🇬",
    Greek: "🇬🇷",
    Turkish: "🇹🇷",
    Hebrew: "🇮🇱",
    Thai: "🇹🇭",
    Vietnamese: "🇻🇳",
    Indonesian: "🇮🇩",
    Malay: "🇲🇾",
    Filipino: "🇵🇭",
    Ukrainian: "🇺🇦",
    Croatian: "🇭🇷",
    Serbian: "🇷🇸",
    Slovenian: "🇸🇮",
    Slovak: "🇸🇰",
    Estonian: "🇪🇪",
    Latvian: "🇱🇻",
    Lithuanian: "🇱🇹",
  };

  return languageToEmoji[language] || "🌐";
};

interface User {
  id: string;
  name: string;
  profileImage?: string;
  profile_image?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  country?: string;
  location?: string;
  age?: number;
  nativeLanguages?: string[];
  targetLanguages?: string[];
  native_languages?: string[];
  learning_languages?: string[];
  interests?: string[];
  is_verified?: boolean;
  followers_count?: number;
  projects_count?: number;
  isNew?: boolean;
  createdAt?: string;
}

interface ProfileCardProps {
  user: User;
  onFollow?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  matchPercentage?: number;
  distance?: string;
  isFollowing?: boolean;
  hasExistingRequest?: boolean;
  existingRequestId?: string;
  darkMode?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onFollow,
  onViewProfile,
  isFollowing = false,
  hasExistingRequest = false,
  existingRequestId,
  darkMode = false,
}) => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasRequestSent, setHasRequestSent] = useState(hasExistingRequest);
  const [currentRequestId, setCurrentRequestId] = useState<string | undefined>(existingRequestId);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  const [actionCount, setActionCount] = useState(0);
  
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };
  
  // Extract first name from full name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Get profile image using the same approach as ProfileHeader
  const currentProfileImage = user.avatar || user.profileImage || user.profile_image || undefined;
  const displayImage = getAbsoluteImageUrl(currentProfileImage);
  
  // Construct location string
  const locationString = user.city && user.country 
    ? `${user.city}, ${user.country}` 
    : user.location || user.city || user.country || "Zurich, Switzerland";

  // Get first native and target language
  const nativeLanguages = user.nativeLanguages || user.native_languages || ["English"];
  const targetLanguages = user.targetLanguages || user.learning_languages || ["Spanish"];
  const firstNativeLanguage = nativeLanguages[0] || "English";
  const firstTargetLanguage = targetLanguages[0] || "Spanish";

  const profileData = {
    name: getFirstName(user.name || "Jay Vaughn"),
    fullName: user.name || "Jay Vaughn", // Keep full name for other uses
    description: truncateText(
      user.bio || "Friendly language learner seeking conversation practice. I love talking about food, music, movies, and travel adventures.",
      70 // Maximum 70 characters to match HighlightedProfileCard
    ),
    location: locationString,
    profileImage: displayImage,
    languages: {
      fluent: {
        flag: getLanguageEmojiFlag(firstNativeLanguage),
        count: nativeLanguages.length || 1
      },
      learning: {
        flag: getLanguageEmojiFlag(firstTargetLanguage), 
        count: targetLanguages.length || 1
      }
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Rate limiting: Prevent rapid actions
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime;
    const COOLDOWN_MS = 3000; // 3 second cooldown
    const MAX_ACTIONS_PER_MINUTE = 10;
    
    if (timeSinceLastAction < COOLDOWN_MS) {
      setError(`Please wait ${Math.ceil((COOLDOWN_MS - timeSinceLastAction) / 1000)} seconds before trying again`);
      return;
    }
    
    // Check if user has exceeded rate limit
    if (actionCount >= MAX_ACTIONS_PER_MINUTE) {
      setError('Too many requests. Please try again in a minute.');
      return;
    }
    
    setLastActionTime(now);
    setActionCount(prev => prev + 1);
    
    // Reset action count after 1 minute
    setTimeout(() => setActionCount(prev => Math.max(0, prev - 1)), 60000);
    
    if (!isFollowing && !hasRequestSent) {
      // Send connect request immediately
      setIsConnecting(true);
      try {
        const response = await MatchService.sendMatchRequest(user.id);
        console.log('Match request response:', response);
        
        // Store the request ID for potential cancellation
        const requestId = response?.id;
        if (requestId) {
          setCurrentRequestId(requestId);
          console.log('Stored request ID:', requestId);
        } else {
          console.warn('No request ID in response:', response);
        }
        
        setSuccessMessage(`Connection request sent to ${profileData.name}!`);
        setHasRequestSent(true);
        onFollow?.(user.id);
      } catch (err: any) {
        console.error('Failed to send connect request:', err);
        
        // Handle specific error cases
        if (err.response?.status === 409) {
          // Conflict - request already exists
          setError('A connection request already exists with this user.');
          setHasRequestSent(true); // Update UI to show request exists
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to send connection request. Please try again.');
        }
      } finally {
        setIsConnecting(false);
      }
    } else if (hasRequestSent && !isFollowing) {
      // Cancel the pending request
      if (!currentRequestId) {
        console.error('No request ID available for cancellation');
        setError('Unable to cancel request. Please refresh the page.');
        return;
      }
      
      console.log('Canceling request with ID:', currentRequestId);
      setIsConnecting(true);
      try {
        await MatchService.cancelMatchRequest(currentRequestId);
        setHasRequestSent(false);
        setCurrentRequestId(undefined);
        setSuccessMessage('Connection request canceled');
        onFollow?.(user.id);
      } catch (err: any) {
        console.error('Failed to cancel request:', err);
        
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to cancel request. Please try again.');
        }
      } finally {
        setIsConnecting(false);
      }
    } else if (isFollowing) {
      // For disconnecting from an accepted connection
      onFollow?.(user.id);
    }
  };


  const handleCardClick = () => {
    // Use router to navigate to user profile
    router.push(`/app/users/${user.id}`);
    
    // Also call the optional onViewProfile callback if provided
    onViewProfile?.(user.id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Box
        onClick={handleCardClick}
        sx={{
          backgroundColor: darkMode ? "rgba(30, 30, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          width: 322,
          height: 420,
          p: 3.5,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
          boxShadow: darkMode
            ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
            : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
          cursor: 'pointer',
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            backgroundColor: darkMode ? "rgba(30, 30, 30, 0.7)" : "rgba(255, 255, 255, 0.95)",
            boxShadow: darkMode
              ? "0 24px 48px -12px rgba(0, 0, 0, 0.4)"
              : "0 24px 48px -12px rgba(0, 0, 0, 0.12)",
            borderColor: darkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.2)",
            transform: "translate3d(0, -8px, 0)",
          },
        }}
      >
        {/* New User Badge */}
        {user.isNew && <NewUserBadge variant="compact" darkMode={darkMode} />}
        
        <Stack spacing={3.5} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Top section with avatar, name and location - matching HighlightedProfileCard */}
          <Stack direction="row" spacing={2.5} alignItems="center">
            {/* Profile image */}
            <UserAvatar
              user={{ ...user, profileImage: profileData.profileImage || undefined }}
              size={80}
              showOnlineStatus={true}
              showBorderForNonImage={false}
            />
            
            {/* Name and location */}
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Stack spacing={0.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    sx={{
                      color: darkMode ? "#ffffff" : "black",
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {profileData.name}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: darkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    width: 142,
                  }}
                >
                  {profileData.description}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOn sx={{ fontSize: 14, color: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" }} />
                <Typography
                  sx={{
                    color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                    fontSize: "12px",
                  }}
                >
                  {profileData.location}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          
          <Stack spacing={3} alignItems="center">
            {/* Divider between location and languages */}
            <Divider sx={{ 
              width: "100%", 
              borderColor: darkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"
            }} />
            
            {/* Languages section - simplified like HighlightedProfileCard */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                sx={{
                  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "-0.11px",
                }}
              >
                Fluent
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>
                {profileData.languages.fluent.flag}
              </Typography>
              <Typography
                sx={{
                  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "-0.11px",
                }}
              >
                +{profileData.languages.fluent.count}
              </Typography>
              <Box
                sx={{
                  width: "1.5px",
                  height: "11px",
                  backgroundColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
                  mx: 0.5,
                }}
              />
              <Typography
                sx={{
                  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "-0.11px",
                }}
              >
                Learns
              </Typography>
              <Typography sx={{ fontSize: "16px" }}>
                {profileData.languages.learning.flag}
              </Typography>
              <Typography
                sx={{
                  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "-0.11px",
                }}
              >
                +{profileData.languages.learning.count}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      
        {/* Stats section - simplified */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-around",
          px: 2,
        }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ 
              fontSize: "18px", 
              fontWeight: 600, 
              color: darkMode ? "white" : "black",
              lineHeight: 1,
            }}>
              #12
            </Typography>
            <Typography sx={{ 
              fontSize: "10px", 
              color: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mt: 0.5,
            }}>
              Rank
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ 
              fontSize: "18px", 
              fontWeight: 600, 
              color: darkMode ? "white" : "black",
              lineHeight: 1,
            }}>
              Native
            </Typography>
            <Typography sx={{ 
              fontSize: "10px", 
              color: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mt: 0.5,
            }}>
              Level
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ 
              fontSize: "18px", 
              fontWeight: 600, 
              color: darkMode ? "white" : "black",
              lineHeight: 1,
            }}>
              128
            </Typography>
            <Typography sx={{ 
              fontSize: "10px", 
              color: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mt: 0.5,
            }}>
              Sessions
            </Typography>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
          <Button
            onClick={handleFollow}
            variant={hasRequestSent && !isFollowing ? "contained" : "outlined"}
            disabled={isConnecting || (Date.now() - lastActionTime < 3000)}
            sx={{
              width: 129,
              height: 41,
              borderRadius: "14px",
              borderColor: darkMode ? "#555" : "#d6d7dd",
              color: hasRequestSent && !isFollowing 
                ? "#ffffff" 
                : (darkMode ? "#ccc" : "#5e5d66"),
              backgroundColor: hasRequestSent && !isFollowing
                ? (darkMode ? "#6366f1" : "#6366f1")
                : "transparent",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "13.7px",
              letterSpacing: "-0.14px",
              textTransform: "none",
              "&:hover": {
                borderColor: hasRequestSent && !isFollowing 
                  ? "transparent"
                  : (darkMode ? "#666" : "#d6d7dd"),
                backgroundColor: hasRequestSent && !isFollowing
                  ? (darkMode ? "#5855eb" : "#5855eb")
                  : (darkMode ? "rgba(85, 85, 85, 0.1)" : "rgba(214, 215, 221, 0.04)"),
              },
              "&:disabled": {
                borderColor: darkMode ? "#444" : "#e0e0e0",
                color: darkMode ? "#666" : "#aaa",
                backgroundColor: darkMode ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.3)",
              },
            }}
          >
            {isConnecting 
              ? (hasRequestSent ? "Canceling..." : "Sending...") 
              : (hasRequestSent ? "Cancel" : (isFollowing ? "Disconnect" : "Connect"))}
          </Button>

          <Button
            variant="contained"
            sx={{
              width: 129,
              height: 41,
              borderRadius: "14px",
              backgroundColor: darkMode ? "#ffffff" : "#151515",
              color: darkMode ? "#151515" : "#d6d7dd",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "13.7px",
              letterSpacing: "-0.14px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: darkMode ? "#f0f0f0" : "#2a2a2a",
              },
            }}
          >
            View Profile
          </Button>
        </Stack>
      </Box>


      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileCard;