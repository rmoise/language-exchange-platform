"use client";

import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PeopleOutlined as PeopleIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  PersonOutlined as PersonIcon,
  Language as LanguageIcon,
  NotificationsOutlined as NotificationsIcon,
  HelpOutlined as HelpIcon,
  FavoriteBorderOutlined as FavoriteIcon,
  VideoCall as SessionsIcon,
  HomeOutlined as HomeIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import UserAvatar from "@/components/ui/UserAvatar";

// Main tab navigation items (subset of navigation items for header tabs)
const tabNavigationItems = [
  { text: "Home", href: "/protected/feed", icon: HomeIcon },
  { text: "Community", href: "/protected/community", icon: PeopleIcon },
  { text: "Sessions", href: "/protected/sessions", icon: SessionsIcon },
  { text: "Messages", href: "/protected/conversations", icon: ChatIcon },
  { text: "Matches", href: "/protected/matches", icon: FavoriteIcon },
  { text: "Profile", href: "/protected/profile", icon: PersonIcon },
];

// Bottom nav items for mobile (simplified main features)
const bottomNavItems = [
  { text: "Home", href: "/protected/feed", icon: HomeIcon },
  { text: "Community", href: "/protected/community", icon: PeopleIcon },
  { text: "Sessions", href: "/protected/sessions", icon: SessionsIcon },
  { text: "Chat", href: "/protected/conversations", icon: ChatIcon, badge: 0 },
  { text: "Profile", href: "/protected/profile", icon: PersonIcon },
];

export default function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const pathname = usePathname();
  const router = useRouter();

  // Handle search functionality
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Navigate to community page with search query
    if (pathname !== "/protected/community") {
      router.push(`/protected/community?search=${encodeURIComponent(value)}`);
    } else {
      // Update URL with search parameter
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('search', value);
      } else {
        url.searchParams.delete('search');
      }
      router.push((url.pathname + url.search) as any);
    }
  };

  // Get current user from Redux store
  const user = useAppSelector((state) => state.auth.user);

  // Get current bottom nav value based on pathname
  const getBottomNavValue = () => {
    const item = bottomNavItems.find((item) => {
      if (item.href === "/protected/requests/incoming") {
        return pathname.startsWith("/protected/requests");
      }
      return pathname === item.href;
    });
    return item ? bottomNavItems.indexOf(item) : 0;
  };

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector('[data-scroll-container="true"]');
      const scrollTop = mainContent ? mainContent.scrollTop : 0;
      setHeaderScrolled(scrollTop > 50);
    };

    // Find the main content container and add scroll listener
    const mainContent = document.querySelector('[data-scroll-container="true"]');
    if (mainContent) {
      mainContent.addEventListener("scroll", handleScroll);
      return () => mainContent.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Bottom navigation component for mobile - Glass morphism design
  const BottomNav = () => {
    const currentIndex = getBottomNavValue();

    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          left: 16,
          right: 16,
          zIndex: 1000,
          display: { xs: "block", lg: "none" },
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "12px",
          px: 6,
          py: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {bottomNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === currentIndex;

            return (
              <Box
                key={item.text}
                onClick={() => router.push(item.href as any)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  color: isActive ? "#a855f7" : "rgba(156, 163, 175, 1)", // purple-500 for active, gray-400 for inactive
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                {/* Icon with optional badge */}
                <Box
                  sx={{
                    position: "relative",
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.badge && item.badge > 0 ? (
                    <Badge
                      badgeContent={item.badge}
                      sx={{
                        "& .MuiBadge-badge": {
                          background: "#ef4444", // red-500
                          color: "white",
                          fontSize: "0.5rem",
                          fontWeight: 600,
                          minWidth: "14px",
                          height: "14px",
                          borderRadius: "7px",
                          border: "1px solid rgba(0, 0, 0, 0.6)",
                          top: -2,
                          right: -2,
                        },
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 24,
                          color: "inherit",
                          transition: "all 0.3s ease",
                        }}
                      />
                    </Badge>
                  ) : (
                    <Icon
                      sx={{
                        fontSize: 24,
                        color: "inherit",
                        transition: "all 0.3s ease",
                      }}
                    />
                  )}
                </Box>

                {/* Text label */}
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "inherit",
                    transition: "all 0.3s ease",
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#000000",
        color: "white",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, #000000 50%)",
          zIndex: -1,
        },
      }}
    >
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Mobile Header - Theme Consistent */}
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
          {/* Logo & User Profile Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

            {/* User Info */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
                flex: 1,
                ml: 1,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "white",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Language Learner
                </Typography>
                <Typography
                  sx={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  user@linguaconnect.io
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <IconButton
              sx={{
                width: 32,
                height: 32,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                },
                borderRadius: "12px",
                border: "1px solid #374151",
              }}
            >
              <NotificationsIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
            </IconButton>
            <UserAvatar
              user={user}
              size={32}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  transform: "scale(1.05)",
                },
                transition: "transform 0.2s ease",
              }}
            />
          </Box>
        </Box>

        {/* Desktop Header with Integrated Tab Navigation */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(10px)",
            border: "1px solid #374151",
            borderRadius: headerScrolled ? 0 : 1,
            mb: headerScrolled ? 0 : 3,
            mx: headerScrolled ? 0 : 3,
            mt: headerScrolled ? 0 : 3,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
                  sx={{
                    position: "relative",
                    color: "#9ca3af",
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                      color: "#6366f1",
                    },
                  }}
                >
                  <NotificationsIcon sx={{ fontSize: 20 }} />
                  <Box
                    sx={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#06b6d4",
                    }}
                  />
                </IconButton>
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
                value={(() => {
                  const currentItem = tabNavigationItems.find((item) => {
                    if (item.href === "/protected/requests/incoming") {
                      return pathname.startsWith("/protected/requests");
                    }
                    return pathname === item.href;
                  });
                  return currentItem
                    ? tabNavigationItems.indexOf(currentItem)
                    : 0;
                })()}
                onChange={(event: React.SyntheticEvent, newValue: number) => {
                  const selectedItem = tabNavigationItems[newValue];
                  if (selectedItem) {
                    router.push(selectedItem.href as any);
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
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Icon sx={{ fontSize: 18 }} />
                          <span>{item.text}</span>
                        </Box>
                      }
                      value={index}
                    />
                  );
                })}
              </Tabs>

              {/* Search Bar */}
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
                  placeholder="Search users..."
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
            </Box>
          </Box>

        {/* Main Content */}
        <Box
          data-scroll-container="true"
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, lg: 3 },
            pt: { xs: 2, lg: 3 },
            pb: { xs: 12, lg: 3 }, // Extra padding bottom for mobile bottom nav
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </Box>
  );
}
