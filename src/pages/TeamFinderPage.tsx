import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersRound,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Send,
  Star,
  Award,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TeamFinderPage: React.FC = () => {
  const { allUsers, currentUser, projects } = useApp();

  const [projectIdea, setProjectIdea] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [inviteModalUser, setInviteModalUser] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const skillsList = ['All', 'React', 'TypeScript', 'Python', 'UI/UX Design', 'Arduino', 'SQL', 'FastAPI'];
  const branchesList = ['All', 'Computer Science Engineering', 'Electronics and Communication', 'Data Science & Artificial Intelligence'];

  const candidateUsers = allUsers.filter((u) => u.id !== currentUser.id);

  const filteredCandidates = candidateUsers.filter((u) => {
    if (selectedSkill !== 'All' && !u.skills.some((s) => s.name.toLowerCase().includes(selectedSkill.toLowerCase()))) {
      return false;
    }
    if (selectedBranch !== 'All' && u.branch !== selectedBranch) {
      return false;
    }
    return true;
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteModalUser(null);
    setFeedbackMsg('Project invitation successfully dispatched to teammate!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {feedbackMsg && (
        <div className="bg-[#26783C] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#EFC66B]" />
          Smart Skills Compatibility Matcher
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          AI Team Finder
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Find matching campus developers, designers, and domain specialists for your next initiative.
        </p>
      </div>

      {/* Project Criteria Query Box */}
      <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#173D2A] mb-1.5">
            Describe Your Project & Roles Needed
          </label>
          <div className="relative">
            <textarea
              rows={2}
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              placeholder="e.g. Building a drone delivery simulator. Need a 3rd/4th year developer experienced with Python, ROS, and embedded simulation..."
              className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none text-xs"
            />
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#173D2A]">Filter Skills:</span>
            {skillsList.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  selectedSkill === skill
                    ? 'bg-[#173D2A] text-white font-bold'
                    : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#687769]">Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 bg-[#EAF1DC]/70 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none text-xs"
            >
              {branchesList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Teammate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCandidates.map((candidate, idx) => {
          const matchPercent = idx === 0 ? 96 : idx === 1 ? 92 : 87;
          const matchExplanation =
            idx === 0
              ? 'High synergy with UI/UX architecture and modern React design systems'
              : idx === 1
              ? 'Proven track record in Embedded C & smart IoT sensor prototyping'
              : 'Advanced machine learning pipelines & Kaggle challenge experience';

          return (
            <div
              key={candidate.id}
              className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#26783C]/40"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-[#173D2A] group-hover:text-[#26783C] transition-colors">
                        {candidate.fullName}
                      </h3>
                      <div className="text-[11px] text-[#687769]">
                        {candidate.branch.split(' ')[0]} • {candidate.academicYear}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#B88718] font-bold mt-0.5">
                        <Star className="w-3 h-3 fill-[#EFC66B] text-[#EFC66B]" />
                        <span>{candidate.reputation} / 5.0 Reputation</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#26783C]">
                    {matchPercent}% Match
                  </span>
                </div>

                {/* Match explanation */}
                <div className="bg-[#EAF1DC]/60 p-2.5 rounded-xl text-[11px] text-[#173D2A] mb-3 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#EFC66B] flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{matchExplanation}</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#687769] line-clamp-2 leading-relaxed mb-3">
                  {candidate.bio}
                </p>

                {/* Skills */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-[#687769] tracking-wider">
                    Verified Competencies:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                          s.verified
                            ? 'bg-[#E4EDCF] text-[#173D2A]'
                            : 'bg-[#EAF1DC] text-[#687769]'
                        }`}
                      >
                        {s.name}
                        {s.verified && <CheckCircle2 className="w-2.5 h-2.5 text-[#26783C]" />}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[#DCE6D2] flex items-center justify-between gap-2">
                <Link
                  to={`/users/${candidate.id}`}
                  className="px-3 py-1.5 border border-[#DCE6D2] hover:bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold rounded-btn transition-colors"
                >
                  View Profile
                </Link>

                <button
                  onClick={() => setInviteModalUser(candidate.fullName)}
                  className="px-3.5 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-2xs"
                >
                  Invite to Project
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {inviteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#26783C]" />
                Invite {inviteModalUser}
              </div>
              <button
                onClick={() => setInviteModalUser(null)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Proposed Role</label>
                <input
                  type="text"
                  required
                  defaultValue="Full-Stack Engineer"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Personal Note</label>
                <textarea
                  rows={2}
                  placeholder="Hey, we are building this project and your skill set is a great fit..."
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalUser(null)}
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
