"use client";

import {
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  Modal,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
  Stack,
  Checkbox,
  FormControlLabel,
  Divider,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LocationOn as LocationIcon,
  PhotoCamera as PhotoCameraIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import EditIconButton from "@/features/users/components/EditIconButton";
import AnimatedWrapper from "./AnimatedWrapper";
import ProfileHeader from "./ProfileHeader";
import UserAvatar from "@/components/ui/UserAvatar";
import { enhanceUserData, calculateAge } from "@/utils/userDataEnhancer";
import SharedModal from "@/components/ui/SharedModal";
import PhotosSection from "./[userId]/PhotosSection";
import CombinedLanguageModal from "@/features/users/components/CombinedLanguageModal";
import PreferencesModal from "@/features/users/components/PreferencesModal";
import LearningPreferencesModal from "@/features/users/components/LearningPreferencesModal";
import { api } from "@/utils/api";
import { useGetCurrentUserQuery, useUpdateProfileImageCacheMutation, useUpdateUserProfileMutation } from "@/features/api/apiSlice";
import ImageUpload from "./ImageUpload";
import { getAbsoluteImageUrl } from '@/utils/imageUrl';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, updateCoverPhoto } from '@/features/auth/authSlice';
import { RootState } from '@/lib/store';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [totalPostsCount, setTotalPostsCount] = useState<number>(0);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userConnections, setUserConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Hide header when in preview mode
  useEffect(() => {
    if (isPreviewMode) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        // Target the header by its content and structure
        // Desktop header
        const desktopHeader = document.querySelector('[style*="display: none"].MuiBox-root');
        const nextSibling = desktopHeader?.nextElementSibling;
        if (nextSibling && nextSibling.tagName === 'DIV' && (nextSibling as HTMLElement).style.position === 'sticky') {
          (nextSibling as HTMLElement).style.display = 'none';
        }
        
        // Mobile header - target by minHeight
        const mobileHeaders = document.querySelectorAll('[style*="minHeight: 72px"]');
        mobileHeaders.forEach(header => {
          (header as HTMLElement).style.display = 'none';
        });
        
        // Also hide any sticky elements at top 0
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
          const el = element as HTMLElement;
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.position === 'sticky' && computedStyle.top === '0px' && !el.classList.contains('preview-banner')) {
            el.style.display = 'none';
            el.dataset.hiddenByPreview = 'true';
          }
        });
        
        // Hide bottom navigation
        const bottomNavs = document.querySelectorAll('[style*="bottom: 20px"]');
        bottomNavs.forEach(nav => {
          (nav as HTMLElement).style.display = 'none';
        });
      }, 100);
    } else {
      // Show headers again
      setTimeout(() => {
        const hiddenElements = document.querySelectorAll('[data-hidden-by-preview="true"]');
        hiddenElements.forEach(element => {
          (element as HTMLElement).style.display = '';
          delete (element as HTMLElement).dataset.hiddenByPreview;
        });
        
        // Show mobile headers
        const mobileHeaders = document.querySelectorAll('[style*="minHeight: 72px"]');
        mobileHeaders.forEach(header => {
          (header as HTMLElement).style.display = '';
        });
        
        // Show bottom navigation
        const bottomNavs = document.querySelectorAll('[style*="bottom: 20px"]');
        bottomNavs.forEach(nav => {
          (nav as HTMLElement).style.display = '';
        });
      }, 100);
    }
    
    return () => {
      // Cleanup
      const hiddenElements = document.querySelectorAll('[data-hidden-by-preview="true"]');
      hiddenElements.forEach(element => {
        (element as HTMLElement).style.display = '';
        delete (element as HTMLElement).dataset.hiddenByPreview;
      });
    };
  }, [isPreviewMode]);


  
  // RTK Query hooks
  const [updateProfileImageCache] = useUpdateProfileImageCacheMutation();
  const [updateProfile] = useUpdateUserProfileMutation();

  // Modal states
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [bulkUnfollowExpanded, setBulkUnfollowExpanded] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editBirthday, setEditBirthday] = useState<Date | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [editTopics, setEditTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");

  // Learning preferences states
  const [communication, setCommunication] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState<string>("");
  const [learningSchedule, setLearningSchedule] = useState<string[]>([]);
  const [correctionPreference, setCorrectionPreference] = useState<string[]>(
    []
  );

  // User bookmarks
  const [userBookmarks, setUserBookmarks] = useState<any[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);

  // Navigation handler for follower cards
  const handleFollowerClick = (userId: string) => {
    router.push(`/app/profile/${userId}`);
  };

  // Fetch user connections (following)
  const fetchUserConnections = async () => {
    try {
      setConnectionsLoading(true);
      const response = await api.get('/connections/following');
      const connections = response.data.data?.connections || [];
      
      // Enhance user data for consistent avatars
      const enhancedConnections = connections.map((conn: any) => enhanceUserData(conn.following));
      setUserConnections(enhancedConnections);
    } catch (error) {
      console.error('Failed to fetch user connections:', error);
      setUserConnections([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await api.get('/posts', {
        params: {
          user_id: user?.id,
          limit: 100  // Fetch all posts to get accurate count
        }
      });
      const posts = response.data.posts || [];
      setUserPosts(posts);
      setTotalPostsCount(posts.length);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch user bookmarks
  const fetchUserBookmarks = async () => {
    try {
      setBookmarksLoading(true);
      const response = await api.get('/bookmarks');
      const bookmarks = response.data.data?.posts || [];
      setUserBookmarks(bookmarks);
    } catch (error) {
      console.error('Failed to fetch user bookmarks:', error);
      setUserBookmarks([]);
    } finally {
      setBookmarksLoading(false);
    }
  };

  // Language proficiency states (managed through modal)
  const [languageProficiencies, setLanguageProficiencies] = useState<{
    [key: string]: number;
  }>({});

  // Helper functions for proficiency display
  const getProficiencyLevel = (language: string): number => {
    return languageProficiencies[language] || 2; // Default to Beginner level
  };

  const getProficiencyLabel = (level: number): string => {
    switch (level) {
      case 1:
        return "Absolute Beginner";
      case 2:
        return "Beginner";
      case 3:
        return "Intermediate";
      case 4:
        return "Advanced";
      case 5:
        return "Fluent";
      default:
        return "Beginner";
    }
  };

  const getProficiencyColor = (level: number): string => {
    switch (level) {
      case 1:
        return "#ef4444"; // red
      case 2:
        return "#f59e0b"; // orange
      case 3:
        return "#eab308"; // yellow
      case 4:
        return "#22c55e"; // green
      case 5:
        return "#3b82f6"; // blue
      default:
        return "#f59e0b";
    }
  };

  // Format time ago helper
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
  };

  // Learning preferences modal states
  const [learningPreferencesModalOpen, setLearningPreferencesModalOpen] =
    useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [preferencesModalType, setPreferencesModalType] = useState<
    | "communication"
    | "timeCommitment"
    | "learningSchedule"
    | "correctionPreference"
  >("communication");
  const [preferencesModalTitle, setPreferencesModalTitle] = useState("");

  // Initialize user from Redux if available
  useEffect(() => {
    if (reduxUser && !user) {
      setUser(reduxUser);
      setEditName(reduxUser.name || "");
      setEditBirthday(reduxUser.birthday ? new Date(reduxUser.birthday) : null);
      setEditBio(reduxUser.bio || "");
      // Combine city and country into one location field
      const location = reduxUser.city && reduxUser.country 
        ? `${reduxUser.city}, ${reduxUser.country}` 
        : reduxUser.city || reduxUser.country || "";
      setEditLocation(location);
      setEditTopics(reduxUser.interests || []);
    }
  }, [reduxUser, user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If we already have user data from Redux, skip API call
        if (reduxUser) {
          setLoading(false);
          return;
        }

        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("No authentication token");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        const userData = data.data || data.user;
        
        // Ensure profile image and cover photo URLs are absolute
        if (userData && userData.profileImage && userData.profileImage.startsWith('/')) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
          const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '') // Remove /api suffix
          userData.profileImage = baseUrl + userData.profileImage
        }
        
        if (userData && userData.coverPhoto && userData.coverPhoto.startsWith('/')) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
          const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '') // Remove /api suffix
          userData.coverPhoto = baseUrl + userData.coverPhoto
        }
        
        const enhancedUser = enhanceUserData(userData);
        setUser(enhancedUser);
        
        // Update Redux store with the complete user data
        dispatch(updateUser(enhancedUser));

        // Initialize form states
        setEditName(enhancedUser.name || "");
        setEditBirthday(enhancedUser.birthday ? new Date(enhancedUser.birthday) : null);
        setEditBio(enhancedUser.bio || "");
        // Combine city and country into one location field
        const location = enhancedUser.city && enhancedUser.country 
          ? `${enhancedUser.city}, ${enhancedUser.country}` 
          : enhancedUser.city || enhancedUser.country || "";
        setEditLocation(location);
        setEditTopics(enhancedUser.interests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reduxUser, dispatch]);

  // Fetch additional data when user is loaded
  useEffect(() => {
    if (user?.id) {
      fetchUserConnections();
      fetchUserPosts();
      fetchUserBookmarks();
    }
  }, [user?.id]);

  const handleLanguageUpdate = (
    nativeLanguages: string[],
    learningLanguages: string[],
    proficiencies?: { [key: string]: number }
  ) => {
    if (user) {
      const updatedUser = {
        ...user,
        nativeLanguages,
        targetLanguages: learningLanguages,
      };
      setUser(updatedUser);
    }

    // Update proficiencies if provided
    if (proficiencies) {
      setLanguageProficiencies(proficiencies);
    }

    setLanguageModalOpen(false);
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Use a reverse geocoding service (you could use Google Maps API or similar)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();
      
      // Extract city and country from the response
      const city = data.address?.city || data.address?.town || data.address?.village || '';
      const country = data.address?.country || '';
      
      // Format as "City, Country"
      const location = city && country ? `${city}, ${country}` : city || country || 'Location not found';
      setEditLocation(location);
    } catch (error) {
      console.error('Failed to detect location:', error);
      // You might want to show an error message to the user
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleAboutSave = async () => {
    if (user) {
      try {
        const updatedUser = await updateProfile({ bio: editBio }).unwrap();
        const enhancedUpdatedUser = enhanceUserData(updatedUser);
        setUser(enhancedUpdatedUser);
        dispatch(updateUser(enhancedUpdatedUser));
        setAboutModalOpen(false);
      } catch (error) {
        console.error('Failed to update bio:', error);
      }
    }
  };


  const handleNameSave = async () => {
    if (user) {
      try {
        // Parse location back into city and country
        const locationParts = editLocation.split(',').map(part => part.trim());
        const city = locationParts[0] || '';
        const country = locationParts[1] || '';
        
        // Prepare update data
        const updateData: any = {
          name: editName,
          city: city || undefined,
          country: country || undefined,
        };
        
        // Only include birthday if it's set
        if (editBirthday) {
          updateData.birthday = editBirthday.toISOString();
        }
        
        // Call the update mutation
        const updatedUser = await updateProfile(updateData).unwrap();
        
        // Enhance the updated user data to calculate age from birthday
        const enhancedUpdatedUser = enhanceUserData(updatedUser);
        
        // Update local state with the enhanced response
        setUser(enhancedUpdatedUser);
        
        // Also update Redux store with enhanced data
        dispatch(updateUser(enhancedUpdatedUser));
        
        setNameModalOpen(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
        // You might want to show an error message to the user
      }
    }
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !editTopics.includes(newTopic.trim())) {
      setEditTopics([...editTopics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setEditTopics(editTopics.filter((topic) => topic !== topicToRemove));
  };

  const handleTopicsSave = async () => {
    if (user) {
      try {
        const updatedUser = await updateProfile({ interests: editTopics }).unwrap();
        const enhancedUpdatedUser = enhanceUserData(updatedUser);
        setUser(enhancedUpdatedUser);
        dispatch(updateUser(enhancedUpdatedUser));
        setTopicsModalOpen(false);
      } catch (error) {
        console.error('Failed to update topics:', error);
      }
    }
  };

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      // Update cache immediately for instant UI feedback
      await updateProfileImageCache(imageUrl);
      
      // Update local state with absolute URL
      const absoluteUrl = getAbsoluteImageUrl(imageUrl);
      if (user) {
        const updatedUser = { ...user, profileImage: absoluteUrl || imageUrl };
        setUser(updatedUser);
        // Also update Redux store
        dispatch(updateUser(updatedUser));
      }
    } catch (error) {
      console.error('Failed to update profile image:', error);
    }
  };

  const handleCoverPhotoUpdate = async (imageUrl: string) => {
    try {
      // Update local state with absolute URL
      const absoluteUrl = getAbsoluteImageUrl(imageUrl);
      if (user) {
        const updatedUser = { ...user, coverPhoto: absoluteUrl || imageUrl };
        setUser(updatedUser);
        // Also update Redux store
        dispatch(updateCoverPhoto(absoluteUrl || imageUrl));
      }
    } catch (error) {
      console.error('Failed to update cover photo:', error);
    }
  };

  const handlePreferencesEdit = (
    section:
      | "communication"
      | "timeCommitment"
      | "learningSchedule"
      | "correctionPreference"
  ) => {
    const titles = {
      communication: "Communication Preferences",
      timeCommitment: "Time Commitment",
      learningSchedule: "Learning Schedule",
      correctionPreference: "Correction Preferences",
    };

    setPreferencesModalType(section);
    setPreferencesModalTitle(titles[section]);
    setPreferencesModalOpen(true);
  };

  const handlePreferencesSave = (values: string | string[]) => {
    switch (preferencesModalType) {
      case "communication":
        setCommunication(Array.isArray(values) ? values : []);
        break;
      case "timeCommitment":
        setTimeCommitment(typeof values === "string" ? values : "");
        // Auto-close modal for single-select since selection is complete
        setPreferencesModalOpen(false);
        break;
      case "learningSchedule":
        setLearningSchedule(Array.isArray(values) ? values : []);
        break;
      case "correctionPreference":
        setCorrectionPreference(Array.isArray(values) ? values : []);
        break;
    }
    // TODO: Save to backend
  };

  const handleLearningPreferencesSave = (preferences: {
    communication: string[];
    timeCommitment: string;
    learningSchedule: string[];
    correctionPreference: string[];
  }) => {
    setCommunication(preferences.communication);
    setTimeCommitment(preferences.timeCommitment);
    setLearningSchedule(preferences.learningSchedule);
    setCorrectionPreference(preferences.correctionPreference);
    // TODO: Save to backend
  };

  const getCurrentPreferenceValues = () => {
    switch (preferencesModalType) {
      case "communication":
        return communication;
      case "timeCommitment":
        return timeCommitment;
      case "learningSchedule":
        return learningSchedule;
      case "correctionPreference":
        return correctionPreference;
      default:
        return [];
    }
  };

  const handleFollowClick = (userId: number) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleConfirmUnfollow = (userName: string, userId: number) => {
    // TODO: Add actual unfollow logic here
    console.log("Unfollowing user:", userName, userId);
    setExpandedUserId(null);
  };

  const handleCancelUnfollow = () => {
    setExpandedUserId(null);
  };

  // Mass selection handlers
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedUsers(new Set());
    setExpandedUserId(null);
    setBulkUnfollowExpanded(false);
  };

  const handleUserSelect = (userId: number) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (newSelectedUsers.has(userId)) {
      newSelectedUsers.delete(userId);
    } else {
      newSelectedUsers.add(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === 12) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
    }
  };

  const handleBulkUnfollow = () => {
    setBulkUnfollowExpanded(true);
  };

  const confirmBulkUnfollow = () => {
    // TODO: Add actual bulk unfollow logic here
    console.log("Bulk unfollowing users:", Array.from(selectedUsers));
    setBulkUnfollowExpanded(false);
    setSelectedUsers(new Set());
    setIsSelectMode(false);
  };

  const cancelBulkUnfollow = () => {
    setBulkUnfollowExpanded(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: "white" }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "white", fontWeight: 500 }}
        >
          My Profile
        </Typography>
        <Typography sx={{ color: "#ef4444" }}>{error}</Typography>
      </Box>
    );
  }

  if (!user) return null;

  return (
    <>
      {/* Spacer to compensate for hidden header */}
      {isPreviewMode && (
        <Box sx={{ height: 56, width: "100%" }} />
      )}
      
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* Preview Mode Banner - Fixed at top */}
        {isPreviewMode && (
          <Box
            className="preview-banner"
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(99, 102, 241, 0.95)",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
              py: 1.5,
              px: 3,
              zIndex: 2000, // Very high to ensure it's on top
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              height: 56, // Fixed height
            }}
          >
          <Typography
            sx={{
              color: "white",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            You're viewing your profile as others see it
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsPreviewMode(false)}
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.75rem",
              py: 0.5,
              px: 2,
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            Exit Preview
          </Button>
        </Box>
      )}
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
        {/* Profile Header */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1200px",
            mx: "auto",
            px: { xs: 2, md: 4 },
            pt: 2,
          }}
        >
          <ProfileHeader
            user={user}
            onEditName={!isPreviewMode ? () => {
              setEditName(user.name || "");
              setEditBirthday(user.birthday ? new Date(user.birthday) : null);
              const location = user.city && user.country 
                ? `${user.city}, ${user.country}` 
                : user.city || user.country || "";
              setEditLocation(location);
              setNameModalOpen(true);
            } : undefined}
            onEditAvatar={!isPreviewMode ? handleImageUpdate : undefined}
            onEditCover={!isPreviewMode ? handleCoverPhotoUpdate : undefined}
            isUserProfile={!isPreviewMode}
            onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
            isPreviewMode={isPreviewMode}
          />
        </Box>

        {/* Main Content - Dark Theme Grid Layout */}
        <Box
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: 4,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Profile Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              alignItems: "start",
            }}
          >
            {/* Languages Section - Left Column */}
            <Box
              sx={{
                gridColumn: { xs: "1", md: "1" },
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid #374151",
                  borderRadius: 1.5,
                  p: 3,
                  color: "white",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 400 }}>
                    Languages
                  </Typography>
                  {!isPreviewMode && <EditIconButton onClick={() => setLanguageModalOpen(true)} />}
                </Box>

                {/* Native Languages */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 400, mb: 2, color: "white" }}
                >
                  Native Languages
                </Typography>
                <Box component="ul" sx={{ listStyle: "none", p: 0, mb: 3 }}>
                  {user.nativeLanguages?.map(
                    (language: string, index: number) => (
                      <Box component="li" key={index} sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2.5,
                            p: 2.5,
                            backgroundColor: "rgba(34, 197, 94, 0.15)",
                            borderRadius: 1,
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "rgba(34, 197, 94, 0.2)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "24px",
                              lineHeight: 1,
                            }}
                          >
                            {getLanguageEmojiFlag(language)}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "white",
                                fontSize: "0.95rem",
                              }}
                            >
                              {language}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "rgba(34, 197, 94, 0.8)",
                                fontWeight: 500,
                              }}
                            >
                              Native Speaker
                            </Typography>
                          </Box>
                          <Chip
                            label="Fluent"
                            size="small"
                            sx={{
                              backgroundColor: "rgba(34, 197, 94, 0.8)",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        </Box>
                      </Box>
                    )
                  )}
                </Box>

                {/* Target Languages */}
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 400, mb: 2, color: "white" }}
                >
                  Learning Languages
                </Typography>
                <Box component="ul" sx={{ listStyle: "none", p: 0 }}>
                  {user.targetLanguages?.map(
                    (language: string, index: number) => (
                      <Box component="li" key={index} sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2.5,
                            p: 2.5,
                            backgroundColor: "rgba(99, 102, 241, 0.15)",
                            borderRadius: 1,
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "rgba(99, 102, 241, 0.2)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "24px",
                              lineHeight: 1,
                            }}
                          >
                            {getLanguageEmojiFlag(language)}
                          </Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "white",
                                fontSize: "0.95rem",
                              }}
                            >
                              {language}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "rgba(99, 102, 241, 0.8)",
                                fontWeight: 500,
                              }}
                            >
                              Currently Learning
                            </Typography>
                          </Box>
                          {/* Language Level Indicator (Display Only) */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              {[1, 2, 3, 4, 5].map((level) => {
                                const currentLevel =
                                  getProficiencyLevel(language);
                                const isActive = level <= currentLevel;

                                return (
                                  <Box
                                    key={level}
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      backgroundColor: isActive
                                        ? getProficiencyColor(currentLevel)
                                        : "rgba(255, 255, 255, 0.3)",
                                      transition: "all 0.2s ease",
                                    }}
                                  />
                                );
                              })}
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "0.65rem",
                                color: "rgba(255, 255, 255, 0.7)",
                                fontWeight: 500,
                              }}
                            >
                              {getProficiencyLabel(
                                getProficiencyLevel(language)
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )
                  )}
                </Box>
              </Box>

              {/* Learning Preferences Section */}
              <Box
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid #374151",
                  borderRadius: 1.5,
                  p: 3,
                  color: "white",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 500, color: "white" }}
                  >
                    Learning Preferences
                  </Typography>
                  {!isPreviewMode && <EditIconButton
                    onClick={() => setLearningPreferencesModalOpen(true)}
                  />}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Communication Preferences */}
                  <Box
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderRadius: 1.5,
                      p: 2.5,
                      border: "1px solid #374151",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "white", fontWeight: 400, mb: 2 }}
                    >
                      Communication
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {communication.length > 0 ? (
                        communication.map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(99, 102, 241, 0.2)",
                              color: "#6366f1",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              fontWeight: 500,
                            }}
                          />
                        ))
                      ) : (
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.875rem",
                          }}
                        >
                          Set your communication preferences
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Time Commitment */}
                  <Box
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderRadius: 1.5,
                      p: 2.5,
                      border: "1px solid #374151",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "white", fontWeight: 400, mb: 2 }}
                    >
                      Time Commitment
                    </Typography>
                    <Typography
                      sx={{
                        color: timeCommitment
                          ? "white"
                          : "rgba(255, 255, 255, 0.6)",
                        fontWeight: timeCommitment ? 500 : 400,
                        fontSize: "0.875rem",
                      }}
                    >
                      {timeCommitment || "Set your daily time commitment"}
                    </Typography>
                  </Box>

                  {/* Learning Schedule */}
                  <Box
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderRadius: 1.5,
                      p: 2.5,
                      border: "1px solid #374151",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "white", fontWeight: 400, mb: 2 }}
                    >
                      Learning Schedule
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {learningSchedule.length > 0 ? (
                        learningSchedule.map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(99, 102, 241, 0.2)",
                              color: "#6366f1",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              fontWeight: 500,
                            }}
                          />
                        ))
                      ) : (
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.875rem",
                          }}
                        >
                          Set your preferred learning schedule
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Correction Preferences */}
                  <Box
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderRadius: 1.5,
                      p: 2.5,
                      border: "1px solid #374151",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ color: "white", fontWeight: 400, mb: 2 }}
                    >
                      Correction Preferences
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {correctionPreference.length > 0 ? (
                        correctionPreference.map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(99, 102, 241, 0.2)",
                              color: "#6366f1",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              fontWeight: 500,
                            }}
                          />
                        ))
                      ) : (
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.6)",
                            fontSize: "0.875rem",
                          }}
                        >
                          Set your correction preferences
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Following Section - Hidden in preview mode */}
              {!isPreviewMode && (
              <Box
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #374151",
                    borderRadius: 1.5,
                    p: 3,
                    color: "white",
                  }}
                >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 400, color: "white" }}
                    >
                      Connections
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {userConnections.length} people
                    </Typography>
                  </Box>
                  {!isPreviewMode && <EditIconButton onClick={() => setFollowingModalOpen(true)} />}
                </Box>

                {/* Following Preview - Show first 4 */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                  }}
                >
                  {connectionsLoading ? (
                    // Loading state
                    [1, 2, 3, 4].map((index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          p: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: 1,
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      >
                        <Box sx={{ mb: 1 }}>
                          <UserAvatar size={48} showOnlineStatus={false} />
                        </Box>
                        <Box sx={{ width: 40, height: 12, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                      </Box>
                    ))
                  ) : (
                    userConnections.slice(0, 4).map((connection) => (
                      <Box
                        key={connection.id}
                        onClick={() => handleFollowerClick(connection.id)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          p: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          borderRadius: 1,
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box sx={{ mb: 1, position: 'relative', display: 'inline-block' }}>
                          <UserAvatar
                            user={connection}
                            size={48}
                            showOnlineStatus={true}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            fontWeight: 500,
                            textAlign: "center",
                            fontSize: "0.75rem",
                          }}
                        >
                          {connection.name?.split(' ')[0] || 'User'}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
              )}
            </Box>

            {/* Right Column - All other sections stacked */}
            <Box
              sx={{
                gridColumn: { xs: "1", md: "2" },
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* About Section */}
              <Box
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid #374151",
                  borderRadius: 1.5,
                  p: 3,
                  color: "white",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 400, color: "white" }}
                  >
                    About Me
                  </Typography>
                  {!isPreviewMode && <EditIconButton
                    onClick={() => {
                      setEditBio(user.bio || "");
                      setAboutModalOpen(true);
                    }}
                  />}
                </Box>

                {/* Bio Section */}
                <Box>
                  <Typography
                    sx={{
                      color: "#e5e7eb",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    "{user.bio}"
                  </Typography>
                </Box>
              </Box>

              {/* Topics Section */}
              <Box
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid #374151",
                  borderRadius: 1.5,
                  p: 3,
                  color: "white",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 400, color: "white" }}
                  >
                    Topics
                  </Typography>
                  {!isPreviewMode && <EditIconButton
                    onClick={() => {
                      setEditTopics(user.interests || []);
                      setTopicsModalOpen(true);
                    }}
                  />}
                </Box>
                <Box
                  component="ul"
                  sx={{
                    listStyle: "none",
                    p: 0,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {(user.interests || []).length > 0 ? (
                    (user.interests || []).map((topic: string, index: number) => (
                      <Box component="li" key={index}>
                        <Typography
                          sx={{
                            backgroundColor: "rgba(99, 102, 241, 0.2)",
                            color: "white",
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.875rem",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            "&:hover": {
                              backgroundColor: "rgba(99, 102, 241, 0.3)",
                            },
                          }}
                        >
                          {topic}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.875rem",
                        fontStyle: "italic",
                      }}
                    >
                      No topics added yet. Click edit to add your interests!
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* My Posts Section - Only visible when not in preview mode */}
              {!isPreviewMode && (
                <Box
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #374151",
                    borderRadius: 1.5,
                    p: 3,
                    color: "white",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 400, color: "white" }}
                    >
                      My Posts
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {userPosts.length > 0 && (
                        <Chip 
                          label={`${totalPostsCount} posts`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(99, 102, 241, 0.2)",
                            color: "#a5b4fc",
                            fontSize: "12px",
                          }}
                        />
                      )}
                      {userPosts.length > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            borderColor: "rgba(255, 255, 255, 0.3)",
                            fontSize: "0.75rem",
                            px: 2,
                            py: 0.5,
                            "&:hover": {
                              borderColor: "rgba(255, 255, 255, 0.5)",
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                          onClick={() => {
                            // Navigate to dedicated posts page
                            router.push("/app/profile/posts");
                          }}
                        >
                          See All Posts
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.875rem",
                      mb: 2,
                    }}
                  >
                    Your recent posts and questions to the community
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {postsLoading ? (
                      // Loading state
                      [1, 2].map((index) => (
                        <Box
                          key={index}
                          sx={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: 1,
                            p: 2,
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            animation: "pulse 1.5s ease-in-out infinite",
                          }}
                        >
                          <Box sx={{ width: "80%", height: 16, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1, mb: 1 }} />
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Box sx={{ width: 60, height: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                            <Box sx={{ width: 80, height: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                          </Box>
                        </Box>
                      ))
                    ) : userPosts.length > 0 ? (
                      userPosts.slice(0, 2).map((post) => {
                        const timeAgo = formatTimeAgo(post.created_at);
                        return (
                          <Box
                            key={post.id}
                            onClick={() => {
                              // Navigate to individual post page
                              router.push(`/app/posts/${post.id}`);
                            }}
                            sx={{
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              borderRadius: 1,
                              p: 2,
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              transition: "all 0.2s ease",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.15)",
                                transform: "translateY(-1px)",
                                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                color: "white",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                mb: 1,
                                lineHeight: 1.3,
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {post.title}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Chip
                                  label={post.category || "General"}
                                  size="small"
                                  sx={{
                                    backgroundColor: "rgba(99, 102, 241, 0.3)",
                                    color: "#a5b4fc",
                                    fontSize: "11px",
                                    height: "20px",
                                  }}
                                />
                                <Typography
                                  sx={{
                                    color: "rgba(255, 255, 255, 0.5)",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {timeAgo}
                                </Typography>
                              </Box>
                              <Typography
                                sx={{
                                  color: "rgba(255, 255, 255, 0.6)",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {post.bookmark_count || 0} bookmarks
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: "0.875rem",
                          fontStyle: "italic",
                          textAlign: "center",
                          py: 2,
                        }}
                      >
                        No posts yet. Start sharing your language learning journey!
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Bookmarks Section - Only visible when not in preview mode */}
              {!isPreviewMode && (
                <Box
                  sx={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid #374151",
                    borderRadius: 1.5,
                    p: 3,
                    color: "white",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 400, color: "white" }}
                    >
                      Bookmarks
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {userBookmarks.length > 0 && (
                        <Chip 
                          label={`${userBookmarks.length} saved`}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(245, 158, 11, 0.2)",
                            color: "#fbbf24",
                            fontSize: "12px",
                          }}
                        />
                      )}
                      {userBookmarks.length > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            borderColor: "rgba(255, 255, 255, 0.3)",
                            fontSize: "0.75rem",
                            px: 2,
                            py: 0.5,
                            "&:hover": {
                              borderColor: "rgba(255, 255, 255, 0.5)",
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                          onClick={() => {
                            // Navigate to dedicated bookmarks page
                            router.push("/app/profile/bookmarks");
                          }}
                        >
                          See All Bookmarks
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.875rem",
                      mb: 2,
                    }}
                  >
                    Posts you've saved for later reference
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {bookmarksLoading ? (
                      // Loading state
                      [1, 2].map((index) => (
                        <Box
                          key={index}
                          sx={{
                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                            borderRadius: 1,
                            p: 2,
                            border: "1px solid rgba(245, 158, 11, 0.2)",
                            animation: "pulse 1.5s ease-in-out infinite",
                          }}
                        >
                          <Box sx={{ width: "80%", height: 16, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1, mb: 1 }} />
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Box sx={{ width: 100, height: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                            <Box sx={{ width: 60, height: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                          </Box>
                        </Box>
                      ))
                    ) : userBookmarks.length > 0 ? (
                      userBookmarks.slice(0, 2).map((post) => (
                        <Box
                          key={post.id}
                          onClick={() => {
                            // Navigate to individual post page
                            router.push(`/app/posts/${post.id}`);
                          }}
                          sx={{
                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                            borderRadius: 1,
                            p: 2,
                            border: "1px solid rgba(245, 158, 11, 0.2)",
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(245, 158, 11, 0.15)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              color: "white",
                              fontWeight: 500,
                              fontSize: "0.875rem",
                              mb: 1,
                              lineHeight: 1.3,
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {post.title}
                          </Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography
                                sx={{
                                  color: "rgba(255, 255, 255, 0.6)",
                                  fontSize: "0.75rem",
                                }}
                              >
                                by {post.author?.name || "Unknown"}
                              </Typography>
                              <Chip
                                label={post.category || "General"}
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(245, 158, 11, 0.3)",
                                  color: "#fbbf24",
                                  fontSize: "11px",
                                  height: "20px",
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.6)",
                                fontSize: "0.75rem",
                              }}
                            >
                              {post.bookmark_count || 0} bookmarks
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                          fontSize: "0.875rem",
                          fontStyle: "italic",
                          textAlign: "center",
                          py: 2,
                        }}
                      >
                        No bookmarks yet. Save posts that interest you!
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Photos Section */}
              <PhotosSection userId={user?.id} isOwnProfile={!isPreviewMode} />
            </Box>
          </Box>
        </Box>
      </AnimatedWrapper>

      {/* Combined Language Modal */}
      <CombinedLanguageModal
        open={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
        nativeLanguages={user.nativeLanguages || []}
        learningLanguages={user.targetLanguages || []}
        existingProficiencies={languageProficiencies}
        onSave={handleLanguageUpdate}
      />

      {/* Name & Birthday Edit Modal */}
      <SharedModal
        open={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        title="Edit Profile"
        maxWidth="xs"
        actions={
          <>
            <Button
              onClick={() => setNameModalOpen(false)}
              size="small"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNameSave}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#6366f1",
                fontSize: "0.8rem",
                "&:hover": {
                  backgroundColor: "#5855eb",
                },
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Name"
              variant="outlined"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "white",
                  height: 40,
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6366f1",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#6366f1",
                  },
                },
              }}
            />
            <DatePicker
              label="Birthday"
              value={editBirthday}
              onChange={(newValue) => setEditBirthday(newValue)}
              maxDate={new Date()}
              minDate={new Date('1900-01-01')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  variant: "outlined",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      height: 40,
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#6366f1",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                      "&.Mui-focused": {
                        color: "#6366f1",
                      },
                    },
                    "& .MuiIconButton-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  },
                },
              }}
            />
            <TextField
            fullWidth
            size="small"
            label="Location"
            variant="outlined"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            placeholder="City, Country"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    size="small"
                    sx={{
                      color: detectingLocation ? "#6366f1" : "rgba(255, 255, 255, 0.7)",
                      "&:hover": {
                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                      },
                    }}
                  >
                    {detectingLocation ? (
                      <CircularProgress size={20} sx={{ color: "#6366f1" }} />
                    ) : (
                      <LocationIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                height: 40,
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: "#6366f1",
                },
              },
            }}
          />
          </Box>
        </LocalizationProvider>
      </SharedModal>

      {/* About Edit Modal */}
      <SharedModal
        open={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        title="Edit About Me"
        maxWidth="sm"
        actions={
          <>
            <Button
              onClick={() => setAboutModalOpen(false)}
              size="small"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAboutSave}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#6366f1",
                fontSize: "0.8rem",
                "&:hover": {
                  backgroundColor: "#5855eb",
                },
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Bio"
          multiline
          rows={4}
          variant="outlined"
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#6366f1",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-focused": {
                color: "#6366f1",
              },
            },
          }}
        />
      </SharedModal>


      {/* Topics Edit Modal */}
      <SharedModal
        open={topicsModalOpen}
        onClose={() => setTopicsModalOpen(false)}
        title="Edit Topics"
        maxWidth="sm"
        actions={
          <>
            <Button
              onClick={() => setTopicsModalOpen(false)}
              size="small"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTopicsSave}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#6366f1",
                fontSize: "0.8rem",
                "&:hover": {
                  backgroundColor: "#5855eb",
                },
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Add new topic"
              variant="outlined"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddTopic();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "white",
                  height: 40,
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6366f1",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-focused": {
                    color: "#6366f1",
                  },
                },
              }}
            />
            <Button
              onClick={handleAddTopic}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: "#6366f1",
                minWidth: 80,
                height: 40,
                "&:hover": {
                  backgroundColor: "#5855eb",
                },
              }}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {editTopics.map((topic, index) => (
              <Chip
                key={index}
                label={topic}
                onDelete={() => handleRemoveTopic(topic)}
                size="small"
                sx={{
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  "& .MuiChip-deleteIcon": {
                    color: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      color: "white",
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </SharedModal>

      {/* Following Modal */}
      <Dialog
        open={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            border: "1px solid #374151",
            borderRadius: 2,
            backdropFilter: "blur(10px)",
            maxHeight: "85vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            borderBottom: "1px solid #374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 600,
            py: 2,
            px: 2.5,
            fontSize: "1.1rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box component="span" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Connections {userConnections.length} people
            </Box>
            {selectedUsers.size > 0 && (
              <Box component="span" sx={{ 
                color: "#6366f1", 
                fontSize: "0.8rem",
                fontWeight: 500 
              }}>
                ({selectedUsers.size} selected)
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
              onClick={toggleSelectMode}
              size="small"
              sx={{
                color: isSelectMode ? "#6366f1" : "rgba(255, 255, 255, 0.7)",
                backgroundColor: isSelectMode ? "rgba(99, 102, 241, 0.2)" : "transparent",
                "&:hover": {
                  backgroundColor: isSelectMode ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.1)",
                },
                fontSize: "0.875rem",
                textTransform: "none",
                fontWeight: 500,
                px: 1.5,
                py: 0.5,
                minHeight: "auto",
              }}
            >
              {isSelectMode ? "Cancel" : "Select"}
            </Button>
            <IconButton
              onClick={() => setFollowingModalOpen(false)}
              size="small"
              sx={{
                backgroundColor: "transparent",
                color: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            px: 2.5,
            py: 0,
            "&.MuiDialogContent-root": {
              paddingTop: "16px !important",
              paddingBottom: "16px !important",
            },
          }}
        >
          <Box>
            {/* Bulk Action Bar */}
            {isSelectMode && (
              <Box
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  borderRadius: 1,
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedUsers.size === userConnections.length}
                        indeterminate={selectedUsers.size > 0 && selectedUsers.size < userConnections.length}
                        onChange={handleSelectAll}
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          "&.Mui-checked": {
                            color: "#6366f1",
                          },
                          "&.MuiCheckbox-indeterminate": {
                            color: "#6366f1",
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: "white", fontSize: "0.8rem" }}>
                        Select all ({selectedUsers.size}/{userConnections.length})
                      </Typography>
                    }
                  />
                  {selectedUsers.size > 0 && (
                    <Button
                      onClick={handleBulkUnfollow}
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: "#ef4444",
                        "&:hover": {
                          backgroundColor: "#dc2626",
                        },
                        fontSize: "0.8rem",
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Unfollow {selectedUsers.size} {selectedUsers.size === 1 ? 'person' : 'people'}
                    </Button>
                  )}
                </Stack>
              </Box>
            )}

            {/* Bulk Unfollow Expandable Confirmation */}
            <Collapse in={bulkUnfollowExpanded}>
              <Box
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  borderRadius: 1,
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                }}
              >
                <Stack spacing={1.5}>
                  {/* Header with close button */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Unfollow {selectedUsers.size} {selectedUsers.size === 1 ? 'person' : 'people'}?
                    </Typography>
                    <IconButton
                      onClick={cancelBulkUnfollow}
                      size="small"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  {/* Confirmation message */}
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "0.8rem",
                      lineHeight: 1.4,
                    }}
                  >
                    You will stop seeing posts from these {selectedUsers.size} {selectedUsers.size === 1 ? 'person' : 'people'} in your feed and they won't be notified of your activity.
                  </Typography>

                  {/* Selected users preview */}
                  <Box sx={{ 
                    maxHeight: 120, 
                    overflow: "auto",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 1,
                    p: 1
                  }}>
                    <Stack spacing={0.5}>
                      {Array.from(selectedUsers).map((userIndex) => {
                        const user = userConnections[userIndex - 1];
                        if (!user) return null;
                        
                        return (
                          <Box key={user.id} sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1.5, 
                            py: 0.5,
                            px: 1,
                          }}>
                            <UserAvatar
                              user={user}
                              size={24}
                              showOnlineStatus={false}
                            />
                            <Typography sx={{ color: "white", fontSize: "0.8rem" }}>
                              {user.name}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* Action buttons */}
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      onClick={cancelBulkUnfollow}
                      size="small"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        minWidth: 70,
                        height: 28,
                        fontSize: "0.8rem",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmBulkUnfollow}
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: "#ef4444",
                        minWidth: 70,
                        height: 28,
                        fontSize: "0.8rem",
                        "&:hover": {
                          backgroundColor: "#dc2626",
                        },
                      }}
                    >
                      Unfollow All
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Collapse>

            {isSelectMode && <Divider sx={{ mb: 1.5, borderColor: "rgba(255, 255, 255, 0.2)" }} />}
            {/* Following List */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: 1,
              maxHeight: "400px",
              overflowY: "auto",
              pr: 0.5
            }}>
              {connectionsLoading ? (
                // Loading state for modal
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index) => (
                  <Box key={index}>
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 1,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}>
                      <UserAvatar size={48} showOnlineStatus={false} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ width: 120, height: 16, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1, mb: 0.5 }} />
                        <Box sx={{ width: 80, height: 12, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                userConnections.map((user, index) => {
                  const userIndex = index + 1;
                  const learningLanguage = user.target_languages?.[0] || user.targetLanguages?.[0] || "English";

                  return (
                    <Box key={user.id}>
                      <Box
                        onClick={() => !isSelectMode && handleFollowerClick(user.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        backgroundColor: selectedUsers.has(userIndex) 
                          ? "rgba(99, 102, 241, 0.2)" 
                          : "rgba(255, 255, 255, 0.15)",
                        borderRadius: 1,
                        border: selectedUsers.has(userIndex)
                          ? "1px solid rgba(99, 102, 241, 0.5)"
                          : "1px solid rgba(255, 255, 255, 0.2)",
                        transition: "all 0.2s ease",
                        cursor: !isSelectMode ? "pointer" : "default",
                        "&:hover": {
                          backgroundColor: selectedUsers.has(userIndex)
                            ? "rgba(99, 102, 241, 0.3)"
                            : "rgba(255, 255, 255, 0.25)",
                        },
                      }}
                    >
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedUsers.has(userIndex)}
                          onChange={() => handleUserSelect(userIndex)}
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            "&.Mui-checked": {
                              color: "#6366f1",
                            },
                          }}
                        />
                      )}
                      <UserAvatar
                        user={user}
                        size={48}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            mb: 0.25,
                            lineHeight: 1.2,
                          }}
                        >
                          {user.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: "0.8rem",
                            lineHeight: 1.3,
                          }}
                        >
                          Learning {learningLanguage}
                        </Typography>
                      </Box>
                      {!isSelectMode && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleFollowClick(userIndex)}
                          sx={{
                            color: "#6366f1",
                            borderColor: "#6366f1",
                            minWidth: 80,
                            height: 32,
                            fontSize: "0.8rem",
                            "&:hover": {
                              backgroundColor: "rgba(99, 102, 241, 0.5)",
                              borderColor: "#6366f1",
                              color: "white",
                            },
                          }}
                        >
                          Following
                        </Button>
                      )}
                    </Box>

                    {/* Expandable Unfollow Confirmation */}
                    <Collapse in={expandedUserId === userIndex && !isSelectMode}>
                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1.5,
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: 1,
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <Stack spacing={1.5}>
                          {/* Header with close button */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography
                              sx={{
                                color: "white",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                              }}
                            >
                              Unfollow {user.name}?
                            </Typography>
                            <IconButton
                              onClick={handleCancelUnfollow}
                              size="small"
                              sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          {/* Confirmation message */}
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.8)",
                              fontSize: "0.8rem",
                              lineHeight: 1.4,
                            }}
                          >
                            You will stop seeing {user.name}'s posts in your feed and they won't be notified of your activity.
                          </Typography>

                          {/* Action buttons */}
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              onClick={handleCancelUnfollow}
                              size="small"
                              sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                minWidth: 70,
                                height: 28,
                                fontSize: "0.8rem",
                                "&:hover": {
                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleConfirmUnfollow(user.name, userIndex)}
                              variant="contained"
                              size="small"
                              sx={{
                                backgroundColor: "#ef4444",
                                minWidth: 70,
                                height: 28,
                                fontSize: "0.8rem",
                                "&:hover": {
                                  backgroundColor: "#dc2626",
                                },
                              }}
                            >
                              Unfollow
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderTop: "1px solid #374151",
            p: 1.5,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setFollowingModalOpen(false)}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "#6366f1",
              fontSize: "0.8rem",
              "&:hover": {
                backgroundColor: "#5855eb",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>


      {/* Learning Preferences Modal */}
      <LearningPreferencesModal
        open={learningPreferencesModalOpen}
        onClose={() => setLearningPreferencesModalOpen(false)}
        preferences={{
          communication,
          timeCommitment,
          learningSchedule,
          correctionPreference,
        }}
        onSave={handleLearningPreferencesSave}
      />

      {/* Individual Preferences Modal (legacy - kept for compatibility) */}
      <PreferencesModal
        open={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
        title={preferencesModalTitle}
        type={preferencesModalType}
        selectedValues={getCurrentPreferenceValues()}
        onSave={handlePreferencesSave}
      />

      </Box>
    </>
  );
}
