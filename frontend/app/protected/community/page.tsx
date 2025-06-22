import {
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import { cookies } from "next/headers";
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import CommunityTabs from "./CommunityTabs";
import {
  enhanceUserData,
  calculateMatchPercentage,
} from "@/utils/userDataEnhancer";

async function searchUsers(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No authentication token");
  }

  // Build query string from search params
  const queryParams = new URLSearchParams();
  // Increase limit to show more users (including Test User 5)
  queryParams.append("limit", "50");
  if (searchParams.native && typeof searchParams.native === "string") {
    queryParams.append("native", searchParams.native);
  }
  if (searchParams.target && typeof searchParams.target === "string") {
    queryParams.append("target", searchParams.target);
  }
  if (searchParams.location && typeof searchParams.location === "string") {
    queryParams.append("location", searchParams.location);
  }
  if (
    searchParams.useLocation === "true" &&
    searchParams.maxDistance &&
    typeof searchParams.maxDistance === "string"
  ) {
    queryParams.append("useLocation", "true");
    queryParams.append("maxDistance", searchParams.maxDistance);
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/users?${queryParams}`;
  console.log("Fetching users from:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch users:", errorText);
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  console.log("Raw API response:", data);
  const users = data.data || data.users || [];
  console.log("Extracted users:", users);
  return users;
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Filter users by location
function filterUsersByLocation(
  users: any[],
  currentUser: any,
  searchParams: any
): any[] {
  let filteredUsers = [...users];

  // Filter by location text (city or country)
  if (searchParams.location) {
    const locationQuery = searchParams.location.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.city?.toLowerCase().includes(locationQuery) ||
        user.country?.toLowerCase().includes(locationQuery)
    );
  }

  // Filter by distance if user coordinates are available
  if (
    searchParams.useLocation === "true" &&
    currentUser?.latitude &&
    currentUser?.longitude &&
    searchParams.maxDistance
  ) {
    const maxDistance = parseInt(searchParams.maxDistance);
    filteredUsers = filteredUsers.filter((user) => {
      if (!user.latitude || !user.longitude) return false;

      const distance = calculateDistance(
        currentUser.latitude,
        currentUser.longitude,
        user.latitude,
        user.longitude
      );

      // Add distance to user object for display
      user.distance = Math.round(distance);

      return distance <= maxDistance;
    });
  }

  return filteredUsers;
}

async function getCurrentUser(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.data || data.user;
    }
  } catch (error) {
    console.error("Failed to fetch current user:", error);
  }
  return null;
}

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CommunityPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  let users: any[] = [];
  let currentUser: any = null;
  let error: string | null = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new Error("No authentication token");
    }

    // Fetch current user and search results in parallel
    const [currentUserResult, usersResult] = await Promise.all([
      getCurrentUser(token),
      searchUsers(resolvedSearchParams),
    ]);

    currentUser = currentUserResult;
    users = usersResult || [];

    // Apply location-based filtering
    users = filterUsersByLocation(users, currentUser, resolvedSearchParams);

    // Apply search filtering if search query exists
    if (
      resolvedSearchParams.search &&
      typeof resolvedSearchParams.search === "string"
    ) {
      const searchQuery = resolvedSearchParams.search.toLowerCase();
      users = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery) ||
          user.city?.toLowerCase().includes(searchQuery) ||
          user.country?.toLowerCase().includes(searchQuery) ||
          user.nativeLanguages?.some((lang: string) =>
            lang.toLowerCase().includes(searchQuery)
          ) ||
          user.targetLanguages?.some((lang: string) =>
            lang.toLowerCase().includes(searchQuery)
          ) ||
          user.bio?.toLowerCase().includes(searchQuery)
      );
    }

    // Enhance user data with consistent mock information and match percentages
    users = users.map((user, index) => {
      const enhancedUser = enhanceUserData(user, index);
      return {
        ...enhancedUser,
        matchPercentage: calculateMatchPercentage(user, currentUser),
      };
    });

    // Filter out current user from community list
    users = users.filter((user) => user.id !== currentUser?.id);

    // Sort by match percentage, then by distance if available
    users.sort((a, b) => {
      const matchDiff = b.matchPercentage - a.matchPercentage;
      if (matchDiff !== 0) return matchDiff;

      // If match percentages are equal, sort by distance (closer first)
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }

      return 0;
    });

    console.log("Final users to display:", users.length);
  } catch (err) {
    console.error("Error in CommunityPage:", err);
    error = err instanceof Error ? err.message : "Failed to load users";
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        overflow: "visible",
      }}
    >
      {error ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#ef4444", fontWeight: 500, mb: 2 }}>
            ⚠️ {error}
          </Typography>
        </Box>
      ) : (
        <CommunityTabs users={users} currentUser={currentUser} />
      )}
    </Box>
  );
}
