"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  IconButton,
  Autocomplete,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Public as PublicIcon,
} from "@mui/icons-material";

interface FilterOptions {
  ageRange: [number, number];
  newMembersOnly: boolean;
  sameGenderOnly: boolean;
  country?: string;
  region?: string;
  city?: string;
  languageLevels: string[];
}

interface ConnectFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onClose?: () => void;
  darkMode?: boolean;
  currentUserGender?: string;
}

const LANGUAGE_LEVELS = [
  { value: "beginner", label: "Beginner", color: "#10b981" },
  { value: "intermediate", label: "Intermediate", color: "#3b82f6" },
  { value: "advanced", label: "Advanced", color: "#8b5cf6" },
  { value: "fluent", label: "Fluent", color: "#f59e0b" },
  { value: "native", label: "Native", color: "#ef4444" },
];

const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
  "Middle East",
];

// Common countries list - you can expand this
const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Russia",
  "Ukraine",
  "Turkey",
  "Greece",
  "Portugal",
  "Switzerland",
  "Austria",
  "Belgium",
  "Czech Republic",
  "Ireland",
  "Romania",
  "Hungary",
  "China",
  "Japan",
  "South Korea",
  "India",
  "Pakistan",
  "Bangladesh",
  "Indonesia",
  "Thailand",
  "Vietnam",
  "Philippines",
  "Malaysia",
  "Singapore",
  "Taiwan",
  "Hong Kong",
  "Australia",
  "New Zealand",
  "Brazil",
  "Mexico",
  "Argentina",
  "Colombia",
  "Chile",
  "Peru",
  "Venezuela",
  "South Africa",
  "Egypt",
  "Nigeria",
  "Kenya",
  "Morocco",
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
].sort();

// Common cities list - grouped by region for easier finding
const CITIES = [
  // North America
  "New York",
  "Los Angeles",
  "Chicago",
  "Toronto",
  "Vancouver",
  "Montreal",
  "San Francisco",
  "Boston",
  "Seattle",
  "Miami",
  "Houston",
  "Dallas",
  "Atlanta",
  "Washington DC",
  "Philadelphia",
  "Phoenix",
  "San Diego",
  "Austin",
  "Denver",
  "Mexico City",
  "Guadalajara",
  // Europe
  "London",
  "Paris",
  "Berlin",
  "Madrid",
  "Barcelona",
  "Rome",
  "Milan",
  "Amsterdam",
  "Vienna",
  "Prague",
  "Munich",
  "Hamburg",
  "Stockholm",
  "Copenhagen",
  "Oslo",
  "Helsinki",
  "Warsaw",
  "Budapest",
  "Lisbon",
  "Athens",
  "Dublin",
  "Brussels",
  "Zurich",
  "Geneva",
  // Asia
  "Tokyo",
  "Seoul",
  "Shanghai",
  "Beijing",
  "Hong Kong",
  "Singapore",
  "Bangkok",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Jakarta",
  "Manila",
  "Kuala Lumpur",
  "Dubai",
  "Tel Aviv",
  "Istanbul",
  "Taipei",
  "Osaka",
  "Kyoto",
  // Oceania
  "Sydney",
  "Melbourne",
  "Brisbane",
  "Perth",
  "Auckland",
  "Wellington",
  // South America
  "São Paulo",
  "Rio de Janeiro",
  "Buenos Aires",
  "Lima",
  "Bogotá",
  "Santiago",
  "Caracas",
  "Montevideo",
  // Africa
  "Cairo",
  "Cape Town",
  "Johannesburg",
  "Lagos",
  "Nairobi",
  "Casablanca",
  "Addis Ababa",
].sort();

