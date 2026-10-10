-- PeerCraft migration 0003: real team invitations for Team Finder.
-- Run AFTER 0002. Safe to re-run.
-- Invitees accept or decline, and inviters cancel, only through the functions below.
-- Nobody updates invitation rows directly, so membership can't be granted by editing a row.

create table if not exists public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  invited_user_id uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'Team Member' check (char_length(role) between 1 and 60),
  message text not null default '' check (char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint invite_not_self check (invited_by <> invited_user_id)
);

-- Only one open invitation per person per project.
create unique index if not exists project_invitations_one_pending
  on public.project_invitations (project_id, invited_user_id) where status = 'pending';

alter table public.project_invitations enable row level security;

drop policy if exists "invites read" on public.project_invitations;
create policy "invites read" on public.project_invitations for select to authenticated
  using (invited_user_id = auth.uid() or invited_by = auth.uid());

-- Only the project owner can invite, and only people who are not already members.
drop policy if exists "invites create owner" on public.project_invitations;
create policy "invites create owner" on public.project_invitations for insert to authenticated
  with check (
    invited_by = auth.uid()
    and status = 'pending'
    and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
    and not exists (select 1 from public.project_members m
                    where m.project_id = project_invitations.project_id
                      and m.user_id = project_invitations.invited_user_id)
  );

-- No direct UPDATE or DELETE policies. See the functions below.

create or replace function public.respond_to_invitation(p_invitation uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  inv public.project_invitations%rowtype;
  member_count int;
  capacity int;
begin
  select * into inv from public.project_invitations where id = p_invitation for update;
  if not found or inv.invited_user_id <> auth.uid() then
    raise exception 'Invitation not found';
  end if;
  if inv.status <> 'pending' then
    raise exception 'This invitation is no longer pending';
  end if;

  if p_accept then
    select count(*) into member_count from public.project_members where project_id = inv.project_id;
    select max_members into capacity from public.projects where id = inv.project_id;
    if member_count >= capacity then
      raise exception 'This team is already full';
    end if;
    insert into public.project_members (project_id, user_id, role)
      values (inv.project_id, inv.invited_user_id, inv.role)
      on conflict (project_id, user_id) do nothing;
    update public.project_invitations set status = 'accepted', responded_at = now() where id = p_invitation;
  else
    update public.project_invitations set status = 'declined', responded_at = now() where id = p_invitation;
  end if;
end $$;

create or replace function public.cancel_invitation(p_invitation uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.project_invitations set status = 'cancelled', responded_at = now()
   where id = p_invitation and invited_by = auth.uid() and status = 'pending';
  if not found then
    raise exception 'Invitation not found or already answered';
  end if;
end $$;
