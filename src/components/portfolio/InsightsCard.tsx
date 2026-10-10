import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getSkillInsights, type SkillInsights } from '../../lib/insights';
import { Card, PrimaryButton, ErrorBanner, Field, inputClass, Loading } from './ui';

export const InsightsCard: React.FC = () => {
  const [role, setRole] = useState('');
  const [result, setResult] = useState<SkillInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setResult(await getSkillInsights(role));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Could not get suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#26783C]" />
        <h2 className="text-sm font-extrabold text-[#173D2A]">AI suggestions</h2>
      </div>
      <p className="text-[11px] text-[#687769]">
        Suggestions are generated from your projects, skills, and achievements. They are not verification, and the AI
        does not mark anything as verified.
      </p>
      <form onSubmit={generate} className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
        <Field label="Role you are aiming for (optional)">
          <input className={inputClass} value={role} maxLength={100} placeholder="Backend developer" onChange={(e) => setRole(e.target.value)} />
        </Field>
        <PrimaryButton type="submit" disabled={loading}>{loading ? 'Thinking...' : 'Get suggestions'}</PrimaryButton>
      </form>
      <ErrorBanner message={error} />
      {loading && <Loading label="Reading your portfolio..." />}
      {result && !loading && (
        <div className="space-y-4 text-xs text-[#1D3024]">
          {result.skillsDemonstrated.length > 0 && (
            <div>
              <p className="font-bold text-[#173D2A] mb-1">Skills your projects show</p>
              <ul className="space-y-1">{result.skillsDemonstrated.map((s) => <li key={s.skill}><span className="font-bold">{s.skill}:</span> {s.evidence}</li>)}</ul>
            </div>
          )}
          {result.learnNext.length > 0 && (
            <div>
              <p className="font-bold text-[#173D2A] mb-1">Learn next</p>
              <ul className="space-y-1">{result.learnNext.map((s) => <li key={s.skill}><span className="font-bold">{s.skill}:</span> {s.why}</li>)}</ul>
            </div>
          )}
          {result.portfolioTips.length > 0 && (
            <div>
              <p className="font-bold text-[#173D2A] mb-1">Improve your portfolio</p>
              <ul className="list-disc pl-5 space-y-1">{result.portfolioTips.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          )}
          {result.roleIdeas.length > 0 && (
            <div>
              <p className="font-bold text-[#173D2A] mb-1">Roles that fit</p>
              <ul className="space-y-1">{result.roleIdeas.map((r) => <li key={r.role}><span className="font-bold">{r.role}:</span> {r.why}</li>)}</ul>
            </div>
          )}
          <p className="text-[11px] text-[#687769]">{result.disclaimer}</p>
        </div>
      )}
    </Card>
  );
};
