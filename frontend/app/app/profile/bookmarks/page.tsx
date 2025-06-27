import { cookies } from "next/headers";
import { Box, Typography } from "@mui/material";
import HierarchicalBreadcrumb from "@/components/ui/HierarchicalBreadcrumb";
import AnimatedWrapper from "../AnimatedWrapper";
import BookmarksList from "./BookmarksList";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No authentication token");
  }

  const response = await fetch(
    `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL}/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  const data = await response.json();
  return data.data || data.user;
}

export default async function AllBookmarksPage() {
  let user;
  
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Failed to fetch user:", error);
    // Fallback to client-side user fetching
    user = null;
  }

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
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1000px",
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: 4,
          }}
        >
          {/* Breadcrumb Navigation */}
          <Box sx={{ mb: 4 }}>
            <HierarchicalBreadcrumb
              variant="compact"
              showBackButton={true}
              showHomeIcon={true}
            />
          </Box>

          {/* Bookmarks Content */}
          {user ? (
            <BookmarksList user={user} />
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "white" }}>Please log in to view your bookmarks.</Typography>
            </Box>
          )}
        </Box>
      </AnimatedWrapper>
    </Box>
  );
}