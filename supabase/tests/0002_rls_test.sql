-- Security tests for migration 0002. Runs inside a transaction that is rolled back.
-- Usage (after schema (1).sql, 0002, and Supabase stubs or a real Supabase DB):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/0002_rls_test.sql
-- Each check prints PASS or aborts with FAIL.
BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.as_user(uid uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', uid::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END $$;

CREATE OR REPLACE FUNCTION pg_temp.as_admin_db() RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE 'RESET ROLE';
END $$;

CREATE OR REPLACE FUNCTION pg_temp.expect_error(q text, label text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE failed boolean := false;
BEGIN
  BEGIN
    EXECUTE q;
  EXCEPTION WHEN others THEN
    failed := true;
  END;
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

-- ---- fixtures (run as table owner, bypassing RLS) ----
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-00000000000a', 'alice@campus.edu', '{"full_name":"Alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@campus.edu',   '{"full_name":"Bob"}'),
  ('00000000-0000-0000-0000-0000000000ff', 'rev@campus.edu',   '{"full_name":"Reviewer"}');
UPDATE public.profiles SET role = 'admin' WHERE id = '00000000-0000-0000-0000-0000000000ff';

INSERT INTO public.projects (id, title, owner_id, visibility) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Public project', '00000000-0000-0000-0000-00000000000a', 'public'),
  ('10000000-0000-0000-0000-000000000002', 'Private project', '00000000-0000-0000-0000-00000000000a', 'private');

-- ---- Alice (owner) ----
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
SELECT pg_temp.expect_rows('SELECT id FROM public.projects', 2, 'owner sees both own projects');
SELECT pg_temp.expect_error($q$UPDATE public.projects SET verification_status = 'verified' WHERE id = '10000000-0000-0000-0000-000000000001'$q$,
  'owner cannot set verified directly');
SELECT pg_temp.expect_error($q$SELECT public.review_verification('project', '10000000-0000-0000-0000-000000000001', 'verified', 'self')$q$,
  'owner cannot call review_verification');
SELECT pg_temp.expect_error($q$INSERT INTO public.projects (title, owner_id, verification_status) VALUES ('x', '00000000-0000-0000-0000-00000000000a', 'verified')$q$,
  'owner cannot insert a project already verified');
SELECT pg_temp.expect_error($q$INSERT INTO public.project_evidence (project_id, uploaded_by, kind, title, url, verification_status)
  VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'link', 'repo', 'https://github.com/x/y', 'verified')$q$,
  'owner cannot insert verified evidence');
INSERT INTO public.project_evidence (project_id, uploaded_by, kind, title, url)
  VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'link', 'repo', 'https://github.com/x/y');
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.projects WHERE id='10000000-0000-0000-0000-000000000001' AND verification_status='evidence_added'$q$, 1,
  'adding evidence moves project to evidence_added');
SELECT pg_temp.expect_error($q$INSERT INTO public.skill_entries (user_id, name, verification_status) VALUES ('00000000-0000-0000-0000-00000000000a', 'Go', 'verified')$q$,
  'owner cannot insert a verified skill');
INSERT INTO public.skill_entries (user_id, name) VALUES ('00000000-0000-0000-0000-00000000000a', 'SQL');
-- Owner tries to self-verify a legacy skill; the trigger must sanitise it, not accept it.
UPDATE public.profiles SET skills = '[{"name":"SQL","verified":true}]'::jsonb WHERE id = '00000000-0000-0000-0000-00000000000a';
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.profiles WHERE id='00000000-0000-0000-0000-00000000000a' AND skills->0->>'verified' = 'false'$q$, 1,
  'legacy profile skills verified flag is forced to false');
SELECT public.request_review('project', '10000000-0000-0000-0000-000000000001');
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.projects WHERE id='10000000-0000-0000-0000-000000000001' AND verification_status='pending_review'$q$, 1,
  'owner can request review (pending_review)');

-- ---- Bob (other student) ----
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
SELECT pg_temp.expect_rows('SELECT id FROM public.projects', 1, 'other student sees only public project');
SELECT pg_temp.expect_rows('SELECT id FROM public.project_evidence', 1, 'other student sees evidence of public project');
SELECT pg_temp.expect_error($q$INSERT INTO public.project_evidence (project_id, uploaded_by, kind, title, url)
  VALUES ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'link', 'fake', 'https://x.y')$q$,
  'non-member cannot attach evidence to someone else project');
SELECT pg_temp.expect_error($q$INSERT INTO public.skill_entries (user_id, name) VALUES ('00000000-0000-0000-0000-00000000000a', 'Forged')$q$,
  'cannot create a skill for another user');
SELECT pg_temp.expect_error($q$SELECT public.review_verification('project', '10000000-0000-0000-0000-000000000001', 'verified', 'self')$q$,
  'non-reviewer cannot verify');

-- ---- Alice makes her profile private; Bob loses access to her skills ----
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
UPDATE public.profiles SET profile_visibility = 'private' WHERE id = '00000000-0000-0000-0000-00000000000a';
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.skill_entries WHERE user_id='00000000-0000-0000-0000-00000000000a'$q$, 0,
  'private profile skills hidden from others');

-- ---- Reviewer approves; audit row written ----
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000000ff');
SELECT public.review_verification('project', '10000000-0000-0000-0000-000000000001', 'verified', 'Checked repo and demo');
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.projects WHERE id='10000000-0000-0000-0000-000000000001' AND verification_status='verified'$q$, 1,
  'reviewer can set verified');
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.verification_reviews WHERE target_id='10000000-0000-0000-0000-000000000001' AND decision='verified'$q$, 1,
  'verification decision is written to the audit log');
SELECT pg_temp.expect_error($q$SELECT public.review_verification('project', '10000000-0000-0000-0000-000000000001', 'bogus')$q$,
  'invalid decision is rejected');

-- Reviewers can see skills of private profiles (needed for the review queue).
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000000ff');
SELECT pg_temp.expect_rows($q$SELECT 1 FROM public.skill_entries WHERE user_id='00000000-0000-0000-0000-00000000000a'$q$, 1,
  'reviewer can read skills of a private profile');

-- Owner edits must not reset verification status silently.
SELECT pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
SELECT pg_temp.expect_error($q$UPDATE public.projects SET verification_status = 'self_reported' WHERE id = '10000000-0000-0000-0000-000000000001'$q$,
  'owner cannot downgrade verified to self_reported');

SELECT pg_temp.as_admin_db();
DO $$ BEGIN RAISE NOTICE 'ALL 0002 RLS CHECKS PASSED'; END $$;
ROLLBACK;
