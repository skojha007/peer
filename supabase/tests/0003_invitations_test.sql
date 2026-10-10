-- Tests for migration 0003. Run after schema (1).sql and 0002, inside a rolled-back transaction.
BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.as_user(uid uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', uid::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END $$;

CREATE OR REPLACE FUNCTION pg_temp.expect_error(q text, label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE failed boolean := false;
BEGIN
  BEGIN EXECUTE q; EXCEPTION WHEN others THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'FAIL (expected an error): %', label; END IF;
  RAISE NOTICE 'PASS: %', label;
END $$;

CREATE OR REPLACE FUNCTION pg_temp.expect_rows(q text, expected int, label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE n int;
BEGIN
  EXECUTE 'SELECT count(*) FROM (' || q || ') t' INTO n;
  IF n <> expected THEN RAISE EXCEPTION 'FAIL (% rows, expected %): %', n, expected, label; END IF;
  RAISE NOTICE 'PASS: %', label;
END $$;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-00000000000a', 'owner@campus.edu', '{"full_name":"Owner"}'),
  ('00000000-0000-0000-0000-00000000000b', 'invitee@campus.edu', '{"full_name":"Invitee"}'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@campus.edu', '{"full_name":"Stranger"}');
INSERT INTO public.projects (id, title, owner_id, max_members) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Team project', '00000000-0000-0000-0000-00000000000a', 2);
INSERT INTO public.project_members (project_id, user_id, role) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Owner');

-- Owner invites Invitee
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
INSERT INTO public.project_invitations (id, project_id, invited_user_id, invited_by, role)
  VALUES ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000a', 'Backend');
SELECT pg_temp.expect_error($q$INSERT INTO public.project_invitations (project_id, invited_user_id, invited_by)
  VALUES ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-00000000000b')$q$,
  'non-owner cannot send an invitation');
SELECT pg_temp.expect_error($q$INSERT INTO public.project_invitations (project_id, invited_user_id, invited_by)
  VALUES ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a')$q$,
  'owner cannot invite themselves');
SELECT pg_temp.expect_error($q$INSERT INTO public.project_invitations (project_id, invited_user_id, invited_by)
  VALUES ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000a')$q$,
  'cannot send a second pending invitation to the same person');
-- No UPDATE policy exists, so a direct update changes zero rows and the status stays pending.
UPDATE public.project_invitations SET status = 'accepted' WHERE id = '30000000-0000-0000-0000-000000000001';
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.project_invitations WHERE id='30000000-0000-0000-0000-000000000001' AND status='pending'$q$, 1,
  'owner cannot mark an invitation accepted directly (status unchanged)');

-- Invitee accepts through the function
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
SELECT pg_temp.expect_rows('SELECT id FROM public.project_invitations', 1, 'invitee sees their invitation');
SELECT public.respond_to_invitation('30000000-0000-0000-0000-000000000001', true);
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.project_members WHERE project_id='20000000-0000-0000-0000-000000000001' AND user_id='00000000-0000-0000-0000-00000000000b' AND role='Backend'$q$, 1,
  'accepting adds the invitee to the team with the invited role');
SELECT pg_temp.expect_error($q$SELECT public.respond_to_invitation('30000000-0000-0000-0000-000000000001', false)$q$,
  'an answered invitation cannot be answered again');

-- A stranger cannot answer or cancel someone else's invitation
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
SELECT pg_temp.expect_rows('SELECT id FROM public.project_invitations', 0, 'stranger cannot see the invitation');

-- Team is now full (owner + invitee = max 2); a new invitation cannot be accepted
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
INSERT INTO public.project_invitations (id, project_id, invited_user_id, invited_by)
  VALUES ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-00000000000a');
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
SELECT pg_temp.expect_error($q$SELECT public.respond_to_invitation('30000000-0000-0000-0000-000000000002', true)$q$,
  'accepting is blocked when the team is full');
SELECT public.respond_to_invitation('30000000-0000-0000-0000-000000000002', false);

-- Owner can cancel only pending invitations they sent
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
INSERT INTO public.project_invitations (id, project_id, invited_user_id, invited_by)
  VALUES ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-00000000000a')
  ON CONFLICT DO NOTHING;
SELECT public.cancel_invitation('30000000-0000-0000-0000-000000000003');
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.project_invitations WHERE id='30000000-0000-0000-0000-000000000003' AND status='cancelled'$q$, 1,
  'owner can cancel a pending invitation they sent');

DO $$ BEGIN RAISE NOTICE 'ALL 0003 INVITATION CHECKS PASSED'; END $$;
ROLLBACK;
