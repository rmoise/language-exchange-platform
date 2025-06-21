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
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

interface LearningPreferencesModalProps {
  open: boolean;
  onClose: () => void;
  preferences: {
    communication: string[];
    timeCommitment: string;
    learningSchedule: string[];
    correctionPreference: string[];
  };
  onSave: (preferences: {
    communication: string[];
    timeCommitment: string;
    learningSchedule: string[];
    correctionPreference: string[];
  }) => void;
}

// Preference options for each section
const preferenceOptions = {
  communication: [
    "Text messaging",
    "Voice calls",
    "Video calls",
    "In-person meetings",
    "Group conversations",
    "Language exchange events",
  ],
  timeCommitment: [
    "15-30 minutes per day",
    "30-60 minutes per day",
    "1-2 hours per day",
    "2-3 hours per day",
    "3+ hours per day",
    "Flexible/as available",
  ],
  learningSchedule: [
    "Morning (6AM - 12PM)",
    "Afternoon (12PM - 6PM)",
    "Evening (6PM - 10PM)",
    "Night (10PM - 6AM)",
    "Weekdays only",
    "Weekends only",
    "Flexible schedule",
  ],
  correctionPreference: [
    "Correct me immediately",
    "Correct me at the end of conversation",
    "Only correct major mistakes",
    "Let me finish speaking first",
    "Don't correct me unless I ask",
    "Focus on grammar corrections",
    "Focus on pronunciation corrections",
  ],
};

const sectionConfig = {
  communication: {
    title: "Communication",
    description: "Select all the ways you'd like to practice",
    chipColor: "rgba(34, 197, 94, 0.2)",
    chipBorder: "rgba(34, 197, 94, 0.3)",
  },
  timeCommitment: {
    title: "Time Commitment",
    description: "Choose your daily time commitment",
    chipColor: "rgba(99, 102, 241, 0.2)",
    chipBorder: "rgba(99, 102, 241, 0.3)",
  },
  learningSchedule: {
    title: "Learning Schedule",
    description: "Select all your preferred learning times",
    chipColor: "rgba(168, 85, 247, 0.2)",
    chipBorder: "rgba(168, 85, 247, 0.3)",
  },
  correctionPreference: {
    title: "Correction Preferences",
    description: "Select all your correction preferences",
    chipColor: "rgba(239, 68, 68, 0.2)",
    chipBorder: "rgba(239, 68, 68, 0.3)",
  },
};

export default function LearningPreferencesModal({
  open,
  onClose,
  preferences,
  onSave,
}: LearningPreferencesModalProps) {
  const [tempPreferences, setTempPreferences] = useState(preferences);
  const [editingSection, setEditingSection] = useState<
    keyof typeof preferenceOptions | null
  >(null);

  React.useEffect(() => {
    setTempPreferences(preferences);
    setEditingSection(null);
  }, [preferences, open]);

  const handleOptionToggle = (
    section: keyof typeof preferenceOptions,
    option: string
  ) => {
    const newPreferences = { ...tempPreferences };

    if (section === "timeCommitment") {
      // Single select for time commitment
      newPreferences[section] = option;
    } else {
      // Multi-select for other sections
      const currentArray = newPreferences[section] as string[];
      if (currentArray.includes(option)) {
        newPreferences[section] = currentArray.filter(
          (item) => item !== option
        );
      } else {
        newPreferences[section] = [...currentArray, option];
      }
    }

    setTempPreferences(newPreferences);
  };

  const handleSave = () => {
    onSave(tempPreferences);
    onClose();
  };

  const handleCancel = () => {
    setTempPreferences(preferences);
    setEditingSection(null);
    onClose();
  };

  const isSelected = (
    section: keyof typeof preferenceOptions,
    option: string
  ) => {
    if (section === "timeCommitment") {
      return tempPreferences[section] === option;
    } else {
      return (tempPreferences[section] as string[]).includes(option);
    }
  };

  const getSelectedCount = (section: keyof typeof preferenceOptions) => {
    if (section === "timeCommitment") {
      return tempPreferences[section] ? 1 : 0;
    } else {
      return (tempPreferences[section] as string[]).length;
    }
  };

  const renderPreferenceSection = (
    section: keyof typeof preferenceOptions,
    config: (typeof sectionConfig)[keyof typeof sectionConfig],
    isEditing: boolean,
    onEditClick: () => void
  ) => (
    <Box
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 1,
        p: 2,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: isEditing ? 2 : 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
            }}
          >
            {config.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "0.75rem",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {getSelectedCount(section)} selected
          </Typography>
        </Box>
        <IconButton
          onClick={onEditClick}
          size="small"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          {isEditing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Selected items preview */}
      {!isEditing && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
          {section === "timeCommitment"
            ? tempPreferences[section] && (
                <Chip
                  label={tempPreferences[section]}
                  size="small"
                  sx={{
                    backgroundColor: config.chipColor,
                    color: "white",
                    border: `1px solid ${config.chipBorder}`,
                    fontSize: "0.75rem",
                    height: 24,
                  }}
                />
              )
            : (tempPreferences[section] as string[])
                .slice(0, 3)
                .map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    size="small"
                    sx={{
                      backgroundColor: config.chipColor,
                      color: "white",
                      border: `1px solid ${config.chipBorder}`,
                      fontSize: "0.75rem",
                      height: 24,
                    }}
                  />
                ))}
          {section !== "timeCommitment" &&
            (tempPreferences[section] as string[]).length > 3 && (
              <Chip
                label={`+${
                  (tempPreferences[section] as string[]).length - 3
                } more`}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            )}
          {getSelectedCount(section) === 0 && (
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.875rem",
                fontStyle: "italic",
              }}
            >
              No preferences selected
            </Typography>
          )}
        </Box>
      )}

      {/* Expanded editing view */}
      <Collapse in={isEditing}>
        <Box sx={{ mt: 2 }}>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mb: 2,
              fontSize: "0.85rem",
            }}
          >
            {config.description}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {preferenceOptions[section].map((option, index) => (
              <Button
                key={index}
                onClick={() => handleOptionToggle(section, option)}
                variant={isSelected(section, option) ? "contained" : "outlined"}
                size="small"
                sx={{
                  textTransform: "none",
                  fontSize: "0.875rem",
                  py: 0.8,
                  px: 1.5,
                  backgroundColor: isSelected(section, option)
                    ? config.chipColor
                    : "transparent",
                  borderColor: isSelected(section, option)
                    ? config.chipBorder
                    : "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: isSelected(section, option)
                      ? config.chipColor
                      : "rgba(255, 255, 255, 0.05)",
                    borderColor: isSelected(section, option)
                      ? config.chipBorder
                      : "rgba(255, 255, 255, 0.3)",
                  },
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
      </Collapse>
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
        Learning Preferences
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
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {Object.entries(sectionConfig).map(([sectionKey, config]) => {
            const section = sectionKey as keyof typeof preferenceOptions;
            return (
              <React.Fragment key={sectionKey}>
                {renderPreferenceSection(
                  section,
                  config,
                  editingSection === section,
                  () =>
                    setEditingSection(editingSection === section ? null : section)
                )}
              </React.Fragment>
            );
          })}
        </Box>
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
