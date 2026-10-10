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
- /life-reference/summary: Interactive summary of the Life Reference Book
- /life-reference/detailed: Detailed Life Reference Book and review tools
- /life-reference/audiobook: On-demand external audio edition

### Life Reference Book

UI pages live at `src/app/life-reference/{summary,detailed,audiobook}/page.tsx`.
Only the content endpoint belongs under `src/app/api/life-reference/[edition]/route.ts`.
Putting UI pages under `api` changes their URLs and can conflict with the content endpoint.

The three editions follow User Guide in the navigation and are linked from the
guide itself. The HTML editions are stored server-side in `src/content/life-reference`,
not in `public` or the client bundle. `/api/life-reference/summary` and
`/api/life-reference/detailed` verify the user's bearer token with Supabase
`auth.getUser` before reading any document. Any authenticated user can access
both editions; they are not restricted to a particular account.
Requests without a valid session are rejected, and responses use private/no-store
caching. PWA caching bypasses these endpoints. File tracing includes both HTML
documents in the deployed Vercel functions.

The client loads the verified HTML into sandboxed frames without giving the
documents access to session tokens, app cookies, or storage. Their interactions
are document-local; they do not save changes to Supabase. Summary and detailed
editions are viewed in-app; **Open in new tab** is available only for the audiobook.
Previously deployed public copies must be removed by redeploying; old deployment
URLs, saved downloads, and previously cached copies cannot be revoked by this change.

The audiobook connects to the supplied Google AI Studio-hosted player only
after the user selects **Load audiobook player**. Its availability, authentication,
and accessibility depend on the external service. **Open in new tab** provides
an alternative if embedding is unavailable. The parent app does not send
Supabase credentials or user data to the player. The external audio URL itself
is not protected by this app's login; access control for that service must be
configured separately.

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

#### Supabase keep-alive cron

[vercel.json](./vercel.json) schedules a GET request to
[`/api/keep-alive`](./src/app/api/keep-alive/route.ts) with `0 0 */3 * *`.
This runs at midnight UTC on days 1, 4, 7, and so on, resetting each month.
The month boundary can shorten the interval; this is not an exact 72-hour schedule.
On Vercel Hobby, execution can occur within the scheduled hour.
Cron schedules run on production deployments, not locally or on previews.

Before deploying, add these **Production** environment variables in Vercel:

- `CRON_SECRET`: a cryptographically random secret, generated with
  `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
  Vercel automatically sends `Authorization: Bearer <CRON_SECRET>`.
- `SUPABASE_SERVICE_ROLE_KEY`: the server-only service-role key from your
  Supabase project's API settings. Never use a `NEXT_PUBLIC_` prefix or expose
  this key in client code; it bypasses row-level security.
- `NEXT_PUBLIC_SUPABASE_URL`: the exact URL of that same active Supabase project.

The endpoint reads at most one `id` from the existing `public.users` table.
An empty table is valid and still executes a database query. No user data is
included in the response, responses are not cached, and the query has a
10-second timeout. Missing configuration returns 500, invalid authorization
returns 401, and database failures return 503 and are logged.

Redeploy after configuring the variables. Under **Vercel Settings > Cron Jobs**,
run the job manually and check the function logs for a successful response
(`{"ok":true}`). A request without the authorization header should return 401.
For local testing, add the server-only variables to your untracked `.env.local`
and invoke the endpoint with the same Bearer header.

This lightweight query is intended to generate activity between real visits,
not guarantee that Supabase will never pause a free project. Monitor failures;
Vercel does not automatically retry failed cron invocations. Resume an
already-paused project in Supabase first. This does not fix DNS errors such as
`ERR_NAME_NOT_RESOLVED` or an incorrect project URL.

### Docker

Docker is optional and only needed if you move to non-Vercel hosting or want containerized local parity.

## Philosophy

Small steps, repeated with calm, create extraordinary life balance.