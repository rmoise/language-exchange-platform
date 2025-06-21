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
import { enhanceUserData } from "@/utils/userDataEnhancer";
import SharedModal from "@/components/ui/SharedModal";
import PhotosSection from "./[userId]/PhotosSection";
import CombinedLanguageModal from "@/features/users/components/CombinedLanguageModal";
import PreferencesModal from "@/features/users/components/PreferencesModal";
import LearningPreferencesModal from "@/features/users/components/LearningPreferencesModal";
import { api } from "@/utils/api";

// Helper function to map languages to country flags
const getLanguageFlag = (language: string): string => {
  const languageToCountry: { [key: string]: string } = {
    English: "us",
    Spanish: "es",
    French: "fr",
    German: "de",
    Italian: "it",
    Portuguese: "pt",
    Russian: "ru",
    Chinese: "cn",
    Japanese: "jp",
    Korean: "kr",
    Arabic: "sa",
    Hindi: "in",
    Swedish: "se",
    Dutch: "nl",
    Norwegian: "no",
    Danish: "dk",
    Finnish: "fi",
    Polish: "pl",
    Czech: "cz",
    Hungarian: "hu",
    Romanian: "ro",
    Bulgarian: "bg",
    Greek: "gr",
    Turkish: "tr",
    Hebrew: "il",
    Thai: "th",
    Vietnamese: "vn",
    Indonesian: "id",
    Malay: "my",
    Filipino: "ph",
    Ukrainian: "ua",
    Croatian: "hr",
    Serbian: "rs",
    Slovenian: "si",
    Slovak: "sk",
    Estonian: "ee",
    Latvian: "lv",
    Lithuanian: "lt",
  };

  return languageToCountry[language] || "un";
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Modal states
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [topicsModalOpen, setTopicsModalOpen] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [bulkUnfollowExpanded, setBulkUnfollowExpanded] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editTopics, setEditTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");

  // Learning preferences states
  const [communication, setCommunication] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState<string>("");
  const [learningSchedule, setLearningSchedule] = useState<string[]>([]);
  const [correctionPreference, setCorrectionPreference] = useState<string[]>(
    []
  );

  // Random follower selection for preview (updated when real users load)
  const [randomFollowers, setRandomFollowers] = useState<any[]>([]);

  // Navigation handler for follower cards
  const handleFollowerClick = (userId: string) => {
    router.push(`/protected/profile/${userId}`);
  };

  // Fetch real users for followers section
  const fetchRealUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/users?limit=12');
      const users = response.data.data || response.data;
      
      // Enhance user data for consistent avatars and additional data
      const enhancedUsers = users.map((user: any) => enhanceUserData(user));
      setRealUsers(enhancedUsers);
      
      // Select 4 random users for the preview
      const shuffled = [...enhancedUsers].sort(() => Math.random() - 0.5);
      setRandomFollowers(shuffled.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch real users:', error);
      // Just show empty state if API fails
      setRealUsers([]);
      setRandomFollowers([]);
    } finally {
      setUsersLoading(false);
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
        const enhancedUser = enhanceUserData(userData);
        setUser(enhancedUser);

        // Initialize form states
        setEditName(enhancedUser.name || "");
        setEditBio(enhancedUser.bio || "");
        setEditCity(enhancedUser.city || "");
        setEditCountry(enhancedUser.country || "");
        setEditTopics(enhancedUser.topics || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchRealUsers();
  }, []);

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

  const handleAboutSave = () => {
    if (user) {
      setUser({ ...user, bio: editBio });
    }
    setAboutModalOpen(false);
  };

  const handleLocationSave = () => {
    if (user) {
      setUser({ ...user, city: editCity, country: editCountry });
    }
    setLocationModalOpen(false);
  };

  const handleNameSave = () => {
    if (user) {
      setUser({ ...user, name: editName });
    }
    setNameModalOpen(false);
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

  const handleTopicsSave = () => {
    if (user) {
      setUser({ ...user, topics: editTopics });
    }
    setTopicsModalOpen(false);
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
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
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
            onEditName={() => {
              setEditName(user.name || "");
              setNameModalOpen(true);
            }}
            onEditAvatar={() => {
              // Handle avatar edit
              console.log("Edit avatar");
            }}
            onEditCover={() => {
              // Handle cover edit
              console.log("Edit cover");
            }}
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
                  <EditIconButton onClick={() => setLanguageModalOpen(true)} />
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
                          <Box
                            component="img"
                            src={`https://flagcdn.com/${getLanguageFlag(
                              language
                            )}.svg`}
                            alt={`${language} Flag`}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "4px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          />
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
                          <Box
                            component="img"
                            src={`https://flagcdn.com/${getLanguageFlag(
                              language
                            )}.svg`}
                            alt={`${language} Flag`}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "4px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                          />
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
                  <EditIconButton
                    onClick={() => setLearningPreferencesModalOpen(true)}
                  />
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

              {/* Following Section */}
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
                      Following
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {realUsers.length} people
                    </Typography>
                  </Box>
                  <EditIconButton onClick={() => setFollowingModalOpen(true)} />
                </Box>

                {/* Following Preview - Show first 4 */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                  }}
                >
                  {usersLoading ? (
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
                        <Avatar sx={{ width: 48, height: 48, mb: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
                        <Box sx={{ width: 40, height: 12, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                      </Box>
                    ))
                  ) : (
                    randomFollowers.map((follower) => (
                      <Box
                        key={follower.id}
                        onClick={() => handleFollowerClick(follower.id)}
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
                        <UserAvatar
                          user={follower}
                          size={48}
                          sx={{ mb: 1 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            fontWeight: 500,
                            textAlign: "center",
                            fontSize: "0.75rem",
                          }}
                        >
                          {follower.name?.split(' ')[0] || 'User'}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
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
                  <EditIconButton
                    onClick={() => {
                      setEditBio(user.bio || "");
                      setAboutModalOpen(true);
                    }}
                  />
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
                  <EditIconButton
                    onClick={() => {
                      setEditTopics(user.topics || []);
                      setTopicsModalOpen(true);
                    }}
                  />
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
                  {user.topics?.map((topic: string, index: number) => (
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
                  ))}
                </Box>
              </Box>

              {/* Photos Section */}
              <PhotosSection userId={user?.id} isOwnProfile={true} />
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

      {/* Name Edit Modal */}
      <SharedModal
        open={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        title="Edit Name"
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

      {/* Location Edit Modal */}
      <SharedModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        title="Edit Location"
        maxWidth="xs"
        actions={
          <>
            <Button
              onClick={() => setLocationModalOpen(false)}
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
              onClick={handleLocationSave}
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
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="City"
            variant="outlined"
            value={editCity}
            onChange={(e) => setEditCity(e.target.value)}
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
          <TextField
            fullWidth
            size="small"
            label="Country"
            variant="outlined"
            value={editCountry}
            onChange={(e) => setEditCountry(e.target.value)}
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
            <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Following {realUsers.length} people
            </Typography>
            {selectedUsers.size > 0 && (
              <Typography sx={{ 
                color: "#6366f1", 
                fontSize: "0.8rem",
                fontWeight: 500 
              }}>
                ({selectedUsers.size} selected)
              </Typography>
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
                        checked={selectedUsers.size === 12}
                        indeterminate={selectedUsers.size > 0 && selectedUsers.size < 12}
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
                        Select all ({selectedUsers.size}/12)
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
                      {Array.from(selectedUsers).map((userId) => {
                        const userName = [
                          "Alex Johnson",
                          "Maria Garcia", 
                          "David Chen",
                          "Sarah Wilson",
                          "Mike Brown",
                          "Lisa Taylor",
                          "James Davis",
                          "Emma Miller",
                          "Ryan Anderson",
                          "Sophie Martin",
                          "Tom Wilson",
                          "Anna Lee",
                        ][userId - 1];
                        
                        return (
                          <Box key={userId} sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1.5, 
                            py: 0.5,
                            px: 1,
                          }}>
                            <Avatar
                              src={`https://randomuser.me/api/portraits/${
                                userId % 2 === 0 ? "men" : "women"
                              }/${userId + 20}.jpg`}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography sx={{ color: "white", fontSize: "0.8rem" }}>
                              {userName}
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
              {usersLoading ? (
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
                      <Avatar sx={{ width: 48, height: 48, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ width: 120, height: 16, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1, mb: 0.5 }} />
                        <Box sx={{ width: 80, height: 12, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                realUsers.map((user) => {
                  const userIndex = realUsers.indexOf(user) + 1;
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
                              onClick={() => handleConfirmUnfollow(userName, index)}
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
  );
}
