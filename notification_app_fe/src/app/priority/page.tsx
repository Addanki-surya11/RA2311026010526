"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Slider,
  Divider,
  Paper,
  Grid,
} from "@mui/material";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/context/NotificationContext";

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: border,
        borderRadius: 2,
        bgcolor: bg,
        textAlign: "center",
      }}
    >
      <Box sx={{ color, mb: 0.5, display: "flex", justifyContent: "center" }}>{icon}</Box>
      <Typography variant="h6" fontWeight={700} sx={{ color: "#0f172a", lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "#64748b", fontSize: 11 }}>
        {label}
      </Typography>
    </Paper>
  );
}

export default function PriorityPage() {
  const { priority, all, loading, error, markViewed, refresh, topN, setTopN } =
    useNotifications();

  const placementCount = priority.filter((n) => n.Type === "Placement").length;
  const resultCount = priority.filter((n) => n.Type === "Result").length;
  const eventCount = priority.filter((n) => n.Type === "Event").length;
  const unread = priority.filter((n) => !n._viewed).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: "#fefce8",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StarOutlineIcon sx={{ color: "#d97706", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 0.1 }}>
              Priority Inbox
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Top {topN} of {all.length} notifications ranked by type & recency
            </Typography>
          </Box>
        </Box>
        <Button
          id="btn-refresh-priority"
          onClick={() => refresh()}
          startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
          size="small"
          sx={{
            color: "text.secondary",
            fontSize: 13,
            fontWeight: 500,
            bgcolor: "#f1f5f9",
            "&:hover": { bgcolor: "#e2e8f0" },
            mt: 0.25,
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Slider */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Showing top notifications
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#6d28d9" }}>
            {topN}
          </Typography>
        </Box>
        <Slider
          id="slider-top-n"
          min={5}
          max={50}
          step={5}
          value={topN}
          onChange={(_, val) => setTopN(val as number)}
          marks
          valueLabelDisplay="auto"
          sx={{
            color: "#6d28d9",
            "& .MuiSlider-rail": { bgcolor: "#e2e8f0" },
            "& .MuiSlider-mark": { bgcolor: "#e2e8f0" },
            "& .MuiSlider-markActive": { bgcolor: "#c4b5fd" },
          }}
        />
      </Paper>

      {/* Stats grid */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<NotificationsNoneIcon sx={{ fontSize: 20 }} />}
            label="Unread"
            value={unread}
            color="#d97706"
            bg="#fefce8"
            border="#fde68a"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<WorkOutlineIcon sx={{ fontSize: 20 }} />}
            label="Placements"
            value={placementCount}
            color="#6d28d9"
            bg="#f5f3ff"
            border="#ddd6fe"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<SchoolOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Results"
            value={resultCount}
            color="#1d4ed8"
            bg="#eff6ff"
            border="#bfdbfe"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<EventNoteOutlinedIcon sx={{ fontSize: 20 }} />}
            label="Events"
            value={eventCount}
            color="#047857"
            bg="#ecfdf5"
            border="#a7f3d0"
          />
        </Grid>
      </Grid>

      {/* Priority formula note */}
      <Box
        sx={{
          mb: 2.5,
          px: 2,
          py: 1.25,
          borderRadius: 1.5,
          bgcolor: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Sorted by:{" "}
          <strong style={{ color: "#6d28d9" }}>Placement</strong> (300) →{" "}
          <strong style={{ color: "#1d4ed8" }}>Result</strong> (200) →{" "}
          <strong style={{ color: "#047857" }}>Event</strong> (100) + recency
        </Typography>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={24} thickness={5} sx={{ color: "#6d28d9" }} />
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error.includes("401") || error.includes("authorization")
            ? "Authentication required — set NOTIFY_TOKEN in .env.local"
            : error}
        </Alert>
      )}

      {!loading &&
        priority.map((n, idx) => (
          <NotificationCard
            key={n.ID}
            notification={n}
            rank={idx + 1}
            onView={markViewed}
          />
        ))}
    </Container>
  );
}
