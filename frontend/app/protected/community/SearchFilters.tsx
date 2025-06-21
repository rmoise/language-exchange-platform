"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Slider,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { LANGUAGES } from "@/utils/constants";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nativeFilter, setNativeFilter] = useState(
    searchParams.get("native") || ""
  );
  const [targetFilter, setTargetFilter] = useState(
    searchParams.get("target") || ""
  );
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || ""
  );
  const [enableLocationFilter, setEnableLocationFilter] = useState(
    searchParams.get("useLocation") === "true"
  );
  const [maxDistance, setMaxDistance] = useState(
    parseInt(searchParams.get("maxDistance") || "50")
  );

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (nativeFilter) {
      params.set("native", nativeFilter);
    }
    if (targetFilter) {
      params.set("target", targetFilter);
    }
    if (locationFilter) {
      params.set("location", locationFilter);
    }
    if (enableLocationFilter) {
      params.set("useLocation", "true");
      params.set("maxDistance", maxDistance.toString());
    }

    // Navigate to search page with filters
    router.push(`/protected/search?${params.toString()}` as any);
  };

  const handleClear = () => {
    setNativeFilter("");
    setTargetFilter("");
    setLocationFilter("");
    setEnableLocationFilter(false);
    setMaxDistance(50);
    router.push("/protected/search" as any);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel
          sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.75rem" }}
        >
          Native Language
        </InputLabel>
        <Select
          value={nativeFilter}
          label="Native Language"
          onChange={(e) => setNativeFilter(e.target.value)}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "white",
            fontSize: "0.75rem",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.1)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#60a5fa",
            },
            "& .MuiSelect-icon": {
              color: "rgba(255, 255, 255, 0.6)",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "& .MuiMenuItem-root": {
                  color: "white",
                  fontSize: "0.75rem",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="">
            <em>Any</em>
          </MenuItem>
          {LANGUAGES.map((language) => (
            <MenuItem key={language} value={language}>
              {language}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel
          sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.75rem" }}
        >
          Learning Language
        </InputLabel>
        <Select
          value={targetFilter}
          label="Learning Language"
          onChange={(e) => setTargetFilter(e.target.value)}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "white",
            fontSize: "0.75rem",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.1)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#06b6d4",
            },
            "& .MuiSelect-icon": {
              color: "rgba(255, 255, 255, 0.6)",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "& .MuiMenuItem-root": {
                  color: "white",
                  fontSize: "0.75rem",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="">
            <em>Any</em>
          </MenuItem>
          {LANGUAGES.map((language) => (
            <MenuItem key={language} value={language}>
              {language}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Location Filters */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          borderRadius: 1,
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <Typography
          sx={{ fontSize: "0.75rem", fontWeight: 500, color: "white", mb: 2 }}
        >
          Location Filters
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="City or Country"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          placeholder="e.g., New York, USA"
          sx={{
            mb: 2,
            "& .MuiInputLabel-root": {
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "0.75rem",
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              color: "white",
              fontSize: "0.75rem",
              "& fieldset": {
                borderColor: "rgba(255, 255, 255, 0.1)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#06b6d4",
              },
            },
            "& .MuiInputBase-input": {
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.4)",
                opacity: 1,
              },
            },
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={enableLocationFilter}
              onChange={(e) => setEnableLocationFilter(e.target.checked)}
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#06b6d4",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#06b6d4",
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: "0.75rem", color: "white" }}>
              Use my location for distance-based search
            </Typography>
          }
          sx={{ mb: enableLocationFilter ? 2 : 0 }}
        />

        {enableLocationFilter && (
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.8)",
                mb: 1,
              }}
            >
              Maximum distance: {maxDistance} km
            </Typography>
            <Slider
              value={maxDistance}
              onChange={(_, value) => setMaxDistance(value as number)}
              min={5}
              max={500}
              step={5}
              marks={[
                { value: 5, label: "5km" },
                { value: 50, label: "50km" },
                { value: 100, label: "100km" },
                { value: 500, label: "500km" },
              ]}
              sx={{
                color: "#06b6d4",
                "& .MuiSlider-thumb": {
                  backgroundColor: "#06b6d4",
                  width: 16,
                  height: 16,
                },
                "& .MuiSlider-track": {
                  backgroundColor: "#06b6d4",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                "& .MuiSlider-mark": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  width: 2,
                  height: 2,
                },
                "& .MuiSlider-markLabel": {
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.625rem",
                },
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          size="small"
          sx={{
            flex: 1,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            color: "white",
            textTransform: "none",
            fontSize: "0.75rem",
            py: 1,
            "&:hover": {
              backgroundColor: "rgba(59, 130, 246, 0.3)",
            },
          }}
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          onClick={handleClear}
          size="small"
          sx={{
            flex: 1,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            textTransform: "none",
            fontSize: "0.75rem",
            py: 1,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}
