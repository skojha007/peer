import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { createProject, updateProject, getProject, validateProjectInput, type ProjectInput } from '../lib/portfolio';
import { PROJECT_STATUSES, type PortfolioProjectStatus } from '../lib/verification';
import { SetupNotice, Card, Field, inputClass, PrimaryButton, SecondaryButton, ErrorBanner, Loading } from '../components/portfolio/ui';

const CATEGORIES = ['Web Development', 'Mobile App', 'AI / ML', 'Data Science', 'IoT & Hardware', 'Game Development', 'Cybersecurity', 'DevOps / Cloud', 'Other'];

const EMPTY: ProjectInput = {
  title: '', description: '', problemStatement: '', solution: '', category: CATEGORIES[0],
  technologies: [], status: 'Planning', progress: 10, visibility: 'public',
  repoUrl: '', liveDemoUrl: '', videoUrl: '', role: 'Owner', responsibilities: '',
};

export const PortfolioProjectFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const editing = Boolean(projectId);
  const { configured, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProjectInput>(EMPTY);
  const [techText, setTechText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing || !configured || !projectId) return;
    getProject(projectId)
      .then((p) => {
        if (!p) { setError('Project not found, or you do not have access to it.'); return; }
        if (user && p.ownerId !== user.id) { setError('Only the project owner can edit this project.'); return; }
        const me = p.members.find((m) => m.userId === user?.id);
        setForm({
          title: p.title, description: p.description, problemStatement: p.problemStatement, solution: p.solution,
          category: p.category, technologies: p.technologies, status: p.status, progress: p.progress,
          visibility: p.visibility, repoUrl: p.repoUrl ?? '', liveDemoUrl: p.liveDemoUrl ?? '', videoUrl: p.videoUrl ?? '',
          role: me?.role ?? 'Owner', responsibilities: me?.responsibilities ?? '',
        });
        setTechText(p.technologies.join(', '));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load project.'))
      .finally(() => setLoading(false));
  }, [editing, configured, projectId, user]);

  if (!configured) return <SetupNotice />;
  if (loading) return <Loading label="Loading project..." />;

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const technologies = techText.split(',').map((t) => t.trim()).filter(Boolean);
    const next = { ...form, technologies };
    const validation = validateProjectInput(next);
    setErrors(validation);
    if (Object.keys(validation).length > 0 || !user) return;

    setSaving(true);
    try {
      if (editing && projectId) {
        await updateProject(projectId, next, user.id);
        navigate(`/portfolio/projects/${projectId}`);
      } else {
        const id = await createProject(next, user.id);
        navigate(`/portfolio/projects/${id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link to={editing && projectId ? `/portfolio/projects/${projectId}` : '/portfolio'} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#687769] hover:text-[#173D2A]">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>
      <div>
        <h1 className="text-2xl font-extrabold text-[#173D2A] tracking-tight">{editing ? 'Edit project' : 'New project'}</h1>
        <p className="text-sm text-[#687769] mt-1">Describe what you built and what you did. Evidence can be added after saving.</p>
      </div>
      <ErrorBanner message={error} />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card className="space-y-5">
          <Field label="Project title" error={errors.title}>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={120} />
          </Field>
          <Field label="What it does" error={errors.description}>
            <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Problem it solves" error={errors.problemStatement}>
              <textarea className={inputClass} rows={3} value={form.problemStatement} onChange={(e) => set('problemStatement', e.target.value)} />
            </Field>
            <Field label="How you solved it" error={errors.solution}>
              <textarea className={inputClass} rows={3} value={form.solution} onChange={(e) => set('solution', e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as PortfolioProjectStatus)}>
                {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Technologies" hint="Comma separated, for example React, TypeScript, Supabase" error={errors.technologies}>
            <input className={inputClass} value={techText} onChange={(e) => setTechText(e.target.value)} />
          </Field>
          <Field label={`Progress: ${form.progress}%`} error={errors.progress}>
            <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set('progress', Number(e.target.value))} className="w-full accent-[#26783C]" />
          </Field>
        </Card>

        <Card className="space-y-5">
          <p className="text-sm font-bold text-[#173D2A]">Links</p>
          <Field label="GitHub repository" error={errors.repoUrl}>
            <input className={inputClass} placeholder="https://github.com/you/project" value={form.repoUrl} onChange={(e) => set('repoUrl', e.target.value)} />
          </Field>
          <Field label="Live demo" error={errors.liveDemoUrl}>
            <input className={inputClass} placeholder="https://..." value={form.liveDemoUrl} onChange={(e) => set('liveDemoUrl', e.target.value)} />
          </Field>
          <Field label="Video walkthrough" error={errors.videoUrl}>
            <input className={inputClass} placeholder="https://youtube.com/..." value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
          </Field>
        </Card>

        <Card className="space-y-5">
          <p className="text-sm font-bold text-[#173D2A]">Your role</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Role on the team">
              <input className={inputClass} value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Frontend lead" />
            </Field>
            <Field label="Visibility">
              <select className={inputClass} value={form.visibility} onChange={(e) => set('visibility', e.target.value as 'public' | 'private')}>
                <option value="public">Public: shown on your portfolio</option>
                <option value="private">Private: only you and your team</option>
              </select>
            </Field>
          </div>
          <Field label="Your responsibilities" hint="What you personally owned in this project">
            <textarea className={inputClass} rows={3} value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} />
          </Field>
        </Card>

        <div className="flex justify-end gap-3">
          <SecondaryButton type="button" onClick={() => navigate(-1)}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create project'}</PrimaryButton>
        </div>
      </form>
    </div>
  );
};
