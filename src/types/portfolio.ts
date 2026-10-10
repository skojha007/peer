import type { VerificationStatus, EvidenceKind, PortfolioProjectStatus, Proficiency } from '../lib/verification';

export interface PortfolioMember {
  userId: string;
  name: string;
  avatarUrl: string;
  role: string;
  responsibilities: string;
  contributions: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  solution: string;
  category: string;
  technologies: string[];
  status: PortfolioProjectStatus;
  progress: number;
  visibility: 'public' | 'private';
  repoUrl: string | null;
  liveDemoUrl: string | null;
  videoUrl: string | null;
  ownerId: string;
  members: PortfolioMember[];
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  position: number;
  completedAt: string | null;
}

export interface ProjectEvidence {
  id: string;
  projectId: string;
  uploadedBy: string;
  kind: EvidenceKind;
  title: string;
  url: string | null;
  storagePath: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  createdAt: string;
}

export interface SkillEntry {
  id: string;
  userId: string;
  name: string;
  proficiency: Proficiency;
  isLearningGoal: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  updatedAt: string;
  evidence: { id: string; projectId: string | null; evidenceId: string | null; note: string; projectTitle?: string }[];
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  issuer: string;
  issuedOn: string | null;
  credentialUrl: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
}

export interface ReviewItem {
  targetType: 'project' | 'evidence' | 'skill' | 'achievement';
  targetId: string;
  label: string;
  ownerName: string;
  detail: string;
  submittedAt: string;
  url?: string | null;
}
