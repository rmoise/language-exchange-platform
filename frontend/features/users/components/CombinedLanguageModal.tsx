"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

interface CombinedLanguageModalProps {
  open: boolean;
  onClose: () => void;
  nativeLanguages: string[];
  learningLanguages: string[];
  existingProficiencies?: { [key: string]: number };
  onSave: (
    nativeLanguages: string[],
    learningLanguages: string[],
    proficiencies?: { [key: string]: number }
  ) => void;
}

// Available languages with flags
const availableLanguages = [
  { name: "English", flag: "🇺🇸" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Portuguese", flag: "🇵🇹" },
  { name: "Japanese", flag: "🇯🇵" },
  { name: "Korean", flag: "🇰🇷" },
  { name: "Chinese", flag: "🇨🇳" },
  { name: "Russian", flag: "🇷🇺" },
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Dutch", flag: "🇳🇱" },
  { name: "Swedish", flag: "🇸🇪" },
  { name: "Norwegian", flag: "🇳🇴" },
  { name: "Danish", flag: "🇩🇰" },
  { name: "Finnish", flag: "🇫🇮" },
  { name: "Polish", flag: "🇵🇱" },
  { name: "Czech", flag: "🇨🇿" },
  { name: "Hungarian", flag: "🇭🇺" },
  { name: "Romanian", flag: "🇷🇴" },
  { name: "Greek", flag: "🇬🇷" },
  { name: "Turkish", flag: "🇹🇷" },
  { name: "Hebrew", flag: "🇮🇱" },
  { name: "Thai", flag: "🇹🇭" },
  { name: "Vietnamese", flag: "🇻🇳" },
  { name: "Indonesian", flag: "🇮🇩" },
  { name: "Malay", flag: "🇲🇾" },
  { name: "Filipino", flag: "🇵🇭" },
  { name: "Ukrainian", flag: "🇺🇦" },
];

export default function CombinedLanguageModal({
  open,
  onClose,
  nativeLanguages,
  learningLanguages,
  existingProficiencies = {},
  onSave,
}: CombinedLanguageModalProps) {
  const [editingSection, setEditingSection] = useState<
    "fluent" | "learning" | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempNativeLanguages, setTempNativeLanguages] =
    useState<string[]>(nativeLanguages);
  const [tempLearningLanguages, setTempLearningLanguages] =
    useState<string[]>(learningLanguages);
  const [languageProficiencies, setLanguageProficiencies] = useState<{
    [key: string]: number;
  }>({});

  React.useEffect(() => {
    setTempNativeLanguages(nativeLanguages);
    setTempLearningLanguages(learningLanguages);
    setEditingSection(null);
    setSearchTerm("");
    // Initialize proficiencies for learning languages
    const initialProficiencies: { [key: string]: number } = {};
    learningLanguages.forEach((lang) => {
      initialProficiencies[lang] = existingProficiencies[lang] || 2; // Use existing or default to Beginner
    });
    setLanguageProficiencies(initialProficiencies);
  }, [nativeLanguages, learningLanguages, existingProficiencies, open]);

  const filteredLanguages = availableLanguages.filter((lang) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNativeLanguageToggle = (languageName: string) => {
    setTempNativeLanguages((prev) => {
      if (prev.includes(languageName)) {
        return prev.filter((lang) => lang !== languageName);
      } else {
        // Remove from learning languages if adding to native
        setTempLearningLanguages((prevLearning) =>
          prevLearning.filter((lang) => lang !== languageName)
        );
        // Remove proficiency data when moving to native
        setLanguageProficiencies((prevProf) => {
          const newProf = { ...prevProf };
          delete newProf[languageName];
          return newProf;
        });
        return [...prev, languageName];
      }
    });
  };

  const handleLearningLanguageToggle = (languageName: string) => {
    setTempLearningLanguages((prev) => {
      if (prev.includes(languageName)) {
        // Remove proficiency data when removing language
        setLanguageProficiencies((prevProf) => {
          const newProf = { ...prevProf };
          delete newProf[languageName];
          return newProf;
        });
        return prev.filter((lang) => lang !== languageName);
      } else {
        // Remove from native languages if adding to learning
        setTempNativeLanguages((prevNative) =>
          prevNative.filter((lang) => lang !== languageName)
        );
        // Add default proficiency
        setLanguageProficiencies((prevProf) => ({
          ...prevProf,
          [languageName]: 2, // Default to Beginner
        }));
        return [...prev, languageName];
      }
    });
  };

  const handleProficiencyChange = (language: string, level: number) => {
    setLanguageProficiencies((prev) => ({
      ...prev,
      [language]: level,
    }));
  };

  const getProficiencyLabel = (level: number): string => {
    switch (level) {
      case 1:
        return "Absolute Beginner";
      case 2:
        return "Beginner";
      case 3:
        return "Intermediate";
      case 4:
        return "Advanced";
      case 5:
        return "Fluent";
      default:
        return "Beginner";
    }
  };

  const getProficiencyColor = (level: number): string => {
    switch (level) {
      case 1:
        return "#ef4444"; // red
      case 2:
        return "#f59e0b"; // orange
      case 3:
        return "#eab308"; // yellow
      case 4:
        return "#22c55e"; // green
      case 5:
        return "#3b82f6"; // blue
      default:
        return "#f59e0b";
    }
  };

  const renderProficiencyDots = (language: string, currentLevel: number) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
      <Typography
        variant="caption"
        sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.7rem", mr: 1 }}
      >
        Level:
      </Typography>
      {[1, 2, 3, 4, 5].map((level) => (
        <Box
          key={level}
          onClick={() => handleProficiencyChange(language, level)}
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor:
              level <= currentLevel
                ? getProficiencyColor(currentLevel)
                : "rgba(255, 255, 255, 0.2)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.2)",
              backgroundColor:
                level <= currentLevel
                  ? getProficiencyColor(currentLevel)
                  : "rgba(255, 255, 255, 0.4)",
            },
          }}
        />
      ))}
      <Typography
        variant="caption"
        sx={{
          color: getProficiencyColor(currentLevel),
          fontSize: "0.7rem",
          ml: 1,
        }}
      >
        {getProficiencyLabel(currentLevel)}
      </Typography>
    </Box>
  );

  const handleSave = () => {
    onSave(tempNativeLanguages, tempLearningLanguages, languageProficiencies);
    onClose();
  };

  const handleCancel = () => {
    setTempNativeLanguages(nativeLanguages);
    setTempLearningLanguages(learningLanguages);
    setSearchTerm("");
    setEditingSection(null);
    // Reset proficiencies
    const initialProficiencies: { [key: string]: number } = {};
    learningLanguages.forEach((lang) => {
      initialProficiencies[lang] = existingProficiencies[lang] || 2;
    });
    setLanguageProficiencies(initialProficiencies);
    onClose();
  };

  const isLanguageSelected = (languageName: string) => {
    return (
      tempNativeLanguages.includes(languageName) ||
      tempLearningLanguages.includes(languageName)
    );
  };

  const getLanguageType = (languageName: string) => {
    if (tempNativeLanguages.includes(languageName)) return "native";
    if (tempLearningLanguages.includes(languageName)) return "learning";
    return null;
  };

  const renderLanguageSection = (
    title: string,
    languages: string[],
    emptyMessage: string,
    isEditing: boolean,
    onEditClick: () => void,
    chipColor: string,
    chipBorder: string,
    showProficiency: boolean = false
  ) => (
    <Box
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 1,
        p: 2,
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: "white", fontWeight: 600, fontSize: "0.95rem" }}
        >
          {title}
        </Typography>
        <IconButton
          onClick={onEditClick}
          size="small"
          sx={{
            color: "#6366f1",
            backgroundColor: isEditing
              ? "rgba(0, 188, 212, 0.1)"
              : "transparent",
            "&:hover": {
              backgroundColor: "rgba(0, 188, 212, 0.1)",
            },
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {languages.length > 0 ? (
          languages.map((lang) => (
            <Box key={lang}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={lang}
                  size="small"
                  onDelete={
                    isEditing
                      ? () => {
                          if (title.includes("Fluent")) {
                            handleNativeLanguageToggle(lang);
                          } else {
                            handleLearningLanguageToggle(lang);
                          }
                        }
                      : undefined
                  }
                  sx={{
                    backgroundColor: chipColor,
                    color: "white",
                    border: `1px solid ${chipBorder}`,
                    height: 28,
                    fontSize: "0.8rem",
                    "& .MuiChip-deleteIcon": {
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "1rem",
                      "&:hover": {
                        color: "white",
                      },
                    },
                  }}
                />
              </Box>
              {showProficiency &&
                languageProficiencies[lang] &&
                renderProficiencyDots(lang, languageProficiencies[lang])}
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.4)",
              fontStyle: "italic",
              fontSize: "0.8rem",
            }}
          >
            {emptyMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          border: "1px solid #374151",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
          maxHeight: "85vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "white",
          borderBottom: "1px solid #374151",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 600,
          py: 2,
          fontSize: "1.1rem",
        }}
      >
        Edit Languages
        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          px: 2.5,
          py: 0,
          "&.MuiDialogContent-root": {
            paddingTop: "20px !important",
            paddingBottom: "20px !important",
          },
        }}
      >
        {/* Language Sections */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {renderLanguageSection(
            "Fluent Languages",
            tempNativeLanguages,
            "No fluent languages selected",
            editingSection === "fluent",
            () =>
              setEditingSection(editingSection === "fluent" ? null : "fluent"),
            "rgba(34, 197, 94, 0.2)",
            "rgba(34, 197, 94, 0.3)",
            false
          )}

          {renderLanguageSection(
            "Learning Languages",
            tempLearningLanguages,
            "No learning languages selected",
            editingSection === "learning",
            () =>
              setEditingSection(
                editingSection === "learning" ? null : "learning"
              ),
            "rgba(99, 102, 241, 0.2)",
            "rgba(99, 102, 241, 0.3)",
            true
          )}
        </Box>

        {/* Language Selection (shown when editing) */}
        {editingSection && (
          <>
            <Divider sx={{ my: 2, borderColor: "#374151" }} />

            {/* Search Bar */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{
                          color: "rgba(255, 255, 255, 0.5)",
                          fontSize: "1.2rem",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    height: 40,
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366f1",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "white",
                    fontSize: "0.9rem",
                    "&::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)",
                    },
                  },
                }}
              />
            </Box>

            {/* Language Grid */}
            <Typography
              variant="subtitle2"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                mb: 1.5,
                fontSize: "0.85rem",
              }}
            >
              {editingSection === "fluent"
                ? "Select Fluent Languages"
                : "Select Learning Languages"}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 0.8,
                maxHeight: "240px",
                overflowY: "auto",
                pr: 1,
              }}
            >
              {filteredLanguages.map((language) => {
                const isSelected = isLanguageSelected(language.name);
                const languageType = getLanguageType(language.name);
                const isCurrentType =
                  editingSection === "fluent"
                    ? languageType === "native"
                    : languageType === "learning";

                return (
                  <Button
                    key={language.name}
                    fullWidth
                    size="small"
                    variant={isCurrentType ? "contained" : "outlined"}
                    onClick={() => {
                      if (editingSection === "fluent") {
                        handleNativeLanguageToggle(language.name);
                      } else {
                        handleLearningLanguageToggle(language.name);
                      }
                    }}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      py: 1,
                      px: 1.5,
                      minHeight: 36,
                      backgroundColor: isCurrentType
                        ? editingSection === "fluent"
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(99, 102, 241, 0.2)"
                        : "transparent",
                      borderColor: isCurrentType
                        ? editingSection === "fluent"
                          ? "rgba(34, 197, 94, 0.5)"
                          : "rgba(99, 102, 241, 0.5)"
                        : "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      opacity: 1,
                      "&.Mui-disabled": {
                        color: "rgba(255, 255, 255, 0.7) !important",
                        borderColor: "rgba(255, 255, 255, 0.15) !important",
                        backgroundColor: "rgba(255, 255, 255, 0.02) !important",
                      },
                      "&:hover": {
                        backgroundColor: isCurrentType
                          ? editingSection === "fluent"
                            ? "rgba(34, 197, 94, 0.3)"
                            : "rgba(99, 102, 241, 0.3)"
                          : isSelected && !isCurrentType
                          ? "rgba(255, 255, 255, 0.02)"
                          : "rgba(255, 255, 255, 0.05)",
                        borderColor: isCurrentType
                          ? editingSection === "fluent"
                            ? "rgba(34, 197, 94, 0.7)"
                            : "rgba(99, 102, 241, 0.7)"
                          : "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                    disabled={isSelected && !isCurrentType}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flex: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: "1rem" }}>
                        {language.flag}
                      </Typography>
                      <Typography sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                        {language.name}
                      </Typography>
                      {languageType && (
                        <Chip
                          label={
                            languageType === "native" ? "Fluent" : "Learning"
                          }
                          size="small"
                          sx={{
                            ml: "auto",
                            backgroundColor:
                              languageType === "native"
                                ? "rgba(34, 197, 94, 0.8)"
                                : "rgba(99, 102, 241, 0.8)",
                            color: "white",
                            fontSize: "0.65rem",
                            height: 20,
                          }}
                        />
                      )}
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderTop: "1px solid #374151",
          p: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={handleCancel}
          size="small"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: "#6366f1",
            "&:hover": {
              backgroundColor: "#5855eb",
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
