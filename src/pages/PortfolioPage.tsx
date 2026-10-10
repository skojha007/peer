import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Globe, Lock, Share2, Copy, Check, FolderKanban, ExternalLink, BadgeCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { listProjectsForUser, getMyProfile, setProfileVisibility } from '../lib/portfolio';
import type { PortfolioProject } from '../types/portfolio';
import { VerificationBadge, TechTags, Loading, ErrorBanner, EmptyState, SetupNotice, Card, PrimaryButton, SecondaryButton } from '../components/portfolio/ui';

export const PortfolioPage: React.FC = () => {
  const { configured, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'campus_only' | 'private'>('public');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [list, profile] = await Promise.all([listProjectsForUser(user.id), getMyProfile(user.id)]);
      setProjects(list);
      setVisibility(profile.profileVisibility);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your portfolio.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (configured) void load();
    else setLoading(false);
  }, [configured, load]);

  if (!configured) return <SetupNotice />;

  const shareUrl = user ? `${window.location.origin}/portfolio/${user.id}` : '';

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changeVisibility = async (next: 'public' | 'campus_only' | 'private') => {
    if (!user) return;
    setError(null);
    try {
      await setProfileVisibility(user.id, next);
      setVisibility(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update visibility.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
            <BadgeCheck className="w-3.5 h-3.5 text-[#26783C]" /> Proof-of-work portfolio
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">My Portfolio</h1>
          <p className="text-sm text-[#687769] mt-1 max-w-2xl">
            Projects you own or work on, with the evidence behind them. Each project shows whether it is self-reported,
            has evidence, or has been verified by a reviewer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => navigate('/skills')}>Skill Passport</SecondaryButton>
          <PrimaryButton onClick={() => navigate('/portfolio/projects/new')}>
            <Plus className="w-4 h-4" /> New project
          </PrimaryButton>
        </div>
      </div>

      <Card className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#173D2A]">Who can see your portfolio</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Portfolio visibility">
            {([
              ['public', 'Everyone', Globe],
              ['campus_only', 'Signed-in students', FolderKanban],
              ['private', 'Only me', Lock],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                role="radio"
                aria-checked={visibility === value}
                onClick={() => changeVisibility(value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border text-xs font-bold transition-colors ${
                  visibility === value ? 'bg-[#173D2A] text-white border-[#173D2A]' : 'bg-white text-[#173D2A] border-[#DCE6D2] hover:bg-[#EEF4E3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#687769]">Private projects stay hidden from everyone except their team, whatever this setting is.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#173D2A]">Share your portfolio</p>
          <div className="flex gap-2">
            <input readOnly value={shareUrl} className="flex-1 min-w-0 px-3 py-2 rounded-input bg-white border border-[#DCE6D2] text-xs text-[#1D3024]" aria-label="Shareable portfolio link" />
            <SecondaryButton onClick={copyShare}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </SecondaryButton>
          </div>
          <p className="text-[11px] text-[#687769]">Visitors see only what your visibility setting and project settings allow.</p>
        </div>
      </Card>

      <ErrorBanner message={error} onRetry={load} />

      {loading ? <Loading label="Loading your projects..." /> : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          body="Add a project you have built, even a small one. Link the repository and demo, and add evidence as you go."
          action={<PrimaryButton onClick={() => navigate('/portfolio/projects/new')}><Plus className="w-4 h-4" /> Add your first project</PrimaryButton>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <Link to={`/portfolio/projects/${p.id}`} className="text-base font-extrabold text-[#173D2A] hover:underline line-clamp-2">{p.title}</Link>
                {p.visibility === 'private' ? <Lock className="w-4 h-4 text-[#687769] shrink-0" aria-label="Private project" /> : <Globe className="w-4 h-4 text-[#687769] shrink-0" aria-label="Public project" />}
              </div>
              <VerificationBadge status={p.verificationStatus} />
              <p className="text-xs text-[#4B5A4D] line-clamp-3">{p.description || 'No description yet.'}</p>
              <TechTags items={p.technologies.slice(0, 6)} />
              <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-[#687769]">
                <span>{p.status} · {p.progress}%</span>
                <div className="flex gap-3">
                  {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#173D2A]">Repo <ExternalLink className="w-3 h-3" /></a>}
                  {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#173D2A]">Demo <ExternalLink className="w-3 h-3" /></a>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="text-[11px] text-[#687769] flex items-center gap-1"><Share2 className="w-3 h-3" /> Share the link above to show this portfolio.</p>
    </div>
  );
};
