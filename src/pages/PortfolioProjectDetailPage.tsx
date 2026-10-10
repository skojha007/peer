import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Pencil, Trash2, Lock, Send, Plus, FileText, Link2, Upload, Check, Circle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  getProject, listMilestones, addMilestone, setMilestoneStatus, deleteMilestone,
  listEvidence, addLinkEvidence, addFileEvidence, deleteEvidence, getEvidenceFileUrl,
  requestReview, deleteProject, updateMyContribution,
} from '../lib/portfolio';
import { canRequestReview, EVIDENCE_KINDS, VERIFICATION_LABELS, type EvidenceKind } from '../lib/verification';
import type { PortfolioProject, ProjectMilestone, ProjectEvidence } from '../types/portfolio';
import {
  VerificationBadge, TechTags, Loading, ErrorBanner, SuccessBanner, SetupNotice,
  Card, PrimaryButton, SecondaryButton, DangerButton, Field, inputClass,
} from '../components/portfolio/ui';

export const PortfolioProjectDetailPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const { configured, user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [evidence, setEvidence] = useState<ProjectEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isOwner = !!user && project?.ownerId === user.id;
  const isMember = !!user && !!project?.members.some((m) => m.userId === user.id);
  const me = project?.members.find((m) => m.userId === user?.id);

  const load = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError(null);
    try {
      const p = await getProject(projectId);
      setProject(p);
      if (p) {
        const [ms, ev] = await Promise.all([listMilestones(projectId), listEvidence(projectId)]);
        setMilestones(ms);
        setEvidence(ev);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this project.');
    } finally {
      setLoading(false);
    }
  }, [configured, projectId]);

  useEffect(() => { void load(); }, [load]);

  const run = async (fn: () => Promise<void>, ok?: string) => {
    setError(null);
    setSuccess(null);
    try {
      await fn();
      if (ok) setSuccess(ok);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    }
  };

  if (!configured) return <SetupNotice />;
  if (loading) return <Loading label="Loading project..." />;
  if (!project) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <ErrorBanner message={error ?? 'This project does not exist or is private to its team.'} />
        <Link to="/portfolio" className="text-xs font-bold text-[#173D2A] underline mt-4 inline-block">Back to portfolio</Link>
      </div>
    );
  }

  const canEditTeam = isOwner || isMember;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#687769] hover:text-[#173D2A]">
        <ArrowLeft className="w-3.5 h-3.5" /> My Portfolio
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#687769]">
            <span className="px-2 py-0.5 rounded-md bg-[#EAF1DC] text-[#173D2A]">{project.category}</span>
            <span>{project.status}</span>
            {project.visibility === 'private' && <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight break-words">{project.title}</h1>
          <VerificationBadge status={project.verificationStatus} showDescription />
        </div>
        {isOwner && (
          <div className="flex gap-2 shrink-0">
            <SecondaryButton onClick={() => navigate(`/portfolio/projects/${project.id}/edit`)}><Pencil className="w-3.5 h-3.5" /> Edit</SecondaryButton>
            <DangerButton onClick={() => {
              if (!window.confirm('Delete this project and all its milestones and evidence? This cannot be undone.')) return;
              void run(async () => { await deleteProject(project.id, user!.id); navigate('/portfolio'); });
            }}><Trash2 className="w-3.5 h-3.5" /> Delete</DangerButton>
          </div>
        )}
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <p className="text-sm text-[#1D3024] whitespace-pre-line leading-relaxed">{project.description || 'No description yet.'}</p>
            {project.problemStatement && <Section title="Problem" body={project.problemStatement} />}
            {project.solution && <Section title="Solution" body={project.solution} />}
            <TechTags items={project.technologies} />
            <div className="flex flex-wrap gap-4 text-xs font-bold text-[#173D2A] pt-1">
              {project.repoUrl && <a className="inline-flex items-center gap-1 underline" href={project.repoUrl} target="_blank" rel="noopener noreferrer">GitHub repository <ExternalLink className="w-3 h-3" /></a>}
              {project.liveDemoUrl && <a className="inline-flex items-center gap-1 underline" href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">Live demo <ExternalLink className="w-3 h-3" /></a>}
              {project.videoUrl && <a className="inline-flex items-center gap-1 underline" href={project.videoUrl} target="_blank" rel="noopener noreferrer">Video <ExternalLink className="w-3 h-3" /></a>}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#173D2A]">Evidence</h2>
              <span className="text-[11px] text-[#687769]">{evidence.length} item{evidence.length === 1 ? '' : 's'}</span>
            </div>
            <p className="text-[11px] text-[#687769]">Evidence you add is self-reported until a reviewer checks it. Uploaded files can be opened only by the person who uploaded them and by reviewers.</p>
            {evidence.length === 0 ? (
              <p className="text-xs text-[#687769]">No evidence yet. Add a repository link, a demo, a document, or a screenshot.</p>
            ) : (
              <ul className="divide-y divide-[#DCE6D2]">
                {evidence.map((ev) => (
                  <EvidenceRow
                    key={ev.id}
                    ev={ev}
                    canDelete={!!user && ev.uploadedBy === user.id}
                    canView={!!user && ev.uploadedBy === user.id}
                    onDelete={() => run(async () => { await deleteEvidence(ev); }, 'Evidence removed.')}
                    onError={setError}
                  />
                ))}
              </ul>
            )}
            {canEditTeam && <AddEvidence projectId={project.id} userId={user!.id} onAdded={() => { setSuccess('Evidence added. The project now shows Evidence added.'); void load(); }} onError={setError} />}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#173D2A]">Milestones</h2>
              <span className="text-[11px] text-[#687769]">{milestones.filter((m) => m.status === 'done').length}/{milestones.length} done</span>
            </div>
            {milestones.length === 0 && <p className="text-xs text-[#687769]">No milestones yet.</p>}
            <ul className="space-y-2">
              {milestones.map((m) => (
                <li key={m.id} className="flex items-start gap-3 p-3 rounded-btn border border-[#DCE6D2] bg-white">
                  <button
                    disabled={!canEditTeam}
                    aria-label={m.status === 'done' ? 'Mark not done' : 'Mark done'}
                    onClick={() => run(() => setMilestoneStatus(m.id, m.status === 'done' ? 'todo' : 'done'))}
                    className="mt-0.5 disabled:opacity-50"
                  >
                    {m.status === 'done' ? <Check className="w-4 h-4 text-[#26783C]" /> : <Circle className="w-4 h-4 text-[#687769]" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${m.status === 'done' ? 'line-through text-[#687769]' : 'text-[#173D2A]'}`}>{m.title}</p>
                    {m.description && <p className="text-xs text-[#687769] mt-0.5">{m.description}</p>}
                  </div>
                  <select
                    disabled={!canEditTeam}
                    value={m.status}
                    onChange={(e) => run(() => setMilestoneStatus(m.id, e.target.value as ProjectMilestone['status']))}
                    className="text-[11px] font-bold rounded-md border border-[#DCE6D2] bg-white px-2 py-1 disabled:opacity-60"
                    aria-label="Milestone status"
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                  {canEditTeam && (
                    <button aria-label="Delete milestone" onClick={() => { if (window.confirm('Delete this milestone?')) void run(() => deleteMilestone(m.id)); }} className="text-[#9B2C2C]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {canEditTeam && <AddMilestone projectId={project.id} userId={user!.id} nextPosition={milestones.length} onAdded={() => { setSuccess('Milestone added.'); void load(); }} onError={setError} />}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-3">
            <h2 className="text-sm font-extrabold text-[#173D2A]">Team and contributions</h2>
            <ul className="space-y-4">
              {project.members.map((m) => (
                <li key={m.userId} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {m.avatarUrl && <img src={m.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-[#EAF1DC]" />}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#173D2A] truncate">{m.name}</p>
                      <p className="text-[11px] text-[#687769]">{m.role}</p>
                    </div>
                  </div>
                  {m.responsibilities && <p className="text-xs text-[#4B5A4D]"><span className="font-bold">Responsibilities:</span> {m.responsibilities}</p>}
                  {m.contributions && <p className="text-xs text-[#4B5A4D]"><span className="font-bold">Contributions:</span> {m.contributions}</p>}
                </li>
              ))}
            </ul>
            {isMember && me && <ContributionEditor projectId={project.id} userId={user!.id} initial={me.contributions} onSaved={() => { setSuccess('Contribution saved.'); void load(); }} onError={setError} />}
          </Card>

          <Card className="space-y-3">
            <h2 className="text-sm font-extrabold text-[#173D2A]">Verification</h2>
            <p className="text-xs text-[#4B5A4D]">Current status: <span className="font-bold">{VERIFICATION_LABELS[project.verificationStatus]}</span></p>
            {project.verifiedAt && <p className="text-[11px] text-[#687769]">Verified on {new Date(project.verifiedAt).toLocaleDateString()}</p>}
            {isOwner && canRequestReview(project.verificationStatus) && (
              <SecondaryButton onClick={() => run(() => requestReview('project', project.id), 'Review requested. A reviewer will check your evidence.')} className="w-full">
                <Send className="w-3.5 h-3.5" /> Request review
              </SecondaryButton>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div>
    <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#687769]">{title}</p>
    <p className="text-sm text-[#1D3024] whitespace-pre-line mt-1">{body}</p>
  </div>
);

const EvidenceRow: React.FC<{
  ev: ProjectEvidence;
  canDelete: boolean;
  canView: boolean;
  onDelete: () => void;
  onError: (m: string) => void;
}> = ({ ev, canDelete, canView, onDelete, onError }) => {
  const openFile = async () => {
    if (!ev.storagePath) return;
    try {
      const url = await getEvidenceFileUrl(ev.storagePath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not open this file.');
    }
  };
  return (
    <li className="py-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          {ev.storagePath ? <FileText className="w-3.5 h-3.5 text-[#687769]" /> : <Link2 className="w-3.5 h-3.5 text-[#687769]" />}
          <p className="text-sm font-bold text-[#173D2A] truncate">{ev.title}</p>
          <span className="text-[10px] font-bold uppercase text-[#687769]">{ev.kind}</span>
        </div>
        <VerificationBadge status={ev.verificationStatus} />
      </div>
      <div className="flex items-center gap-3 text-xs font-bold">
        {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline text-[#173D2A]">Open <ExternalLink className="w-3 h-3" /></a>}
        {ev.storagePath && (canView
          ? <button onClick={openFile} className="underline text-[#173D2A]">Open file</button>
          : <span className="text-[#687769] font-normal" title="Only the uploader and reviewers can open this file">Private file</span>)}
        {canDelete && <button aria-label="Remove evidence" onClick={() => { if (window.confirm('Remove this evidence?')) onDelete(); }} className="text-[#9B2C2C]"><Trash2 className="w-3.5 h-3.5" /></button>}
      </div>
    </li>
  );
};

const AddEvidence: React.FC<{ projectId: string; userId: string; onAdded: () => void; onError: (m: string) => void }> = ({ projectId, userId, onAdded, onError }) => {
  const [mode, setMode] = useState<'link' | 'file'>('link');
  const [kind, setKind] = useState<EvidenceKind>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'link') await addLinkEvidence(projectId, userId, kind, title, url);
      else if (file) await addFileEvidence(projectId, userId, kind, title, file);
      else throw new Error('Choose a file to upload.');
      setTitle(''); setUrl(''); setFile(null);
      onAdded();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not add evidence.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 pt-4 border-t border-[#DCE6D2]">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('link')} className={`px-3 py-1.5 rounded-btn text-xs font-bold border ${mode === 'link' ? 'bg-[#173D2A] text-white border-[#173D2A]' : 'bg-white border-[#DCE6D2]'}`}><Link2 className="w-3 h-3 inline mr-1" />Link</button>
        <button type="button" onClick={() => setMode('file')} className={`px-3 py-1.5 rounded-btn text-xs font-bold border ${mode === 'file' ? 'bg-[#173D2A] text-white border-[#173D2A]' : 'bg-white border-[#DCE6D2]'}`}><Upload className="w-3 h-3 inline mr-1" />Private file</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required /></Field>
        <Field label="Type">
          <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value as EvidenceKind)}>
            {EVIDENCE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        {mode === 'link'
          ? <Field label="Link"><input className={inputClass} placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} required /></Field>
          : <Field label="File (max 10 MB)"><input type="file" className="text-xs" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.zip,.mp4" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>}
      </div>
      <PrimaryButton type="submit" disabled={busy}><Plus className="w-3.5 h-3.5" />{busy ? 'Adding...' : 'Add evidence'}</PrimaryButton>
    </form>
  );
};

const AddMilestone: React.FC<{ projectId: string; userId: string; nextPosition: number; onAdded: () => void; onError: (m: string) => void }> = ({ projectId, userId, nextPosition, onAdded, onError }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addMilestone(projectId, userId, title, description, nextPosition);
      setTitle(''); setDescription('');
      onAdded();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not add milestone.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-3 pt-4 border-t border-[#DCE6D2] items-end">
      <Field label="Milestone"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required /></Field>
      <Field label="Details"><input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} /></Field>
      <PrimaryButton type="submit" disabled={busy}><Plus className="w-3.5 h-3.5" /> Add milestone</PrimaryButton>
    </form>
  );
};

const ContributionEditor: React.FC<{ projectId: string; userId: string; initial: string; onSaved: () => void; onError: (m: string) => void }> = ({ projectId, userId, initial, onSaved, onError }) => {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2 pt-3 border-t border-[#DCE6D2]">
      <Field label="Your contributions" hint="What you actually built or fixed">
        <textarea className={inputClass} rows={3} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} />
      </Field>
      <SecondaryButton disabled={busy} onClick={async () => {
        setBusy(true);
        try { await updateMyContribution(projectId, userId, text); onSaved(); }
        catch (err) { onError(err instanceof Error ? err.message : 'Could not save.'); }
        finally { setBusy(false); }
      }}>Save contribution</SecondaryButton>
    </div>
  );
};
