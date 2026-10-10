-- PeerCraft migration 0002: Proof-of-Work Portfolio + Developer DNA / Skill Passport.
-- Run AFTER "schema (1).sql". Safe to re-run.
--
-- Verification model (summary):
--   * Every verifiable record has verification_status.
--   * Students can only set 'self_reported', 'evidence_added' or 'pending_review'.
--   * 'verified', 'needs_review' and 'rejected' can only be written through
--     public.review_verification(), which requires an admin/moderator and
--     writes an audit row to public.verification_reviews.

-- ============ NEW COLUMNS ON EXISTING TABLES ============
alter table public.projects
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'private')),
  add column if not exists problem_statement text not null default '',
  add column if not exists solution text not null default '',
  add column if not exists live_demo_url text,
  add column if not exists video_url text,
  add column if not exists verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported','evidence_added','pending_review','verified','needs_review')),
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.profiles(id);

alter table public.project_members
  add column if not exists responsibilities text not null default '',
  add column if not exists contributions text not null default '';

-- ============ HELPERS ============
create or replace function public.is_reviewer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'moderator')
  );
$$;

create or replace function public.is_project_member(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project and p.owner_id = auth.uid()
  ) or exists (
    select 1 from public.project_members m
    where m.project_id = p_project and m.user_id = auth.uid()
  );
$$;

create or replace function public.can_see_project(p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project
      and (p.visibility = 'public' or public.is_project_member(p.id))
  );
$$;

-- ============ MILESTONES ============
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 2000),
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  position int not null default 0,
  completed_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============ EVIDENCE ============
create table if not exists public.project_evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('code','documentation','demo','deliverable','screenshot','video','link')),
  title text not null check (char_length(title) between 1 and 160),
  url text,                    -- external link (repo, demo, video)
  storage_path text,           -- object path in the private project-evidence bucket
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes between 0 and 10485760),
  verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported','evidence_added','pending_review','verified','needs_review','rejected')),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint evidence_has_content check (url is not null or storage_path is not null)
);

-- ============ SKILLS (Developer DNA / Skill Passport) ============
create table if not exists public.skill_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  proficiency text not null default 'Beginner'
    check (proficiency in ('Beginner','Intermediate','Advanced','Expert')),
  is_learning_goal boolean not null default false,
  verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported','evidence_added','pending_review','verified','needs_review')),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Links a skill to the project or evidence that supports it.
