"use client";

import Link from "next/link";
import { useState } from "react";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  AppBar,
  Avatar,
  Breadcrumbs,
  Box,
  Link as MuiLink,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { drawerWidth } from "@/components/common/Sidebar";
import { useAuth } from "@/lib/auth-context";

interface NavbarProps {
  title: string;
  subtitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  onOpenSidebar: () => void;
}

/**
 * Renders the top application bar with context, user identity, and profile dropdown.
 */
export default function Navbar({ title, subtitle, breadcrumbs, onOpenSidebar }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isProfileOpen = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleProfileClose();
    await signOut();
  };

  const displayName = profile?.name || profile?.email || "User";

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(18px)",
        background: "linear-gradient(180deg, rgba(247,251,255,0.86), rgba(247,251,255,0.72))",
        borderBottom: "1px solid rgba(22,50,79,0.08)",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, py: { xs: 0.75, md: 1 }, minHeight: { xs: 60, md: 64 } }}>
        <IconButton onClick={onOpenSidebar} sx={{ display: { lg: "none" }, mr: 1.5 }}>
          <MenuRoundedIcon />
        </IconButton>
        <Stack spacing={{ xs: 0.15, md: 0.25 }} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" sx={{ lineHeight: 1.1, fontSize: { xs: "1.15rem", md: "1.65rem" } }}>
            {title}
          </Typography>
          <Breadcrumbs
            aria-label="breadcrumb"
            separator="/"
            sx={{
              display: { xs: "none", md: "flex" },
              "& .MuiBreadcrumbs-separator": { mx: 0.75, color: "text.disabled" },
            }}
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              if (isLast || !item.href) {
                return (
                  <Typography
                    key={`${item.label}-${index}`}
                    variant="caption"
                    color={isLast ? "text.primary" : "text.secondary"}
                    sx={{ fontWeight: isLast ? 700 : 500 }}
                  >
                    {item.label}
                  </Typography>
                );
              }

              return (
                <MuiLink
                  key={`${item.label}-${index}`}
                  component={Link}
                  href={item.href}
                  underline="hover"
                  color="text.secondary"
                  variant="caption"
                  sx={{ fontWeight: 500 }}
                >
                  {item.label}
                </MuiLink>
              );
            })}
          </Breadcrumbs>
          <Typography variant="body2" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            onClick={handleProfileClick}
            size="small"
            sx={{
              padding: 0.5,
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "primary.main",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isProfileOpen}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 240,
                  backdropFilter: "blur(12px)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(247,251,255,0.90))",
                  border: "1px solid rgba(22,50,79,0.08)",
                },
              },
            }}
          >
            <MenuItem sx={{ py: 1.5, pointerEvents: "none", cursor: "default" }}>
              <Stack spacing={0.25} sx={{ width: "100%" }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  {displayName}
                </Typography>
                <Typography variant="caption" color="text.primary" sx={{ opacity: 1 }}>
                  {profile?.email}
                </Typography>
              </Stack>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "inherit" }}>
                <LogoutRoundedIcon fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
