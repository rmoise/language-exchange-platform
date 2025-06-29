import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  Grid,
  Chip,
  Modal,
  IconButton,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AlternateEmail as EmailIcon,
  Message as MessageIcon,
  PersonAdd as PersonAddIcon,
  MoreHoriz as MoreIcon,
  Bolt as BoltIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import PhotosSection from "../../profile/[userId]/PhotosSection";
import AnimatedWrapper from "../../profile/AnimatedWrapper";
import ProfileHeader from "../../profile/ProfileHeader";
import { enhanceUserData, getConsistentRandom } from "@/utils/userDataEnhancer";
import HierarchicalBreadcrumb from "@/components/ui/HierarchicalBreadcrumb";

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

async function getUserProfile(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No authentication token");
  }

  const response = await fetch(
    `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();
  return data.data || data.user;
}

function formatJoinDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

function calculateAge(birthDate?: string) {
  if (!birthDate) return 25; // Default age for demo
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { userId } = await params;

  try {
    const [user, currentUser] = await Promise.all([
      getUserProfile(userId),
      getCurrentUser(),
    ]);

    // Determine if viewing own profile
    const isOwnProfile = currentUser.id === userId;

    // Enhance user data with consistent mock information
    const enhancedUser = enhanceUserData(user);

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
        {/* Breadcrumb Navigation */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <HierarchicalBreadcrumb
            variant="compact"
            userName={enhancedUser.name}
          />
        </Box>

        {/* Profile Header */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1200px",
            mx: "auto",
            px: { xs: 2, md: 4 },
            pt: 1,
          }}
        >
          <ProfileHeader
            user={enhancedUser}
            isUserProfile={false}
            actionButtons={
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Button
                  startIcon={<PersonAddIcon />}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    px: 2,
                    py: 0.5,
                    minWidth: "auto",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  Connect
                </Button>
                <Button
                  startIcon={<MessageIcon />}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#6366f1",
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    px: 2,
                    py: 0.5,
                    minWidth: "auto",
                    "&:hover": { backgroundColor: "#5855eb" },
                  }}
                >
                  Message
                </Button>
                <Button
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    px: 2,
                    py: 0.5,
                    minWidth: "auto",
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  <MoreIcon />
                </Button>
              </Box>
            }
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
                  <Typography variant="h5" sx={{ fontWeight: 400, mb: 3 }}>
                  Languages
                </Typography>

                {/* Native Languages */}
                <Typography
                  variant="h6"
                    sx={{ fontWeight: 400, mb: 2, color: "white" }}
                >
                  Native Languages
                </Typography>
                <Box component="ul" sx={{ listStyle: "none", p: 0, mb: 3 }}>
                  {enhancedUser.nativeLanguages?.map(
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
                  {enhancedUser.targetLanguages?.map(
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
                          {/* Language Level Indicator */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <Box
                                  key={level}
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor:
                                      level <= 2
                                        ? "#f59e0b"
                                        : "rgba(255, 255, 255, 0.3)",
                                    transition: "all 0.2s ease",
                                  }}
                                />
                              ))}
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "0.65rem",
                                color: "rgba(255, 255, 255, 0.7)",
                                fontWeight: 500,
                              }}
                            >
                              Beginner
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )
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
                <Typography
                  variant="h5"
                    sx={{ fontWeight: 400, mb: 3, color: "white" }}
                >
                  About Me
                </Typography>

                {/* Bio Section */}
                <Box>
                  <Typography
                    sx={{
                      color: "#e5e7eb",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    "{enhancedUser.bio}"
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
                <Typography
                  variant="h5"
                    sx={{ fontWeight: 400, mb: 3, color: "white" }}
                >
                  Topics
                </Typography>
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
                  {enhancedUser.topics.map((topic: string, index: number) => (
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
              <PhotosSection userId={userId} isOwnProfile={isOwnProfile} />

              {/* References Section */}
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
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 500, color: "white" }}
                  >
                    References
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        color: "white",
                      }}
                    >
                      {Math.floor(getConsistentRandom(userId, 15) * 10) + 3}
                    </Typography>
                    <Typography sx={{ fontSize: "1rem" }}>💬</Typography>
                  </Box>
                </Box>

                {/* Sample References */}
                <Box
                  component="ul"
                  sx={{
                    listStyle: "none",
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {[1, 2, 3].map((ref) => (
                    <Box
                      component="li"
                      key={ref}
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: 1,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Avatar
                          src={`https://randomuser.me/api/portraits/${
                            ref % 2 === 0 ? "men" : "women"
                          }/${Math.floor(
                            getConsistentRandom(userId, ref + 20) * 100
                          )}.jpg`}
                          sx={{ width: 40, height: 40 }}
                        />
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: "0.875rem",
                              color: "white",
                            }}
                          >
                            {["Alex", "Maria", "David"][ref - 1]}
                          </Typography>
                          <Typography
                            sx={{ color: "#9ca3af", fontSize: "0.75rem" }}
                          >
                            {new Date(
                              Date.now() - ref * 7 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          color: "#e5e7eb",
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {
                          [
                            `${enhancedUser.name} is a fantastic conversation partner! Very patient and helpful with language learning.`,
                            `Great experience chatting with ${enhancedUser.name}. Really helped me improve my pronunciation and grammar.`,
                            `Highly recommend! ${enhancedUser.name} is friendly, knowledgeable, and makes learning fun.`,
                          ][ref - 1]
                        }
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="text"
                  sx={{
                    mt: 2,
                    color: "#6366f1",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                    },
                  }}
                >
                  See All
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
        </AnimatedWrapper>
      </Box>
    );
  } catch (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(20, 20, 20, 0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 1.5,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" sx={{ color: "#ef4444", mb: 2 }}>
            Profile Not Found
          </Typography>
          <Typography sx={{ color: "#9ca3af", mb: 3 }}>
            The user profile you're looking for doesn't exist or has been
            removed.
          </Typography>
          <Link href="/app/connect" style={{ textDecoration: "none" }}>
            <Button variant="contained" sx={{ backgroundColor: "#6366f1" }}>
              Back to Community
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }
}
