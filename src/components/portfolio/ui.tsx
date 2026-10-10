import React from 'react';
import { Loader2, AlertTriangle, Info, ShieldCheck, Clock, Search, FileCheck2, CircleDashed, XCircle } from 'lucide-react';
import {
  VERIFICATION_LABELS, VERIFICATION_STYLES, VERIFICATION_DESCRIPTIONS,
  type VerificationStatus,
} from '../../lib/verification';

const ICONS: Record<VerificationStatus, React.ComponentType<{ className?: string }>> = {
  self_reported: CircleDashed,
  evidence_added: FileCheck2,
  pending_review: Clock,
  verified: ShieldCheck,
  needs_review: Search,
  rejected: XCircle,
};

export const VerificationBadge: React.FC<{ status: VerificationStatus; showDescription?: boolean }> = ({ status, showDescription }) => {
  const Icon = ICONS[status];
  return (
    <span className="inline-flex flex-col gap-0.5" title={VERIFICATION_DESCRIPTIONS[status]}>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold w-fit ${VERIFICATION_STYLES[status]}`}>
        <Icon className="w-3 h-3" />
        {VERIFICATION_LABELS[status]}
      </span>
      {showDescription && <span className="text-[11px] text-[#687769] leading-snug">{VERIFICATION_DESCRIPTIONS[status]}</span>}
    </span>
  );
};

export const TechTags: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((t) => (
      <span key={t} className="px-2 py-0.5 rounded-md bg-[#EAF1DC] text-[#173D2A] text-[11px] font-semibold">{t}</span>
    ))}
  </div>
);

export const Loading: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#687769]">
    <Loader2 className="w-4 h-4 animate-spin" /> {label}
  </div>
);

export const ErrorBanner: React.FC<{ message: string | null; onRetry?: () => void }> = ({ message, onRetry }) => {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 p-3 rounded-btn bg-[#FDECEC] text-[#9B2C2C] text-xs font-semibold">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onRetry && <button onClick={onRetry} className="underline shrink-0">Try again</button>}
    </div>
  );
};

export const SuccessBanner: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div role="status" className="p-3 rounded-btn bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold">{message}</div>
  ) : null;

export const EmptyState: React.FC<{ title: string; body: string; action?: React.ReactNode }> = ({ title, body, action }) => (
  <div className="text-center py-12 px-6 border border-dashed border-[#DCE6D2] rounded-card bg-[#FAFCF5] space-y-2">
    <p className="text-sm font-bold text-[#173D2A]">{title}</p>
    <p className="text-xs text-[#687769] max-w-md mx-auto">{body}</p>
    {action && <div className="pt-2">{action}</div>}
  </div>
);

export const SetupNotice: React.FC = () => (
  <div className="max-w-2xl mx-auto mt-10 p-5 rounded-card bg-[#FFF6DD] border border-[#EFD9A0] text-sm text-[#6B4E00] space-y-2">
    <p className="font-bold flex items-center gap-2"><Info className="w-4 h-4" /> Supabase is not connected</p>
    <p className="text-xs leading-relaxed">
      This feature stores data in Supabase, so it needs <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in
      <code> .env.local</code>. Until those are set, nothing is shown here, so no sample or fake data appears.
    </p>
  </div>
);

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = '', children }) => (
  <div className={`bg-[#FAFCF5] p-5 sm:p-6 rounded-card border border-[#DCE6D2] shadow-subtle ${className}`}>{children}</div>
);

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...rest }) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#173D2A] hover:bg-[#102B20] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-btn transition-colors ${className}`}
  />
);

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...rest }) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#FAFCF5] border border-[#DCE6D2] hover:bg-[#EEF4E3] disabled:opacity-50 text-[#173D2A] text-xs font-bold rounded-btn transition-colors ${className}`}
  />
);

export const DangerButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...rest }) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#FDECEC] hover:bg-[#FAD4D4] disabled:opacity-50 text-[#9B2C2C] text-xs font-bold rounded-btn transition-colors ${className}`}
  />
);

export const Field: React.FC<{ label: string; error?: string; hint?: string; children: React.ReactNode }> = ({ label, error, hint, children }) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-bold text-[#173D2A]">{label}</span>
    {children}
    {hint && !error && <span className="block text-[11px] text-[#687769]">{hint}</span>}
    {error && <span className="block text-[11px] font-semibold text-[#9B2C2C]">{error}</span>}
  </label>
);

export const inputClass =
  'w-full px-3 py-2.5 rounded-input bg-white border border-[#DCE6D2] text-sm text-[#1D3024] focus:outline-none focus:ring-2 focus:ring-[#26783C]/30 focus:border-[#26783C]';
