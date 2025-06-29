import { Container, Typography, Box } from "@mui/material";
import { cookies } from "next/headers";
import MatchesClient from "@/features/matches/components/MatchesClient";

async function getMatches(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch matches");
    }

    const data = await response.json();
    return data.data || data.matches || [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

async function getIncomingRequests(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/matches/requests/incoming`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch incoming requests");
    }

    const data = await response.json();
    return data.data || data.requests || [];
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    return [];
  }
}

async function getOutgoingRequests(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/matches/requests/outgoing`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch outgoing requests");
    }

    const data = await response.json();
    return data.data || data.requests || [];
  } catch (error) {
    console.error("Error fetching outgoing requests:", error);
    return [];
  }
}

export default async function MatchesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ color: "white" }}>
          Authentication required
        </Typography>
      </Container>
    );
  }

  // Fetch all data concurrently
  const [matchesResult, incomingResult, outgoingResult] =
    await Promise.allSettled([
      getMatches(token),
      getIncomingRequests(token),
      getOutgoingRequests(token),
    ]);

  // Extract data and errors
  const matches =
    matchesResult.status === "fulfilled" ? matchesResult.value : [];
  const incomingRequests =
    incomingResult.status === "fulfilled" ? incomingResult.value : [];
  const outgoingRequests =
    outgoingResult.status === "fulfilled" ? outgoingResult.value : [];

  const errors = {
    matches:
      matchesResult.status === "rejected" ? "Failed to load matches" : null,
    incoming:
      incomingResult.status === "rejected"
        ? "Failed to load incoming requests"
        : null,
    outgoing:
      outgoingResult.status === "rejected"
        ? "Failed to load outgoing requests"
        : null,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h1"
          sx={{ fontWeight: 300, mb: 2, color: "white" }}
        >
          Matches & Requests
        </Typography>
        <Typography variant="body1" sx={{ color: "#9ca3af", mb: 3 }}>
          Connect with your language exchange matches and manage partner requests
        </Typography>
      </Box>

      <MatchesClient
        matches={matches}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        errors={errors}
      />
    </Container>
  );
}
