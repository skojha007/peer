import { supabase } from './supabase';
import type {
  PortfolioProject, PortfolioMember, ProjectMilestone, ProjectEvidence,
  SkillEntry, Achievement, ReviewItem,
} from '../types/portfolio';
import {
  isVerificationStatus, safeFileName, validateEvidenceFile, validateHttpUrl,
  type VerificationStatus, type EvidenceKind, type PortfolioProjectStatus, type Proficiency,
  PROJECT_STATUSES, PROFICIENCIES,
} from './verification';

/* ---------- helpers ---------- */

function db() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function asStatus(v: unknown): VerificationStatus {
  return isVerificationStatus(v) ? v : 'self_reported';
}

function asProjectStatus(v: unknown): PortfolioProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(v as string)
    ? (v as PortfolioProjectStatus)
    : 'Planning';
}

function asProficiency(v: unknown): Proficiency {
  return (PROFICIENCIES as readonly string[]).includes(v as string) ? (v as Proficiency) : 'Beginner';
}

/* ---------- row mappers ---------- */

type Row = Record<string, any>;

function mapMember(m: Row): PortfolioMember {
  return {
    userId: m.user_id,
    name: m.profiles?.full_name || 'Private student',
    avatarUrl: m.profiles?.avatar_url || '',
    role: m.role ?? 'Team Member',
    responsibilities: m.responsibilities ?? '',
    contributions: m.contributions ?? '',
  };
}

function mapProject(r: Row): PortfolioProject {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    problemStatement: r.problem_statement ?? '',
    solution: r.solution ?? '',
    category: r.category ?? '',
    technologies: r.technologies ?? [],
    status: asProjectStatus(r.status),
    progress: r.progress ?? 0,
    maxMembers: r.max_members ?? 4,
    visibility: r.visibility === 'private' ? 'private' : 'public',
    repoUrl: r.repo_url ?? null,
    liveDemoUrl: r.live_demo_url ?? null,
    videoUrl: r.video_url ?? null,
    ownerId: r.owner_id,
    members: (r.project_members ?? []).map(mapMember),
    verificationStatus: asStatus(r.verification_status),
    verifiedAt: r.verified_at ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const PROJECT_SELECT =
  '*, project_members(user_id, role, responsibilities, contributions, profiles(full_name, avatar_url))';

function mapMilestone(r: Row): ProjectMilestone {
  return {
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    description: r.description ?? '',
    status: r.status,
    position: r.position ?? 0,
    completedAt: r.completed_at ?? null,
  };
}

function mapEvidence(r: Row): ProjectEvidence {
  return {
    id: r.id,
    projectId: r.project_id,
    uploadedBy: r.uploaded_by,
    kind: r.kind as EvidenceKind,
    title: r.title,
    url: r.url ?? null,
    storagePath: r.storage_path ?? null,
    mimeType: r.mime_type ?? null,
    sizeBytes: r.size_bytes ?? null,
    verificationStatus: asStatus(r.verification_status),
    verifiedAt: r.verified_at ?? null,
    createdAt: r.created_at,
  };
}

function mapSkill(r: Row): SkillEntry {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    proficiency: asProficiency(r.proficiency),
    isLearningGoal: !!r.is_learning_goal,
    verificationStatus: asStatus(r.verification_status),
    verifiedAt: r.verified_at ?? null,
    updatedAt: r.updated_at,
    evidence: (r.skill_evidence ?? []).map((e: Row) => ({
      id: e.id,
      projectId: e.project_id ?? null,
      evidenceId: e.evidence_id ?? null,
      note: e.note ?? '',
      projectTitle: e.projects?.title,
    })),
  };
}

function mapAchievement(r: Row): Achievement {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    issuer: r.issuer ?? '',
    issuedOn: r.issued_on ?? null,
    credentialUrl: r.credential_url ?? null,
    verificationStatus: asStatus(r.verification_status),
    verifiedAt: r.verified_at ?? null,
  };
}

/* ---------- profile ---------- */

export async function getMyProfile(userId: string) {
  const { data, error } = await db()
    .from('profiles')
    .select('id, full_name, role, profile_visibility, avatar_url')
    .eq('id', userId)
    .single();
  fail(error);
  if (!data) throw new Error('Profile not found.');
  return {
    id: data.id as string,
    fullName: data.full_name as string,
    role: data.role as string,
    profileVisibility: data.profile_visibility as 'public' | 'campus_only' | 'private',
    avatarUrl: data.avatar_url as string,
  };
}

