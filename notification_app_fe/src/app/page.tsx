"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/context/NotificationContext";

const TYPES = ["All", "Placement", "Result", "Event"] as const;

const TYPE_COLORS: Record<string, { active: string; bg: string; border: string }> = {
  All: { active: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
  Placement: { active: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
  Result: { active: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  Event: { active: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
};

export default function HomePage() {
  const { all, loading, error, viewedIds, markViewed, refresh } = useNotifications();
  const [activeType, setActiveType] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = all
    .filter((n) => activeType === "All" || n.Type === activeType)
    .filter((n) =>
      search ? n.Message.toLowerCase().includes(search.toLowerCase()) : true
    );

  const unreadCount = all.filter((n) => !viewedIds.has(n.ID)).length;

  const sanitizeError = (err: string) => {
    if (err.includes("authorization") || err.includes("401")) {
      return "Authentication required — add your NOTIFY_TOKEN to .env.local and restart the server.";
    }
    return err;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 0.25 }}>
            All Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {all.length} total · {unreadCount} unread
          </Typography>
        </Box>
        <Button
          id="btn-refresh-all"
          onClick={() => refresh(activeType === "All" ? undefined : activeType)}
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

      {/* Search bar */}
      <TextField
        id="input-search"
        fullWidth
        placeholder="Search notifications…"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2, bgcolor: "#fff" }}
      />

      {/* Type filter chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: "wrap" }} useFlexGap>
        {TYPES.map((t) => {
          const count = t === "All" ? all.length : all.filter((n) => n.Type === t).length;
          const active = activeType === t;
          const col = TYPE_COLORS[t];
          return (
            <Chip
              key={t}
              id={`chip-type-${t.toLowerCase()}`}
              label={`${t} (${count})`}
              clickable
              onClick={() => {
                setActiveType(t);
                refresh(t === "All" ? undefined : t);
              }}
              sx={{
                height: 28,
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                bgcolor: active ? col.active : "#fff",
                color: active ? "#fff" : "#64748b",
                border: "1px solid",
                borderColor: active ? col.active : "#e2e8f0",
                "&:hover": {
                  bgcolor: active ? col.active : col.bg,
                  borderColor: active ? col.active : col.border,
                },
              }}
            />
          );
        })}
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={24} thickness={5} sx={{ color: "#6d28d9" }} />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          {sanitizeError(error)}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="body2" color="text.disabled">
            No notifications found.
          </Typography>
        </Box>
      )}

      {/* Notification list */}
      {!loading &&
        filtered.map((n) => (
          <NotificationCard key={n.ID} notification={n} onView={markViewed} />
        ))}
    </Container>
  );
}
