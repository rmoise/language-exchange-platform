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
        width: "100%",
        maxWidth: 360,
        backgroundColor: darkMode ? "rgba(30, 30, 30, 0.5)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: darkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        boxShadow: darkMode
          ? "0 20px 40px -12px rgba(0, 0, 0, 0.3)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
        p: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon sx={{ color: darkMode ? "#9ca3af" : "#6b7280" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? "white" : "#1a1a1a" }}>
            Filters
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              sx={{
                backgroundColor: "#6366f1",
                color: "white",
                fontWeight: 600,
                height: 20,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          )}
        </Box>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Age Range */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: darkMode ? "#e5e7eb" : "#374151", fontWeight: 500 }}>
          Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
        </Typography>
        <Slider
          value={filters.ageRange}
          onChange={(_, value) => handleFilterChange({ ageRange: value as [number, number] })}
          valueLabelDisplay="auto"
          min={18}
          max={65}
          sx={{
            color: "#6366f1",
            "& .MuiSlider-thumb": {
              backgroundColor: "#6366f1",
            },
          }}
        />
      </Box>

      {/* Toggle Switches */}
      <Stack spacing={1} sx={{ mb: 3 }}>
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
            <Typography variant="body2" sx={{ color: darkMode ? "#e5e7eb" : "#374151" }}>
              New members only
            </Typography>
          }
        />
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
            <Typography variant="body2" sx={{ color: darkMode ? "#e5e7eb" : "#374151" }}>
              Same gender only
            </Typography>
          }
        />
      </Stack>

      {/* Location Filters */}
      <Accordion
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          "&:before": { display: "none" },
          mb: 2,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? "#9ca3af" : "#6b7280" }} />}
          sx={{ px: 0, minHeight: 48 }}
        >
          <Typography variant="subtitle2" sx={{ color: darkMode ? "#e5e7eb" : "#374151", fontWeight: 500 }}>
            Location
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: darkMode ? "#e5e7eb" : "#374151", fontWeight: 500 }}>
          Language Level
        </Typography>
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
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.08)",
                color: filters.languageLevels.includes(level.value)
                  ? "white"
                  : darkMode
                  ? "#9ca3af"
                  : "#6b7280",
                border: "1px solid",
                borderColor: filters.languageLevels.includes(level.value)
                  ? level.color
                  : "transparent",
                "&:hover": {
                  backgroundColor: filters.languageLevels.includes(level.value)
                    ? level.color
                    : darkMode
                    ? "rgba(255, 255, 255, 0.15)"
                    : "rgba(0, 0, 0, 0.12)",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Reset Button */}
      <Button
        fullWidth
        variant="outlined"
        onClick={resetFilters}
        disabled={activeFiltersCount === 0}
        sx={{
          borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
          color: darkMode ? "#e5e7eb" : "#374151",
          "&:hover": {
            borderColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          },
        }}
      >
        Reset Filters
      </Button>
    </Box>
  );
};