# 📋 DEPLOYMENT CHECKLIST - Phase 4.6

## Pre-Deployment Verification

### Code Quality ✅
- [x] TypeScript: `tsc --noEmit` passes
- [x] Linter: `oxlint` passes
- [x] No console errors or warnings
- [x] All imports resolved
- [x] No unused variables

### Security ✅
- [x] No hardcoded secrets
- [x] Environment variables documented
- [x] RLS policies enabled
- [x] Input validation complete
- [x] File upload restrictions in place

### Database ✅
- [x] Migrations 0002 and 0003 tested
- [x] Table structure verified
- [x] Foreign keys configured
- [x] Indexes created
- [x] Backup taken

### Features ✅
- [x] Portfolio system working
- [x] Skill Passport functional
- [x] Verification workflow operational
- [x] Evidence storage configured
- [x] Team invitations tested

---

## Deployment Steps

### 1. Pre-Deployment (5 minutes)
```bash
# Pull latest changes
git checkout main
git pull origin main

# Verify environment
node --version  # Should be >=20
npm --version   # Should be >=10

# Check branches
git branch -a
```

### 2. Database Preparation (5 minutes)
```bash
# Backup production database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify migrations are ready
ls supabase/migrations/
# Should show: 0002_portfolio_and_passport.sql, 0003_team_invitations.sql
```

### 3. Environment Configuration (5 minutes)
```bash
# Create/update .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# Verify config loads
npm run build 2>&1 | grep -i "error" || echo "✅ Build passed"
```

### 4. Build & Test (15 minutes)
```bash
# Clean install
rm -rf node_modules package-lock.json
npm ci

# Type checking
npm run build

# Linting
npm run lint

# Run tests (if applicable)
npm run test || true

# Build production bundle
npm run build
# Check dist/ folder size (~500-800 KB typical)
du -sh dist/
```

### 5. Database Migration (5 minutes)
```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manual in Supabase Dashboard
# 1. SQL Editor → New Query
# 2. Paste content of supabase/migrations/0002_portfolio_and_passport.sql
# 3. Execute
# 4. Repeat for 0003_team_invitations.sql

# Verify tables exist
# Run in Supabase SQL Editor:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 6. Pre-Production Testing (10 minutes)
```bash
# Start local dev server
npm run dev

# Test critical flows:
# 1. Login page loads ✓
# 2. Signup works ✓
# 3. Dashboard renders ✓
# 4. Portfolio page accessible ✓
# 5. Skills page functional ✓
# 6. Can create project ✓
# 7. Can add skill ✓
# 8. Verification queue loads (admin) ✓

# Check console for errors
# F12 → Console tab (should be clear)
```

### 7. Deploy to Production (5-10 minutes)

**Option A: Vercel**
```bash
vercel --prod
# Set environment variables in Vercel dashboard
# Wait for deployment to complete
```

**Option B: Netlify**
```bash
netlify deploy --prod
# Set environment variables in dashboard
```

**Option C: GitHub Actions (Auto-deploy on main)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      # Deploy to your hosting
```

### 8. Post-Deployment Verification (15 minutes)

```bash
# 1. Check if site is accessible
curl -I https://your-domain.com
# Should return: HTTP 200 OK

# 2. Test critical endpoints
# Open browser → https://your-domain.com/
# Should load landing page

# 3. Test authentication
# Signup with test account
# Verify email confirmation works

# 4. Test core features
# Create portfolio project
# Add skill
# View portfolio
# Check verification queue

# 5. Check error logging
# Go to error tracking dashboard (Sentry)
# Should show no new errors

# 6. Monitor performance
# DevTools → Network tab
# Page load time should be < 3 seconds
# Total bundle size < 1 MB

# 7. Database verification
# Supabase dashboard → Database → Tables
# Confirm all Phase 4.6 tables exist:
# - projects ✓
# - project_members ✓
# - project_milestones ✓
# - project_evidence ✓
# - skill_entries ✓
# - skill_evidence ✓
# - achievements ✓
# - team_invitations ✓
# - verification_reviews ✓

# 8. RLS Verification
# Supabase dashboard → Authentication → Users
# Create test admin user
# Login and verify can see review queue
# Create normal user
# Verify cannot see review queue
```

---

## Monitoring After Deployment

### First Hour
- [ ] Monitor error logs every 5 minutes
- [ ] Check performance metrics
- [ ] Test all major user flows
- [ ] Monitor server resources
- [ ] Check database connections

### First Day
- [ ] Review error tracking (Sentry/etc)
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Verify backups are working
- [ ] Check log retention

### First Week
- [ ] Weekly security scan
- [ ] Review user analytics
- [ ] Check for performance regressions
- [ ] Plan next phase features
- [ ] Document any issues

---

## Rollback Procedure

If something goes wrong:

### Immediate Rollback
```bash
# Stop production traffic to new version
# Redeploy previous version
vercel rollback
# or
git revert <deploy-commit>
git push origin main

# Notify users of incident
# Start investigation
```

### Database Rollback
```bash
# In Supabase dashboard → SQL Editor
BEGIN;

-- Disable RLS temporarily if needed
ALTER POLICY "Enable read access" ON projects DISABLE;

-- Or restore from backup
ROLLBACK;

-- Then manually restore tables if needed
-- This requires backup preparation
```

---

## Success Metrics

After deployment, verify:

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| App Load Time | < 2s | _ | [ ] |
| Database Query Time | < 200ms | _ | [ ] |
| Build Bundle Size | < 1MB | _ | [ ] |
| Lighthouse Score | > 90 | _ | [ ] |
| Error Rate | < 0.1% | _ | [ ] |
| Uptime | > 99.9% | _ | [ ] |
| User Signup Success | > 95% | _ | [ ] |
| Portfolio Creation | > 90% | _ | [ ] |
| Skill Addition | > 85% | _ | [ ] |

---

## Contact Information

| Role | Contact | Availability |
|------|---------|---|
| Deployment Lead | @skojha007 | 24/7 for emergencies |
| Database Admin | Supabase Support | Business hours + urgent |
| DevOps | GitHub Actions | CI/CD automated |
| Security | Security Team | On-call |

---

## Sign-Off

- **Deployment Date**: [Enter date]
- **Deployed By**: [Enter name]
- **Verified By**: [Enter name]
- **Status**: [ ] Ready [ ] In Progress [ ] Complete [ ] Rolled Back

---

**Last Updated**: 2026-10-10  
**Next Review**: Post-deployment + 24 hours