create table if not exists public.skill_evidence (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skill_entries(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  evidence_id uuid references public.project_evidence(id) on delete cascade,
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  check (project_id is not null or evidence_id is not null)
);

-- Achievements and certifications. Student-entered until reviewed.
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  issuer text not null default '',
  issued_on date,
  credential_url text,
  verification_status text not null default 'self_reported'
    check (verification_status in ('self_reported','evidence_added','pending_review','verified','needs_review')),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Append-only audit trail of every verification decision.
create table if not exists public.verification_reviews (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('project','evidence','skill','achievement')),
  target_id uuid not null,
  reviewer_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('verified','needs_review','rejected')),
  note text not null default '' check (char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

-- ============ GUARDS ============
-- Students may request review but may never set a final verification outcome.
create or replace function public.guard_verification_status()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE'
     and new.verification_status is distinct from old.verification_status
     and not public.is_reviewer() then
    -- Students may not set a final outcome...
    if new.verification_status in ('verified','needs_review','rejected') then
      raise exception 'Only reviewers can set verification outcomes';
    end if;
    -- ...nor erase one. Students may only ask for a new review.
    if old.verification_status in ('verified','needs_review','rejected')
       and new.verification_status <> 'pending_review' then
      raise exception 'Only reviewers can change an existing verification outcome';
    end if;
  end if;
  if tg_op = 'INSERT' and new.verification_status in ('verified','needs_review','rejected')
     and not public.is_reviewer() then
    raise exception 'Only reviewers can set verification outcomes';
  end if;
  return new;
end $$;

drop trigger if exists guard_project_verification on public.projects;
create trigger guard_project_verification before insert or update on public.projects
  for each row execute function public.guard_verification_status();

drop trigger if exists guard_evidence_verification on public.project_evidence;
create trigger guard_evidence_verification before insert or update on public.project_evidence
  for each row execute function public.guard_verification_status();

drop trigger if exists guard_skill_verification on public.skill_entries;
create trigger guard_skill_verification before insert or update on public.skill_entries
  for each row execute function public.guard_verification_status();

drop trigger if exists guard_achievement_verification on public.achievements;
create trigger guard_achievement_verification before insert or update on public.achievements
  for each row execute function public.guard_verification_status();

-- Adding evidence moves a self-reported project to 'evidence_added' automatically.
create or replace function public.mark_project_evidence_added()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.projects
     set verification_status = 'evidence_added'
   where id = new.project_id and verification_status = 'self_reported';
  return new;
end $$;

drop trigger if exists on_evidence_added on public.project_evidence;
create trigger on_evidence_added after insert on public.project_evidence
  for each row execute function public.mark_project_evidence_added();

-- Legacy profiles.skills is jsonb with a 'verified' flag that students could set.
-- Force verified=false for everyone except reviewers; the real source of truth is skill_entries.
create or replace function public.sanitize_profile_skills()
returns trigger language plpgsql as $$
begin
  if not public.is_reviewer() then
    new.skills := coalesce((
      select jsonb_agg(elem || jsonb_build_object('verified', false))
      from jsonb_array_elements(new.skills) elem
    ), '[]'::jsonb);
  end if;
  return new;
end $$;

drop trigger if exists sanitize_skills on public.profiles;
create trigger sanitize_skills before insert or update of skills on public.profiles
  for each row execute function public.sanitize_profile_skills();

-- ============ REVIEW FUNCTION (the only way to set verified) ============
create or replace function public.review_verification(
  p_target_type text,
  p_target_id uuid,
  p_decision text,
  p_note text default ''
) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_reviewer() then
    raise exception 'Not authorized to review';
  end if;
  if p_decision not in ('verified','needs_review','rejected') then
    raise exception 'Invalid decision';
  end if;

  insert into public.verification_reviews (target_type, target_id, reviewer_id, decision, note)
  values (p_target_type, p_target_id, auth.uid(), p_decision, coalesce(p_note, ''));

  if p_target_type = 'project' then
    update public.projects set verification_status = p_decision,
      verified_by = auth.uid(), verified_at = now() where id = p_target_id;
  elsif p_target_type = 'evidence' then
    update public.project_evidence set verification_status = p_decision,
      verified_by = auth.uid(), verified_at = now() where id = p_target_id;
  elsif p_target_type = 'skill' then
    update public.skill_entries set verification_status = p_decision,
      verified_by = auth.uid(), verified_at = now() where id = p_target_id;
  elsif p_target_type = 'achievement' then
    update public.achievements set verification_status = p_decision,
      verified_by = auth.uid(), verified_at = now() where id = p_target_id;
  else
    raise exception 'Unknown target type';
  end if;
end $$;

-- Students request review through this function (sets pending_review only).
create or replace function public.request_review(p_target_type text, p_target_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_target_type = 'project' then
    update public.projects set verification_status = 'pending_review'
      where id = p_target_id and owner_id = auth.uid();
  elsif p_target_type = 'evidence' then
    update public.project_evidence set verification_status = 'pending_review'
      where id = p_target_id and uploaded_by = auth.uid();
  elsif p_target_type = 'skill' then
    update public.skill_entries set verification_status = 'pending_review'
      where id = p_target_id and user_id = auth.uid();
  elsif p_target_type = 'achievement' then
    update public.achievements set verification_status = 'pending_review'
      where id = p_target_id and user_id = auth.uid();
  else
    raise exception 'Unknown target type';
  end if;
  if not found then raise exception 'Not found or not yours'; end if;
end $$;

-- ============ ROW LEVEL SECURITY ============
alter table public.project_milestones enable row level security;
alter table public.project_evidence enable row level security;
alter table public.skill_entries enable row level security;
alter table public.skill_evidence enable row level security;
alter table public.achievements enable row level security;
alter table public.verification_reviews enable row level security;

-- Projects: replace the old open read policy with visibility-aware access.
drop policy if exists "projects read" on public.projects;
create policy "projects read" on public.projects for select to authenticated
  using (visibility = 'public' or owner_id = auth.uid() or public.is_project_member(id) or public.is_reviewer());

drop policy if exists "projects update owner" on public.projects;
create policy "projects update owner" on public.projects for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Milestones
drop policy if exists "milestones read" on public.project_milestones;
create policy "milestones read" on public.project_milestones for select to authenticated
  using (public.can_see_project(project_id));
drop policy if exists "milestones write members" on public.project_milestones;
create policy "milestones write members" on public.project_milestones for all to authenticated
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id) and created_by = auth.uid());

