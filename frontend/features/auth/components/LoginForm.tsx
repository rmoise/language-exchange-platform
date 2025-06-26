"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loginUser, clearError } from "../authSlice";
import GoogleAuthButton from "@/components/ui/GoogleAuthButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(
        loginUser({
          email: email.trim(),
          password: password.trim(),
        })
      ).unwrap();
      router.push("/app/home");
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleInputChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 1,
        width: "100%",
        maxWidth: { xs: "100%", sm: 420 },
        mx: "auto",
        p: { xs: 4, sm: 6 },
        borderRadius: 3,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(10px)",
        border: "1px solid #374151",
        boxShadow: "none",
      }}
    >
      <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 5 } }}>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 300,
            color: "white",
            mb: 1,
            fontSize: { xs: "1.5rem", sm: "2rem" },
            letterSpacing: "-0.02em",
          }}
        >
          Welcome back
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "0.875rem", sm: "1rem" },
            color: "#9ca3af",
            fontWeight: 300,
          }}
        >
          Enter your credentials to sign in to your account
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 1,
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            color: "#fca5a5",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            "& .MuiAlert-icon": {
              fontSize: "1.2rem",
              color: "#fca5a5",
            },
          }}
        >
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          handleInputChange();
        }}
        sx={{
          mb: { xs: 2.5, sm: 3 },
          "& .MuiInputLabel-root": {
            color: "#9ca3af",
            fontWeight: 300,
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            fontSize: { xs: "0.875rem", sm: "1rem" },
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "white",
            "& fieldset": {
              borderColor: "#374151",
            },
            "&:hover fieldset": {
              borderColor: "#6366f1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
              borderWidth: 1,
            },
            "& input": {
              "&:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.2) inset",
                WebkitTextFillColor: "white",
                caretColor: "white",
                borderRadius: 1,
              },
              "&:-webkit-autofill:hover": {
                WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.3) inset",
                WebkitTextFillColor: "white",
              },
              "&:-webkit-autofill:focus": {
                WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.3) inset",
                WebkitTextFillColor: "white",
              },
            },
          },
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          handleInputChange();
        }}
        sx={{
          mb: { xs: 3, sm: 4 },
          "& .MuiInputLabel-root": {
            color: "#9ca3af",
            fontWeight: 300,
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
            fontSize: { xs: "0.875rem", sm: "1rem" },
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "white",
            "& fieldset": {
              borderColor: "#374151",
            },
            "&:hover fieldset": {
              borderColor: "#6366f1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
              borderWidth: 1,
            },
            "& input": {
              "&:-webkit-autofill": {
                WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.2) inset",
                WebkitTextFillColor: "white",
                caretColor: "white",
                borderRadius: 1,
              },
              "&:-webkit-autofill:hover": {
                WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.3) inset",
                WebkitTextFillColor: "white",
              },
              "&:-webkit-autofill:focus": {
                WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.3) inset",
                WebkitTextFillColor: "white",
              },
            },
          },
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{
          py: { xs: 1.75, sm: 2 },
          borderRadius: 1,
          fontWeight: 300,
          fontSize: { xs: "0.875rem", sm: "0.95rem" },
          textTransform: "none",
          backgroundColor: "white",
          color: "black",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
          "&:disabled": {
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            color: "rgba(0, 0, 0, 0.5)",
          },
          transition: "all 0.3s ease",
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            Signing In...
          </Box>
        ) : (
          "Sign In"
        )}
      </Button>

      <Box sx={{ mt: 3, position: "relative" }}>
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "#9ca3af",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "1px",
              backgroundColor: "#374151",
              zIndex: 1,
            },
          }}
        >
          <Box
            component="span"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              px: 2,
              position: "relative",
              zIndex: 2,
            }}
          >
            or
          </Box>
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <GoogleAuthButton variant="signin" />
      </Box>
    </Box>
  );
}
