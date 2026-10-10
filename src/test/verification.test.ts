import { describe, it, expect } from 'vitest';
import {
  validateHttpUrl, validateEvidenceFile, safeFileName, canRequestReview,
  isVerificationStatus, VERIFICATION_LABELS, MAX_EVIDENCE_BYTES,
} from '../lib/verification';
import { validateProjectInput, type ProjectInput } from '../lib/portfolio';

const validProject: ProjectInput = {
  title: 'Campus Ride Share', description: 'Share rides between hostels.', problemStatement: '', solution: '',
  category: 'Web Development', technologies: ['React'], status: 'Planning', progress: 10, visibility: 'public',
  repoUrl: 'https://github.com/a/b', liveDemoUrl: '', videoUrl: '', role: 'Owner', responsibilities: '',
};

describe('verification states', () => {
  it('has exactly the five required student-facing states plus rejected for reviewers', () => {
    expect(Object.values(VERIFICATION_LABELS)).toEqual([
      'Self-reported', 'Evidence added', 'Pending review', 'Verified', 'Needs review', 'Rejected',
    ]);
  });

  it('only allows students to request review from non-final states', () => {
    expect(canRequestReview('self_reported')).toBe(true);
    expect(canRequestReview('evidence_added')).toBe(true);
    expect(canRequestReview('needs_review')).toBe(true);
    expect(canRequestReview('pending_review')).toBe(false);
    expect(canRequestReview('verified')).toBe(false);
    expect(canRequestReview('rejected')).toBe(false);
  });

  it('recognises valid statuses and rejects unknown values', () => {
    expect(isVerificationStatus('verified')).toBe(true);
    expect(isVerificationStatus('trusted')).toBe(false);
    expect(isVerificationStatus(undefined)).toBe(false);
  });
});

describe('url validation', () => {
  it('accepts http and https links and treats empty as optional', () => {
    expect(validateHttpUrl('https://github.com/a/b')).toBeNull();
    expect(validateHttpUrl('http://example.com')).toBeNull();
    expect(validateHttpUrl('   ')).toBeNull();
  });

  it('rejects javascript, data and malformed URLs', () => {
    expect(validateHttpUrl('javascript:alert(1)')).not.toBeNull();
    expect(validateHttpUrl('data:text/html,hi')).not.toBeNull();
    expect(validateHttpUrl('github.com/a/b')).not.toBeNull();
  });
});

describe('evidence file validation', () => {
  it('accepts an allowed type under the size limit', () => {
    expect(validateEvidenceFile({ type: 'application/pdf', size: 1024 })).toBeNull();
  });

  it('rejects disallowed types, empty files, and files over 10 MB', () => {
    expect(validateEvidenceFile({ type: 'application/x-msdownload', size: 100 })).not.toBeNull();
    expect(validateEvidenceFile({ type: 'application/pdf', size: 0 })).not.toBeNull();
    expect(validateEvidenceFile({ type: 'application/pdf', size: MAX_EVIDENCE_BYTES + 1 })).not.toBeNull();
    expect(validateEvidenceFile({ type: 'application/pdf', size: MAX_EVIDENCE_BYTES })).toBeNull();
  });

  it('sanitises file names so they cannot escape the storage folder', () => {
    expect(safeFileName('../../etc/passwd')).not.toContain('/');
    expect(safeFileName('my report (final).pdf')).toBe('my_report_final_.pdf');
    expect(safeFileName('')).toBe('file');
  });
});

describe('project form validation', () => {
  it('passes a valid project', () => {
    expect(validateProjectInput(validProject)).toEqual({});
  });

  it('requires a title and description', () => {
    const errors = validateProjectInput({ ...validProject, title: '  ', description: '' });
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
  });

  it('rejects out-of-range progress and unsafe links', () => {
    const errors = validateProjectInput({ ...validProject, progress: 140, liveDemoUrl: 'javascript:void(0)' });
    expect(errors.progress).toBeDefined();
    expect(errors.liveDemoUrl).toBeDefined();
  });
});
