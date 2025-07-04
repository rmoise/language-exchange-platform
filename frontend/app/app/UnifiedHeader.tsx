"use client";

import {
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Badge,
  Button,
} from "@mui/material";
import {
  PeopleOutlined as PeopleIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  PersonOutlined as PersonIcon,
  Language as LanguageIcon,
  HelpOutlined as HelpIcon,
  FavoriteBorderOutlined as FavoriteIcon,
  VideoCall as SessionsIcon,
  HomeOutlined as HomeIcon,
  Search as SearchIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import NotificationIcon from "@/components/notifications/NotificationIcon";
import UserAvatar from "@/components/ui/UserAvatar";
import type { Notification } from "@/app/actions/notifications";
import { useAppSelector } from "@/lib/hooks";
import { useColorScheme } from "@mui/material/styles";

// Main tab navigation items
const tabNavigationItems = [
  { text: "Home", href: "/app/home", icon: HomeIcon },
  { text: "Connect", href: "/app/connect", icon: PeopleIcon },
  { text: "Sessions", href: "/app/sessions", icon: SessionsIcon },
  { text: "Messages", href: "/app/conversations", icon: ChatIcon },
  { text: "Matches", href: "/app/matches", icon: FavoriteIcon },
  { text: "Profile", href: "/app/profile", icon: PersonIcon },
];

interface UnifiedHeaderProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export default function UnifiedHeader({
  initialNotifications,
  initialUnreadCount,
}: UnifiedHeaderProps) {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { mode, setMode } = useColorScheme();
  
  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  // Prefetch all tab routes on component mount for faster navigation
  useEffect(() => {
    tabNavigationItems.forEach(item => {
      router.prefetch(item.href);
    });
  }, [router]);

  // Memoized tab value calculation for better performance
  const currentTabValue = useMemo(() => {
    // Special handling for requests pages - they should highlight "Matches"
    if (pathname.startsWith("/app/requests")) {
      const matchesIndex = tabNavigationItems.findIndex(item => item.href === "/app/matches");
      return matchesIndex !== -1 ? matchesIndex : 0;
    }
    
    // Special handling for posts pages - no tab should be highlighted
    if (pathname.startsWith("/app/posts/") || pathname === "/app/profile/posts") {
      return false; // This will unselect all tabs
    }
    
    // Special handling for users pages (viewing other users) - no tab should be highlighted
    if (pathname.startsWith("/app/users/")) {
      return false; // This will unselect all tabs
    }
    
    // Special handling for profile sub-pages - highlight "Profile"
    if (pathname.startsWith("/app/profile/")) {
      const profileIndex = tabNavigationItems.findIndex(item => item.href === "/app/profile");
      return profileIndex !== -1 ? profileIndex : false;
    }
    
    const currentItem = tabNavigationItems.find((item) => pathname === item.href);
    return currentItem ? tabNavigationItems.indexOf(currentItem) : false;
  }, [pathname]);

  // Handle search functionality
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Navigate to connect page with search query
    if (pathname !== "/app/connect") {
      router.push(`/app/connect?search=${encodeURIComponent(value)}`);
    } else {
      // Update URL with search parameter
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('search', value);
      } else {
        url.searchParams.delete('search');
      }
      router.push(url.pathname + url.search);
    }
  };

  // Handle scroll effect for header with debouncing
  useEffect(() => {
    let rafId: number | null = null;
    
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        const mainContent = document.querySelector('[data-scroll-container="true"]');
        const scrollTop = mainContent ? mainContent.scrollTop : 0;
        setHeaderScrolled(scrollTop > 50);
      });
    };

    // Find the main content container and add scroll listener
    const mainContent = document.querySelector('[data-scroll-container="true"]');
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        mainContent.removeEventListener("scroll", handleScroll);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, []);

  return (
    <>
      {/* Desktop Header with Integrated Tab Navigation */}
      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          position: "sticky",
          top: 0,
          zIndex: 1000,
          px: headerScrolled ? 0 : 3,
          pt: headerScrolled ? 0 : 3,
          transition: "padding 0.3s ease-out",
          willChange: "padding",
        }}
      >
        <Box
          sx={{
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(10px)",
            border: "1px solid #374151",
            borderRadius: headerScrolled ? 0 : 1,
            transition: "border-radius 0.3s ease-out",
            "&:hover": {
              borderColor: "#6366f1",
              background: "rgba(0, 0, 0, 0.6)",
            },
          }}
        >
          {/* Header Top Section */}
          <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          {/* Left Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#6366f1",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LanguageIcon sx={{ fontSize: 22, color: "white" }} />
              </Box>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  letterSpacing: "-0.025em",
                  color: "white",
                }}
              >
                LinguaConnect
              </Typography>
            </Box>
          </Box>

          {/* Right Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                },
              }}
            >
              {mode === "dark" ? (
                <LightModeIcon sx={{ fontSize: 20 }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            <NotificationIcon
              initialNotifications={initialNotifications}
              initialUnreadCount={initialUnreadCount}
            />
            <IconButton
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                },
              }}
            >
              <HelpIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <UserAvatar user={user} size={32} />
          </Box>
        </Box>

        {/* Tab Navigation Integrated */}
        <Box
          sx={{
            borderTop: "1px solid #374151",
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Tabs
            value={currentTabValue}
            onChange={(event: React.SyntheticEvent, newValue: number) => {
              const selectedItem = tabNavigationItems[newValue];
              if (selectedItem) {
                // Always allow navigation, even to the same route
                // This allows users to click Profile tab to go back to main profile from sub-pages
                setIsNavigating(true);
                // Use prefetch for faster navigation
                router.prefetch(selectedItem.href);
                router.push(selectedItem.href);
                // Reset loading state after a short delay
                setTimeout(() => setIsNavigating(false), 500);
              }
            }}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#6366f1",
                height: 2,
              },
              "& .MuiTab-root": {
                color: "#9ca3af",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 400,
                minWidth: "auto",
                px: 2,
                py: 1.5,
                transition: "all 0.2s ease",
                opacity: isNavigating ? 0.6 : 1,
                "&:hover": {
                  color: "#e5e7eb",
                  backgroundColor: "rgba(99, 102, 241, 0.05)",
                },
                "&.Mui-selected": {
                  color: "#6366f1",
                  fontWeight: 500,
                },
              },
              "& .MuiTabs-flexContainer": {
                gap: 1,
              },
            }}
          >
            {tabNavigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Tab
                  key={item.text}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Icon sx={{ fontSize: 18 }} />
                      <span>{item.text}</span>
                    </Box>
                  }
                  value={index}
                />
              );
            })}
          </Tabs>

          {/* Search Bar - Always visible */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 1.5,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                px: 2,
                py: 1,
                minWidth: 200,
                maxWidth: 250,
                "&:hover": {
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
                "&:focus-within": {
                  borderColor: "#6366f1",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
            <SearchIcon
              sx={{
                fontSize: 18,
                color: "rgba(255, 255, 255, 0.6)",
                mr: 1,
              }}
            />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "0.875rem",
                width: "100%",
              }}
            />
          </Box>
          
          {/* Filter Button - Only show on Connect page */}
          {pathname === "/app/connect" && (
              <IconButton
                onClick={() => {
                  // Navigate to connect page with filter param to open drawer
                  router.push('/app/connect?openFilters=true');
                }}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderColor: "#6366f1",
                    color: "#6366f1",
                  },
                }}
              >
                <FilterListIcon sx={{ fontSize: 20 }} />
              </IconButton>
          )}
            </Box>
        </Box>
      </Box>
      </Box>

      {/* Mobile Header */}
      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid #374151",
          minHeight: 72,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LanguageIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: "white",
              letterSpacing: "-0.02em",
              display: { xs: "none", sm: "block" },
            }}
          >
            LinguaConnect
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: "#9ca3af",
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                color: "#6366f1",
              },
            }}
          >
            {mode === "dark" ? (
              <LightModeIcon sx={{ fontSize: 20 }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
          <NotificationIcon
            initialNotifications={initialNotifications}
            initialUnreadCount={initialUnreadCount}
          />
          <UserAvatar user={user} size={32} />
        </Box>
      </Box>
    </>
  );
}