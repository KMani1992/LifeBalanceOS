"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import ChildCareRoundedIcon from "@mui/icons-material/ChildCareRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import GrassRoundedIcon from "@mui/icons-material/GrassRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import RadarRoundedIcon from "@mui/icons-material/RadarRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import AppLogo from "@/components/common/AppLogo";

const drawerWidth = 280;

const groups = [
  {
    title: "Operate",
    items: [
      { label: "Overview", href: "/", icon: AutoGraphRoundedIcon },
      { label: "Dashboard", href: "/dashboard", icon: RadarRoundedIcon },
      { label: "Daily Planner", href: "/daily", icon: TaskAltRoundedIcon },
      { label: "Weekly Review", href: "/weekly-review", icon: InsightsRoundedIcon },
      { label: "Knowledge Base", href: "/knowledge-base", icon: SchoolRoundedIcon },
    ],
  },
  {
    title: "Grow",
    items: [
      { label: "Goals", href: "/goals", icon: TrackChangesRoundedIcon },
      { label: "Kids", href: "/kids", icon: ChildCareRoundedIcon },
      { label: "Finance", href: "/finance", icon: SavingsRoundedIcon },
      { label: "Habits", href: "/habits", icon: EventNoteRoundedIcon },
      { label: "Reflections", href: "/reflections", icon: SpaRoundedIcon },
      { label: "Garden", href: "/garden", icon: GrassRoundedIcon },
    ],
  },
] as const;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

/**
 * Renders the reusable application sidebar for desktop and mobile navigation.
 */
export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <Stack sx={{ height: "100%" }}>
      <Box
        component={Link}
        href="/"
        onClick={onClose}
        sx={{
          px: 2.5,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.75,
          textDecoration: "none",
          color: "inherit",
          "&:hover": { opacity: 0.85 },
          transition: "opacity 0.2s",
        }}
      >
        <AppLogo size={42} />
        <Box>
          <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 800, letterSpacing: "0.1em", lineHeight: 1 }}>
            LIFEBALANCEOS
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.3, mt: 0.25 }}>
            A calm operating system for the week.
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        {groups.map((group) => (
          <Box key={group.title} sx={{ mb: 2.5 }}>
            <Typography sx={{ px: 1.5, pb: 1, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", color: "text.secondary", textTransform: "uppercase" }}>
              {group.title}
            </Typography>
            <List sx={{ p: 0 }}>
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    onClick={onClose}
                    sx={{
                      mb: 0.5,
                      borderRadius: 3,
                      mx: 0.5,
                      bgcolor: active ? "rgba(30,136,229,0.10)" : "transparent",
                      border: active ? "1px solid rgba(30,136,229,0.16)" : "1px solid transparent",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: active ? "primary.main" : "text.secondary" }}>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: active ? 800 : 600,
                        color: active ? "text.primary" : "text.secondary",
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Stack>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export { drawerWidth };
