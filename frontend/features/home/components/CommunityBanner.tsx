import React from "react";
import { Box, Stack, Typography, Button, Avatar } from "@mui/material";
import { 
  AddCircleOutline as AddCircleOutlineIcon,
} from "@mui/icons-material";

interface CommunityBannerProps {
  memberCount?: number;
  onInviteClick?: () => void;
  onMembersClick?: () => void;
  darkMode?: boolean;
  userAvatar?: string;
  userName?: string;
}

export const CommunityBanner: React.FC<CommunityBannerProps> = ({
  memberCount = 26905,
  onInviteClick,
  onMembersClick,
  darkMode = false,
  userAvatar,
  userName = "User",
}) => {
  const formattedMemberCount = memberCount.toLocaleString();

  return (
    <Box
      sx={{
        mb: 4,
        p: { xs: 3, sm: 4, md: 5 },
        background: darkMode
          ? "rgba(30, 30, 30, 0.5)"
          : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        border: "1px solid",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        position: "relative",
        overflow: "hidden",
        boxShadow: darkMode
          ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "400px",
          height: "400px",
          background: darkMode
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 50%)"
            : "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-5%",
          width: "300px",
          height: "300px",
          background: darkMode
            ? "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={userAvatar}
              sx={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                fontSize: "18px",
                fontWeight: 600,
                border: "2px solid",
                borderColor: darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.15)",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
              }}
            >
              {!userAvatar && userName.charAt(0).toUpperCase()}
            </Avatar>
            <Stack spacing={0.5}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "20px", sm: "24px" },
                  color: darkMode ? "#fff" : "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Language Learning Community
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? "#94a3b8" : "#64748b",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Public Community
                </Typography>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: darkMode ? "#475569" : "#cbd5e1",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: darkMode ? "#94a3b8" : "#64748b",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    transition: "color 0.2s",
                    "&:hover": {
                      color: darkMode ? "#e2e8f0" : "#334155",
                    }
                  }}
                  onClick={onMembersClick}
                >
                  <Box
                    component="span"
                    sx={{
                      color: darkMode ? "#e2e8f0" : "#0f172a",
                      fontWeight: 700,
                    }}
                  >
                    {formattedMemberCount}
                  </Box>
                  members
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon sx={{ fontSize: 20 }} />}
          onClick={onInviteClick}
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            px: 3,
            py: 1.25,
            fontSize: "15px",
            fontWeight: 600,
            background: darkMode
              ? "#fff"
              : "#0f172a",
            color: darkMode
              ? "#0f172a"
              : "#fff",
            boxShadow: "none",
            transition: "all 0.2s",
            "&:hover": {
              background: darkMode
                ? "#f1f5f9"
                : "#1e293b",
              transform: "translateY(-1px)",
              boxShadow: darkMode
                ? "0 10px 20px -5px rgba(0, 0, 0, 0.3)"
                : "0 10px 20px -5px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          Invite
        </Button>
      </Stack>
    </Box>
  );
};