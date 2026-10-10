# 🚀 DEPLOYMENT GUIDE - Phase 4.6 Complete

## Current Status
- **Repository**: `skojha007/peer`
- **Default Branch**: `main`
- **Phase 4.6 Branch**: `phase-4-6-complete` (Commit: c04ac87a134bef9f3f29a70dbddcbff40e68d983)
- **Latest Audit**: FILE_AUDIT_REPORT.md (Commit: 5b0dfa66)
- **Status**: ✅ READY FOR DEPLOYMENT

---

## PRE-DEPLOYMENT CHECKLIST

### ✅ Code Quality
- [x] All 100+ files present and validated
- [x] TypeScript compilation passing
- [x] ESLint (oxlint) rules compliant
- [x] No security vulnerabilities
- [x] Database migrations tested
- [x] RLS policies configured

### ✅ Features Implemented (Phase 4.6)
- [x] Proof-of-Work Portfolio (projects with milestones)
- [x] Developer DNA / Skill Passport
- [x] Verification System (6-state workflow)
- [x] Evidence Management (10 MB private storage)
- [x] Achievement Tracking
- [x] Team Invitations
- [x] Portfolio Sharing
- [x] Admin Review Queue

### ✅ Database
- [x] Migration 0002: Portfolio & Passport tables
- [x] Migration 0003: Team Invitations
- [x] Row-Level Security (RLS) enabled
- [x] Verification audit trail configured
- [x] Storage bucket with 10 MB limit

### ✅ Frontend
- [x] All 28 pages implemented
- [x] Routes configured in App.tsx
- [x] Components modularized
- [x] State management via Context
- [x] Responsive design (Tailwind)
- [x] Loading/error states handled

---

## DEPLOYMENT STEPS

### Step 1: Prepare Repository for Merge
```bash
# Switch to main branch
git checkout main
git pull origin main

# Verify current state
git log --oneline -5
# Should show: audit report commit first
```

### Step 2: Merge phase-4-6-complete → main
```bash
# Pull latest from phase-4-6-complete
git fetch origin phase-4-6-complete

# Create merge commit
git merge --no-ff origin/phase-4-6-complete -m "Merge phase-4-6-complete: Deploy Phase 4.6 features"

# Verify merge
git log --graph --oneline -10

# Push to main
git push origin main
```

### Step 3: Environment Setup

Create `.env.local` with:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Install Dependencies
```bash
npm ci  # Clean install (better than npm install)
```

### Step 5: Run Database Migrations
```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase dashboard:
# 1. Go to SQL Editor
# 2. Run supabase/migrations/0002_portfolio_and_passport.sql
# 3. Run supabase/migrations/0003_team_invitations.sql
```

### Step 6: Build & Test
```bash
# Type check
npm run build

# Run linter
npm run lint

# Run tests (if available)
npm run test
```

### Step 7: Deploy to Production

#### Option A: Vercel (Recommended for React)
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

#### Option B: Netlify
```bash
# Deploy to Netlify
netlify deploy --prod

# Set env vars in Netlify dashboard
```

#### Option C: Self-Hosted (Docker)
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Option D: GitHub Pages
```bash
# Update vite.config.ts with base path
# Deploy: npm run build
# Push /dist to gh-pages branch
```

---

## POST-DEPLOYMENT VERIFICATION

### Health Checks
```bash
# 1. Check if app loads
curl https://your-deployed-url/

# 2. Check critical endpoints
curl https://your-deployed-url/api/health

# 3. Verify Supabase connection
# Login → Check user context loads
# Navigate → Dashboard renders
```

### Feature Validation
- [ ] User login/signup works
- [ ] Dashboard loads without errors
- [ ] Portfolio creation works
- [ ] Skill Passport page accessible
- [ ] Can add/edit projects
- [ ] Can add/link skills
- [ ] Verification queue shows (for admins)
- [ ] Team finder functional
- [ ] Public portfolio shareable

### Performance Checks
```bash
# Lighthouse audit
npm run build
# Run in Chrome DevTools

# Expected scores:
# Performance: >90
# Accessibility: >90
# Best Practices: >90
# SEO: >90
```

### Database Checks
```sql
-- In Supabase SQL Editor
SELECT tablename FROM pg_tables WHERE schemaname='public';
-- Should show: projects, project_members, project_milestones, 
-- project_evidence, skill_entries, skill_evidence, achievements, etc.

-- Check RLS policies enabled
SELECT * FROM pg_policies;
```

---

## MONITORING & LOGGING

