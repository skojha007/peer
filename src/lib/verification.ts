/**
 * Verification states shared by projects, evidence, skills and achievements.
 * Only reviewers can set 'verified', 'needs_review' or 'rejected' (enforced in the database).
 */
export type VerificationStatus =
  | 'self_reported'
  | 'evidence_added'
  | 'pending_review'
  | 'verified'
  | 'needs_review'
  | 'rejected';

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  self_reported: 'Self-reported',
  evidence_added: 'Evidence added',
  pending_review: 'Pending review',
  verified: 'Verified',
  needs_review: 'Needs review',
  rejected: 'Rejected',
};

export const VERIFICATION_DESCRIPTIONS: Record<VerificationStatus, string> = {
  self_reported: 'The student has entered this. No independent check has been done.',
  evidence_added: 'Supporting links or files were attached. A reviewer has not checked them yet.',
  pending_review: 'The student asked a reviewer to check this.',
  verified: 'A reviewer checked the evidence and approved it. Decision is recorded in the audit log.',
  needs_review: 'A reviewer found something to resolve before this can be verified.',
  rejected: 'A reviewer could not confirm this from the evidence provided.',
};

/** Tailwind classes for a status badge. Verified is the only green-filled state. */
export const VERIFICATION_STYLES: Record<VerificationStatus, string> = {
  self_reported: 'bg-[#F1F3EE] text-[#4B5A4D] border-[#DCE6D2]',
  evidence_added: 'bg-[#DDEBFA] text-[#1F4E79] border-[#B9D3EE]',
  pending_review: 'bg-[#FFF6DD] text-[#6B4E00] border-[#EFD9A0]',
  verified: 'bg-[#26783C] text-white border-[#1C622F]',
  needs_review: 'bg-[#FDECEC] text-[#9B2C2C] border-[#F5C2C2]',
  rejected: 'bg-[#FDECEC] text-[#9B2C2C] border-[#F5C2C2]',
};

export const EVIDENCE_KINDS = [
  'code', 'documentation', 'demo', 'deliverable', 'screenshot', 'video', 'link',
] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];

export const PROJECT_STATUSES = ['Planning', 'Active', 'In Progress', 'On Hold', 'Completed'] as const;
export type PortfolioProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export type Proficiency = (typeof PROFICIENCIES)[number];

/** Files allowed as private evidence. Must match the storage bucket policy in migration 0002. */
export const ALLOWED_EVIDENCE_MIME = [
  'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
  'text/plain', 'text/markdown', 'application/zip', 'video/mp4',
] as const;
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

export function isVerificationStatus(v: unknown): v is VerificationStatus {
  return typeof v === 'string' && v in VERIFICATION_LABELS;
}

/** Returns an error message, or null if the URL is an acceptable http(s) link. */
export function validateHttpUrl(value: string): string | null {
  if (!value.trim()) return null;
  try {
    const u = new URL(value.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'Use an http or https link.';
    return null;
  } catch {
    return 'Enter a valid link, for example https://github.com/you/project.';
  }
}

export function validateEvidenceFile(file: { type: string; size: number }): string | null {
  if (!(ALLOWED_EVIDENCE_MIME as readonly string[]).includes(file.type)) {
    return 'That file type is not allowed. Use PDF, PNG, JPG, WEBP, TXT, MD, ZIP or MP4.';
  }
  if (file.size <= 0) return 'The file is empty.';
  if (file.size > MAX_EVIDENCE_BYTES) return 'Files must be 10 MB or smaller.';
  return null;
}

/** Makes a filename safe for a storage path. Keeps letters, digits, dot, dash, underscore. */
export function safeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+/, '');
  return (cleaned || 'file').slice(0, 120);
}

/** Students may request review only from these states. */
export function canRequestReview(status: VerificationStatus): boolean {
  return status === 'self_reported' || status === 'evidence_added' || status === 'needs_review';
}
