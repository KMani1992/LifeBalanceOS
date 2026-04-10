"use client";

import { PropsWithChildren, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Sidebar, { drawerWidth } from "@/components/common/Sidebar";
import AuthGate from "@/components/auth/AuthGate";

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Overview",
    subtitle: "Design a week that feels calm, intentional, and measurable.",
  },
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Monitor balance across the four life pillars and today's execution.",
  },
  "/daily": {
    title: "Daily Planner",
    subtitle: "Keep the day finite, visible, and actionable.",
  },
  "/weekly-review": {
    title: "Weekly Review",
    subtitle: "Review the week honestly and reset the next one with clarity.",
  },
  "/goals": {
    title: "Goals",
    subtitle: "Translate long-term direction into a few meaningful active commitments.",
  },
  "/kids": {
    title: "Kids",
    subtitle: "Track small observations that compound into growth over time.",
  },
  "/finance": {
    title: "Finance",
    subtitle: "Watch cash flow, savings momentum, and confidence in the numbers.",
  },
  "/habits": {
    title: "Habits",
    subtitle: "Keep rhythm-based behaviors visible enough to sustain them.",
  },
  "/reflections": {
    title: "Reflections",
    subtitle: "Capture lessons, wins, and tomorrow's adjustment while it is fresh.",
  },
  "/garden": {
    title: "Garden",
    subtitle: "Keep recurring home care simple, visible, and easy to complete.",
  },
};

/**
 * Applies the default authenticated shell while allowing auth utility routes
 * such as password recovery to render without the normal gate and navigation.
 */
export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const meta = useMemo(
    () => routeMeta[pathname] ?? routeMeta["/dashboard"],
    [pathname],
  );

  if (pathname.startsWith("/auth/reset-password")) {
    return <>{children}</>;
  }

  return (
    <AuthGate>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Navbar title={meta.title} subtitle={meta.subtitle} onOpenSidebar={() => setMobileOpen(true)} />
          <Box
            component="main"
            sx={{
              px: { xs: 2, md: 2.5, xl: 3 },
              pb: { xs: 4, md: 5 },
              pt: 1.5,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AuthGate>
  );
}