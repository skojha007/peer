import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getMyProfile, listPendingReviews, submitReviewDecision } from '../lib/portfolio';
import type { ReviewItem } from '../types/portfolio';
import { Loading, ErrorBanner, SuccessBanner, EmptyState, SetupNotice, Card, PrimaryButton, SecondaryButton, DangerButton, inputClass } from '../components/portfolio/ui';

type Decision = 'verified' | 'needs_review' | 'rejected';

export const ReviewQueuePage: React.FC = () => {
  const { configured, user } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await getMyProfile(user.id);
      const ok = profile.role === 'admin' || profile.role === 'moderator';
      setAllowed(ok);
      if (ok) setItems(await listPendingReviews());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the review queue.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (configured) void load(); else setLoading(false); }, [configured, load]);

  if (!configured) return <SetupNotice />;
  if (loading) return <Loading label="Loading review queue..." />;
  if (allowed === false) {
    return <div className="max-w-xl mx-auto px-4 py-16"><EmptyState title="Reviewers only" body="Only admins and moderators can review verification requests." /></div>;
  }

  const decide = async (item: ReviewItem, decision: Decision) => {
    const key = `${item.targetType}:${item.targetId}`;
    const note = notes[key] ?? '';
    if (decision !== 'verified' && !note.trim()) {
      setError('Add a note explaining what the student needs to fix or why it was rejected.');
      return;
    }
    setError(null); setSuccess(null);
    try {
      await submitReviewDecision(item.targetType, item.targetId, decision, note);
      setSuccess(`Recorded: ${item.label} is now ${decision.replace('_', ' ')}. This decision is in the audit log.`);
      setNotes((n) => { const copy = { ...n }; delete copy[key]; return copy; });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record the decision.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-[#26783C]" /> Verification queue</h1>
        <p className="text-sm text-[#687769] mt-1">Check the evidence, then record a decision. Every decision is saved with your name and a timestamp.</p>
      </div>
      <ErrorBanner message={error} onRetry={load} />
      <SuccessBanner message={success} />
      {items.length === 0 ? <EmptyState title="Nothing waiting" body="No student has requested review." /> : (
        <ul className="space-y-4">
          {items.map((item) => {
            const key = `${item.targetType}:${item.targetId}`;
            return (
              <Card key={key} className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-[#173D2A]">{item.label}</p>
                    <p className="text-xs text-[#687769]">{item.detail} · {item.ownerName} · requested {new Date(item.submittedAt).toLocaleDateString()}</p>
                  </div>
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold underline text-[#173D2A]">Open link <ExternalLink className="w-3 h-3" /></a>}
                </div>
                <textarea
                  className={inputClass}
                  rows={2}
                  placeholder="Note for the student (required unless you verify)"
                  value={notes[key] ?? ''}
                  maxLength={1000}
                  onChange={(e) => setNotes((n) => ({ ...n, [key]: e.target.value }))}
                  aria-label={`Note for ${item.label}`}
                />
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton onClick={() => decide(item, 'verified')}>Verify</PrimaryButton>
                  <SecondaryButton onClick={() => decide(item, 'needs_review')}>Needs review</SecondaryButton>
                  <DangerButton onClick={() => decide(item, 'rejected')}>Reject</DangerButton>
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
};
