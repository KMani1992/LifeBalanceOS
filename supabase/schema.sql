
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
  task_date date,
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

create table if not exists public.goal_subtasks (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  title text not null,
  completed boolean default false,
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
    'income','expense','savings','investment','other'
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
    'learning','exercise','kids','family','reflection','other'
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
create index if not exists idx_goal_subtasks_goal on public.goal_subtasks(goal_id);
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
alter table public.goal_subtasks enable row level security;
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

drop policy if exists "Users can access subtasks for their own goals" on public.goal_subtasks;
create policy "Users can access subtasks for their own goals"
on public.goal_subtasks
for all
using (
  exists (
    select 1
    from public.goals
    where public.goals.id = public.goal_subtasks.goal_id
      and public.goals.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.goals
    where public.goals.id = public.goal_subtasks.goal_id
      and public.goals.user_id = auth.uid()
  )
);

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

-- ============================================================
-- MIGRATION v2: Enhanced Life Tracking
-- Idempotent: safe to run on top of v1 schema.
-- ============================================================

-- A. Goals table enhancements (new columns, backward-compatible)
alter table public.goals
  add column if not exists goal_type text
    check (goal_type in ('master','milestone','task')) default 'task',
  add column if not exists period text
    check (period in ('daily','weekly','monthly','one-time')) default 'one-time',
  add column if not exists level_current integer default 1,
  add column if not exists level_target integer default 5,
  add column if not exists repeat text
    check (repeat in ('none','weekly','monthly')) default 'none';

-- B. Daily tasks enhancements (new columns, backward-compatible)
alter table public.daily_tasks
  add column if not exists goal_id uuid references public.goals(id) on delete set null,
  add column if not exists task_date date,
  add column if not exists week_tag text
    check (week_tag in ('week1','week2','week3','week4'));

create index if not exists idx_daily_tasks_goal on public.daily_tasks(goal_id);

-- C. Milestones table
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists idx_milestones_goal on public.milestones(goal_id);

alter table public.milestones enable row level security;

drop policy if exists "Users can access milestones for their own goals" on public.milestones;
create policy "Users can access milestones for their own goals"
on public.milestones
for all
using (
  exists (
    select 1
    from public.goals
    where public.goals.id = public.milestones.goal_id
      and public.goals.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.goals
    where public.goals.id = public.milestones.goal_id
      and public.goals.user_id = auth.uid()
  )
);

-- D. Monthly reviews table
create table if not exists public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  month date,
  improved text,
  not_improved text,
  level_change text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_monthly_reviews_user on public.monthly_reviews(user_id);

alter table public.monthly_reviews enable row level security;

drop policy if exists "Users can access their own monthly reviews" on public.monthly_reviews;
create policy "Users can access their own monthly reviews"
on public.monthly_reviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================
-- MIGRATION v3: Extended Categories via sub_category
-- Idempotent: adds sub_category columns and week_tag support
-- Maps: kids→family, health/personal→peace (via sub_category)
-- ============================================================

-- A. Add sub_category to goals (for future category grouping)
alter table public.goals
  add column if not exists sub_category text;

-- B. Add sub_category and preserve week_tag for daily_tasks
alter table public.daily_tasks
  add column if not exists sub_category text;

-- C. Add sub_category to habits (for grouping habits)
alter table public.habits
  add column if not exists sub_category text;

-- D. Create a view for backward compatibility (daily_tasks with mapped category)
-- This allows legacy code expecting 6 categories to still work
create or replace view public.daily_tasks_with_mapped_category as
select
  id,
  user_id,
  title,
  category,
  sub_category,
  completed,
  task_date,
  created_at,
  completed_at,
  goal_id,
  week_tag,
  -- Map old 6-category values to 4-pillar + sub_category
  case
    when category in ('career','family','finance','peace') then 'pillar'::text
    when category = 'health' then 'mapped_peace'::text
    when category = 'personal' then 'mapped_peace'::text
    when category = 'kids' then 'mapped_family'::text
    else 'unknown'::text
  end as category_type
from public.daily_tasks;

-- ===================================================
-- Migration v4: Normalize 6-category to 4-pillar + sub_category
-- ===================================================
-- One-time migration to permanently convert old category values
-- to 4-pillar categories with sub_category fields

-- Step 1: Update daily_tasks with old 6-category values
update public.daily_tasks
set 
  category = 'peace',
  sub_category = 'health'
where category = 'health';

update public.daily_tasks
set 
  category = 'peace',
  sub_category = 'personal'
where category = 'personal';

update public.daily_tasks
set 
  category = 'family',
  sub_category = 'kids'
where category = 'kids';

-- Set all remaining tasks to have at least 'general' as sub_category if null
update public.daily_tasks
set sub_category = 'general'
where sub_category is null and category in ('career', 'family', 'finance', 'peace');

-- Step 2: Update goals with old 6-category values (goals already use 4-pillar in schema)
-- Just ensure sub_category is set appropriately
update public.goals
set sub_category = 'general'
where sub_category is null and category in ('career', 'family', 'finance', 'peace');

-- Step 3: Update habits (habits have different categories, but normalize any that map)
-- No normalization needed for habits as they don't use the same 6-category system

-- Step 4: Drop the backward compatibility view after data is normalized
drop view if exists public.daily_tasks_with_mapped_category;

-- ============================================================
-- SEED DATA: Default tasks for first-time users
-- Uses auth.uid() — must be run as authenticated user
-- Idempotent: inserts only if no tasks exist for this user
-- ============================================================

do $$
begin
  if (select count(*) from public.daily_tasks where user_id = auth.uid()) = 0 then

    -- Master Goals
    insert into public.goals (user_id, title, category, goal_type, period, level_target)
    values
    (auth.uid(), 'Become strong in React, System Design, and AI', 'career', 'master', 'one-time', 5),
    (auth.uid(), 'Build peaceful and stable family life', 'family', 'master', 'one-time', 5),
    (auth.uid(), 'Achieve financial discipline and savings growth', 'finance', 'master', 'one-time', 5),
    (auth.uid(), 'Maintain calm mind and healthy routine', 'peace', 'master', 'one-time', 5);

    -- Monthly Milestone Goals
    insert into public.goals (user_id, title, category, sub_category, goal_type, period)
    values
    (auth.uid(), 'Complete 1 major topic (React/AI)', 'career', 'general', 'milestone', 'monthly'),
    (auth.uid(), 'Update resume or LinkedIn', 'career', 'general', 'milestone', 'monthly'),
    (auth.uid(), 'Plan 1 family outing', 'family', 'general', 'milestone', 'monthly'),
    (auth.uid(), 'Discuss family goals with wife', 'family', 'general', 'milestone', 'monthly'),
    (auth.uid(), 'Review SIP investments', 'finance', 'general', 'milestone', 'monthly'),
    (auth.uid(), 'Check savings growth', 'finance', 'general', 'milestone', 'monthly'),
    (auth.uid(), 'Adjust monthly budget', 'finance', 'general', 'milestone', 'monthly'),
    (auth.uid(), 'Maintain daily reflection habit', 'peace', 'personal', 'milestone', 'monthly'),
    (auth.uid(), 'Maintain exercise routine', 'peace', 'health', 'milestone', 'monthly');

    -- Core Daily Tasks
    insert into public.daily_tasks (user_id, title, category, sub_category)
    values
    (auth.uid(), 'Study React / AI topic (30 min)', 'career', 'general'),
    (auth.uid(), 'Play or talk with kids', 'family', 'kids'),
    (auth.uid(), 'Calm conversation with wife', 'family', 'general'),
    (auth.uid(), 'Track daily expenses', 'finance', 'general'),
    (auth.uid(), 'Walk / exercise (20 min)', 'peace', 'health'),
    (auth.uid(), '5 min reflection / prayer', 'peace', 'personal');

    -- Kids Weekly Rotation Tasks
    insert into public.daily_tasks (user_id, title, category, sub_category, week_tag)
    values
    -- Week 1: Language
    (auth.uid(), 'Storytelling with child', 'family', 'kids', 'week1'),
    (auth.uid(), 'Teach object naming', 'family', 'kids', 'week1'),
    -- Week 2: Discipline
    (auth.uid(), 'Teach cleaning toys', 'family', 'kids', 'week2'),
    (auth.uid(), 'Practice eating discipline', 'family', 'kids', 'week2'),
    -- Week 3: Physical
    (auth.uid(), 'Park play', 'family', 'kids', 'week3'),
    (auth.uid(), 'Ball play activity', 'family', 'kids', 'week3'),
    -- Week 4: Values
    (auth.uid(), 'Teach sharing', 'family', 'kids', 'week4'),
    (auth.uid(), 'Teach respect elders', 'family', 'kids', 'week4');

    -- Habits
    insert into public.habits (user_id, title, category, sub_category)
    values
    (auth.uid(), 'Wake up early', 'reflection', 'personal'),
    (auth.uid(), 'Plan top 3 tasks', 'learning', 'personal'),
    (auth.uid(), 'Evening reflection', 'reflection', 'personal'),
    (auth.uid(), 'Daily walk / exercise', 'exercise', 'health');

  end if;
end $$;
