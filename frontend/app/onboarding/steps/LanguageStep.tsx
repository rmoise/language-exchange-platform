"use client";

import { useState } from "react";
import { useAppDispatch } from '@/lib/hooks';
import { updateOnboardingStep } from '@/features/onboarding/onboardingSlice';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Alert,
  useTheme,
} from "@mui/material";
import { Language as LanguageIcon } from "@mui/icons-material";
import { User } from "@/types/global";
import { LANGUAGES } from "@/utils/constants";

interface LanguageStepProps {
  user: User;
  onNext: () => void;
  onBack?: () => void;
}

export default function LanguageStep({ user, onNext, onBack }: LanguageStepProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [nativeLanguages, setNativeLanguages] = useState<string[]>(
    user.nativeLanguages || []
  );
  const [targetLanguages, setTargetLanguages] = useState<string[]>(
    user.targetLanguages || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNativeLanguageToggle = (language: string) => {
    setNativeLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
    setError(null);
  };

  const handleTargetLanguageToggle = (language: string) => {
    setTargetLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
    setError(null);
  };

  const handleContinue = async () => {
    if (nativeLanguages.length === 0 || targetLanguages.length === 0) {
      setError(
        "Please select at least one native language and one target language."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/languages`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            native: nativeLanguages,
            target: targetLanguages,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update languages");
      }

      // Update onboarding step using Redux (should be step 2, not 1)
      await dispatch(updateOnboardingStep(2));
      
      onNext();
    } catch (err) {
      setError("Failed to save languages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = nativeLanguages.length > 0 && targetLanguages.length > 0;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Native Languages */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(139, 92, 246, 0.1)'
            : 'rgba(102, 126, 234, 0.05)',
          border: `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(139, 92, 246, 0.3)'
            : 'rgba(102, 126, 234, 0.1)'}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <LanguageIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Languages I Speak
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Select the languages you can speak fluently and help others learn.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {LANGUAGES.map((language) => (
            <Box key={`native-${language}`}>
              <Chip
                label={language}
                onClick={() => handleNativeLanguageToggle(language)}
                color={
                  nativeLanguages.includes(language) ? "primary" : "default"
                }
                variant={
                  nativeLanguages.includes(language) ? "filled" : "outlined"
                }
                sx={{
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: nativeLanguages.includes(language)
                      ? theme.palette.primary.dark
                      : theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Target Languages */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(168, 85, 247, 0.1)'
            : 'rgba(118, 75, 162, 0.05)',
          border: `1px solid ${theme.palette.mode === 'dark'
            ? 'rgba(168, 85, 247, 0.3)'
            : 'rgba(118, 75, 162, 0.1)'}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <LanguageIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Languages I Want to Learn
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Select the languages you want to learn or improve with native
          speakers.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {LANGUAGES.map((language) => (
            <Box key={`target-${language}`}>
              <Chip
                label={language}
                onClick={() => handleTargetLanguageToggle(language)}
                color={
                  targetLanguages.includes(language) ? "secondary" : "default"
                }
                variant={
                  targetLanguages.includes(language) ? "filled" : "outlined"
                }
                sx={{
                  fontSize: "0.875rem",
                  "&:hover": {
                    backgroundColor: targetLanguages.includes(language)
                      ? theme.palette.secondary.dark
                      : theme.palette.mode === 'dark' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(118, 75, 162, 0.1)',
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Matching Info */}
      {nativeLanguages.length > 0 && targetLanguages.length > 0 && (
        <Box
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(34, 197, 94, 0.05)',
            border: `1px solid ${theme.palette.mode === 'dark'
              ? 'rgba(34, 197, 94, 0.3)'
              : 'rgba(34, 197, 94, 0.2)'}`,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: theme.palette.mode === 'dark' ? '#10b981' : '#059669', fontWeight: 500, mb: 1 }}
          >
            🎯 How matching works:
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            You'll be matched with people who speak your target languages
            natively and want to learn your native languages. It's a win-win
            exchange!
          </Typography>
        </Box>
      )}

      {/* Navigation buttons */}
      <Box sx={{ display: 'grid', gridTemplateColumns: onBack ? '1fr 1fr' : '1fr', gap: 2 }}>
        {onBack && (
          <Box>
            <Button
              fullWidth
              variant="outlined"
              onClick={onBack}
              sx={{
                py: 2,
                borderColor: theme.palette.mode === 'dark' ? 'rgba(107, 114, 128, 0.5)' : '#d1d5db',
                color: theme.palette.text.secondary,
              }}
            >
              Back
            </Button>
          </Box>
        )}
        <Box>
          <Button
            fullWidth
            variant="contained"
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            sx={{
              py: 2,
              fontSize: "1rem",
              fontWeight: 600,
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
              "&:disabled": {
                backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb',
                color: theme.palette.mode === 'dark' ? '#6b7280' : '#9ca3af',
              },
            }}
          >
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
