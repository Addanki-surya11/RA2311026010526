"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import RefreshIcon from "@mui/icons-material/Refresh";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AppsIcon from "@mui/icons-material/Apps";
import SearchIcon from "@mui/icons-material/Search";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/context/NotificationContext";

type FilterType = "All" | "Placement" | "Result" | "Event";

const TYPE_CONFIG: Record<FilterType, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  All: { color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", icon: <AppsIcon sx={{ fontSize: 15 }} /> },
  Placement: { color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", icon: <WorkOutlineIcon sx={{ fontSize: 15 }} /> },
  Result: { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: <SchoolOutlinedIcon sx={{ fontSize: 15 }} /> },
  Event: { color: "#047857", bg: "#ecfdf5", border: "#a7f3d0", icon: <EventNoteOutlinedIcon sx={{ fontSize: 15 }} /> },
};

const FILTERS: FilterType[] = ["All", "Placement", "Result", "Event"];

export default function FilterPage() {
  const { all, loading, error, markViewed, refresh } = useNotifications();
  const [activeType, setActiveType] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, val: FilterType | null) => {
    if (!val) return;
    setActiveType(val);
    refresh(val === "All" ? undefined : val);
  };

  const filtered = all
    .filter((n) => activeType === "All" || n.Type === activeType)
    .filter((n) =>
      search ? n.Message.toLowerCase().includes(search.toLowerCase()) : true
    )
    .filter((n) => (showUnreadOnly ? !n._viewed : true));

  const counts: Record<FilterType, number> = {
    All: all.length,
    Placement: all.filter((n) => n.Type === "Placement").length,
    Result: all.filter((n) => n.Type === "Result").length,
    Event: all.filter((n) => n.Type === "Event").length,
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: "#f5f3ff",
              border: "1px solid #ddd6fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TuneIcon sx={{ color: "#6d28d9", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 0.1 }}>
              Filter Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Filter by type, keyword, or read status
            </Typography>
          </Box>
        </Box>
        <Button
          id="btn-refresh-filter"
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

      {/* Filter panel */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid #e2e8f0",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#94a3b8", display: "block", mb: 1.5, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px" }}
        >
          Notification Type
        </Typography>

        <ToggleButtonGroup
          id="toggle-type"
          value={activeType}
          exclusive
          onChange={handleTypeChange}
          sx={{ flexWrap: "wrap", gap: 1, mb: 2, "& .MuiToggleButtonGroup-grouped": { border: "1px solid #e2e8f0 !important", borderRadius: "6px !important" } }}
        >
          {FILTERS.map((f) => {
            const cfg = TYPE_CONFIG[f];
            const active = activeType === f;
            return (
              <ToggleButton
                key={f}
                value={f}
                id={`toggle-${f.toLowerCase()}`}
                sx={{
                  color: active ? cfg.color : "#64748b",
                  bgcolor: active ? cfg.bg : "#fff",
                  borderColor: `${active ? cfg.border : "#e2e8f0"} !important`,
                  fontWeight: active ? 600 : 500,
                  fontSize: 12,
                  px: 1.5,
                  py: 0.6,
                  gap: 0.75,
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { bgcolor: cfg.bg },
                  "&.Mui-selected": { bgcolor: cfg.bg, color: cfg.color },
                  "&.Mui-selected:hover": { bgcolor: cfg.bg },
                }}
              >
                {cfg.icon}
                {f}
                <Chip
                  label={counts[f]}
                  size="small"
                  sx={{
                    height: 17,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: active ? cfg.border : "#f1f5f9",
                    color: active ? cfg.color : "#64748b",
                    "& .MuiChip-label": { px: 0.7 },
                  }}
                />
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        <Divider sx={{ mb: 2 }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            id="input-filter-search"
            fullWidth
            placeholder="Search by keyword…"
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
          />
          <Button
            id="btn-unread-toggle"
            variant={showUnreadOnly ? "contained" : "outlined"}
            size="small"
            onClick={() => setShowUnreadOnly((p) => !p)}
            disableElevation
            sx={{
              whiteSpace: "nowrap",
              minWidth: 130,
              fontWeight: 500,
              fontSize: 13,
              ...(showUnreadOnly
                ? { bgcolor: "#6d28d9", "&:hover": { bgcolor: "#5b21b6" } }
                : { color: "#64748b", borderColor: "#e2e8f0", "&:hover": { bgcolor: "#f8fafc" } }),
            }}
          >
            {showUnreadOnly ? "Showing Unread" : "Unread Only"}
          </Button>
        </Stack>
      </Paper>

      {/* Result count */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          Showing{" "}
          <strong style={{ color: "#0f172a" }}>{filtered.length}</strong>{" "}
          notification{filtered.length !== 1 ? "s" : ""}
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

      {!loading && !error && filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="body2" color="text.disabled">
            No notifications match your filters.
          </Typography>
        </Box>
      )}

      {!loading &&
        filtered.map((n) => (
          <NotificationCard key={n.ID} notification={n} onView={markViewed} />
        ))}
    </Container>
  );
}
