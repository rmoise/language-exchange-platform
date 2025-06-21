"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Checkbox,
  Radio,
  Divider,
} from "@mui/material";
import SharedModal from "@/components/ui/SharedModal";

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  type:
    | "communication"
    | "timeCommitment"
    | "learningSchedule"
    | "correctionPreference";
  selectedValues: string | string[];
  onSave: (values: string | string[]) => void;
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

export default function PreferencesModal({
  open,
  onClose,
  title,
  type,
  selectedValues,
  onSave,
}: PreferencesModalProps) {
  const [tempValues, setTempValues] = useState<string | string[]>(
    selectedValues
  );

  React.useEffect(() => {
    setTempValues(selectedValues);
  }, [selectedValues, open]);

  const options = preferenceOptions[type];
  const isMultiSelect = type !== "timeCommitment"; // Time commitment is single select

  const handleOptionToggle = (option: string) => {
    let newValues: string | string[];

    if (isMultiSelect) {
      const currentArray = Array.isArray(tempValues) ? tempValues : [];
      if (currentArray.includes(option)) {
        newValues = currentArray.filter((item) => item !== option);
      } else {
        newValues = [...currentArray, option];
      }
    } else {
      newValues = option;
    }

    setTempValues(newValues);
    // Auto-save immediately
    onSave(newValues);
  };

  const handleClose = () => {
    onClose();
  };

  const isSelected = (option: string) => {
    if (isMultiSelect) {
      return Array.isArray(tempValues) && tempValues.includes(option);
    } else {
      return tempValues === option;
    }
  };

  return (
    <SharedModal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth="sm"
      contentSx={{
        backgroundColor: "rgba(20, 20, 20, 0.6)",
        p: 4,
      }}
    >
      <Typography
        sx={{
          color: "rgba(255, 255, 255, 0.8)",
          mb: 4,
          mt: 3,
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        {isMultiSelect ? "Select all that apply:" : "Choose one option:"}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {options.map((option, index) => (
          <Box
            key={index}
            onClick={() => handleOptionToggle(option)}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              borderRadius: 2,
              cursor: "pointer",
              backgroundColor: isSelected(option)
                ? "rgba(99, 102, 241, 0.2)"
                : "rgba(255, 255, 255, 0.05)",
              border: isSelected(option)
                ? "1px solid #6366f1"
                : "1px solid rgba(255, 255, 255, 0.1)",
              "&:hover": {
                backgroundColor: isSelected(option)
                  ? "rgba(99, 102, 241, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {isMultiSelect ? (
              <Checkbox
                checked={isSelected(option)}
                sx={{
                  color: "rgba(255, 255, 255, 0.5)",
                  "&.Mui-checked": {
                    color: "#6366f1",
                  },
                  mr: 2,
                }}
              />
            ) : (
              <Radio
                checked={isSelected(option)}
                sx={{
                  color: "rgba(255, 255, 255, 0.5)",
                  "&.Mui-checked": {
                    color: "#6366f1",
                  },
                  mr: 2,
                }}
              />
            )}
            <Typography
              sx={{
                color: isSelected(option) ? "#6366f1" : "white",
                fontWeight: isSelected(option) ? 600 : 400,
                fontSize: "0.95rem",
              }}
            >
              {option}
            </Typography>
          </Box>
        ))}
      </Box>

      {isMultiSelect &&
        Array.isArray(tempValues) &&
        tempValues.length > 0 && (
          <>
            <Divider
              sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Box>
              <Typography sx={{ color: "white", mb: 2, fontWeight: 500 }}>
                Selected ({tempValues.length}):
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {tempValues.map((value, index) => (
                  <Chip
                    key={index}
                    label={value}
                    onDelete={() => handleOptionToggle(value)}
                    sx={{
                      backgroundColor: "rgba(99, 102, 241, 0.2)",
                      color: "#6366f1",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      "& .MuiChip-deleteIcon": {
                        color: "#6366f1",
                        "&:hover": {
                          color: "#5855eb",
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
    </SharedModal>
  );
}
