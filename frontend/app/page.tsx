"use client";

import Link from "next/link";
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  useScrollTrigger,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import {
  Language,
  People,
  School,
  Translate,
  Public,
  EmojiPeople,
  ArrowForward,
  PlayArrow,
  Star,
  Verified,
} from "@mui/icons-material";

const features = [
  {
    icon: People,
    title: "Global Network",
    description: "Connect with native speakers from 100+ countries worldwide",
    color: "#6366f1",
  },
  {
    icon: Translate,
    title: "Smart Matching",
    description:
      "AI-powered matching finds your perfect language exchange partner",
    color: "#8b5cf6",
  },
  {
    icon: School,
    title: "Structured Learning",
    description:
      "Guided conversations and progress tracking for effective learning",
    color: "#f59e0b",
  },
];

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Korean",
  "Chinese",
  "Portuguese",
];
const testimonials = [
  {
    name: "Sarah Chen",
    country: "🇺🇸 United States",
    text: "Found my perfect Spanish partner in just 2 days. My confidence has grown tremendously!",
    rating: 5,
  },
  {
    name: "Marco Silva",
    country: "🇧🇷 Brazil",
    text: "The platform made learning English fun and natural. Highly recommend!",
    rating: 5,
  },
];

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let globe: any = null;

    const initGlobe = async () => {
      if (!canvasRef.current) return;

      try {
        const createGlobe = (await import("cobe")).default;

        globe = createGlobe(canvasRef.current, {
          devicePixelRatio: 2,
          width: 1000,
          height: 1000,
          phi: 0,
          theta: 0,
          dark: 1,
          diffuse: 1.2,
          scale: 1,
          mapSamples: 16000,
          mapBrightness: 6,
          baseColor: [0.3, 0.3, 0.9],
          markerColor: [0.9, 0.5, 1],
          glowColor: [0.2, 0.2, 1],
          offset: [0, 0],
          markers: [
            { location: [37.7595, -122.4367], size: 0.03 },
            { location: [40.7128, -74.006], size: 0.1 },
            { location: [51.5074, -0.1278], size: 0.05 },
            { location: [35.6762, 139.6503], size: 0.05 },
            { location: [22.3193, 114.1694], size: 0.03 },
            { location: [-33.8688, 151.2093], size: 0.03 },
          ],
          onRender: (state: any) => {
            state.phi = phi;
            phi += 0.005;
          },
        });
      } catch (error) {
        console.error("Failed to load globe:", error);
      }
    };

    initGlobe();

    return () => {
      if (globe) {
        globe.destroy?.();
      }
    };
  }, []);

  return (
    <Box sx={{ position: "relative", width: 500, height: 500, mx: "auto" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: "500px",
          height: "500px",
          position: "relative",
          zIndex: 10,
        }}
        width={1000}
        height={1000}
      />
    </Box>
  );
}