### Set Up Error Tracking (Sentry)
```typescript
// In src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Set Up Analytics (Optional)
```typescript
// Google Analytics or Mixpanel
// Track: page views, feature usage, errors
```

### Monitor Logs
```bash
# Supabase dashboard → Logs
# Check: Auth events, Database errors, RLS violations
```

---

## ROLLBACK PLAN

If deployment fails:

### Quick Rollback
```bash
# Reset main to previous commit
git reset --hard 5b0dfa66  # Audit report commit

# Or go back before merge
git reset --hard <previous-safe-commit>

# Force push (careful!)
git push origin main --force
```

### Database Rollback
```sql
-- Disable RLS policies temporarily
ALTER POLICY ... ON projects DISABLE;

-- Or drop new tables
DROP TABLE IF EXISTS skill_entries CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS project_evidence CASCADE;
```

---

## BRANCH STRATEGY GOING FORWARD

```
main (production)
  ├── ✅ phase-4-6-complete → MERGED
  ├── phase-5-advanced-features (next)
  ├── hotfix-bug-xyz (urgent fixes)
  └── release/v1.0.0 (release tags)
```

### Release Notes (v1.0.0-phase-4.6)
```markdown
## Phase 4.6 Release

### New Features
- ✨ Proof-of-Work Portfolio with milestones
- ✨ Developer DNA / Skill Passport system
- ✨ Verification workflow (6-state pipeline)
- ✨ Private evidence storage (up to 10 MB)
- ✨ Achievement & certification tracking
- ✨ Team member invitations
- ✨ Public portfolio sharing

### Database
- Added 8 new tables with RLS security
- Added verification audit trail
- Added team invitations system

### Security
- Row-level security on all sensitive data
- Private storage bucket for evidence
- Role-based reviewer access
- Input validation on all forms

### Performance
- Optimized database queries
- Component code-splitting
- Lazy loading for routes

### Bug Fixes
- Fixed verification status transitions
- Fixed skill linking to projects
- Fixed storage path traversal vulnerability
```

---

## DEPLOYMENT TIMELINE

| Task | Time | Owner |
|------|------|-------|
| Code Review | 30 min | @skojha007 |
| Merge PR | 5 min | @skojha007 |
| Environment Setup | 10 min | DevOps |
| Database Migration | 5 min | DevOps |
| Build & Test | 15 min | CI/CD |
| Deploy to Staging | 10 min | DevOps |
| Smoke Tests | 15 min | QA |
| Deploy to Production | 5 min | DevOps |
| Monitor (1 hour) | 60 min | DevOps |

**Total Time**: ~2 hours

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue**: Supabase connection fails
```
Solution: Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
Verify Supabase project is active
Check network policies don't block requests
```

**Issue**: RLS policy denies access
```
Solution: Verify user role in database
Check RLS policy logic in migrations
Test with supabase.auth.user() in console
```

**Issue**: Build fails with TypeScript errors
```
Solution: Run tsc --noEmit to find issues
Check tsconfig.json is correct
Update types if dependencies changed
```

**Issue**: Portfolio page not loading
```
Solution: Check browser console for errors
Verify Supabase tables exist (SELECT * FROM projects)
Check RLS policies allow user access
Test with public visibility first
```

---

## CONTACTS & ESCALATION

| Issue Type | Contact | Response Time |
|------------|---------|---|
| Deployment | @skojha007 | 15 min |
| Database | Supabase Support | 1 hour |
| Security | Security Team | ASAP |
| Performance | DevOps | 30 min |

---

## SUCCESS CRITERIA

✅ All checks must pass before going live:

- [ ] Build passes without errors
- [ ] All page routes load successfully
- [ ] Authentication flows work
- [ ] Portfolio creation/editing works
- [ ] Skills can be added/linked/verified
- [ ] Admin dashboard accessible
- [ ] No console errors in production
- [ ] Response times < 2 seconds
- [ ] Mobile responsive design works
- [ ] Database migrations successful
- [ ] RLS policies enforced
- [ ] Error logging functional

---

## NEXT PHASE (Phase 5)

Once Phase 4.6 stabilizes:
- [ ] Advanced search with filters
- [ ] Achievement verification automation
- [ ] Mentor-student matching
- [ ] Portfolio insights ML
- [ ] Mobile app development
- [ ] Blockchain certifications

---

**Generated**: 2026-10-10  
**Status**: 🟢 READY FOR PRODUCTION DEPLOYMENT  
**Approved by**: CODE AUDIT SYSTEM
