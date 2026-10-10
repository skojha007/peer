import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UsersRound, Send, X, CheckCircle2, BadgeCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  listProjectsForUser, listCandidates, listSentInvitations, sendInvitation, cancelInvitation,
  type CandidateProfile, type InvitationRow,
} from '../lib/portfolio';
import { computeMatch } from '../lib/teamMatch';
import type { PortfolioProject } from '../types/portfolio';
import {
  Loading, ErrorBanner, SuccessBanner, EmptyState, SetupNotice, Card, PrimaryButton, SecondaryButton, Field, inputClass,
} from '../components/portfolio/ui';

export const TeamFinderPage: React.FC = () => {
  const { configured, user } = useAuth();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [sent, setSent] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviting, setInviting] = useState<CandidateProfile | null>(null);
  const [role, setRole] = useState('Team Member');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const owned = useMemo(() => projects.filter((p) => p.ownerId === user?.id), [projects, user]);
  const selected = owned.find((p) => p.id === selectedId) ?? null;

  const loadBase = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [list, people] = await Promise.all([listProjectsForUser(user.id), listCandidates(user.id)]);
      setProjects(list);
      setCandidates(people);
      const firstOwned = list.find((p) => p.ownerId === user.id);
      setSelectedId((cur) => cur || firstOwned?.id || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load Team Finder.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadSent = useCallback(async (projectId: string) => {
    try { setSent(await listSentInvitations(projectId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load invitations.'); }
  }, []);

  useEffect(() => { if (configured) void loadBase(); else setLoading(false); }, [configured, loadBase]);
  useEffect(() => { if (configured && selectedId) void loadSent(selectedId); }, [configured, selectedId, loadSent]);

  if (!configured) return <SetupNotice />;

  const memberIds = new Set(selected?.members.map((m) => m.userId) ?? []);
  const pendingIds = new Map(sent.filter((s) => s.status === 'pending').map((s) => [s.invitedUserId, s]));

  const ranked = selected
    ? candidates
        .filter((c) => !memberIds.has(c.userId))
        .map((c) => ({ candidate: c, match: computeMatch(
          { requiredSkills: [], technologies: selected.technologies, category: selected.category },
          c,
        ) }))
        .sort((a, b) => (b.match.score ?? -1) - (a.match.score ?? -1))
    : [];

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviting || !selected || !user) return;
    setBusy(true); setError(null); setSuccess(null);
    try {
      await sendInvitation(selected.id, inviting.userId, user.id, role, message);
      setSuccess(`Invitation sent to ${inviting.name}. They can accept it from their portfolio page.`);
      setInviting(null); setMessage(''); setRole('Team Member');
      await loadSent(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the invitation.');
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (inv: InvitationRow) => {
    setError(null); setSuccess(null);
    try { await cancelInvitation(inv.id); setSuccess('Invitation withdrawn.'); await loadSent(inv.projectId); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not withdraw.'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight flex items-center gap-2">
            <UsersRound className="w-6 h-6 text-[#26783C]" /> Team Finder
          </h1>
          <p className="text-sm text-[#687769] mt-1 max-w-2xl">
            Students ranked for your project by the skills in their Skill Passport. Each score shows how it was calculated.
          </p>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={loadBase} />
      <SuccessBanner message={success} />

      {loading ? <Loading label="Finding teammates..." /> : owned.length === 0 ? (
        <EmptyState
          title="You need a project first"
          body="Team Finder matches people to a project you own. Create one in My Portfolio, then come back."
          action={<Link to="/portfolio/projects/new" className="text-xs font-bold underline text-[#173D2A]">Create a project</Link>}
        />
      ) : (
        <>
          <Card className="space-y-4">
            <Field label="Project you are recruiting for">
              <select className={inputClass} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {owned.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </Field>
            {selected && (
              <div className="text-xs text-[#4B5A4D] space-y-1">
                <p><span className="font-bold">Technologies:</span> {selected.technologies.join(', ') || 'None listed'}</p>
                <p><span className="font-bold">Team:</span> {selected.members.length} of {selected.maxMembers} members</p>
                <p className="text-[11px] text-[#687769]">Score = 80% skill coverage + 20% shared interest. Matches use the project technologies as the required skills. Verified skills are marked but do not change the score.</p>
              </div>
            )}
          </Card>

          {sent.length > 0 && (
            <Card className="space-y-3">
              <h2 className="text-sm font-extrabold text-[#173D2A]">Invitations for this project</h2>
              <ul className="divide-y divide-[#DCE6D2]">
                {sent.map((inv) => (
                  <li key={inv.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[#1D3024]"><span className="font-bold">{inv.invitedUserName}</span> · {inv.role}</span>
                    <span className="flex items-center gap-3">
                      <span className={`font-bold ${inv.status === 'accepted' ? 'text-[#26783C]' : inv.status === 'pending' ? 'text-[#6B4E00]' : 'text-[#687769]'}`}>
                        {inv.status === 'pending' ? 'Waiting for reply' : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                      {inv.status === 'pending' && <button onClick={() => withdraw(inv)} className="underline text-[#9B2C2C]">Withdraw</button>}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {ranked.length === 0 ? (
            <EmptyState title="No candidates yet" body="Students appear here once they make their profile visible and add skills to their passport." />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {ranked.map(({ candidate: c, match }) => {
                const pending = pendingIds.get(c.userId);
                return (
                  <Card key={c.userId} className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {c.avatarUrl && <img src={c.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-[#EAF1DC]" />}
                        <div className="min-w-0">
                          <p className="font-extrabold text-[#173D2A] truncate">{c.name}</p>
                          <p className="text-[11px] text-[#687769] truncate">{[c.branch, c.academicYear].filter(Boolean).join(' · ')}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-extrabold text-[#173D2A]">{match.score === null ? '—' : `${match.score}%`}</p>
                        <p className="text-[10px] font-bold uppercase text-[#687769]">Match</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#4B5A4D]">{match.explanation}</p>
                    {match.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {match.matchedSkills.map((s) => (
                          <span key={s} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${match.verifiedMatchedSkills.includes(s) ? 'bg-[#26783C] text-white' : 'bg-[#EAF1DC] text-[#173D2A]'}`}>
                            {match.verifiedMatchedSkills.includes(s) && <BadgeCheck className="w-3 h-3" />}{s}
                          </span>
                        ))}
                      </div>
                    )}
                    {match.missingSkills.length > 0 && (
                      <p className="text-[11px] text-[#687769]"><span className="font-bold">Not yet listed:</span> {match.missingSkills.join(', ')}</p>
                    )}
                    <div className="pt-1">
                      {pending ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#6B4E00]"><CheckCircle2 className="w-3.5 h-3.5" /> Invitation pending</span>
                      ) : (
                        <SecondaryButton onClick={() => { setInviting(c); setRole('Team Member'); setMessage(''); }} disabled={!selected}>
                          <Send className="w-3.5 h-3.5" /> Invite to team
                        </SecondaryButton>
                      )}
                    </div>
                  </Card>
                );
              })}
            </ul>
          )}
        </>
      )}

      {inviting && selected && (
        <div className="fixed inset-0 z-50 bg-[#102B20]/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Invite to team">
          <form onSubmit={submitInvite} className="w-full max-w-md bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-extrabold text-[#173D2A]">Invite {inviting.name}</p>
                <p className="text-xs text-[#687769]">To {selected.title}</p>
              </div>
              <button type="button" onClick={() => setInviting(null)} aria-label="Close"><X className="w-4 h-4" /></button>
            </div>
            <Field label="Role on the team"><input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} maxLength={60} required /></Field>
            <Field label="Message (optional)"><textarea className={inputClass} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} /></Field>
            <div className="flex justify-end gap-2">
              <SecondaryButton type="button" onClick={() => setInviting(null)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send invitation'}</PrimaryButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
