"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "@/lib/auth-context";
import { NavItem } from "@/types";

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Daily", href: "/daily" },
  { label: "Weekly Review", href: "/weekly-review" },
  { label: "Goals", href: "/goals" },
  { label: "Kids", href: "/kids" },
  { label: "Finance", href: "/finance" },
  { label: "Habits", href: "/habits" },
  { label: "Reflections", href: "/reflections" },
  { label: "Garden", href: "/garden" },
];

/**
 * Renders the responsive top-level navigation for the app routes.
 */
export default function MainNavigation() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2, py: 1.5, alignItems: "flex-start" }}>
          <Box sx={{ minWidth: { xs: "auto", md: 220 } }}>
            <Typography variant="h6" fontWeight={800}>
              LifeBalanceOS
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.86 }}>
              Calm planning for a balanced life system.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ overflowX: "auto", flexWrap: "nowrap", pb: 0.5, width: "100%", alignItems: "center" }}
          >
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color="inherit"
                  variant={active ? "contained" : "text"}
                  sx={{
                    whiteSpace: "nowrap",
                    bgcolor: active ? "rgba(255,255,255,0.18)" : "transparent",
                    border: active ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
            <Box sx={{ flex: 1 }} />
            {profile?.email ? (
              <Chip
                label={profile.email}
                color="default"
                sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white" }}
              />
            ) : null}
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => void signOut()}
              sx={{ borderColor: "rgba(255,255,255,0.24)" }}
            >
              Sign Out
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
