import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Globe, Users, BadgeCheck, Award, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getPublicProfile, listProjectsForUser, listSkills, listAchievements } from '../lib/portfolio';
import type { PortfolioProject, SkillEntry, Achievement } from '../types/portfolio';
import { VerificationBadge, TechTags, Loading, ErrorBanner, EmptyState, SetupNotice, Card } from '../components/portfolio/ui';

interface PublicState {
  name: string;
  college: string;
  branch: string;
  year: string;
  bio: string;
  avatarUrl: string;
  projects: PortfolioProject[];
  skills: SkillEntry[];
  achievements: Achievement[];
}

export const PublicPortfolioPage: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const { configured, user } = useAuth();
  const [data, setData] = useState<PublicState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !userId) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const profile = await getPublicProfile(userId);
        if (!profile) { if (active) setData(null); return; }
        const [projects, skills, achievements] = await Promise.all([
          listProjectsForUser(userId), listSkills(userId), listAchievements(userId),
        ]);
        if (active) setData({
          name: profile.full_name || 'Student',
          college: profile.college ?? '',
          branch: profile.branch ?? '',
          year: profile.academic_year ?? '',
          bio: profile.bio ?? '',
          avatarUrl: profile.avatar_url ?? '',
          projects: projects.filter((p) => p.visibility === 'public' || p.members.some((m) => m.userId === user?.id)),
          skills,
          achievements,
        });
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load this portfolio.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [configured, userId, user?.id]);

  if (!configured) return <SetupNotice />;
  if (loading) return <Loading label="Loading portfolio..." />;

  if (!data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <EmptyState title="Portfolio not available" body="This student has not shared their portfolio with you, or the link is wrong." />
      </div>
    );
  }

  const isOwnerView = user?.id === userId;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {isOwnerView && (
        <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#687769] hover:text-[#173D2A]"><ArrowLeft className="w-3.5 h-3.5" /> Back to My Portfolio</Link>
      )}
      <ErrorBanner message={error} />

      <header className="flex flex-col sm:flex-row gap-5 items-start">
        {data.avatarUrl && <img src={data.avatarUrl} alt="" className="w-20 h-20 rounded-2xl bg-[#EAF1DC]" />}
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">{data.name}</h1>
          <p className="text-xs text-[#687769]">{[data.branch, data.year, data.college].filter(Boolean).join(' · ')}</p>
          {data.bio && <p className="text-sm text-[#1D3024] max-w-2xl">{data.bio}</p>}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-[#173D2A] flex items-center gap-2"><Globe className="w-4 h-4" /> Projects</h2>
        {data.projects.length === 0 ? <EmptyState title="No projects shown" body="Projects appear here when they are public, or when the student adds you to their team." /> : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.projects.map((p) => (
              <Card key={p.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/portfolio/projects/${p.id}`} className="font-extrabold text-[#173D2A] hover:underline">{p.title}</Link>
                  {p.visibility === 'private' && <span className="text-[10px] font-bold text-[#687769]">Team only</span>}
                </div>
                <VerificationBadge status={p.verificationStatus} />
                <p className="text-xs text-[#4B5A4D] line-clamp-3">{p.description}</p>
                <TechTags items={p.technologies.slice(0, 6)} />
                {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold underline text-[#173D2A]">Repository <ExternalLink className="w-3 h-3" /></a>}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-[#173D2A] flex items-center gap-2"><BadgeCheck className="w-4 h-4" /> Skills</h2>
        {data.skills.length === 0 ? <p className="text-xs text-[#687769]">No skills listed.</p> : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.skills.map((s) => (
              <li key={s.id} className="p-4 rounded-card border border-[#DCE6D2] bg-[#FAFCF5] flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-[#173D2A]">{s.name}</p>
                  <span className="text-[11px] font-bold text-[#687769]">{s.isLearningGoal ? 'Learning' : s.proficiency}</span>
                </div>
                <VerificationBadge status={s.verificationStatus} />
                {s.evidence.some((e) => e.projectTitle) && (
                  <p className="text-[11px] text-[#687769]">Evidence: {s.evidence.map((e) => e.projectTitle).filter(Boolean).join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-extrabold text-[#173D2A] flex items-center gap-2"><Award className="w-4 h-4" /> Achievements</h2>
        {data.achievements.length === 0 ? <p className="text-xs text-[#687769]">No achievements listed.</p> : (
          <ul className="space-y-3">
            {data.achievements.map((a) => (
              <li key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-card border border-[#DCE6D2] bg-[#FAFCF5]">
                <div>
                  <p className="font-bold text-[#173D2A]">{a.title}</p>
                  <p className="text-[11px] text-[#687769]">{[a.issuer, a.issuedOn].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <VerificationBadge status={a.verificationStatus} />
                  {a.credentialUrl && <a href={a.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline text-[#173D2A]">Credential</a>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-[#687769] flex items-center gap-1"><Users className="w-3 h-3" /> Badges show what a reviewer has checked. Self-reported items are the student's own claims.</p>
    </div>
  );
};
