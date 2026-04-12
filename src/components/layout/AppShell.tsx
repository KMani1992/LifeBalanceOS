"use client";

import { PropsWithChildren, useMemo, useState } from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Sidebar, { drawerWidth } from "@/components/common/Sidebar";
import AuthGate from "@/components/auth/AuthGate";
import { ROUTE_META } from "@/constants/navigation";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Applies the default authenticated shell while allowing auth utility routes
 * such as password recovery to render without the normal gate and navigation.
 */
export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const meta = useMemo(
    () => ROUTE_META[pathname] ?? ROUTE_META["/dashboard"],
    [pathname],
  );

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    if (pathname === "/") {
      return [{ label: ROUTE_META["/"].title }];
    }

    const routeTitle = ROUTE_META[pathname]?.title;
    if (routeTitle) {
      return [
        { label: ROUTE_META["/"].title, href: "/" },
        { label: routeTitle },
      ];
    }

    const segmentLabel = pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.replace(/-/g, " "))
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" / ");

    return [
      { label: ROUTE_META["/"].title, href: "/" },
      { label: segmentLabel || "Page" },
    ];
  }, [pathname]);

  if (pathname.startsWith("/auth/reset-password")) {
    return <>{children}</>;
  }

  return (
    <AuthGate>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navbar
            title={meta.title}
            subtitle={meta.subtitle}
            breadcrumbs={breadcrumbItems}
            onOpenSidebar={() => setMobileOpen(true)}
          />
          <Box
            component="main"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowX: "clip",
              px: { xs: 1.25, md: 2.5, xl: 3 },
              pb: { xs: 4, md: 5 },
              pt: 1.5,
            }}
          >
            <Box sx={{ flex: 1 }}>{children}</Box>
            <Box
              component="footer"
              sx={{
                mt: 4,
                py: 2,
                textAlign: "center",
                color: "text.secondary",
                borderTop: "1px solid rgba(22,50,79,0.08)",
              }}
            >
              <div>Small steps, repeated with calm, create extraordinary life balance.</div>
              <div>
                Designed and developed by {" "}
                <Box
                  component="a"
                  href="mailto:kmanikandangce@gmail.com"
                  sx={{ color: "primary.main", textDecoration: "none", fontWeight: 600 }}
                >
                  kmanikandangce@gmail.com
                </Box>
              </div>
            </Box>
          </Box>
        </Box>
      </Box>
    </AuthGate>
  );
}