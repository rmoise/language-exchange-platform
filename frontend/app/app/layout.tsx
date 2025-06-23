import { Box } from "@mui/material";
import OnboardingCheck from "./OnboardingCheck";
import ProtectedHeader from "./ProtectedHeader";
import MobileBottomNav from "./MobileBottomNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingCheck>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "#000000",
          color: "white",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, #000000 50%)",
            zIndex: -1,
          },
        }}
      >
        {/* Header with notifications */}
        <ProtectedHeader />

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            data-scroll-container="true"
            sx={{
              flex: 1,
              overflowY: "auto",
              p: { xs: 2, lg: 3 },
              pt: { xs: 2, lg: 3 },
              pb: { xs: 12, lg: 3 }, // Extra padding bottom for mobile bottom nav
            }}
          >
            {children}
          </Box>
        </Box>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </Box>
    </OnboardingCheck>
  );
}