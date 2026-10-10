# PeerCraft: Proof-of-Work Portfolio, Developer DNA, and Skill Passport

This report covers what was built, how to set it up, what was tested, and what is still open.

## Summary

| Phase | Status | Notes |
|---|---|---|
| 1. Repository audit | Done | Stack and gaps documented in the chat plan. |
| 2. Backend and auth | Done | Supabase Auth, client, migration 0002, RLS tests. |
| 3. Portfolio and Skill Passport | Done | Projects, milestones, evidence, passport, reviewer queue. |
| 4. Integration with Team Finder | Done | Real match scores, real invitations, invitation inbox. |
| 5. Security and AI insights | Done, AI untested live | Edge Function written and parsed. Needs an Anthropic key to run. |
| 6. Final report | This file | |

Some older screens still use mock data. See "Not done" at the end. These are not part of the new features, but they are not fully migrated to the database yet.

## What was built

**Proof-of-work portfolio** (`/portfolio`, `/portfolio/projects/*`)
- Create, edit, and delete projects. A project has a title, description, problem, solution, category, technologies, status, progress, and GitHub, demo, and video links.
- Each project has a team list with each member's role, responsibilities, and contributions. Members can edit their own contribution.
- Milestones can be added, marked done, and deleted.
- Evidence can be a link or a private file (PDF, PNG, JPG, WEBP, TXT, MD, ZIP, or MP4, up to 10 MB).
- Visibility can be public or private per project. The portfolio itself can be shown to everyone, to signed-in students, or only to the owner.
- Shareable page at `/portfolio/:userId`.

**Verification** (five states, one shared model)
- Self-reported, Evidence added, Pending review, Verified, Needs review. A Rejected state exists for reviewer decisions.
- Students can request review. Only admins and moderators can record a decision, through `review_verification()`, which writes an audit row.
- Verification queue at `/verification-queue`, visible only to reviewers.
- The database blocks students from setting Verified, Needs review, or Rejected, and blocks them from erasing a reviewer's decision.

**Skill Passport and Developer DNA** (`/skills`)
- Skills with level, learning-goal flag, and links to projects that show them. Editing a skill resets its verification.
- Achievements and certifications, with an optional credential link.
- Developer DNA summary is computed from recorded data: project count, technologies used, teammate count, strengths (Advanced or Expert), and learning goals. It is not an AI score.
- Fake verified badges and hardcoded achievements were removed.

**Team Finder** (`/team-finder`)
- Candidates are students with a visible profile, ranked against one of your projects.
- Score formula: 80% of required skills covered by the candidate's Skill Passport, plus 20% if any of their interests matches the project's technologies or category. Learning goals do not count as skills. Each card explains its score.
- Verified skills are marked on the card but do not change the score.
- Invitations are real. The invitee accepts or declines from My Portfolio. Accepting checks team capacity and adds them to the team with the invited role.

**AI insights** (`/skills`, "AI suggestions" card)
- Supabase Edge Function `skill-insights`. It reads only the signed-in student's own records, sends them to the Anthropic API, and checks the reply's shape before returning it.
- The AI is instructed not to claim anything is verified. Output is labeled as suggestions.
- The API key stays on the server.

**Dashboard**
- The fake "96% / 92% / 88% Match" teammate list was removed. The section now links to Team Finder.

## Files

New:
- `src/lib/verification.ts`, `src/lib/portfolio.ts`, `src/lib/teamMatch.ts`, `src/lib/insights.ts`, `src/lib/supabase.ts`, `src/lib/auth.tsx`
- `src/types/portfolio.ts`
- `src/components/portfolio/ui.tsx`, `src/components/portfolio/InsightsCard.tsx`
- `src/pages/PortfolioPage.tsx`, `src/pages/PortfolioProjectFormPage.tsx`, `src/pages/PortfolioProjectDetailPage.tsx`, `src/pages/PublicPortfolioPage.tsx`, `src/pages/ReviewQueuePage.tsx`
- `supabase/migrations/0002_portfolio_and_passport.sql`, `supabase/migrations/0003_team_invitations.sql`
- `supabase/functions/skill-insights/index.ts`
- `supabase/tests/0002_rls_test.sql`, `supabase/tests/0003_invitations_test.sql`
- `src/test/verification.test.ts`, `src/test/teamMatch.test.ts`, `src/test/insights.test.ts`
- `.env.example`, `PHASE_REPORT.md`

