"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  Badge,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  People as PeopleIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import ProfileCard from "../../../features/users/components/ProfileCard";
import { HighlightedProfilesSection } from "@/features/home";
import { ConnectFilters } from "@/components/ui/ConnectFilters";
import { useSearchParams } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profile_picture?: string;
  city?: string;
  country?: string;
  region?: string;
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
  isNew?: boolean;
  age?: number;
  gender?: string;
  languageLevel?: string;
}

interface CommunityTabsProps {
  users: User[];
  currentUser: User | null;
  onRequestUpdate?: () => void;
}


interface FilterOptions {
  ageRange: [number, number];
  newMembersOnly: boolean;
  sameGenderOnly: boolean;
  country?: string;
  region?: string;
  city?: string;
  languageLevels: string[];
}

export default function CommunityTabs({
  users,
  currentUser,
  onRequestUpdate,
}: CommunityTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [displayCount, setDisplayCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 65],
    newMembersOnly: false,
    sameGenderOnly: false,
    country: "",
    region: "",
    city: "",
    languageLevels: [],
  });
  
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const darkMode = theme.palette.mode === 'dark';


  console.log("CommunityTabs - users received:", users.length, users);

  // Check if we should open filters from URL param
  useEffect(() => {
    if (searchParams.get('openFilters') === 'true') {
      setFilterDrawerOpen(true);
      // Remove the param from URL after opening
      const url = new URL(window.location.href);
      url.searchParams.delete('openFilters');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams]);

  // Apply filters
  const applyFilters = (userList: User[]) => {
    return userList.filter((user) => {
      // Age filter
      if (user.age && (user.age < filters.ageRange[0] || user.age > filters.ageRange[1])) {
        return false;
      }

      // New members filter
      if (filters.newMembersOnly && !user.isNew) {
        return false;
      }

      // Same gender filter
      if (filters.sameGenderOnly && currentUser?.gender && user.gender !== currentUser.gender) {
        return false;
      }

      // Location filters
      if (filters.country && user.country?.toLowerCase() !== filters.country.toLowerCase()) {
        return false;
      }
      if (filters.region && user.region?.toLowerCase() !== filters.region.toLowerCase()) {
        return false;
      }
      if (filters.city && !user.city?.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // Language level filter
      if (filters.languageLevels.length > 0 && user.languageLevel) {
        if (!filters.languageLevels.includes(user.languageLevel.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  // Use all users directly (search now handled by main header)
  const filteredUsers = applyFilters(users);

  // Sort users by match percentage only
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aMatch = a.matchPercentage || 0;
    const bMatch = b.matchPercentage || 0;
    return bMatch - aMatch;
  });

  // Separate nearby users (those with distance data) and apply same sorting
  const nearbyUsers = sortedUsers.filter(
    (user) => user.distance !== undefined
  );
  const allUsers = sortedUsers;


  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setDisplayCount(20); // Reset display count when changing tabs
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayCount((prev) => prev + 20);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const hasMoreUsers = activeTab === 0 
      ? allUsers.length > displayCount 
      : nearbyUsers.length > displayCount;

    if (!hasMoreUsers) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [activeTab, displayCount, allUsers.length, nearbyUsers.length, isLoadingMore, handleLoadMore]);

  // Use ProfileCard instead of custom UserCard

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 300, mb: 2, color: "white" }}
        >
          Language Partners
        </Typography>
        <Typography variant="body1" sx={{ color: "#9ca3af", mb: 3 }}>
          Find people to practice languages with around the world
        </Typography>
      </Box>


      {/* Tabs */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#6366f1",
            },
            "& .MuiTab-root": {
              color: "#9ca3af",
              "&.Mui-selected": {
                color: "#6366f1",
              },
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon sx={{ fontSize: 20 }} />
                All Members
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationIcon sx={{ fontSize: 20 }} />
                Nearby
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            {allUsers.length > 0 ? (
              <>
                {/* First 8 profile cards */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(322px, 322px))",
                    gap: "24px",
                    maxWidth: "1400px",
                    justifyContent: "center",
                    justifyItems: "center",
                    width: "100%",
                  }}
                >
                  {allUsers.slice(0, Math.min(4, displayCount)).map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      width: "322px",
                      height: "360px",
                    }}
                  >
                    <ProfileCard
                      user={{
                        id: user.id,
                        name: user.name,
                        age: 25,
                        avatar: user.avatar,
                        profile_picture:
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=6366f1&color=fff&size=400`,
                        bio:
                          user.bio ||
                          "Learning languages and connecting with people around the world!",
                        city: user.city,
                        country: user.country,
                        location:
                          user.city && user.country
                            ? `${user.city}, ${user.country}`
                            : user.city || user.country,
                        nativeLanguages: user.nativeLanguages,
                        targetLanguages: user.targetLanguages,
                        native_languages: user.nativeLanguages,
                        learning_languages: user.targetLanguages,
                        is_verified: true,
                      } as any}
                      matchPercentage={user.matchPercentage || 85}
                      distance={user.distance ? `${user.distance}km` : "2.1km"}
                      isFollowing={false}
                      hasExistingRequest={user.hasExistingRequest}
                      existingRequestId={user.existingRequestId}
                      darkMode={true}
                      onFollow={onRequestUpdate}
                    />
                  </Box>
                  ))}
                </Box>
                
                {/* Highlighted Profiles Section - shown after first row (4 cards) */}
                {displayCount > 4 && (
                  <Box sx={{ width: "100%", my: 4 }}>
                    <HighlightedProfilesSection currentUser={currentUser} />
                  </Box>
                )}
                
                {/* Remaining profile cards after highlighted section */}
                {displayCount > 4 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(322px, 322px))",
                      gap: "24px",
                      maxWidth: "1400px",
                      justifyContent: "center",
                      justifyItems: "center",
                      width: "100%",
                    }}
                  >
                    {allUsers.slice(4, displayCount).map((user) => (
                      <Box
                        key={user.id}
                        sx={{
                          width: "322px",
                          height: "360px",
                        }}
                      >
                        <ProfileCard
                          user={{
                            id: user.id,
                            name: user.name,
                            age: 25,
                            avatar: user.avatar,
                            profile_picture:
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                              )}&background=6366f1&color=fff&size=400`,
                            bio:
                              user.bio ||
                              "Learning languages and connecting with people around the world!",
                            city: user.city,
                            country: user.country,
                            location:
                              user.city && user.country
                                ? `${user.city}, ${user.country}`
                                : user.city || user.country,
                            nativeLanguages: user.nativeLanguages,
                            targetLanguages: user.targetLanguages,
                            native_languages: user.nativeLanguages,
                            learning_languages: user.targetLanguages,
                            is_verified: true,
                          } as any}
                          matchPercentage={user.matchPercentage || 85}
                          distance={user.distance ? `${user.distance}km` : "2.1km"}
                          isFollowing={false}
                          hasExistingRequest={user.hasExistingRequest}
                          existingRequestId={user.existingRequestId}
                          darkMode={true}
                          onFollow={onRequestUpdate}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ fontSize: "3rem", mb: 2 }}>🔍</Typography>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    color: "white",
                    mb: 1,
                  }}
                >
                  No members found
                </Typography>
                <Typography sx={{ color: "#9ca3af" }}>
                  Try adjusting your search criteria
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            {nearbyUsers.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(322px, 322px))",
                  gap: "24px",
                  maxWidth: "1400px",
                  justifyContent: "center",
                  justifyItems: "center",
                }}
              >
                {nearbyUsers.slice(0, displayCount).map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      width: "322px",
                      height: "360px",
                    }}
                  >
                    <ProfileCard
                      user={{
                        id: user.id,
                        name: user.name,
                        age: 25,
                        avatar: user.avatar,
                        profile_picture:
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=6366f1&color=fff&size=400`,
                        bio:
                          user.bio ||
                          "Learning languages and connecting with people around the world!",
                        city: user.city,
                        country: user.country,
                        location:
                          user.city && user.country
                            ? `${user.city}, ${user.country}`
                            : user.city || user.country,
                        nativeLanguages: user.nativeLanguages,
                        targetLanguages: user.targetLanguages,
                        native_languages: user.nativeLanguages,
                        learning_languages: user.targetLanguages,
                        is_verified: true,
                      } as any}
                      matchPercentage={user.matchPercentage || 85}
                      distance={user.distance ? `${user.distance}km` : "2.1km"}
                      isFollowing={false}
                      hasExistingRequest={user.hasExistingRequest}
                      existingRequestId={user.existingRequestId}
                      darkMode={true}
                      onFollow={onRequestUpdate}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ fontSize: "3rem", mb: 2 }}>📍</Typography>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    color: "white",
                    mb: 1,
                  }}
                >
                  No nearby members found
                </Typography>
                <Typography sx={{ color: "#9ca3af", mb: 3 }}>
                  Enable location sharing to find language partners near you
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<LocationIcon />}
                  sx={{
                    backgroundColor: "#6366f1",
                    color: "white",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#5855eb",
                    },
                  }}
                >
                  Enable Location
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Load More Trigger */}
      {((activeTab === 0 && allUsers.length > displayCount) ||
        (activeTab === 1 && nearbyUsers.length > displayCount)) && (
        <Box 
          ref={loadMoreRef}
          sx={{ 
            textAlign: "center", 
            mt: 4,
            minHeight: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isLoadingMore ? (
            <CircularProgress 
              size={40} 
              sx={{ 
                color: "#6366f1",
              }} 
            />
          ) : (
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              sx={{
                color: "white",
                borderColor: "#374151",
                textTransform: "none",
                px: 4,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  borderColor: "#6366f1",
                },
              }}
            >
              Load More
            </Button>
          )}
        </Box>
      )}
      
      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
            width: isMobile ? "100%" : 400,
            maxWidth: 400,
            p: 3,
          },
        }}
      >
        <ConnectFilters
          onFiltersChange={handleFiltersChange}
          onClose={() => setFilterDrawerOpen(false)}
          darkMode={darkMode}
          currentUserGender={currentUser?.gender}
        />
      </Drawer>
    </Box>
  );
}
