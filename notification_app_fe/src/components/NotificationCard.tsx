"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import { ScoredNotification } from "@/lib/types";

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  Placement: {
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    icon: <WorkOutlineIcon sx={{ fontSize: 13 }} />,
    label: "Placement",
  },
  Result: {
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: <SchoolOutlinedIcon sx={{ fontSize: 13 }} />,
    label: "Result",
  },
  Event: {
    color: "#047857",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    icon: <EventNoteOutlinedIcon sx={{ fontSize: 13 }} />,
    label: "Event",
  },
};

interface Props {
  notification: ScoredNotification;
  rank?: number;
  onView: (id: string) => void;
}

export default function NotificationCard({ notification, rank, onView }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[notification.Type] ?? TYPE_CONFIG.Event;
  const isUnread = !notification._viewed;

  const handleClick = () => {
    setExpanded((p) => !p);
    if (isUnread) onView(notification.ID);
  };

  const date = new Date(notification.Timestamp.replace(" ", "T"));
  const dateStr = isNaN(date.getTime())
    ? notification.Timestamp
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
      " · " +
      date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid",
        borderColor: expanded ? cfg.color + "55" : "#e2e8f0",
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: "0 8px 8px 0",
        mb: 1.5,
        overflow: "hidden",
        opacity: notification._viewed && !expanded ? 0.72 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": {
          borderColor: cfg.color + "55",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        },
      }}
    >
      {/* Main row */}
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Rank badge */}
        {rank !== undefined && (
          <Typography
            variant="caption"
            sx={{ color: "#94a3b8", fontWeight: 700, minWidth: 20, pt: 0.1, fontFamily: "monospace" }}
          >
            {rank}
          </Typography>
        )}

        {/* Unread dot */}
        {isUnread && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: cfg.color,
              flexShrink: 0,
              mt: "7px",
            }}
          />
        )}

        {/* Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: isUnread ? "#0f172a" : "#475569",
              fontWeight: isUnread ? 600 : 400,
              lineHeight: 1.55,
              wordBreak: "break-word",
            }}
          >
            {notification.Message}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
            <Chip
              icon={cfg.icon as React.ReactElement}
              label={cfg.label}
              size="small"
              sx={{
                height: 19,
                fontSize: 11,
                fontWeight: 600,
                color: cfg.color,
                bgcolor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                "& .MuiChip-icon": { color: cfg.color, ml: "5px" },
                "& .MuiChip-label": { px: "6px" },
              }}
            />
            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: 11 }}>
              {dateStr}
            </Typography>
          </Box>
        </Box>

        {/* Right actions */}
        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, mt: 0.25 }}>
          {notification._viewed && (
            <Tooltip title="Read">
              <CheckIcon sx={{ fontSize: 14, color: "#94a3b8", mr: 0.5 }} />
            </Tooltip>
          )}
          <IconButton
            size="small"
            disableRipple
            sx={{ color: "#94a3b8", p: 0.25 }}
          >
            <KeyboardArrowDownIcon
              sx={{
                fontSize: 18,
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.18s ease",
              }}
            />
          </IconButton>
        </Box>
      </Box>

      {/* Expanded detail */}
      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: "1px solid #f1f5f9" }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
            {notification.Message}
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.25, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Notification ID
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#64748b", fontSize: 11 }}>
                {notification.ID}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.25, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Timestamp
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontSize: 11 }}>
                {notification.Timestamp}
              </Typography>
            </Box>
            {typeof notification._priority === "number" && (
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.25, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Priority Score
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontFamily: "monospace", fontSize: 11 }}>
                  {notification._priority.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
