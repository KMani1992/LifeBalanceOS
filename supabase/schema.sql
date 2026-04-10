
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  created_at timestamp with time zone default now()
);

create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  category text check (category in (
    'career','health','family','kids','finance','personal'
  )),
  completed boolean default false,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  week_start date,
  career_score integer check (career_score between 1 and 10),
  family_score integer check (family_score between 1 and 10),
  finance_score integer check (finance_score between 1 and 10),
  peace_score integer check (peace_score between 1 and 10),
  life_balance_score numeric,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text check (category in (
    'career','family','finance','peace'
  )),
  target_date date,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists public.kids_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  child_name text,
  activity_type text check (activity_type in (
    'study','behavior','physical','creativity'
  )),
  description text,
  activity_date date,
  rating integer check (rating between 1 and 5),
  created_at timestamp with time zone default now()
);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text check (type in (
    'income','expense','savings','investment'
  )),
  category text,
  amount numeric not null,
  notes text,
  entry_date date,
  created_at timestamp with time zone default now()
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  reflection_date date,
  went_well text,
  learned_today text,
  improve_tomorrow text,
  mood integer check (mood between 1 and 10),
  created_at timestamp with time zone default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  category text check (category in (
    'learning','exercise','kids','family','reflection'
  )),
  target_frequency integer default 7,
  created_at timestamp with time zone default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade,
  completed_date date,
  created_at timestamp with time zone default now()
);

create table if not exists public.garden_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  task_name text,
  description text,
  completed boolean default false,
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create index if not exists idx_daily_tasks_user on public.daily_tasks(user_id);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_finance_user on public.finance_entries(user_id);
create index if not exists idx_habits_user on public.habits(user_id);
create index if not exists idx_weekly_reviews_user on public.weekly_reviews(user_id);
create index if not exists idx_habit_logs_habit on public.habit_logs(habit_id);
create index if not exists idx_garden_tasks_user on public.garden_tasks(user_id);
create index if not exists idx_kids_activities_user on public.kids_activities(user_id);
create index if not exists idx_reflections_user on public.reflections(user_id);

alter table public.users enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.goals enable row level security;
alter table public.kids_activities enable row level security;
alter table public.finance_entries enable row level security;
alter table public.reflections enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.garden_tasks enable row level security;

drop policy if exists "Users can access their own profile" on public.users;
create policy "Users can access their own profile"
on public.users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can access their own daily tasks" on public.daily_tasks;
create policy "Users can access their own daily tasks"
on public.daily_tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access their own weekly reviews" on public.weekly_reviews;
create policy "Users can access their own weekly reviews"
on public.weekly_reviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access their own goals" on public.goals;
create policy "Users can access their own goals"
on public.goals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access their own kids activities" on public.kids_activities;
create policy "Users can access their own kids activities"
on public.kids_activities
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access their own finance entries" on public.finance_entries;
create policy "Users can access their own finance entries"
on public.finance_entries
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access their own reflections" on public.reflections;
create policy "Users can access their own reflections"
on public.reflections
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access their own habits" on public.habits;
create policy "Users can access their own habits"
on public.habits
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access logs for their habits" on public.habit_logs;
create policy "Users can access logs for their habits"
on public.habit_logs
for all
using (
  exists (
    select 1
    from public.habits
    where public.habits.id = public.habit_logs.habit_id
      and public.habits.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.habits
    where public.habits.id = public.habit_logs.habit_id
      and public.habits.user_id = auth.uid()
  )
);

drop policy if exists "Users can access their own garden tasks" on public.garden_tasks;
create policy "Users can access their own garden tasks"
on public.garden_tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
