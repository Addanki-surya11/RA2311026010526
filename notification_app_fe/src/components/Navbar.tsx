"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import TuneIcon from "@mui/icons-material/Tune";
import MenuIcon from "@mui/icons-material/Menu";

const NAV_LINKS = [
  { label: "All Notifications", href: "/", icon: <HomeOutlinedIcon sx={{ fontSize: 17 }} /> },
  { label: "Priority Inbox", href: "/priority", icon: <StarOutlineIcon sx={{ fontSize: 17 }} /> },
  { label: "Filter", href: "/filter", icon: <TuneIcon sx={{ fontSize: 17 }} /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#0f172a",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <Toolbar sx={{ minHeight: "56px !important", px: { xs: 2, sm: 3 } }}>
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CampaignIcon sx={{ color: "#818cf8", fontSize: 20 }} />
            <Box>
              <Typography
                variant="subtitle2"
                component="span"
                sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}
              >
                AFFORDMED
              </Typography>
              <Typography
                component="span"
                sx={{ color: "#475569", fontSize: 13, ml: 0.5 }}
              >
                / Campus
              </Typography>
            </Box>
          </Box>

          {isMobile ? (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ ml: "auto", color: "#94a3b8" }}
              size="small"
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          ) : (
            <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Button
                    key={link.href}
                    component={Link}
                    href={link.href}
                    startIcon={link.icon}
                    size="small"
                    sx={{
                      color: active ? "#f1f5f9" : "#94a3b8",
                      bgcolor: active ? "rgba(255,255,255,0.08)" : "transparent",
                      fontWeight: active ? 600 : 400,
                      fontSize: 13,
                      px: 1.5,
                      py: 0.6,
                      borderRadius: 1.5,
                      gap: 0.5,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.06)",
                        color: "#e2e8f0",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: "#0f172a", borderLeft: "1px solid #1e293b", minWidth: 220 } }}
      >
        <List sx={{ pt: 2 }}>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                component={Link}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                selected={pathname === link.href}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  color: "#94a3b8",
                  "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.08)", color: "#f1f5f9" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#e2e8f0" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>{link.icon}</ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: pathname === link.href ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
