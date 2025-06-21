"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Chip, LinearProgress } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import LanguageSelectionModal from "./LanguageSelectionModal";

interface User {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  profileImage?: string;
  city?: string;
  country?: string;
  bio?: string;
  nativeLanguages?: string[];
  targetLanguages?: string[];
  interests?: string[];
  createdAt?: string;
}

interface LanguagesTabProps {
  user: User;
}

// Mock data for language proficiency levels
const mockLanguageProficiency = {
  German: { level: "Beginner", progress: 25 },
  Spanish: { level: "Intermediate", progress: 60 },
  French: { level: "Advanced", progress: 85 },
};

// Language flag mapping (using emoji flags)
const languageFlags: { [key: string]: string } = {
  English: "🇺🇸",
  German: "🇩🇪",
  Spanish: "🇪🇸",
  French: "🇫🇷",
  Italian: "🇮🇹",
  Portuguese: "🇵🇹",
  Japanese: "🇯🇵",
  Korean: "🇰🇷",
  Chinese: "🇨🇳",
  Russian: "🇷🇺",
  Arabic: "🇸🇦",
  Hindi: "🇮🇳",
};

export default function LanguagesTab({ user }: LanguagesTabProps) {
  const [fluentLanguages, setFluentLanguages] = useState<string[]>([]);
  const [translateLanguages, setTranslateLanguages] = useState<string[]>([]);
  const [nativeLanguages, setNativeLanguages] = useState<string[]>(
    user?.nativeLanguages || []
  );
  const [learningLanguages, setLearningLanguages] = useState<string[]>(
    user?.targetLanguages || []
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "native" | "fluent" | "learning" | "translate"
  >("native");
  const [modalTitle, setModalTitle] = useState("");

  const handleEdit = (
    section: "native" | "fluent" | "learning" | "translate"
  ) => {
    const titles = {
      native: "Edit Native Languages",
      fluent: "Edit Fluent Languages",
      learning: "Edit Learning Languages",
      translate: "Edit Translation Languages",
    };

    setModalType(section);
    setModalTitle(titles[section]);
    setModalOpen(true);
  };

  const handleModalSave = (
    languages: string[],
    proficiencyLevels?: { [key: string]: string }
  ) => {
    switch (modalType) {
      case "native":
        setNativeLanguages(languages);
        break;
      case "fluent":
        setFluentLanguages(languages);
        break;
      case "learning":
        setLearningLanguages(languages);
        // TODO: Handle proficiency levels
        break;
      case "translate":
        setTranslateLanguages(languages);
        break;
    }
    // TODO: Save to backend
  };

  const getCurrentLanguages = () => {
    switch (modalType) {
      case "native":
        return nativeLanguages;
      case "fluent":
        return fluentLanguages;
      case "learning":
        return learningLanguages;
      case "translate":
        return translateLanguages;
      default:
        return [];
    }
  };

  const getLanguageFlag = (language: string) => {
    return languageFlags[language] || "🌐";
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "#ef4444";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* I am native in */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            I am native in
          </Typography>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleEdit("native")}
            sx={{
              color: "#6366f1",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              },
            }}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {nativeLanguages && nativeLanguages.length > 0 ? (
            nativeLanguages.map((language, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Typography sx={{ fontSize: "1.2rem" }}>
                  {getLanguageFlag(language)}
                </Typography>
                <Typography sx={{ color: "white", fontWeight: 500 }}>
                  {language}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              No native languages set
            </Typography>
          )}
        </Box>
      </Box>

      {/* I am fluent in */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            I am fluent in
          </Typography>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleEdit("fluent")}
            sx={{
              color: "#6366f1",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              },
            }}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {fluentLanguages.length > 0 ? (
            fluentLanguages.map((language, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Typography sx={{ fontSize: "1.2rem" }}>
                  {getLanguageFlag(language)}
                </Typography>
                <Typography sx={{ color: "white", fontWeight: 500 }}>
                  {language}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              No languages selected
            </Typography>
          )}
        </Box>
      </Box>

      {/* I am learning */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            I am learning
          </Typography>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleEdit("learning")}
            sx={{
              color: "#6366f1",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              },
            }}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {learningLanguages && learningLanguages.length > 0 ? (
            learningLanguages.map((language, index) => {
              const proficiency =
                mockLanguageProficiency[
                  language as keyof typeof mockLanguageProficiency
                ];
              return (
                <Box key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Typography sx={{ fontSize: "1.2rem" }}>
                        {getLanguageFlag(language)}
                      </Typography>
                      <Typography sx={{ color: "white", fontWeight: 500 }}>
                        {language}
                      </Typography>
                    </Box>
                    {proficiency && (
                      <Chip
                        label={proficiency.level}
                        size="small"
                        sx={{
                          backgroundColor: getLevelColor(proficiency.level),
                          color: "white",
                          fontWeight: 500,
                          fontSize: "0.75rem",
                        }}
                      />
                    )}
                  </Box>
                  {proficiency && (
                    <LinearProgress
                      variant="determinate"
                      value={proficiency.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getLevelColor(proficiency.level),
                          borderRadius: 3,
                        },
                      }}
                    />
                  )}
                </Box>
              );
            })
          ) : (
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              No learning languages set
            </Typography>
          )}
        </Box>
      </Box>

      {/* Translate incoming messages to */}
      <Box
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            Translate incoming messages to
          </Typography>
          <Button
            startIcon={<EditIcon />}
            onClick={() => handleEdit("translate")}
            sx={{
              color: "#6366f1",
              textTransform: "none",
              fontSize: "0.9rem",
              "&:hover": {
                backgroundColor: "rgba(99, 102, 241, 0.1)",
              },
            }}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {translateLanguages.length > 0 ? (
            translateLanguages.map((language, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Typography sx={{ fontSize: "1.2rem" }}>
                  {getLanguageFlag(language)}
                </Typography>
                <Typography sx={{ color: "white", fontWeight: 500 }}>
                  {language}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              No languages selected
            </Typography>
          )}
        </Box>
      </Box>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        selectedLanguages={getCurrentLanguages()}
        onSave={handleModalSave}
        showProficiency={modalType === "learning"}
        type={modalType}
      />
    </Box>
  );
}