Modified:
- `src/App.tsx` (auth provider, auth gate, new routes)
- `src/components/layout/Sidebar.tsx` (My Portfolio and Verification Queue links)
- `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx` (Supabase auth with demo fallback)
- `src/pages/SkillPassportPage.tsx` (replaced)
- `src/pages/TeamFinderPage.tsx` (replaced)
- `src/pages/DashboardPage.tsx` (fake match scores removed)
- `package.json`, `package-lock.json` (added `@supabase/supabase-js`, `vitest`, `test` script)
- `.gitignore` (allows `.env.example`)

## Database changes

Run in this order in the Supabase SQL Editor:
1. `schema (1).sql`
2. `supabase/migrations/0002_portfolio_and_passport.sql`
3. `supabase/migrations/0003_team_invitations.sql`

0002 adds project visibility and content fields, milestones, evidence, skill entries, skill-evidence links, achievements, a verification audit log, a private `project-evidence` bucket, and the guard triggers and functions. 0003 adds `project_invitations` and the functions `respond_to_invitation` and `cancel_invitation`.

To make someone a reviewer: `update public.profiles set role = 'admin' where email = '...';`

## Environment variables and secrets

Frontend (`.env.local`, never committed):
- `VITE_SUPABASE_URL`: your project URL
- `VITE_SUPABASE_ANON_KEY`: the anon public key. Never put the service-role key here.

Edge Function (set with `supabase secrets set`):
- `ANTHROPIC_API_KEY`: required for AI suggestions
- `ANTHROPIC_MODEL`: optional, defaults to `claude-sonnet-5-5`

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided to functions automatically.

Deploy the function with `supabase functions deploy skill-insights`.

## Test results

- `npm run build`: passes.
- `npm run lint`: 0 errors. 149 warnings, mostly the same react-hooks pattern used across the existing code, plus a few about exporting components from files that also export helpers.
- `npm test` (vitest): 20 of 20 pass. Covers verification states, URL and file validation, project form validation, team match scoring, and AI output shape checks.
- Database tests, run on Postgres 16 with minimal stand-ins for Supabase's `auth` and `storage` schemas:
  - `0002_rls_test.sql`: 20 of 20 pass. Covers ownership, private projects and profiles, verification guards, the audit log, and reviewer access.
  - `0003_invitations_test.sql`: 10 of 10 pass. Covers who can invite, accept, decline, cancel, and team capacity.
- The Edge Function was checked for syntax with the TypeScript parser. It was not run on Deno.

## Not tested

- The app was not run in a browser against a live Supabase project. Every page compiles and the data layer is typed, but clicking through the UI has not been verified.
- Supabase Storage policies were tested only against stand-ins, not a real Supabase project.
- The AI function was not called, because no Anthropic key was available.

## Not done

- **Mock-driven screens.** Dashboard (other sections), Profile, Project Workspace, Resource Exchange, Campus Credits, Coding Arena, Community, Micro-Gigs, Events, Notifications, and Admin still read from `AppContext` and mock data. They are not connected to the database. Migrating them is a separate project.
- **Mock "verified" flags.** Mock profile skills still carry `verified: true` and show on those screens. They are not real verifications.
- **GitHub integration.** The code does not call GitHub. Adding it needs a GitHub OAuth app (client ID and secret) and a callback URL.
- **LinkedIn.** LinkedIn does not offer a public API for reading profiles to third parties. It can only be a user-entered link.
- **LeetCode and HackerRank.** Neither offers an official public API for this use. They are user-entered links only. Scraping was not done.
- **Team Finder for users with no skills.** Candidates with no Skill Passport entries get a score of 0 and are ranked last.
- **Rate limiting on AI suggestions.** The function has no per-user limit yet. Add one before public launch.
- **Private file access.** Only the uploader and reviewers can open a private file. Other team members cannot.
- **Notifications on invitations.** Invitations appear in the invitee's portfolio page. No email or notification is sent.
- **Bundle size.** The main JavaScript bundle is about 950 kB. Splitting it is a future optimisation.

## Run locally

```
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
npm test
npm run build
```

## Git

Work is on branch `phase-4-6-complete`, built on `phase-3-portfolio-passport`, which is built on `phase-2-backend-auth`. Nothing has been pushed from this environment. To push:

```
git push -u origin phase-2-backend-auth phase-3-portfolio-passport phase-4-6-complete
```