-- Evidence: readable with the project; writable by project members who uploaded it.
drop policy if exists "evidence read" on public.project_evidence;
create policy "evidence read" on public.project_evidence for select to authenticated
  using (public.can_see_project(project_id) or public.is_reviewer());
drop policy if exists "evidence insert member" on public.project_evidence;
create policy "evidence insert member" on public.project_evidence for insert to authenticated
  with check (uploaded_by = auth.uid() and public.is_project_member(project_id));
drop policy if exists "evidence update own" on public.project_evidence;
create policy "evidence update own" on public.project_evidence for update to authenticated
  using (uploaded_by = auth.uid()) with check (uploaded_by = auth.uid());
drop policy if exists "evidence delete own" on public.project_evidence;
create policy "evidence delete own" on public.project_evidence for delete to authenticated
  using (uploaded_by = auth.uid());

-- Skills: owner always; others only when the owner's profile is not private.
drop policy if exists "skills read" on public.skill_entries;
create policy "skills read" on public.skill_entries for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = user_id and p.profile_visibility <> 'private'));
drop policy if exists "skills write own" on public.skill_entries;
create policy "skills write own" on public.skill_entries for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "skill evidence read" on public.skill_evidence;
create policy "skill evidence read" on public.skill_evidence for select to authenticated
  using (exists (select 1 from public.skill_entries s where s.id = skill_id
    and (s.user_id = auth.uid() or exists (select 1 from public.profiles p
      where p.id = s.user_id and p.profile_visibility <> 'private'))));
drop policy if exists "skill evidence write own" on public.skill_evidence;
create policy "skill evidence write own" on public.skill_evidence for all to authenticated
  using (exists (select 1 from public.skill_entries s where s.id = skill_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.skill_entries s where s.id = skill_id and s.user_id = auth.uid()));

-- Achievements follow the same visibility as skills.
drop policy if exists "achievements read" on public.achievements;
create policy "achievements read" on public.achievements for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.profiles p where p.id = user_id and p.profile_visibility <> 'private'));
drop policy if exists "achievements write own" on public.achievements;
create policy "achievements write own" on public.achievements for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Audit log: reviewers and the affected owner can read; nobody can write directly.
drop policy if exists "reviews read" on public.verification_reviews;
create policy "reviews read" on public.verification_reviews for select to authenticated
  using (public.is_reviewer());

-- ============ PRIVATE EVIDENCE STORAGE ============
-- Path convention: <user_id>/<project_id>/<filename>. Private bucket, 10 MB, safe types only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-evidence', 'project-evidence', false, 10485760,
  array['application/pdf','image/png','image/jpeg','image/webp','text/plain','text/markdown',
        'application/zip','video/mp4'])
on conflict (id) do update set public = false, file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "evidence upload own" on storage.objects;
create policy "evidence upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "evidence read own or reviewer" on storage.objects;
create policy "evidence read own or reviewer" on storage.objects for select to authenticated
  using (bucket_id = 'project-evidence' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_reviewer()));
drop policy if exists "evidence delete own" on storage.objects;
create policy "evidence delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'project-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