export const ConnectFilters: React.FC<ConnectFiltersProps> = ({
  onFiltersChange,
  onClose,
  darkMode = false,
  currentUserGender,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 65],
    newMembersOnly: false,
    sameGenderOnly: false,
    country: "",
    region: "",
    city: "",
    languageLevels: [],
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleLevelToggle = (level: string) => {
    const newLevels = filters.languageLevels.includes(level)
      ? filters.languageLevels.filter((l) => l !== level)
      : [...filters.languageLevels, level];
    handleFilterChange({ languageLevels: newLevels });
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      ageRange: [18, 65],
      newMembersOnly: false,
      sameGenderOnly: false,
      country: "",
      region: "",
      city: "",
      languageLevels: [],
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    filters.ageRange[0] !== 18 || filters.ageRange[1] !== 65,
    filters.newMembersOnly,
    filters.sameGenderOnly,
    filters.country,
    filters.region,
    filters.city,
    filters.languageLevels.length > 0,
  ].filter(Boolean).length;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: darkMode ? "#0a0a0a" : "#ffffff",
      }}
    >
      {/* Modern Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
          background: darkMode
            ? "linear-gradient(180deg, rgba(10, 10, 10, 0.8) 0%, rgba(10, 10, 10, 0.6) 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              <FilterListIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: darkMode ? "white" : "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Filters
              </Typography>
              {activeFiltersCount > 0 && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#6366f1",
                    fontWeight: 500,
                  }}
                >
                  {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Box>
          {onClose && (
            <IconButton
              onClick={onClose}
              sx={{
                color: darkMode ? "#9ca3af" : "#64748b",
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          py: 2.5,
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
            borderRadius: 3,
            "&:hover": {
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
            },
          },
        }}
      >

        {/* Age Range */}
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            pb: 3,
            borderRadius: "16px",
            background: darkMode
              ? "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: darkMode ? "#f3f4f6" : "#1f2937",
                letterSpacing: "-0.01em",
              }}
            >
              Age Range
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#6366f1",
                backgroundColor: darkMode ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
              }}
            >
              {filters.ageRange[0]} - {filters.ageRange[1]}
            </Typography>
          </Box>
          <Box sx={{ px: 2 }}>
            <Slider
              value={filters.ageRange}
              onChange={(_, value) => handleFilterChange({ ageRange: value as [number, number] })}
              valueLabelDisplay="auto"
              min={18}
              max={65}
              sx={{
                color: "#6366f1 !important",
                height: 6,
                py: 1.5,
                "& .MuiSlider-root": {
                  color: "#6366f1 !important",
                },
                "& .MuiSlider-thumb": {
                  width: 18,
                  height: 18,
                  backgroundColor: "#6366f1",
                  border: "3px solid",
                  borderColor: darkMode ? "#0a0a0a" : "#ffffff",
                  boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.6)",
                  },
                },
                "& .MuiSlider-track, & [class*='MuiSlider-track']": {
                  background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%) !important",
                  backgroundColor: "#6366f1 !important",
                  border: "none !important",
                  height: "6px !important",
                  opacity: "1 !important",
                  display: "block !important",
                  visibility: "visible !important",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "transparent !important",
                  opacity: "0 !important",
                },
                "& .MuiSlider-valueLabel": {
                  backgroundColor: "#6366f1",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </Box>

        {/* Toggle Switches */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: "1px solid",
              borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: darkMode ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.2)",
                backgroundColor: darkMode ? "rgba(16, 185, 129, 0.05)" : "rgba(16, 185, 129, 0.02)",
              },
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={filters.newMembersOnly}
                  onChange={(e) => handleFilterChange({ newMembersOnly: e.target.checked })}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#10b981",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#10b981",
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: darkMode ? "#f3f4f6" : "#1f2937" }}>
                    New members only
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: darkMode ? "#9ca3af" : "#6b7280", mt: 0.5 }}>
                    Show users who joined recently
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: "100%" }}
            />
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
              border: "1px solid",
              borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s",
              opacity: !currentUserGender ? 0.5 : 1,
              "&:hover": {
                borderColor: !currentUserGender
                  ? undefined
                  : darkMode
                  ? "rgba(99, 102, 241, 0.3)"
                  : "rgba(99, 102, 241, 0.2)",
                backgroundColor: !currentUserGender
                  ? undefined
                  : darkMode
                  ? "rgba(99, 102, 241, 0.05)"
                  : "rgba(99, 102, 241, 0.02)",
              },
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={filters.sameGenderOnly}
                  onChange={(e) => handleFilterChange({ sameGenderOnly: e.target.checked })}
                  disabled={!currentUserGender}
                  sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#6366f1",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#6366f1",
                },
              }}
            />
              }
              label={
                <Box>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: darkMode ? "#f3f4f6" : "#1f2937" }}>
                    Same gender only
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: darkMode ? "#9ca3af" : "#6b7280", mt: 0.5 }}>
                    Match with users of the same gender
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: "100%" }}
            />
          </Box>
        </Stack>

        {/* Location Filters */}
        <Accordion
          sx={{
            mb: 3,
            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
            borderRadius: "12px !important",
            boxShadow: "none",
            "&:before": { display: "none" },
            "&.Mui-expanded": {
              margin: "0 0 24px 0",
              borderColor: darkMode ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.15)",
              backgroundColor: darkMode ? "rgba(99, 102, 241, 0.03)" : "rgba(99, 102, 241, 0.02)",
            },
          }}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon 
                sx={{ 
                  color: "#6366f1",
                  backgroundColor: darkMode ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.08)",
                  borderRadius: "6px",
                  p: 0.5,
                  fontSize: 20,
                }} 
              />
            }
            sx={{ 
              px: 2,
              minHeight: 56,
              "&.Mui-expanded": {
                minHeight: 56,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PublicIcon sx={{ color: "white", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: darkMode ? "#f3f4f6" : "#1f2937" }}>
                  Location
                </Typography>
                {(filters.country || filters.region || filters.city) && (
                  <Typography sx={{ fontSize: "12px", color: "#6366f1", mt: 0.25 }}>
                    {[filters.region, filters.country, filters.city].filter(Boolean).join(", ")}
                  </Typography>
                )}
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
          <Stack spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={filters.region}
                onChange={(e) => handleFilterChange({ region: e.target.value })}
                label="Region"
              >
                <MenuItem value="">All Regions</MenuItem>
                {REGIONS.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              size="small"
              fullWidth
              options={COUNTRIES}
              value={filters.country || null}
              onChange={(_, newValue) => handleFilterChange({ country: newValue || "" })}
              disablePortal
              slotProps={{
                popper: {
                  placement: "bottom-start",
                  modifiers: [
                    {
                      name: "flip",
                      enabled: false,
                    },
                  ],
                },
                paper: {
                  sx: {
                    maxHeight: 200,
                    "& .MuiAutocomplete-listbox": {
                      maxHeight: 200,
                      "& .MuiAutocomplete-option": {
                        minHeight: 36,
                      },
                    },
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  placeholder="Type to search..."
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6366f1",
                  },
                },
              }}
            />
            <Autocomplete
              size="small"
              fullWidth
              options={CITIES}
              value={filters.city || null}
              onChange={(_, newValue) => handleFilterChange({ city: newValue || "" })}
              freeSolo
              disablePortal
              slotProps={{
                popper: {
                  placement: "bottom-start",
                  modifiers: [
                    {
                      name: "flip",
                      enabled: false,
                    },
                  ],
                },
                paper: {
                  sx: {
                    maxHeight: 200,
                    "& .MuiAutocomplete-listbox": {
                      maxHeight: 200,
                      "& .MuiAutocomplete-option": {
                        minHeight: 36,
                      },
                    },
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  placeholder="Type to search..."
                  onChange={(e) => {
                    // For freeSolo mode, also handle direct text input
                    if (e.target.value !== filters.city) {
                      handleFilterChange({ city: e.target.value });
                    }
                  }}
                />
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6366f1",
                  },
                },
              }}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

        {/* Language Level Filter */}
        <Box
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: "16px",
            background: darkMode
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(236, 72, 153, 0.03) 100%)",
            border: "1px solid",
            borderColor: darkMode ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              🎯
            </Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: darkMode ? "#f3f4f6" : "#1f2937",
                letterSpacing: "-0.01em",
              }}
            >
              Language Level
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {LANGUAGE_LEVELS.map((level) => (
              <Chip
                key={level.value}
                label={level.label}
                onClick={() => handleLevelToggle(level.value)}
                sx={{
                  backgroundColor: filters.languageLevels.includes(level.value)
                    ? level.color
                    : darkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.03)",
                  color: filters.languageLevels.includes(level.value)
                    ? "white"
                    : darkMode
                    ? "#e5e7eb"
                    : "#374151",
                  border: "1px solid",
                  borderColor: filters.languageLevels.includes(level.value)
                    ? level.color
                    : darkMode
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.06)",
                  fontWeight: filters.languageLevels.includes(level.value) ? 600 : 500,
                  fontSize: "13px",
                  height: 32,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: filters.languageLevels.includes(level.value)
                      ? level.color
                      : darkMode
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.06)",
                    transform: "translateY(-1px)",
                    boxShadow: filters.languageLevels.includes(level.value)
                      ? `0 4px 12px ${level.color}40`
                      : "none",
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Footer with Reset Button */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          mt: "auto",
          borderTop: "1px solid",
          borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
          background: darkMode
            ? "linear-gradient(180deg, rgba(10, 10, 10, 0.6) 0%, rgba(10, 10, 10, 0.8) 100%)"
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.9) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Button
          fullWidth
          variant={activeFiltersCount > 0 ? "contained" : "outlined"}
          onClick={resetFilters}
          disabled={activeFiltersCount === 0}
          startIcon={activeFiltersCount > 0 ? <FilterListIcon /> : undefined}
          sx={{
            borderRadius: "12px",
            py: 1.5,
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            ...(activeFiltersCount > 0
              ? {
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    boxShadow: "0 6px 16px rgba(239, 68, 68, 0.4)",
                  },
                }
              : {
                  borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                  color: darkMode ? "#6b7280" : "#9ca3af",
                  "&:hover": {
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                    backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                  },
                }),
          }}
        >
          {activeFiltersCount > 0 ? `Clear ${activeFiltersCount} Filter${activeFiltersCount !== 1 ? 's' : ''}` : 'Reset Filters'}
        </Button>
      </Box>
    </Box>
  );
};