function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "transparent !important",
        backdropFilter: "none !important",
        borderBottom: "none !important",
        boxShadow: "none !important",
        zIndex: 1000,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            mt: 2,
            mx: "auto",
            maxWidth: scrolled
              ? { xs: "100%", sm: 900, md: 1000 }
              : { xs: "100%", sm: 1200, md: 1400 },
            px: { xs: 1, sm: 0 },
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Toolbar
            sx={{
              background: scrolled
                ? "rgba(0, 0, 0, 0.4)"
                : "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: 2,
              border: "1px solid",
              borderColor: scrolled ? "#374151" : "rgba(255, 255, 255, 0.12)",
              boxShadow: scrolled
                ? "0 4px 32px rgba(0, 0, 0, 0.3)"
                : "0 2px 24px rgba(0, 0, 0, 0.2)",
              py: { xs: 1, sm: 1.5 },
              px: { xs: 2, sm: 3 },
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              minHeight: { xs: 56, sm: 64 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "nowrap",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                pointerEvents: "none",
                zIndex: -1,
              },
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                minWidth: { xs: 40, sm: scrolled ? 40 : 200 },
                flexShrink: 0,
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Language
                sx={{
                  fontSize: scrolled ? { xs: 24, sm: 28 } : { xs: 28, sm: 32 },
                  color: "#6366f1",
                  mr: scrolled ? 0 : { xs: 0.5, sm: 1 },
                  transition: "all 0.3s ease-in-out",
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 400,
                  fontSize: { xs: "0.95rem", sm: "1.25rem" },
                  color: "white",
                  transition: "all 0.3s ease-in-out",
                  display: { xs: "none", sm: scrolled ? "none" : "block" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  opacity: scrolled ? 0 : 1,
                  width: scrolled ? 0 : "auto",
                  letterSpacing: "-0.025em",
                }}
              >
                LinguaConnect
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },
                gap: 10,
                flexShrink: 0,
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                transition: "all 0.3s ease-in-out",
              }}
            >
              {["Features", "About", "Reviews"].map((item) => (
                <Button
                  key={item}
                  sx={{
                    color: "#d1d5db",
                    textTransform: "none",
                    fontWeight: 300,
                    fontSize: "0.875rem",
                    px: 0,
                    py: 1,
                    minWidth: "auto",
                    transition: "all 0.2s ease-in-out",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      color: "white",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexShrink: 0,
                alignItems: "center",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Button
                variant="outlined"
                component={Link}
                href="/auth/login"
                sx={{
                  color: "white",
                  textTransform: "none",
                  fontWeight: 300,
                  px: 4,
                  py: 1.5,
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  border: "1px solid #374151",
                  backgroundColor: "transparent",
                  transition: "all 0.3s ease-in-out",
                  whiteSpace: "nowrap",
                  minWidth: "auto",
                  minHeight: "auto",
                  height: "auto",
                  lineHeight: 1,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "#374151",
                  },
                }}
              >
                Sign in
              </Button>
              <Button
                variant="contained"
                component={Link}
                href="/auth/register"
                sx={{
                  backgroundColor: "white",
                  color: "black",
                  textTransform: "none",
                  fontWeight: 300,
                  px: 4,
                  py: 1.5,
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  transition: "all 0.3s ease-in-out",
                  whiteSpace: "nowrap",
                  minWidth: "auto",
                  minHeight: "auto",
                  height: "auto",
                  lineHeight: 1,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                Sign up
              </Button>
            </Box>
          </Toolbar>
        </Box>
      </Container>
    </AppBar>
  );
}

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "white",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000000",
          zIndex: -1,
        },
      }}
    >
      <FloatingNavbar />

      {/* Divider under navbar */}
      <Box
        sx={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, #374151, transparent)",
        }}
      />

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, #000000 50%)",
        }}
      >
        {/* Background gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, #000000 50%)",
            zIndex: 0,
          }}
        />

        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 10, py: { xs: 16, md: 24 } }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
            }}
          >
            {/* Text content */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                mb: { xs: 12, md: 0 },
                pr: { xs: 0, md: 12 },
              }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "3rem", md: "3.75rem", lg: "4.5rem" },
                  fontWeight: 300,
                  letterSpacing: "-0.05em",
                  mb: 6,
                  lineHeight: 1.1,
                  "& .gradient-text": {
                    background: "linear-gradient(to right, #6366f1, #a855f7)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  },
                }}
              >
                <span className="gradient-text">Connect</span>{" "}
                <span style={{ color: "white" }}>
                  your world with precision
                </span>
              </Typography>

              <Typography
                sx={{
                  color: "#d1d5db",
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  mb: 8,
                  maxWidth: { xs: "100%", md: "28rem" },
                  fontWeight: 200,
                  letterSpacing: "0.025em",
                  lineHeight: 1.6,
                }}
              >
                Experience language learning through authentic conversations
                with native speakers from around the world.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 4,
                }}
              >
                <Button
                  variant="contained"
                  component={Link}
                  href="/auth/register"
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                    fontWeight: 300,
                    borderRadius: 1,
                    px: 6,
                    py: 2,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    boxShadow: "none",
                    minHeight: "auto",
                    height: "auto",
                    lineHeight: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Get started
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    backgroundColor: "transparent",
                    border: "1px solid #374151",
                    borderRadius: 1,
                    px: 6,
                    py: 2,
                    fontSize: "0.875rem",
                    fontWeight: 300,
                    textTransform: "none",
                    color: "white",
                    minHeight: "auto",
                    height: "auto",
                    lineHeight: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "#374151",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  View demo
                </Button>
              </Box>
            </Box>

            {/* Globe visualization */}
            <Box
              sx={{
                width: { xs: "100%", md: "50%" },
                position: "relative",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: 500,
                  width: 500,
                  mx: "auto",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                  }}
                />
                <Globe />
              </Box>
            </Box>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              height: "1px",
              background:
                "linear-gradient(to right, transparent, #374151, transparent)",
              my: 16,
            }}
          />

          {/* Stats */}
          <Grid container spacing={6}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: 300,
                  mb: 1,
                  letterSpacing: "-0.025em",
                }}
              >
                50+
              </Typography>
              <Typography sx={{ color: "#9ca3af", fontWeight: 200 }}>
                Languages available
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: 300,
                  mb: 1,
                  letterSpacing: "-0.025em",
                }}
              >
                10k+
              </Typography>
              <Typography sx={{ color: "#9ca3af", fontWeight: 200 }}>
                Active learners
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: 300,
                  mb: 1,
                  letterSpacing: "-0.025em",
                }}
              >
                100+
              </Typography>
              <Typography sx={{ color: "#9ca3af", fontWeight: 200 }}>
                Countries represented
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography
                sx={{
                  fontSize: "2.5rem",
                  fontWeight: 300,
                  mb: 1,
                  letterSpacing: "-0.025em",
                }}
              >
                95%
              </Typography>
              <Typography sx={{ color: "#9ca3af", fontWeight: 200 }}>
                Find a match rate
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 12, md: 16 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 8, md: 12 } }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
                fontWeight: 300,
                mb: 4,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              Why Choose LinguaConnect?
            </Typography>
            <Typography
              sx={{
                color: "#9ca3af",
                maxWidth: 600,
                mx: "auto",
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              Experience the most natural way to learn languages through
              meaningful conversations
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 4, md: 6 }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                  <Box
                    sx={{
                      p: { xs: 6, sm: 8 },
                      height: "100%",
                      textAlign: "center",
                      borderRadius: 3,
                      border: "1px solid #374151",
                      background: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: "#6366f1",
                        background: "rgba(0, 0, 0, 0.6)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${feature.color}, ${feature.color}88)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 4,
                      }}
                    >
                      <Icon sx={{ fontSize: 40, color: "white" }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 300,
                        mb: 3,
                        fontSize: { xs: "1.5rem", sm: "1.75rem" },
                        color: "white",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      sx={{
                        lineHeight: 1.6,
                        color: "#9ca3af",
                        fontWeight: 300,
                        fontSize: "1.1rem",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Divider */}
      <Container maxWidth="lg">
        <Box
          sx={{
            height: "1px",
            background:
              "linear-gradient(to right, transparent, #374151, transparent)",
            my: { xs: 8, md: 12 },
          }}
        />
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: { xs: 8, md: 12 } }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
                fontWeight: 300,
                mb: 4,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              Loved by Learners Worldwide
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 4, md: 6 }}>
            {testimonials.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Box
                  sx={{
                    p: { xs: 6, sm: 8 },
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid #374151",
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "#6366f1",
                      background: "rgba(0, 0, 0, 0.6)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} sx={{ color: "#fbbf24", fontSize: 24 }} />
                    ))}
                  </Box>
                  <Typography
                    sx={{
                      mb: 6,
                      fontStyle: "italic",
                      lineHeight: 1.7,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      color: "#e5e7eb",
                      fontWeight: 300,
                    }}
                  >
                    "{testimonial.text}"
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "linear-gradient(135deg, #6366f1, #a855f7)",
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Verified sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 400,
                          color: "white",
                          fontSize: "1.1rem",
                          mb: 0.5,
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#9ca3af",
                          fontWeight: 300,
                        }}
                      >
                        {testimonial.country}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Divider */}
      <Container maxWidth="lg">
        <Box
          sx={{
            height: "1px",
            background:
              "linear-gradient(to right, transparent, #374151, transparent)",
            my: { xs: 8, md: 12 },
          }}
        />
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3rem", md: "4rem" },
              fontWeight: 300,
              mb: 4,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to Start Your Journey?
          </Typography>
          <Typography
            sx={{
              mb: 8,
              color: "#9ca3af",
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            Join thousands of language learners who have already transformed
            their skills
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/auth/register"
            sx={{
              py: 3,
              px: 8,
              fontSize: "1.1rem",
              fontWeight: 300,
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "white",
              color: "black",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            Get Started Today
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: "relative",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(12px)",
          mt: 8,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={6} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    mr: 3,
                  }}
                >
                  <Language sx={{ fontSize: 20, color: "white" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1.125rem" }}
                >
                  LinguaConnect
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                  lineHeight: 1.6,
                  maxWidth: 300,
                  mb: 3,
                }}
              >
                Connecting language learners worldwide through authentic
                conversations and cultural exchange.
              </Typography>
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.2)",
                    },
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </Box>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.2)",
                    },
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </Box>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.2)",
                    },
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 3, fontSize: "0.875rem" }}
              >
                Platform
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    Find Partners
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    My Matches
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 3, fontSize: "0.875rem" }}
              >
                Resources
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    Learning Tips
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    Blog
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    Community
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 3, fontSize: "0.875rem" }}
              >
                Support
              </Typography>
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    Help Center
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    Contact Us
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 2 }}>
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      textDecoration: "none",
                      "&:hover": { color: "#6366f1" },
                      transition: "color 0.2s",
                    }}
                  >
                    FAQ
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              pt: 6,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: 3, sm: 0 },
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", color: "#9ca3af" }}>
              © 2024 LinguaConnect. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Typography
                component="a"
                href="#"
                sx={{
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                  textDecoration: "none",
                  "&:hover": { color: "white" },
                  transition: "color 0.2s",
                }}
              >
                Privacy
              </Typography>
              <Typography
                component="a"
                href="#"
                sx={{
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                  textDecoration: "none",
                  "&:hover": { color: "white" },
                  transition: "color 0.2s",
                }}
              >
                Terms
              </Typography>
              <Typography
                component="a"
                href="#"
                sx={{
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                  textDecoration: "none",
                  "&:hover": { color: "white" },
                  transition: "color 0.2s",
                }}
              >
                Cookies
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
