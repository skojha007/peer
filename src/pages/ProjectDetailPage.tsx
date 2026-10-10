import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  ArrowLeft,
  Users,
  CheckCircle2,
  Circle,
  ExternalLink,
  GitBranch,
  Calendar,
  Share2,
  UserPlus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, currentUser, joinProject } = useApp();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === id) || projects[0];

  const [milestones, setMilestones] = useState([
    { id: 'm1', title: 'System Architecture & Database Schema Design', done: true },
    { id: 'm2', title: 'Core API Endpoints & Auth Integration', done: true },
    { id: 'm3', title: 'Frontend UI Components & State Management', done: project.progress > 50 },
    { id: 'm4', title: 'Campus Beta Deployment & Field Testing', done: false },
    { id: 'm5', title: 'Performance Optimization & Final Documentation', done: false },
  ]);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const toggleMilestone = (milestoneId: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m))
    );
  };

  const isEnrolled = project.members.some((m) => m.userId === currentUser.id);

  const handleJoin = () => {
    joinProject(project.id, 'Contributor');
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteModalOpen(false);
    setInviteStatus('Invitation sent to campus teammate!');
    setTimeout(() => setInviteStatus(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {inviteStatus && (
        <div className="bg-[#26783C] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between">
          <span>{inviteStatus}</span>
          <button onClick={() => setInviteStatus(null)}>✕</button>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#26783C] hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Workspace
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#26783C] bg-[#EAF1DC] px-2.5 py-0.5 rounded-full">
                {project.category}
              </span>
              <span className="text-xs text-[#687769] font-medium">Status: {project.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
              {project.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isEnrolled ? (
              <button
                onClick={handleJoin}
                className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
              >
                Join Project Team
              </button>
            ) : (
              <button
                onClick={() => setInviteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#173D2A] hover:bg-[#102B20] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
              >
                <UserPlus className="w-4 h-4 text-[#EFC66B]" />
                <span>Invite Teammate</span>
              </button>
            )}

            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#DCE6D2] hover:bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold rounded-btn transition-colors"
              >
                <GitBranch className="w-4 h-4 text-[#26783C]" />
                <span>Repository</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Overview, Milestones, Activity (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Overview */}
          <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-[#173D2A]">Project Overview</h2>
            <p className="text-xs sm:text-sm text-[#687769] leading-relaxed">
              {project.description}
            </p>

            <div>
              <div className="text-xs font-bold text-[#173D2A] mb-2">Technologies & Architecture</div>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-[#EAF1DC] text-[#173D2A] font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#173D2A] mb-2">Required Core Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded border border-[#DCE6D2] bg-[#FAFCF5] text-[#687769]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks & Milestones */}
          <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#173D2A]">Milestones & Deliverables</h2>
                <p className="text-xs text-[#687769]">Check off deliverables as tasks complete.</p>
              </div>
              <span className="text-xs font-bold text-[#26783C] bg-[#EAF1DC] px-2.5 py-1 rounded-full">
                {milestones.filter((m) => m.done).length} / {milestones.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => toggleMilestone(milestone.id)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    milestone.done
                      ? 'bg-[#EAF1DC]/70 border-[#DCE6D2] text-[#173D2A]'
                      : 'bg-[#FAFCF5] hover:bg-[#EEF4E3] border-[#DCE6D2] text-[#687769]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {milestone.done ? (
                      <CheckCircle2 className="w-4 h-4 text-[#26783C] flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#A2BA95] flex-shrink-0" />
                    )}
                    <span className={milestone.done ? 'line-through text-[#687769]' : 'font-medium'}>
                      {milestone.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A2BA95] flex-shrink-0">
                    {milestone.done ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Team Directory, Details (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Team Directory */}
          <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#173D2A] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#26783C]" />
                Team Directory
              </h2>
              <span className="text-xs text-[#687769]">
                {project.memberCount} / {project.maxMembers}
              </span>
            </div>

            <div className="space-y-3">
              {project.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#EAF1DC]/50 border border-[#DCE6D2]"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#26783C]/30"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#173D2A]">{member.name}</div>
                      <div className="text-[10px] text-[#687769]">{member.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#A2BA95]">Joined {member.joinedAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Meta Details */}
          <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-3 text-xs">
            <h3 className="font-bold text-sm text-[#173D2A]">Initiative Meta</h3>
            <div className="space-y-2 text-[#687769]">
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="font-semibold text-[#173D2A]">{project.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{project.lastUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Enrolled Role:</span>
                <span className="font-bold text-[#26783C]">
                  {project.userRole || (isEnrolled ? 'Team Member' : 'Not Enrolled')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#26783C]" />
                Invite Campus Student
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  Student Campus Email or Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. priya.patel@campus.edu"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Proposed Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Specialist"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
