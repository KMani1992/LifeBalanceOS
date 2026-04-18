# LifeBalanceOS

LifeBalanceOS is a personal life management platform that helps you plan, review, and improve life across four core pillars: Career, Family, Finance, and Peace.

It combines daily execution, weekly and monthly reflection, goals, habits, finance tracking, kids development logs, and home-care tasks in one system.

## Highlights

- Daily planner with goal-linked tasks and recurring workflow support
- Weekly review with pillar scoring and trend visualization
- Monthly review with insight generation and history
- Multi-level goals: master, milestone, and task
- Habit tracking with streak-style completion flow
- Finance tracking for income, expenses, savings, and investments
- Kids activity tracking across study, behavior, physical, and creativity
- Reflection journal with optional AI coaching hints
- PWA-ready experience with runtime caching support

## Pillar Model

LifeBalanceOS uses four top-level pillars:

- Career
- Family
- Finance
- Peace

Additional concerns such as kids, health, and personal growth are modeled using sub-categories rather than new top-level pillars.

## Main Routes

- /: Overview and entry actions
- /dashboard: Unified control center
- /daily: Daily planner and suggested tasks
- /weekly-review: Weekly scoring and trend analysis
- /monthly-review: Monthly reflection and insight history
- /goals: Goal planning and progression
- /habits: Habit creation and completion tracking
- /finance: Financial logging and metrics
- /kids: Kids development activity tracking
- /reflections: Reflection journal
- /garden: Home and maintenance task list
- /knowledge-base: Reference content
- /user-guide: Guided usage instructions

## Tech Stack

- Next.js 16 (App Router)
- React 18
- TypeScript
- Material UI
- Redux Toolkit
- Supabase (auth + database + RLS)
- Recharts
- Google GenAI
- next-pwa

## State Management

Redux slices currently cover:

- daily
- weeklyReviews
- monthlyReviews
- goals
- finance
- kids
- habits
- reflections

The auth provider hydrates all module state after sign-in using centralized persistence helpers.

## API Endpoints

AI-powered API routes:

- /api/weekly-coach
- /api/monthly-coach
- /api/reflection-coach
- /api/task-suggestions

These routes use Google GenAI and require an AI API key.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase project

### Install

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build and run production mode locally

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create a .env.local file using .env.example as reference.

Required:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
```

Recommended:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

AI configuration (either one):

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
# or
GOOGLE_API_KEY=your_google_ai_api_key_here
```

Optional push setup:

```dotenv
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

## Supabase Setup

1. Create a Supabase project.
2. Add Supabase keys to .env.local.
3. Run SQL from supabase/schema.sql.
4. Configure auth providers and redirect URLs.

The schema enables Row Level Security for user-scoped access across modules.

## Deployment

### Vercel

This project is ready for Vercel deployment with native Next.js settings.

- Docker is not required for Vercel free-tier deployment.
- Add all required environment variables in Vercel Project Settings.
- Set NEXT_PUBLIC_APP_URL to your deployed domain.

### Docker

Docker is optional and only needed if you move to non-Vercel hosting or want containerized local parity.

## Philosophy

Small steps, repeated with calm, create extraordinary life balance.