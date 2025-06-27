"use client";

import { IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <IconButton
      onClick={() => router.back()}
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        color: "white",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
}