export async function getPublicProfile(userId: string) {
  const { data, error } = await db()
    .from('profiles')
    .select('id, full_name, branch, college, academic_year, bio, avatar_url, profile_visibility')
    .eq('id', userId)
    .maybeSingle();
  fail(error);
  return data as Row | null;
}

export async function setProfileVisibility(userId: string, visibility: 'public' | 'campus_only' | 'private') {
  const { error } = await db().from('profiles').update({ profile_visibility: visibility }).eq('id', userId);
  fail(error);
}

/* ---------- projects ---------- */

/** Projects a user owns or belongs to. RLS hides private projects from everyone else. */
export async function listProjectsForUser(userId: string): Promise<PortfolioProject[]> {
  const sb = db();
  const { data: memberships, error: mErr } = await sb
    .from('project_members').select('project_id').eq('user_id', userId);
  fail(mErr);
  const memberIds = (memberships ?? []).map((m: Row) => m.project_id as string);
  const filter = memberIds.length
    ? `owner_id.eq.${userId},id.in.(${memberIds.join(',')})`
    : `owner_id.eq.${userId}`;
  const { data, error } = await sb
    .from('projects').select(PROJECT_SELECT).or(filter).order('updated_at', { ascending: false });
  fail(error);
  return (data ?? []).map(mapProject);
}

export async function getProject(projectId: string): Promise<PortfolioProject | null> {
  const { data, error } = await db().from('projects').select(PROJECT_SELECT).eq('id', projectId).maybeSingle();
  fail(error);
  return data ? mapProject(data) : null;
}

export interface ProjectInput {
  title: string;
  description: string;
  problemStatement: string;
  solution: string;
  category: string;
  technologies: string[];
  status: PortfolioProjectStatus;
  progress: number;
  visibility: 'public' | 'private';
  repoUrl: string;
  liveDemoUrl: string;
  videoUrl: string;
  role: string;
  responsibilities: string;
}

/** Returns a field-level error map, or an empty object when the input is valid. */
export function validateProjectInput(input: ProjectInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.title.trim()) errors.title = 'Title is required.';
  if (input.title.length > 120) errors.title = 'Keep the title under 120 characters.';
  if (!input.description.trim()) errors.description = 'Describe what the project does.';
  if (input.description.length > 2000) errors.description = 'Keep the description under 2000 characters.';
  if (input.problemStatement.length > 1000) errors.problemStatement = 'Keep this under 1000 characters.';
  if (input.solution.length > 1000) errors.solution = 'Keep this under 1000 characters.';
  if (input.technologies.length > 20) errors.technologies = 'Use at most 20 technologies.';
  if (!Number.isFinite(input.progress) || input.progress < 0 || input.progress > 100) {
    errors.progress = 'Progress must be between 0 and 100.';
  }
  for (const [key, value] of [
    ['repoUrl', input.repoUrl], ['liveDemoUrl', input.liveDemoUrl], ['videoUrl', input.videoUrl],
  ] as const) {
    const err = validateHttpUrl(value);
    if (err) errors[key] = err;
  }
  return errors;
}

function projectPayload(input: ProjectInput) {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    problem_statement: input.problemStatement.trim(),
    solution: input.solution.trim(),
    category: input.category,
    technologies: input.technologies,
    status: input.status,
    progress: Math.round(input.progress),
    visibility: input.visibility,
    repo_url: input.repoUrl.trim() || null,
    live_demo_url: input.liveDemoUrl.trim() || null,
    video_url: input.videoUrl.trim() || null,
  };
}

export async function createProject(input: ProjectInput, ownerId: string): Promise<string> {
  const sb = db();
  const { data, error } = await sb
    .from('projects')
    .insert({ ...projectPayload(input), owner_id: ownerId })
    .select('id')
    .single();
  fail(error);
  if (!data) throw new Error('Project was not created.');
  const projectId = data.id as string;
  // The owner is also the first team member, with their own role and responsibilities.
  const { error: mErr } = await sb.from('project_members').insert({
    project_id: projectId,
    user_id: ownerId,
    role: input.role.trim() || 'Owner',
    responsibilities: input.responsibilities.trim(),
  });
  fail(mErr);
  return projectId;
}

