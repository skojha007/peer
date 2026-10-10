import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Link2, X, Send, Share2, Copy, Check, Award, Target, Layers, Users } from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  listSkills, upsertSkill, deleteSkill, linkSkillToEvidence, unlinkSkillEvidence,
  listAchievements, addAchievement, deleteAchievement, listProjectsForUser, requestReview,
} from '../lib/portfolio';
import { PROFICIENCIES, canRequestReview, type Proficiency } from '../lib/verification';
import type { SkillEntry, Achievement, PortfolioProject } from '../types/portfolio';
import { InsightsCard } from '../components/portfolio/InsightsCard';
import {
  VerificationBadge, Loading, ErrorBanner, SuccessBanner, EmptyState, SetupNotice,
  Card, PrimaryButton, SecondaryButton, DangerButton, Field, inputClass,
} from '../components/portfolio/ui';

export const SkillPassportPage: React.FC = () => {
  const { configured, user } = useAuth();
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [s, a, p] = await Promise.all([listSkills(user.id), listAchievements(user.id), listProjectsForUser(user.id)]);
      setSkills(s); setAchievements(a); setProjects(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your passport.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (configured) void load(); else setLoading(false); }, [configured, load]);

  // Summary is computed only from recorded data. It is not an AI score.
  const dna = useMemo(() => {
    const teammates = new Set<string>();
    const technologies = new Set<string>();
    for (const p of projects) {
      p.technologies.forEach((t) => technologies.add(t));
      p.members.forEach((m) => { if (m.userId !== user?.id) teammates.add(m.userId); });
    }
    return {
      projectCount: projects.length,
      technologies: [...technologies].sort(),
      teammateCount: teammates.size,
      strengths: skills.filter((s) => (s.proficiency === 'Advanced' || s.proficiency === 'Expert') && !s.isLearningGoal).map((s) => s.name),
      goals: skills.filter((s) => s.isLearningGoal).map((s) => s.name),
      verifiedSkills: skills.filter((s) => s.verificationStatus === 'verified').length,
    };
  }, [projects, skills, user]);

  if (!configured) return <SetupNotice />;

  const shareUrl = user ? `${window.location.origin}/portfolio/${user.id}` : '';
  const copyShare = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const run = async (fn: () => Promise<void>, ok?: string) => {
    setError(null); setSuccess(null);
    try { await fn(); if (ok) setSuccess(ok); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">Skill Passport</h1>
          <p className="text-sm text-[#687769] mt-1 max-w-2xl">
            Skills you list, what they are based on, and where a reviewer has confirmed them. Nothing is verified
            until a reviewer approves it.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <SecondaryButton onClick={copyShare}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy public link'}</SecondaryButton>
          <Link to={`/portfolio/${user?.id ?? ''}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#173D2A] underline"><Share2 className="w-3.5 h-3.5" /> Preview</Link>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={load} />
      <SuccessBanner message={success} />

      {loading ? <Loading label="Loading passport..." /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Layers} label="Projects" value={dna.projectCount} />
            <Stat icon={Award} label="Verified skills" value={dna.verifiedSkills} />
            <Stat icon={Users} label="Teammates" value={dna.teammateCount} />
            <Stat icon={Target} label="Learning goals" value={dna.goals.length} />
          </div>

          <Card className="space-y-3">
            <h2 className="text-sm font-extrabold text-[#173D2A]">Developer DNA</h2>
            <p className="text-[11px] text-[#687769]">Built from your projects and skills. These are facts from your records, not a score.</p>
            <DnaRow label="Technologies used in projects" items={dna.technologies} empty="Add projects to see the technologies you use." />
            <DnaRow label="Strengths (Advanced or Expert)" items={dna.strengths} empty="Set a skill to Advanced or Expert to list it here." />
            <DnaRow label="Learning next" items={dna.goals} empty="Mark skills as learning goals to track them." />
          </Card>

          <InsightsCard />

          <SkillsSection
            userId={user!.id}
            skills={skills}
            projects={projects}
            onChange={(fn, ok) => run(fn, ok)}
            onError={setError}
          />

          <AchievementsSection
            userId={user!.id}
            achievements={achievements}
            onChange={(fn, ok) => run(fn, ok)}
            onError={setError}
          />

          {skills.length === 0 && achievements.length === 0 && (
            <EmptyState title="Your passport is empty" body="Add the skills you use. Then link each one to a project that shows it." />
          )}
        </>
      )}
    </div>
  );
};

const Stat: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; value: number }> = ({ icon: Icon, label, value }) => (
  <Card className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-btn bg-[#EAF1DC] flex items-center justify-center"><Icon className="w-5 h-5 text-[#26783C]" /></div>
    <div>
      <p className="text-2xl font-extrabold text-[#173D2A]">{value}</p>
      <p className="text-[11px] font-bold text-[#687769] uppercase tracking-wide">{label}</p>
    </div>
  </Card>
);

const DnaRow: React.FC<{ label: string; items: string[]; empty: string }> = ({ label, items, empty }) => (
  <div>
    <p className="text-xs font-bold text-[#173D2A]">{label}</p>
    {items.length === 0 ? <p className="text-xs text-[#687769]">{empty}</p> : (
      <div className="flex flex-wrap gap-1.5 mt-1">
        {items.map((i) => <span key={i} className="px-2 py-0.5 rounded-md bg-[#EAF1DC] text-[#173D2A] text-[11px] font-semibold">{i}</span>)}
      </div>
    )}
  </div>
);

const SkillsSection: React.FC<{
  userId: string;
  skills: SkillEntry[];
  projects: PortfolioProject[];
  onChange: (fn: () => Promise<void>, ok?: string) => Promise<void>;
  onError: (m: string) => void;
}> = ({ userId, skills, projects, onChange, onError }) => {
  const [editing, setEditing] = useState<SkillEntry | 'new' | null>(null);
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState<Proficiency>('Beginner');
  const [goal, setGoal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkingFor, setLinkingFor] = useState<string | null>(null);
  const [linkProject, setLinkProject] = useState('');
  const [linkNote, setLinkNote] = useState('');

  const openForm = (s: SkillEntry | 'new') => {
    setEditing(s);
    setName(s === 'new' ? '' : s.name);
    setProficiency(s === 'new' ? 'Beginner' : s.proficiency);
    setGoal(s === 'new' ? false : s.isLearningGoal);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await upsertSkill(userId, name, proficiency, goal, editing && editing !== 'new' ? editing.id : undefined);
      setEditing(null);
      await onChange(async () => {}, 'Skill saved.');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not save the skill.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-[#173D2A]">Skills</h2>
        <PrimaryButton onClick={() => openForm('new')}><Plus className="w-3.5 h-3.5" /> Add skill</PrimaryButton>
      </div>

      {editing && (
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-4 items-end p-4 rounded-btn bg-white border border-[#DCE6D2]">
          <Field label="Skill"><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required /></Field>
          <Field label="Level">
            <select className={inputClass} value={proficiency} onChange={(e) => setProficiency(e.target.value as Proficiency)}>
              {PROFICIENCIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-xs font-bold text-[#173D2A] pb-2"><input type="checkbox" checked={goal} onChange={(e) => setGoal(e.target.checked)} /> Learning goal</label>
          <div className="flex gap-2">
            <PrimaryButton type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save'}</PrimaryButton>
            <SecondaryButton type="button" onClick={() => setEditing(null)}>Cancel</SecondaryButton>
          </div>
          {editing !== 'new' && <p className="sm:col-span-4 text-[11px] text-[#9B2C2C]">Changing a skill resets its verification, so a reviewer must check it again.</p>}
        </form>
      )}

      {skills.length === 0 ? <p className="text-xs text-[#687769]">No skills yet. Add one, then link it to a project that shows it.</p> : (
        <ul className="space-y-3">
          {skills.map((s) => (
            <li key={s.id} className="p-4 rounded-btn border border-[#DCE6D2] bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-[#173D2A]">{s.name}</p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F1F3EE] text-[#4B5A4D]">{s.proficiency}</span>
                  {s.isLearningGoal && <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FFF6DD] text-[#6B4E00]">Learning goal</span>}
                </div>
                <div className="flex items-center gap-2">
                  <VerificationBadge status={s.verificationStatus} />
                  <button aria-label={`Edit ${s.name}`} onClick={() => openForm(s)} className="text-[#173D2A]"><Pencil className="w-3.5 h-3.5" /></button>
                  <button aria-label={`Delete ${s.name}`} onClick={() => { if (window.confirm(`Delete the skill "${s.name}"?`)) void onChange(() => deleteSkill(s.id, userId), 'Skill deleted.'); }} className="text-[#9B2C2C]"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#687769] uppercase tracking-wide">Evidence</p>
                {s.evidence.length === 0 ? <p className="text-xs text-[#687769]">No project linked yet.</p> : (
                  <ul className="space-y-1">
                    {s.evidence.map((ev) => (
                      <li key={ev.id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-[#1D3024]">{ev.projectId ? <Link to={`/portfolio/projects/${ev.projectId}`} className="underline">{ev.projectTitle ?? 'Project'}</Link> : 'Evidence'}{ev.note ? ` · ${ev.note}` : ''}</span>
                        <button aria-label="Unlink evidence" onClick={() => void onChange(() => unlinkSkillEvidence(ev.id), 'Link removed.')} className="text-[#9B2C2C]"><X className="w-3 h-3" /></button>
                      </li>
                    ))}
                  </ul>
                )}
                {linkingFor === s.id ? (
                  <form className="grid gap-2 sm:grid-cols-4 items-end" onSubmit={async (e) => {
                    e.preventDefault();
                    if (!linkProject) { onError('Choose a project.'); return; }
                    try { await linkSkillToEvidence(s.id, linkProject, linkNote); setLinkingFor(null); setLinkNote(''); await onChange(async () => {}, 'Linked to project.'); }
                    catch (err) { onError(err instanceof Error ? err.message : 'Could not link.'); }
                  }}>
                    <select className={inputClass} value={linkProject} onChange={(e) => setLinkProject(e.target.value)}>
                      <option value="">Choose a project</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <input className={`${inputClass} sm:col-span-2`} placeholder="What you used it for (optional)" value={linkNote} maxLength={500} onChange={(e) => setLinkNote(e.target.value)} />
                    <div className="flex gap-2"><PrimaryButton type="submit">Link</PrimaryButton><SecondaryButton type="button" onClick={() => setLinkingFor(null)}>Cancel</SecondaryButton></div>
                  </form>
                ) : (
                  <button onClick={() => setLinkingFor(s.id)} disabled={projects.length === 0} className="text-xs font-bold text-[#173D2A] underline inline-flex items-center gap-1 disabled:opacity-40 disabled:no-underline">
                    <Link2 className="w-3 h-3" /> {projects.length === 0 ? 'Add a project first to link evidence' : 'Link to a project'}
                  </button>
                )}
              </div>

              {canRequestReview(s.verificationStatus) && s.evidence.length > 0 && (
                <SecondaryButton onClick={() => void onChange(() => requestReview('skill', s.id), 'Review requested.')}><Send className="w-3 h-3" /> Request review</SecondaryButton>
              )}
              {s.verificationStatus === 'self_reported' && s.evidence.length === 0 && (
                <p className="text-[11px] text-[#687769]">Link at least one project before requesting review.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const AchievementsSection: React.FC<{
  userId: string;
  achievements: Achievement[];
  onChange: (fn: () => Promise<void>, ok?: string) => Promise<void>;
  onError: (m: string) => void;
}> = ({ userId, achievements, onChange, onError }) => {
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuedOn, setIssuedOn] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addAchievement(userId, title, issuer, issuedOn, url);
      setTitle(''); setIssuer(''); setIssuedOn(''); setUrl('');
      await onChange(async () => {}, 'Achievement added. It shows as Self-reported until reviewed.');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not add achievement.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <h2 className="text-sm font-extrabold text-[#173D2A]">Achievements and certifications</h2>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-5 items-end">
        <Field label="Title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required /></Field>
        <Field label="Issued by"><input className={inputClass} value={issuer} onChange={(e) => setIssuer(e.target.value)} maxLength={120} /></Field>
        <Field label="Date"><input type="date" className={inputClass} value={issuedOn} onChange={(e) => setIssuedOn(e.target.value)} /></Field>
        <Field label="Credential link"><input className={inputClass} placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <PrimaryButton type="submit" disabled={busy}><Plus className="w-3.5 h-3.5" /> Add</PrimaryButton>
      </form>
      {achievements.length === 0 ? <p className="text-xs text-[#687769]">Nothing added yet.</p> : (
        <ul className="divide-y divide-[#DCE6D2]">
          {achievements.map((a) => (
            <li key={a.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#173D2A]">{a.title}</p>
                <p className="text-[11px] text-[#687769]">{[a.issuer, a.issuedOn].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <VerificationBadge status={a.verificationStatus} />
                {canRequestReview(a.verificationStatus) && (
                  <SecondaryButton onClick={() => void onChange(() => requestReview('achievement', a.id), 'Review requested.')}>Request review</SecondaryButton>
                )}
                <DangerButton aria-label={`Delete ${a.title}`} onClick={() => { if (window.confirm('Delete this achievement?')) void onChange(() => deleteAchievement(a.id, userId), 'Achievement deleted.'); }}><Trash2 className="w-3 h-3" /></DangerButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

