"use client";

import { useState } from "react";
import { Box, Tabs, Tab, Badge, Typography } from "@mui/material";
import {
  FavoriteBorder as MatchIcon,
  MailOutline as IncomingIcon,
  Send as OutgoingIcon,
} from "@mui/icons-material";
import MatchList from "@/app/protected/matches/MatchList";
import RequestList from "@/app/protected/requests/RequestList";

interface MatchesClientProps {
  matches: any[];
  incomingRequests: any[];
  outgoingRequests: any[];
  errors: {
    matches: string | null;
    incoming: string | null;
    outgoing: string | null;
  };
}

export default function MatchesClient({
  matches,
  incomingRequests,
  outgoingRequests,
  errors,
}: MatchesClientProps) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Tab Navigation */}
      <Box
        sx={{ borderBottom: 1, borderColor: "rgba(255, 255, 255, 0.2)", mb: 3 }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              minWidth: "auto",
              px: 3,
              py: 1.5,
              color: "rgba(255, 255, 255, 0.7)",
              "&.Mui-selected": {
                color: "#6366f1",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#6366f1",
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MatchIcon sx={{ fontSize: 18 }} />
                <span>Active Matches</span>
                {matches.length > 0 && (
                  <Badge
                    badgeContent={matches.length}
                    color="primary"
                    sx={{ ml: 0.5 }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IncomingIcon sx={{ fontSize: 18 }} />
                <span>Incoming Requests</span>
                {incomingRequests.length > 0 && (
                  <Badge
                    badgeContent={incomingRequests.length}
                    color="error"
                    sx={{ ml: 0.5 }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <OutgoingIcon sx={{ fontSize: 18 }} />
                <span>Sent Requests</span>
                {outgoingRequests.length > 0 && (
                  <Badge
                    badgeContent={outgoingRequests.length}
                    color="info"
                    sx={{ ml: 0.5 }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <Box>
            {errors.matches ? (
              <Typography sx={{ p: 2, color: "#ef4444" }}>
                {errors.matches}
              </Typography>
            ) : (
              <>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Your confirmed language exchange partners. Start conversations
                  and practice together!
                </Typography>
                <MatchList matches={matches} />
              </>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {errors.incoming ? (
              <Typography sx={{ p: 2, color: "#ef4444" }}>
                {errors.incoming}
              </Typography>
            ) : (
              <>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: "rgba(255, 255, 255, 0.7)" }}
                >
                  People who want to be your language exchange partner. Accept
                  or decline their requests.
                </Typography>
                <RequestList requests={incomingRequests} type="incoming" />
              </>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            {errors.outgoing ? (
              <Typography sx={{ p: 2, color: "#ef4444" }}>
                {errors.outgoing}
              </Typography>
            ) : (
              <>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Match requests you've sent to other users. Track their status
                  here.
                </Typography>
                <RequestList requests={outgoingRequests} type="outgoing" />
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