export async function updateProject(projectId: string, input: ProjectInput, userId: string) {
  const sb = db();
  const { error } = await sb
    .from('projects')
    .update({ ...projectPayload(input), updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('owner_id', userId);
  fail(error);
  const { error: mErr } = await sb
    .from('project_members')
    .update({ role: input.role.trim() || 'Owner', responsibilities: input.responsibilities.trim() })
    .eq('project_id', projectId)
    .eq('user_id', userId);
  fail(mErr);
}

export async function deleteProject(projectId: string, userId: string) {
  const { error } = await db().from('projects').delete().eq('id', projectId).eq('owner_id', userId);
  fail(error);
}

/** Contribution notes for a team member. Members can edit their own entry only. */
export async function updateMyContribution(projectId: string, userId: string, contributions: string) {
  if (contributions.length > 2000) throw new Error('Keep contributions under 2000 characters.');
  const { error } = await db()
    .from('project_members')
    .update({ contributions: contributions.trim() })
    .eq('project_id', projectId)
    .eq('user_id', userId);
  fail(error);
}

/* ---------- milestones ---------- */

export async function listMilestones(projectId: string): Promise<ProjectMilestone[]> {
  const { data, error } = await db()
    .from('project_milestones').select('*').eq('project_id', projectId)
    .order('position', { ascending: true }).order('created_at', { ascending: true });
  fail(error);
  return (data ?? []).map(mapMilestone);
}

export async function addMilestone(projectId: string, userId: string, title: string, description: string, position: number) {
  if (!title.trim()) throw new Error('Milestone title is required.');
  const { error } = await db().from('project_milestones').insert({
    project_id: projectId, created_by: userId, title: title.trim(),
    description: description.trim(), position,
  });
  fail(error);
}

export async function setMilestoneStatus(milestoneId: string, status: ProjectMilestone['status']) {
  const { error } = await db().from('project_milestones').update({
    status,
    completed_at: status === 'done' ? new Date().toISOString() : null,
  }).eq('id', milestoneId);
  fail(error);
}

export async function deleteMilestone(milestoneId: string) {
  const { error } = await db().from('project_milestones').delete().eq('id', milestoneId);
  fail(error);
}

/* ---------- evidence ---------- */

export async function listEvidence(projectId: string): Promise<ProjectEvidence[]> {
  const { data, error } = await db()
    .from('project_evidence').select('*').eq('project_id', projectId)
    .order('created_at', { ascending: false });
  fail(error);
  return (data ?? []).map(mapEvidence);
}

export async function addLinkEvidence(projectId: string, userId: string, kind: EvidenceKind, title: string, url: string) {
  if (!title.trim()) throw new Error('Give the evidence a title.');
  const urlErr = validateHttpUrl(url);
  if (urlErr || !url.trim()) throw new Error(urlErr ?? 'Enter a link.');
  const { error } = await db().from('project_evidence').insert({
    project_id: projectId, uploaded_by: userId, kind, title: title.trim(), url: url.trim(),
  });
  fail(error);
}

/** Uploads to the private bucket, then records the evidence row. Removes the file if the row fails. */
export async function addFileEvidence(projectId: string, userId: string, kind: EvidenceKind, title: string, file: File) {
  if (!title.trim()) throw new Error('Give the evidence a title.');
  const fileErr = validateEvidenceFile(file);
  if (fileErr) throw new Error(fileErr);
  const sb = db();
  const path = `${userId}/${projectId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: upErr } = await sb.storage.from('project-evidence').upload(path, file, {
    contentType: file.type, upsert: false,
  });
  fail(upErr);
  const { error } = await sb.from('project_evidence').insert({
    project_id: projectId, uploaded_by: userId, kind, title: title.trim(),
    storage_path: path, mime_type: file.type, size_bytes: file.size,
  });
  if (error) {
    await sb.storage.from('project-evidence').remove([path]);
    fail(error);
  }
}

export async function deleteEvidence(evidence: ProjectEvidence) {
  const sb = db();
  const { error } = await sb.from('project_evidence').delete().eq('id', evidence.id);
  fail(error);
  if (evidence.storagePath) {
    await sb.storage.from('project-evidence').remove([evidence.storagePath]);
  }
}

/** Short-lived link to a private file. Only the uploader and reviewers can open it. */
export async function getEvidenceFileUrl(storagePath: string): Promise<string> {
  const { data, error } = await db().storage.from('project-evidence').createSignedUrl(storagePath, 300);
  fail(error);
  if (!data) throw new Error('Could not create a link to the file.');
  return data.signedUrl;
}

/* ---------- skills (Developer DNA / Skill Passport) ---------- */

const SKILL_SELECT = '*, skill_evidence(id, project_id, evidence_id, note, projects(title))';

export async function listSkills(userId: string): Promise<SkillEntry[]> {
  const { data, error } = await db()
    .from('skill_entries').select(SKILL_SELECT).eq('user_id', userId).order('name', { ascending: true });
  fail(error);
  return (data ?? []).map(mapSkill);
}

export async function upsertSkill(userId: string, name: string, proficiency: Proficiency, isLearningGoal: boolean, id?: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Skill name is required.');
  if (trimmed.length > 60) throw new Error('Keep skill names under 60 characters.');
  const payload = { name: trimmed, proficiency, is_learning_goal: isLearningGoal, updated_at: new Date().toISOString() };
  if (id) {
    // Changing a skill's name or level resets verification, so it must be reviewed again.
    const { error } = await db().from('skill_entries').update({ ...payload, verification_status: 'self_reported', verified_by: null, verified_at: null }).eq('id', id).eq('user_id', userId);
    fail(error);
  } else {
    const { error } = await db().from('skill_entries').insert({ ...payload, user_id: userId });
    fail(error);
  }
}

export async function deleteSkill(skillId: string, userId: string) {
  const { error } = await db().from('skill_entries').delete().eq('id', skillId).eq('user_id', userId);
  fail(error);
}

export async function linkSkillToEvidence(skillId: string, projectId: string, note: string) {
  const { error } = await db().from('skill_evidence').insert({ skill_id: skillId, project_id: projectId, note: note.trim() });
  fail(error);
}

export async function unlinkSkillEvidence(linkId: string) {
  const { error } = await db().from('skill_evidence').delete().eq('id', linkId);
  fail(error);
}

/* ---------- achievements ---------- */

export async function listAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await db()
    .from('achievements').select('*').eq('user_id', userId).order('issued_on', { ascending: false, nullsFirst: false });
  fail(error);
  return (data ?? []).map(mapAchievement);
}

export async function addAchievement(userId: string, title: string, issuer: string, issuedOn: string, credentialUrl: string) {
  if (!title.trim()) throw new Error('Achievement title is required.');
  const urlErr = validateHttpUrl(credentialUrl);
  if (urlErr) throw new Error(urlErr);
  const { error } = await db().from('achievements').insert({
    user_id: userId, title: title.trim(), issuer: issuer.trim(),
    issued_on: issuedOn || null, credential_url: credentialUrl.trim() || null,
  });
  fail(error);
}

export async function deleteAchievement(id: string, userId: string) {
  const { error } = await db().from('achievements').delete().eq('id', id).eq('user_id', userId);
  fail(error);
}

/* ---------- verification workflow ---------- */

export type ReviewTargetType = 'project' | 'evidence' | 'skill' | 'achievement';

export async function requestReview(targetType: ReviewTargetType, targetId: string) {
  const { error } = await db().rpc('request_review', { p_target_type: targetType, p_target_id: targetId });
  fail(error);
}

export async function submitReviewDecision(
  targetType: ReviewTargetType, targetId: string,
  decision: 'verified' | 'needs_review' | 'rejected', note: string,
) {
  const { error } = await db().rpc('review_verification', {
    p_target_type: targetType, p_target_id: targetId, p_decision: decision, p_note: note.trim(),
  });
  fail(error);
}

/** Everything waiting for a reviewer. Only works for admins and moderators (RLS + RPC checks). */
export async function listPendingReviews(): Promise<ReviewItem[]> {
  const sb = db();
  const [projects, evidence, skills, achievements] = await Promise.all([
    sb.from('projects').select('id, title, updated_at, owner_id, profiles!projects_owner_id_fkey(full_name)')
      .eq('verification_status', 'pending_review'),
    sb.from('project_evidence').select('id, title, kind, url, created_at, uploaded_by, profiles!project_evidence_uploaded_by_fkey(full_name)')
      .eq('verification_status', 'pending_review'),
    sb.from('skill_entries').select('id, name, proficiency, updated_at, user_id, profiles!skill_entries_user_id_fkey(full_name)')
      .eq('verification_status', 'pending_review'),
    sb.from('achievements').select('id, title, issuer, created_at, user_id, profiles!achievements_user_id_fkey(full_name)')
      .eq('verification_status', 'pending_review'),
  ]);
  fail(projects.error); fail(evidence.error); fail(skills.error); fail(achievements.error);

  const items: ReviewItem[] = [
    ...(projects.data ?? []).map((r: Row) => ({
      targetType: 'project' as const, targetId: r.id, label: r.title,
      ownerName: r.profiles?.full_name || 'Student', detail: 'Project', submittedAt: r.updated_at,
    })),
    ...(evidence.data ?? []).map((r: Row) => ({
      targetType: 'evidence' as const, targetId: r.id, label: r.title,
      ownerName: r.profiles?.full_name || 'Student', detail: `Evidence (${r.kind})`,
      submittedAt: r.created_at, url: r.url ?? null,
    })),
    ...(skills.data ?? []).map((r: Row) => ({
      targetType: 'skill' as const, targetId: r.id, label: r.name,
      ownerName: r.profiles?.full_name || 'Student', detail: `Skill (${r.proficiency})`, submittedAt: r.updated_at,
    })),
    ...(achievements.data ?? []).map((r: Row) => ({
      targetType: 'achievement' as const, targetId: r.id, label: r.title,
      ownerName: r.profiles?.full_name || 'Student', detail: `Achievement${r.issuer ? ` from ${r.issuer}` : ''}`,
      submittedAt: r.created_at,
    })),
  ];
  return items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/* ---------- team invitations and Team Finder ---------- */

export interface InvitationRow {
  id: string;
  projectId: string;
  projectTitle: string;
  invitedUserId: string;
  invitedUserName: string;
  invitedBy: string;
  role: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

function mapInvitation(r: Row): InvitationRow {
  return {
    id: r.id,
    projectId: r.project_id,
    projectTitle: r.projects?.title ?? 'Project',
    invitedUserId: r.invited_user_id,
    invitedUserName: r.invitee?.full_name ?? 'Student',
    invitedBy: r.invited_by,
    role: r.role,
    message: r.message ?? '',
    status: r.status,
    createdAt: r.created_at,
  };
}

/** Pending invitations addressed to the signed-in user. */
export async function listIncomingInvitations(userId: string): Promise<InvitationRow[]> {
  const { data, error } = await db()
    .from('project_invitations')
    .select('*, projects(title)')
    .eq('invited_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  fail(error);
  return (data ?? []).map(mapInvitation);
}

/** Invitations the signed-in user has sent for a project they own. */
export async function listSentInvitations(projectId: string): Promise<InvitationRow[]> {
  const { data, error } = await db()
    .from('project_invitations')
    .select('*, projects(title), invitee:profiles!project_invitations_invited_user_id_fkey(full_name)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  fail(error);
  return (data ?? []).map(mapInvitation);
}

export async function sendInvitation(projectId: string, invitedUserId: string, invitedBy: string, role: string, message: string) {
  if (!role.trim()) throw new Error('Choose a role for this person.');
  if (message.length > 500) throw new Error('Keep the message under 500 characters.');
  const { error } = await db().from('project_invitations').insert({
    project_id: projectId, invited_user_id: invitedUserId, invited_by: invitedBy,
    role: role.trim(), message: message.trim(),
  });
  if (error) {
    if (error.message.includes('duplicate key')) throw new Error('This person already has a pending invitation to this project.');
    throw new Error(error.message);
  }
}

export async function respondToInvitation(invitationId: string, accept: boolean) {
  const { error } = await db().rpc('respond_to_invitation', { p_invitation: invitationId, p_accept: accept });
  fail(error);
}

export async function cancelInvitation(invitationId: string) {
  const { error } = await db().rpc('cancel_invitation', { p_invitation: invitationId });
  fail(error);
}

export interface CandidateProfile {
  userId: string;
  name: string;
  branch: string;
  college: string;
  academicYear: string;
  avatarUrl: string;
  interests: string[];
  skills: { name: string; verified: boolean; proficiency: string; isLearningGoal: boolean }[];
}

/** Students who allow being found, with their Skill Passport entries. RLS hides private profiles. */
export async function listCandidates(excludeUserId: string): Promise<CandidateProfile[]> {
  const sb = db();
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('id, full_name, branch, college, academic_year, avatar_url, interests, profile_visibility')
    .neq('id', excludeUserId)
    .neq('profile_visibility', 'private')
    .limit(200);
  fail(error);
  const rows = profiles ?? [];
  if (rows.length === 0) return [];

  const ids = rows.map((p: Row) => p.id as string);
  const { data: skills, error: sErr } = await sb
    .from('skill_entries')
    .select('user_id, name, verification_status, proficiency, is_learning_goal')
    .in('user_id', ids);
  fail(sErr);

  const byUser = new Map<string, CandidateProfile['skills']>();
  for (const s of skills ?? []) {
    const list = byUser.get(s.user_id) ?? [];
    list.push({
      name: s.name, verified: s.verification_status === 'verified',
      proficiency: s.proficiency, isLearningGoal: !!s.is_learning_goal,
    });
    byUser.set(s.user_id, list);
  }

  return rows.map((p: Row) => ({
    userId: p.id,
    name: p.full_name || 'Student',
    branch: p.branch ?? '',
    college: p.college ?? '',
    academicYear: p.academic_year ?? '',
    avatarUrl: p.avatar_url ?? '',
    interests: p.interests ?? [],
    skills: byUser.get(p.id) ?? [],
  }));
}
