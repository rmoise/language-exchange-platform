"use client";

import { Box, Typography, Badge } from "@mui/material";
import {
  PeopleOutlined as PeopleIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  PersonOutlined as PersonIcon,
  VideoCall as SessionsIcon,
  HomeOutlined as HomeIcon,
  FavoriteBorderOutlined as FavoriteIcon,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";

// Bottom nav items for mobile
const bottomNavItems = [
  { text: "Home", href: "/app/home", icon: HomeIcon },
  { text: "Connect", href: "/app/connect", icon: PeopleIcon },
  { text: "Matches", href: "/app/matches", icon: FavoriteIcon },
  { text: "Chat", href: "/app/conversations", icon: ChatIcon, badge: 0 },
  { text: "Profile", href: "/app/profile", icon: PersonIcon },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Get current bottom nav value based on pathname
  const getBottomNavValue = () => {
    // Special handling for posts pages - no item should be highlighted
    if (pathname.startsWith("/app/posts/") || pathname === "/app/profile/posts") {
      return -1; // This will unselect all items
    }
    
    // Special handling for users pages (viewing other users) - no item should be highlighted
    if (pathname.startsWith("/app/users/")) {
      return -1; // This will unselect all items
    }
    
    // Special handling for profile sub-pages - highlight "Profile"
    if (pathname.startsWith("/app/profile/")) {
      const profileItem = bottomNavItems.find(item => item.href === "/app/profile");
      return profileItem ? bottomNavItems.indexOf(profileItem) : -1;
    }
    
    const item = bottomNavItems.find((item) => pathname === item.href);
    return item ? bottomNavItems.indexOf(item) : -1;
  };

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
              onClick={() => router.push(item.href)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                color: isActive ? "#a855f7" : "rgba(156, 163, 175, 1)",
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
                        background: "#ef4444",
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
}