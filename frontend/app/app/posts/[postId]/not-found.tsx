import { Box, Typography, Button } from "@mui/material";
import { Article as ArticleIcon } from "@mui/icons-material";
import Link from "next/link";

export default function PostNotFound() {
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
          maxWidth: 400,
        }}
      >
        <ArticleIcon sx={{ fontSize: 64, color: "rgba(255, 255, 255, 0.3)", mb: 2 }} />
        <Typography variant="h5" sx={{ color: "#ef4444", mb: 2 }}>
          Post Not Found
        </Typography>
        <Typography sx={{ color: "#9ca3af", mb: 3 }}>
          The post you're looking for doesn't exist or has been removed.
        </Typography>
        <Link href="/app/home" style={{ textDecoration: "none" }}>
          <Button variant="contained" sx={{ backgroundColor: "#6366f1" }}>
            Back to Home
          </Button>
        </Link>
      </Box>
    </Box>
  );
}