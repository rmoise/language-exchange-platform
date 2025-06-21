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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";

interface LanguageSelectionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  selectedLanguages: string[];
  onSave: (
    languages: string[],
    proficiencyLevels?: { [key: string]: string }
  ) => void;
  showProficiency?: boolean;
  type: "native" | "fluent" | "learning" | "translate";
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

const proficiencyOptions = ["Beginner", "Intermediate", "Advanced", "Fluent"];

export default function LanguageSelectionModal({
  open,
  onClose,
  title,
  selectedLanguages,
  onSave,
  showProficiency = false,
  type,
}: LanguageSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedLanguages, setTempSelectedLanguages] =
    useState<string[]>(selectedLanguages);
  const [proficiencyLevels, setProficiencyLevels] = useState<{
    [key: string]: string;
  }>({});

  React.useEffect(() => {
    setTempSelectedLanguages(selectedLanguages);
  }, [selectedLanguages, open]);

  const filteredLanguages = availableLanguages.filter((lang) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageToggle = (languageName: string) => {
    setTempSelectedLanguages((prev) => {
      if (prev.includes(languageName)) {
        // Remove language and its proficiency level
        const newProficiency = { ...proficiencyLevels };
        delete newProficiency[languageName];
        setProficiencyLevels(newProficiency);
        return prev.filter((lang) => lang !== languageName);
      } else {
        // Add language with default proficiency level for learning languages
        if (showProficiency) {
          setProficiencyLevels((prev) => ({
            ...prev,
            [languageName]: "Beginner",
          }));
        }
        return [...prev, languageName];
      }
    });
  };

  const handleProficiencyChange = (languageName: string, level: string) => {
    setProficiencyLevels((prev) => ({
      ...prev,
      [languageName]: level,
    }));
  };

  const handleSave = () => {
    onSave(
      tempSelectedLanguages,
      showProficiency ? proficiencyLevels : undefined
    );
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedLanguages(selectedLanguages);
    setProficiencyLevels({});
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.8)",
          color: "white",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 600,
        }}
      >
        {title}
        <IconButton
          onClick={handleCancel}
          sx={{ color: "rgba(255, 255, 255, 0.7)" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: "rgba(20, 20, 20, 0.6)", p: 0 }}>
        {/* Search Bar */}
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <TextField
            fullWidth
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "white",
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
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          />
        </Box>

        {/* Selected Languages */}
        {tempSelectedLanguages.length > 0 && (
          <Box
            sx={{ p: 3, borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Typography
              sx={{
                color: "white",
                mb: 3,
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              Selected Languages ({tempSelectedLanguages.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {tempSelectedLanguages.map((langName) => {
                const language = availableLanguages.find(
                  (l) => l.name === langName
                );
                return (
                  <Box
                    key={langName}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      backgroundColor: "rgba(0, 188, 212, 0.15)",
                      border: "1px solid #6366f1",
                      borderRadius: 2,
                      px: 2.5,
                      py: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(0, 188, 212, 0.25)",
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: "1.2rem" }}>
                      {language?.flag}
                    </Typography>
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      }}
                    >
                      {langName}
                    </Typography>
                    <IconButton
                      onClick={() => handleLanguageToggle(langName)}
                      size="small"
                      sx={{
                        color: "#ef4444",
                        ml: 1,
                        "&:hover": {
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Proficiency Configuration - Separate Section */}
        {showProficiency && tempSelectedLanguages.length > 0 && (
          <Box
            sx={{
              p: 3,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(0, 188, 212, 0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  backgroundColor: "#6366f1",
                  borderRadius: 2,
                }}
              />
              <Typography
                sx={{
                  color: "#6366f1",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Set Your Skill Levels
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                mb: 3,
                fontSize: "0.9rem",
              }}
            >
              Choose your current proficiency level for each selected language
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {tempSelectedLanguages.map((langName) => {
                const language = availableLanguages.find(
                  (l) => l.name === langName
                );
                return (
                  <Box
                    key={langName}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: 2,
                      p: 3,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography sx={{ fontSize: "1.3rem" }}>
                        {language?.flag}
                      </Typography>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {langName}
                      </Typography>
                    </Box>

                    <FormControl sx={{ minWidth: 160 }}>
                      <Select
                        value={proficiencyLevels[langName] || "Beginner"}
                        onChange={(e) =>
                          handleProficiencyChange(langName, e.target.value)
                        }
                        size="medium"
                        sx={{
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          borderRadius: 2,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#6366f1",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#6366f1",
                            borderWidth: 2,
                          },
                          "& .MuiSvgIcon-root": {
                            color: "rgba(255, 255, 255, 0.7)",
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: "#1a1a1a",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: 2,
                            },
                          },
                        }}
                      >
                        {proficiencyOptions.map((level) => (
                          <MenuItem
                            key={level}
                            value={level}
                            sx={{
                              color: "white",
                              py: 1.5,
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "rgba(0, 188, 212, 0.15)",
                                "&:hover": {
                                  backgroundColor: "rgba(0, 188, 212, 0.25)",
                                },
                              },
                            }}
                          >
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Available Languages */}
        <Box sx={{ p: 3 }}>
          <Typography sx={{ color: "white", mb: 2, fontWeight: 500 }}>
            Available Languages
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 1,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {filteredLanguages.map((language) => {
              const isSelected = tempSelectedLanguages.includes(language.name);
              return (
                <Box
                  key={language.name}
                  onClick={() => handleLanguageToggle(language.name)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 2,
                    borderRadius: 1,
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "rgba(0, 188, 212, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: isSelected
                      ? "1px solid #6366f1"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? "rgba(0, 188, 212, 0.3)"
                        : "rgba(255, 255, 255, 0.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Typography sx={{ fontSize: "1.1rem" }}>
                    {language.flag}
                  </Typography>
                  <Typography
                    sx={{
                      color: isSelected ? "#6366f1" : "white",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {language.name}
                  </Typography>
                  {isSelected && (
                    <AddIcon sx={{ color: "#6366f1", ml: "auto" }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: "rgba(20, 20, 20, 0.8)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          p: 3,
          gap: 2,
        }}
      >
        <Button
          onClick={handleCancel}
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.5)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
            textTransform: "none",
            px: 4,
            py: 1,
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          sx={{
            backgroundColor: "#6366f1",
            color: "white",
            "&:hover": {
              backgroundColor: "#5855eb",
            },
            textTransform: "none",
            px: 4,
            py: 1,
          }}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
