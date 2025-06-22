import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Grid,
  Stack,
  LinearProgress,
  Badge,
} from "@mui/material";
import {
  PlayArrow as StartIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  TrendingUp as ProgressIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  VideoCall as VideoIcon,
  Chat as ChatIcon,
  EmojiEvents as AchievementIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import Link from "next/link";

// Mock data for language learning dashboard
const mockData = {
  activeSessionsCount: 3,
  matchesCount: 8,
  weeklySessionsCompleted: 4,
  totalLearningHours: 23,
  currentStreak: 7,
  recentMatches: [
    {
      id: "1",
      name: "Maria Rodriguez",
      avatar: "https://placehold.co/40x40",
      languages: { native: "Spanish", learning: "English" },
      status: "online",
      lastSession: "2 hours ago",
    },
    {
      id: "2", 
      name: "Jean Dupont",
      avatar: "https://placehold.co/40x40",
      languages: { native: "French", learning: "German" },
      status: "offline",
      lastSession: "Yesterday",
    },
    {
      id: "3",
      name: "Hiroshi Tanaka", 
      avatar: "https://placehold.co/40x40",
      languages: { native: "Japanese", learning: "English" },
      status: "in-session",
      lastSession: "Currently in session",
    },
  ],
  activeSessions: [
    {
      id: "session-1",
      name: "Spanish Conversation Practice",
      host: "Carlos Martinez",
      participants: 2,
      maxParticipants: 4,
      language: "Spanish",
      type: "conversation",
      timeRemaining: "45 min",
    },
    {
      id: "session-2", 
      name: "French Grammar Workshop",
      host: "Sophie Laurent",
      participants: 1,
      maxParticipants: 3,
      language: "French", 
      type: "lesson",
      timeRemaining: "1h 20min",
    },
  ],
  recentActivity: [
    {
      type: "session_completed",
      title: "Completed Spanish practice session",
      description: "45 minutes with Maria Rodriguez",
      time: "2 hours ago",
      icon: <VideoIcon />,
      color: "#22c55e",
    },
    {
      type: "new_match",
      title: "New match with Jean Dupont",
      description: "French ↔ German language exchange", 
      time: "1 day ago",
      icon: <GroupIcon />,
      color: "#6366f1",
    },
    {
      type: "achievement",
      title: "7-day learning streak!",
      description: "Keep up the great work",
      time: "Today",
      icon: <AchievementIcon />,
      color: "#f59e0b",
    },
  ],
  learningProgress: {
    spanish: { level: "Intermediate", progress: 65, sessionsThisWeek: 3 },
    french: { level: "Beginner", progress: 42, sessionsThisWeek: 1 },
  },
};

export default function DashboardPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "white",
        p: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "white",
              mb: 1,
            }}
          >
            Welcome back! 👋
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#9ca3af",
              fontSize: "1.1rem",
            }}
          >
            Ready to practice your languages today?
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyle, borderColor: "#22c55e" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                    }}
                  >
                    <VideoIcon sx={{ color: "#22c55e", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "white" }}>
                      {mockData.weeklySessionsCompleted}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                      Sessions this week
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyle, borderColor: "#6366f1" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                    }}
                  >
                    <GroupIcon sx={{ color: "#6366f1", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "white" }}>
                      {mockData.matchesCount}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                      Active matches
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyle, borderColor: "#f59e0b" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    <AchievementIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "white" }}>
                      {mockData.currentStreak}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                      Day streak
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ ...cardStyle, borderColor: "#8b5cf6" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                    }}
                  >
                    <TimeIcon sx={{ color: "#8b5cf6", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "white" }}>
                      {mockData.totalLearningHours}h
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                      Total hours
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Quick Actions */}
            <Card sx={{ ...cardStyle, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "white", mb: 3, fontWeight: 500 }}
                >
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Link href="/protected/sessions" style={{ textDecoration: "none" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<StartIcon />}
                        sx={{
                          backgroundColor: "#22c55e",
                          color: "white",
                          py: 2,
                          textTransform: "none",
                          fontSize: "1rem",
                          "&:hover": { backgroundColor: "#16a34a" },
                        }}
                      >
                        Start New Session
                      </Button>
                    </Link>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Link href="/protected/community" style={{ textDecoration: "none" }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        startIcon={<SearchIcon />}
                        sx={{
                          borderColor: "#6366f1",
                          color: "#6366f1",
                          py: 2,
                          textTransform: "none", 
                          fontSize: "1rem",
                          "&:hover": {
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            borderColor: "#6366f1",
                          },
                        }}
                      >
                        Find Partners
                      </Button>
                    </Link>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Session Invitations */}
            <Card sx={{ ...cardStyle, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
                    Session Invitations
                  </Typography>
                  <Badge badgeContent={2} color="error">
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(245, 158, 11, 0.2)",
                        color: "#f59e0b",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                      }}
                    />
                  </Badge>
                </Box>

                <Stack spacing={2}>
                  {[
                    {
                      id: "inv-1",
                      sessionName: "Spanish Conversation Practice",
                      invitedBy: "Maria Rodriguez",
                      language: "Spanish",
                      type: "conversation",
                      scheduledFor: "Today 3:00 PM",
                      avatar: "https://placehold.co/40x40",
                    },
                    {
                      id: "inv-2",
                      sessionName: "French Grammar Help",
                      invitedBy: "Jean Dupont", 
                      language: "French",
                      type: "lesson",
                      scheduledFor: "Tomorrow 7:00 PM",
                      avatar: "https://placehold.co/40x40",
                    },
                  ].map((invitation) => (
                    <Box
                      key={invitation.id}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "rgba(245, 158, 11, 0.05)",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                        "&:hover": {
                          backgroundColor: "rgba(245, 158, 11, 0.08)",
                          borderColor: "rgba(245, 158, 11, 0.3)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                            <Avatar src={invitation.avatar} sx={{ width: 32, height: 32 }}>
                              {invitation.invitedBy.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
                                {invitation.sessionName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                                Invited by {invitation.invitedBy}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                            <Chip
                              label={invitation.language}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(99, 102, 241, 0.2)",
                                color: "#a5b4fc",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                              }}
                            />
                            <Chip
                              label={invitation.type}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(34, 197, 94, 0.2)",
                                color: "#86efac",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                              }}
                            />
                            <Typography variant="body2" sx={{ color: "#f59e0b" }}>
                              {invitation.scheduledFor}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: "#6b7280",
                              color: "#9ca3af",
                              textTransform: "none",
                              "&:hover": {
                                backgroundColor: "rgba(107, 114, 128, 0.1)",
                                borderColor: "#6b7280",
                              },
                            }}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "#22c55e",
                              textTransform: "none",
                              "&:hover": { backgroundColor: "#16a34a" },
                            }}
                          >
                            Accept
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body2" sx={{ color: "#9ca3af", mb: 2 }}>
                    No pending invitations
                  </Typography>
                  <Link href="/protected/sessions" style={{ textDecoration: "none" }}>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: "#374151",
                        color: "#9ca3af",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "rgba(99, 102, 241, 0.1)",
                          borderColor: "#6366f1",
                          color: "#6366f1",
                        },
                      }}
                    >
                      Invite a Match to Practice
                    </Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card sx={{ ...cardStyle }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: 500 }}>
                  Recent Activity
                </Typography>
                <Stack spacing={3}>
                  {mockData.recentActivity.map((activity, index) => (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: `${activity.color}20`,
                          color: activity.color,
                        }}
                      >
                        {activity.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ color: "white", fontWeight: 500 }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                          {activity.description}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Your Matches */}
            <Card sx={{ ...cardStyle, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
                    Your Matches
                  </Typography>
                  <Link href="/protected/matches" style={{ textDecoration: "none" }}>
                    <Button
                      size="small"
                      sx={{
                        color: "#6366f1",
                        textTransform: "none",
                        minWidth: "auto",
                      }}
                    >
                      View All
                    </Button>
                  </Link>
                </Box>

                <Stack spacing={2}>
                  {mockData.recentMatches.map((match) => (
                    <Box
                      key={match.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.03)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                        },
                      }}
                    >
                      <Badge
                        variant="dot"
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor:
                              match.status === "online"
                                ? "#22c55e"
                                : match.status === "in-session"
                                ? "#f59e0b"
                                : "#6b7280",
                          },
                        }}
                      >
                        <Avatar src={match.avatar} sx={{ width: 40, height: 40 }}>
                          {match.name.charAt(0)}
                        </Avatar>
                      </Badge>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "white", fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          {match.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#9ca3af", fontSize: "0.75rem" }}
                        >
                          {match.languages.native} ↔ {match.languages.learning}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#9ca3af", fontSize: "0.75rem", display: "block" }}
                        >
                          {match.lastSession}
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
                          textTransform: "none",
                        }}
                      >
                        <ChatIcon sx={{ fontSize: 16 }} />
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card sx={{ ...cardStyle }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: "white", mb: 3, fontWeight: 500 }}>
                  Learning Progress
                </Typography>
                <Stack spacing={3}>
                  {Object.entries(mockData.learningProgress).map(([language, data]) => (
                    <Box key={language}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{ color: "white", textTransform: "capitalize", fontWeight: 500 }}
                        >
                          {language}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                          {data.level}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: language === "spanish" ? "#22c55e" : "#3b82f6",
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          {data.progress}% complete
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          {data.sessionsThisWeek} sessions this week
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// Shared card style
const cardStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(10px)",
  border: "1px solid #374151",
  borderRadius: 2,
  "&:hover": {
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  transition: "border-color 0.2s ease",
};