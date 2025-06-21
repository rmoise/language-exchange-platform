"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import PreferencesModal from "./PreferencesModal";

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

interface LearningPreferencesTabProps {
  user: User;
}

export default function LearningPreferencesTab({
  user,
}: LearningPreferencesTabProps) {
  // State for learning preferences
  const [communication, setCommunication] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState<string>("");
  const [learningSchedule, setLearningSchedule] = useState<string[]>([]);
  const [correctionPreference, setCorrectionPreference] = useState<string>("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    | "communication"
    | "timeCommitment"
    | "learningSchedule"
    | "correctionPreference"
  >("communication");
  const [modalTitle, setModalTitle] = useState("");

  const handleEdit = (
    section:
      | "communication"
      | "timeCommitment"
      | "learningSchedule"
      | "correctionPreference"
  ) => {
    const titles = {
      communication: "Communication Preferences",
      timeCommitment: "Time Commitment",
      learningSchedule: "Learning Schedule",
      correctionPreference: "Correction Preferences",
    };

    setModalType(section);
    setModalTitle(titles[section]);
    setModalOpen(true);
  };

  const handleModalSave = (values: string | string[]) => {
    switch (modalType) {
      case "communication":
        setCommunication(Array.isArray(values) ? values : []);
        break;
      case "timeCommitment":
        setTimeCommitment(typeof values === "string" ? values : "");
        break;
      case "learningSchedule":
        setLearningSchedule(Array.isArray(values) ? values : []);
        break;
      case "correctionPreference":
        setCorrectionPreference(typeof values === "string" ? values : "");
        break;
    }
    // TODO: Save to backend
  };

  const getCurrentValues = () => {
    switch (modalType) {
      case "communication":
        return communication;
      case "timeCommitment":
        return timeCommitment;
      case "learningSchedule":
        return learningSchedule;
      case "correctionPreference":
        return correctionPreference;
      default:
        return [];
    }
  };

  const PreferenceSection = ({
    title,
    value,
    onEdit,
  }: {
    title: string;
    value: string | string[];
    onEdit: () => void;
  }) => (
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
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
          {title}
        </Typography>
        <Button
          startIcon={<EditIcon />}
          onClick={onEdit}
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

      <Box>
        {Array.isArray(value) ? (
          value.length > 0 ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {value.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  sx={{
                    backgroundColor: "rgba(0, 188, 212, 0.2)",
                    color: "#6366f1",
                    border: "1px solid rgba(0, 188, 212, 0.3)",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Not set
            </Typography>
          )
        ) : value ? (
          <Typography sx={{ color: "white", fontWeight: 500 }}>
            {value}
          </Typography>
        ) : (
          <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Not set
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Communication */}
      <PreferenceSection
        title="Communication"
        value={communication}
        onEdit={() => handleEdit("communication")}
      />

      {/* Time Commitment */}
      <PreferenceSection
        title="Time Commitment"
        value={timeCommitment}
        onEdit={() => handleEdit("timeCommitment")}
      />

      {/* Learning Schedule */}
      <PreferenceSection
        title="Learning Schedule"
        value={learningSchedule}
        onEdit={() => handleEdit("learningSchedule")}
      />

      {/* Correction Preference */}
      <PreferenceSection
        title="Correction Preference"
        value={correctionPreference}
        onEdit={() => handleEdit("correctionPreference")}
      />

      {/* Preferences Modal */}
      <PreferencesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        type={modalType}
        selectedValues={getCurrentValues()}
        onSave={handleModalSave}
      />
    </Box>
  );
}
