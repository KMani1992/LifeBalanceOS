"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";

const spotlightStats = [
  {
    label: "Career",
    value: "Goals + habits",
    support: "Keep learning, execution, and review loops visible together.",
    accent: "#1E88E5",
  },
  {
    label: "Family",
    value: "Kids + routines",
    support: "Notice patterns in attention, consistency, and presence at home.",
    accent: "#43A047",
  },
  {
    label: "Finance",
    value: "Cash flow clarity",
    support: "Track income, spending, savings, and investment momentum in one place.",
    accent: "#FB8C00",
  },
  {
    label: "Peace",
    value: "Reflection + recovery",
    support: "Make calm measurable through rhythms, reviews, and daily reflection.",
    accent: "#8E24AA",
  },
];

const modules = [
  {
    title: "Career Growth",
    description: "Goals, learning, and execution rhythms that compound over time.",
    href: "/dashboard",
  },
  {
    title: "Family Stability",
    description: "Shared routines, kids development, and intentional relationships.",
    href: "/kids",
  },
  {
    title: "Financial Security",
    description: "Income, spending, savings, investing, and confidence in the numbers.",
    href: "/finance",
  },
  {
    title: "Personal Peace",
    description: "Habits, reflections, calm review loops, and sustainable energy.",
    href: "/reflections",
  },
];

/**
 * Renders the landing page with an overview of the LifeBalanceOS system.
 */
export default function HomePage() {
  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Stack spacing={5}>
        {/* Hero Section */}
        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
              <Grid item xs={12} md={6}>
                <Stack spacing={3} justifyContent="space-between" sx={{ height: "100%" }}>
                  <PageHeader
                    eyebrow="Personal Life Management OS"
                    title="Run your life with clarity, not backlog guilt"
                    description="LifeBalanceOS brings planning, review, goals, habits, kids development, finance, reflections, and home care into one calm operating system."
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1, width: { xs: "100%", sm: "auto" } }}>
                      <Button component={Link} href="/dashboard" size="large" variant="contained" sx={{ width: { xs: "100%", sm: 180, borderRadius: 2 } }}>
                        Open Dashboard
                      </Button>
                      <Button component={Link} href="/weekly-review" size="large" variant="outlined" sx={{ width: { xs: "100%", sm: 180, borderRadius: 2 } }}>
                        Start Weekly Review
                      </Button>
                    </Stack>
                  </PageHeader>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%", background: "linear-gradient(180deg, #ffffff, #eef7f3)" }}>
                  <CardContent>
                    <Stack spacing={2.5} sx={{ height: "100%", justifyContent: "space-between" }}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          A philosophy of clarity
                        </Typography>
                        <Typography color="text.secondary" sx={{ lineHeight: 1.6, fontStyle: "italic" }}>
                          "The best productivity system is the one you actually use. LifeBalanceOS keeps your life intentional, measurable, and sustainable—without the guilt."
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: "rgba(30, 136, 229, 0.08)" }}>
                        <Typography fontWeight={700} sx={{ mb: 0.75 }}>
                          Built for your real life
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          Designed for those who believe that clarity breeds calm, and that intentional living is worth a small, consistent investment each week.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Pillar Highlights */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, ml: 0.5 }}>
            Four pillars of intentional living
          </Typography>
          <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            {spotlightStats.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.label}>
                <StatCard label={item.label} value={item.value} support={item.support} accent={item.accent} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Module Cards */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, ml: 0.5 }}>
            Explore each module
          </Typography>
          <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            {modules.map((module) => (
              <Grid item xs={12} sm={6} md={6} lg={6} key={module.title}>
                <Card sx={{ height: "100%", transition: "all 0.3s ease", "&:hover": { boxShadow: 2, transform: "translateY(-2px)" } }}>
                  <CardContent>
                    <Stack spacing={2} sx={{ height: "100%" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {module.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ flex: 1, lineHeight: 1.6 }}>
                        {module.description}
                      </Typography>
                      <Button component={Link} href={module.href} variant="text" size="small" sx={{ alignSelf: "flex-start" }}>
                        Explore →
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
}