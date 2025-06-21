import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import {
  Favorite,
  Comment,
  Share,
  MoreVert,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import CreatePostComponent from "./CreatePostComponent";

// Mock data for posts and events
const mockPosts = [
  {
    id: 1,
    type: "post",
    author: {
      name: "Maria Rodriguez",
      avatar: "https://placehold.co/40x40",
      location: "Madrid, Spain",
      languages: ["Spanish", "English"],
    },
    content:
      "Just had an amazing conversation practice session! Looking for more English speakers to practice with. Anyone interested in a language exchange? 🗣️",
    timestamp: "2 hours ago",
    likes: 12,
    comments: 5,
    image: null,
  },
  {
    id: 2,
    type: "event",
    author: {
      name: "Tokyo Language Club",
      avatar: "https://placehold.co/40x40",
      location: "Tokyo, Japan",
      languages: ["Japanese", "English"],
    },
    title: "Japanese-English Language Exchange Meetup",
    content:
      "Join us for our weekly language exchange meetup! Beginners welcome. We'll have structured conversations and fun activities.",
    timestamp: "4 hours ago",
    likes: 24,
    comments: 8,
    eventDetails: {
      date: "Saturday, Dec 21",
      time: "3:00 PM - 5:00 PM",
      location: "Shibuya Community Center",
      attendees: 15,
    },
  },
  {
    id: 3,
    type: "post",
    author: {
      name: "Ahmed Hassan",
      avatar: "https://placehold.co/40x40",
      location: "Cairo, Egypt",
      languages: ["Arabic", "French"],
    },
    content:
      "Sharing some great French learning resources I found! These podcasts really helped me improve my pronunciation. Link in comments 📚",
    timestamp: "6 hours ago",
    likes: 18,
    comments: 12,
    image: "https://placehold.co/300x200",
  },
];

export default function FeedPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "white",
        p: { xs: 1, md: 0 },
      }}
    >
      {/* Facebook-style Three Column Layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "280px 1fr 320px",
          },
          gap: { xs: 0, md: 3 },
          maxWidth: 1200,
          mx: "auto",
          pt: { xs: 2, md: 3 },
        }}
      >
        {/* Left Sidebar */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "sticky",
            top: 20,
            height: "fit-content",
          }}
        >
          <LeftSidebar />
        </Box>

        {/* Main Feed */}
        <Box
          sx={{
            maxWidth: { xs: "100%", md: "none" },
            mx: { xs: "auto", md: 0 },
          }}
        >
          {/* Mobile Header */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              mb: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 300,
                color: "white",
                mb: 1,
              }}
            >
              News Feed
            </Typography>
          </Box>

          {/* Create Post Section */}
          <CreatePostComponent />

          {/* Feed Content */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {mockPosts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid #374151",
                  borderRadius: 2,
                  color: "white",
                  "&:hover": {
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Author Header */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={post.author.avatar}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    >
                      {post.author.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 500, color: "white" }}
                      >
                        {post.author.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                          {post.author.location} • {post.timestamp}
                        </Typography>
                        {post.author.languages.map((lang) => (
                          <Chip
                            key={lang}
                            label={lang}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(99, 102, 241, 0.2)",
                              color: "#a5b4fc",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              fontSize: "0.75rem",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <IconButton sx={{ color: "#9ca3af" }}>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* Event Title (for events) */}
                  {post.type === "event" && "title" in post && (
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 500,
                        mb: 1,
                        color: "#fbbf24",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <EventIcon sx={{ fontSize: 20 }} />
                      {post.title}
                    </Typography>
                  )}

                  {/* Content */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#e5e7eb",
                      lineHeight: 1.6,
                      mb: post.image ? 2 : 0,
                    }}
                  >
                    {post.content}
                  </Typography>

                  {/* Image (if present) */}
                  {post.image && (
                    <Box
                      component="img"
                      src={post.image}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        borderRadius: 1,
                        mb: 2,
                      }}
                    />
                  )}

                  {/* Event Details (for events) */}
                  {post.type === "event" && "eventDetails" in post && (
                    <Card
                      sx={{
                        backgroundColor: "rgba(251, 191, 36, 0.1)",
                        border: "1px solid rgba(251, 191, 36, 0.3)",
                        borderRadius: 1,
                        mt: 2,
                        mb: 2,
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <ScheduleIcon
                              sx={{ fontSize: 16, color: "#fbbf24" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#fbbf24" }}
                            >
                              {post.eventDetails?.date} •{" "}
                              {post.eventDetails?.time}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocationIcon
                              sx={{ fontSize: 16, color: "#fbbf24" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#fbbf24" }}
                            >
                              {post.eventDetails?.location}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{ color: "#fbbf24", mt: 1 }}
                          >
                            {post.eventDetails?.attendees} people attending
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  <Divider sx={{ borderColor: "#374151", my: 2 }} />

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        startIcon={<Favorite />}
                        sx={{
                          color: "#9ca3af",
                          textTransform: "none",
                          "&:hover": {
                            color: "#ef4444",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                          },
                        }}
                      >
                        {post.likes}
                      </Button>
                      <Button
                        startIcon={<Comment />}
                        sx={{
                          color: "#9ca3af",
                          textTransform: "none",
                          "&:hover": {
                            color: "#6366f1",
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                          },
                        }}
                      >
                        {post.comments}
                      </Button>
                      <Button
                        startIcon={<Share />}
                        sx={{
                          color: "#9ca3af",
                          textTransform: "none",
                          "&:hover": {
                            color: "#22c55e",
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                          },
                        }}
                      >
                        Share
                      </Button>
                    </Box>

                    {/* Join Event Button (for events) */}
                    {post.type === "event" && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#fbbf24",
                          color: "black",
                          textTransform: "none",
                          fontWeight: 500,
                          "&:hover": {
                            backgroundColor: "#f59e0b",
                          },
                        }}
                      >
                        Join Event
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Load More Button */}
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
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
              Load More Posts
            </Button>
          </Box>
        </Box>

        {/* Right Sidebar */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "sticky",
            top: 20,
            height: "fit-content",
          }}
        >
          <RightSidebar />
        </Box>
      </Box>
    </Box>
  );
}

// Left Sidebar Component
function LeftSidebar() {
  const user = { name: "John Doe", avatar: null }; // This would come from Redux

  const shortcuts = [
    { icon: <EventIcon />, label: "Language Events", color: "#f59e0b" },
    { icon: <PeopleIcon />, label: "Study Groups", color: "#3b82f6" },
    { icon: <LanguageIcon />, label: "Language Exchange", color: "#8b5cf6" },
    { icon: <SchoolIcon />, label: "Learning Resources", color: "#22c55e" },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* User Profile Section */}
      <Card
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid #374151",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar src={(user as any).avatar || undefined} sx={{ width: 40, height: 40, mr: 2 }}>
              {user.name.charAt(0)}
            </Avatar>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, color: "white" }}
            >
              {user.name}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{ color: "#9ca3af", fontSize: "0.875rem" }}
          >
            Language enthusiast learning Spanish and French
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Shortcuts */}
      <Typography
        variant="h6"
        sx={{ color: "white", mb: 2, fontSize: "1rem", fontWeight: 500 }}
      >
        Your Shortcuts
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {shortcuts.map((shortcut, index) => (
          <Button
            key={index}
            startIcon={shortcut.icon}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              textTransform: "none",
              py: 1.5,
              px: 2,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
              "& .MuiButton-startIcon": {
                color: shortcut.color,
              },
            }}
          >
            {shortcut.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

// Right Sidebar Component
function RightSidebar() {
  const suggestedFriends = [
    {
      name: "Maria Garcia",
      languages: ["Spanish", "English"],
      location: "Madrid",
    },
    { name: "Jean Dupont", languages: ["French", "German"], location: "Paris" },
    {
      name: "Hiroshi Tanaka",
      languages: ["Japanese", "English"],
      location: "Tokyo",
    },
  ];

  const upcomingEvents = [
    {
      title: "Spanish Conversation Circle",
      time: "Today 7:00 PM",
      attendees: 12,
    },
    { title: "French Movie Night", time: "Tomorrow 8:00 PM", attendees: 8 },
    {
      title: "Language Exchange Meetup",
      time: "Saturday 2:00 PM",
      attendees: 24,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* Suggested Friends */}
      <Card
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid #374151",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "white", mb: 2, fontSize: "1rem", fontWeight: 500 }}
          >
            People You May Know
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {suggestedFriends.map((friend, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <Avatar sx={{ width: 36, height: 36 }}>
                  {friend.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    {friend.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#9ca3af", fontSize: "0.75rem" }}
                  >
                    {friend.location} • {friend.languages.join(", ")}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    backgroundColor: "#6366f1",
                    minWidth: "auto",
                    px: 2,
                    py: 0.5,
                    fontSize: "0.75rem",
                  }}
                >
                  Add
                </Button>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid #374151",
          borderRadius: 2,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "white", mb: 2, fontSize: "1rem", fontWeight: 500 }}
          >
            Upcoming Events
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {upcomingEvents.map((event, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    mb: 0.5,
                  }}
                >
                  {event.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#9ca3af",
                    fontSize: "0.75rem",
                    display: "block",
                    mb: 1,
                  }}
                >
                  {event.time}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "#22c55e", fontSize: "0.75rem" }}
                  >
                    {event.attendees} attending
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "#6366f1",
                      color: "#6366f1",
                      minWidth: "auto",
                      px: 2,
                      py: 0.25,
                      fontSize: "0.7rem",
                    }}
                  >
                    Join
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Language Learning Stats */}
      <Card
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid #374151",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "white", mb: 2, fontSize: "1rem", fontWeight: 500 }}
          >
            Your Progress
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "white", fontSize: "0.875rem" }}
                >
                  Spanish
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#22c55e", fontSize: "0.875rem" }}
                >
                  65%
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "65%",
                    height: "100%",
                    backgroundColor: "#22c55e",
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "white", fontSize: "0.875rem" }}
                >
                  French
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#3b82f6", fontSize: "0.875rem" }}
                >
                  42%
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "42%",
                    height: "100%",
                    backgroundColor: "#3b82f6",
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
