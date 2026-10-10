-- PeerCraft schema. Run once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text not null default '',
  status_emoji text,
  college text not null default '',
  branch text not null default '',
  academic_year text not null default '',
  bio text not null default '',
  role text not null default 'student' check (role in ('student','admin','moderator')),
  reputation numeric not null default 0,
  profile_visibility text not null default 'public' check (profile_visibility in ('public','campus_only','private')),
  interests text[] not null default '{}',
  skills jsonb not null default '[]'::jsonb,   -- [{name, proficiency, verified}]
  github_url text, linkedin_url text, leetcode_url text, hackerrank_url text,
  completed_projects_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when someone signs up (reads signup metadata).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, college, branch, academic_year,
                               github_url, linkedin_url, leetcode_url, hackerrank_url, avatar_url)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'college',''),
    coalesce(new.raw_user_meta_data->>'branch',''),
    coalesce(new.raw_user_meta_data->>'academic_year',''),
    nullif(new.raw_user_meta_data->>'github_url',''),
    nullif(new.raw_user_meta_data->>'linkedin_url',''),
    nullif(new.raw_user_meta_data->>'leetcode_url',''),
    nullif(new.raw_user_meta_data->>'hackerrank_url',''),
    'https://api.dicebear.com/7.x/initials/svg?seed=' ||
      replace(coalesce(new.raw_user_meta_data->>'full_name','user'),' ','%20') ||
      '&backgroundColor=26783c&textColor=ffffff'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ PROJECTS ============
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default '',
  technologies text[] not null default '{}',
  required_skills text[] not null default '{}',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'Planning'
    check (status in ('Active','Planning','In Progress','On Hold','Completed')),
  progress int not null default 10 check (progress between 0 and 100),
  max_members int not null default 4,
  repo_url text,
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'Team Member',
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- ============ COMMUNITY ============
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null default 'Discussion',
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.post_upvotes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_upvotes enable row level security;

-- profiles: signed-in users can see non-private profiles (and their own); edit only their own.
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
  using (profile_visibility <> 'private' or id = auth.uid());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- projects
drop policy if exists "projects read" on public.projects;
create policy "projects read" on public.projects for select to authenticated using (true);
drop policy if exists "projects insert own" on public.projects;
create policy "projects insert own" on public.projects for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "projects update owner" on public.projects;
create policy "projects update owner" on public.projects for update to authenticated using (owner_id = auth.uid());
drop policy if exists "projects delete owner" on public.projects;
create policy "projects delete owner" on public.projects for delete to authenticated using (owner_id = auth.uid());

-- project members: anyone signed in can read; you can add/remove yourself; owners can add the owner row.
drop policy if exists "members read" on public.project_members;
create policy "members read" on public.project_members for select to authenticated using (true);
drop policy if exists "members join self" on public.project_members;
create policy "members join self" on public.project_members for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "members leave self" on public.project_members;
create policy "members leave self" on public.project_members for delete to authenticated using (user_id = auth.uid());

-- community
drop policy if exists "posts read" on public.community_posts;
create policy "posts read" on public.community_posts for select to authenticated using (true);
drop policy if exists "posts insert own" on public.community_posts;
create policy "posts insert own" on public.community_posts for insert to authenticated with check (author_id = auth.uid());
drop policy if exists "posts delete own" on public.community_posts;
create policy "posts delete own" on public.community_posts for delete to authenticated using (author_id = auth.uid());

drop policy if exists "comments read" on public.post_comments;
create policy "comments read" on public.post_comments for select to authenticated using (true);
drop policy if exists "comments insert own" on public.post_comments;
create policy "comments insert own" on public.post_comments for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "upvotes read" on public.post_upvotes;
create policy "upvotes read" on public.post_upvotes for select to authenticated using (true);
drop policy if exists "upvotes add own" on public.post_upvotes;
create policy "upvotes add own" on public.post_upvotes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "upvotes remove own" on public.post_upvotes;
create policy "upvotes remove own" on public.post_upvotes for delete to authenticated using (user_id = auth.uid());

-- ============ STORAGE: profile pictures ============
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
  on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars upload own" on storage.objects;
create policy "avatars upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
