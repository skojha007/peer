import React, { useState } from 'react';
import {
  BadgeCheck,
  ShieldCheck,
  Award,
  Sparkles,
  Share2,
  FolderKanban,
  Star,
  ExternalLink,
  Code2,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SkillPassportPage: React.FC = () => {
  const { currentUser, projects } = useApp();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const completedProjects = projects.filter((p) => p.status === 'Completed' || p.isUserEnrolled);

  const achievements = [
    { title: 'Campus Innovation Grant Winner', issuer: 'NIT Innovation Cell', date: 'Sep 2026', verified: true },
    { title: 'LeetCode 100+ Algorithmic Problems Solved', issuer: 'LeetCode Platform Integration', date: 'Oct 2026', verified: true },
    { title: 'HackCampus Semi-Finalist', issuer: 'Tech Fest Committee', date: 'Aug 2026', verified: true },
    { title: 'Active Peer Mentor (5 Endorsements)', issuer: 'PeerCraft Campus Network', date: 'Sep 2026', verified: true },
  ];

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/users/${currentUser.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
            <BadgeCheck className="w-3.5 h-3.5 text-[#26783C]" />
            Verified Developer Credential
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
            Skill Passport
          </h1>
          <p className="text-sm text-[#687769] mt-1">
            Tamper-proof portfolio of verified developer activities, project milestones, and peer reputation.
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#173D2A] hover:bg-[#102B20] text-white text-xs font-bold rounded-btn transition-colors w-fit shadow-xs"
        >
          <Share2 className="w-4 h-4 text-[#EFC66B]" />
          <span>Share Public Passport</span>
        </button>
      </div>

      {/* Top Identity & Reputation Banner */}
      <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#26783C]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#173D2A]">{currentUser.fullName}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#26783C]">
                <ShieldCheck className="w-3.5 h-3.5" /> Campus Verified
              </span>
            </div>
            <div className="text-xs text-[#687769] mt-0.5">
              {currentUser.branch} • {currentUser.academicYear} • {currentUser.college}
            </div>
            <p className="text-xs text-[#1D3024] mt-2 max-w-xl">{currentUser.bio}</p>
          </div>
        </div>

        {/* Reputation Score Card */}
        <div className="bg-[#EAF1DC] p-4 rounded-xl border border-[#DCE6D2] min-w-[200px] text-center">
          <div className="text-[11px] uppercase font-bold text-[#687769] tracking-wider">
            Reputation Score
          </div>
          <div className="text-3xl font-black text-[#173D2A] mt-1 flex items-center justify-center gap-1">
            <Star className="w-6 h-6 fill-[#EFC66B] text-[#EFC66B]" />
            <span>{currentUser.reputation}</span>
            <span className="text-xs text-[#687769] font-normal">/ 5.0</span>
          </div>
          <div className="text-[10px] text-[#26783C] font-semibold mt-1">
            Based on 14 verified project reviews
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#173D2A]">Technical Competencies</h2>
            <p className="text-xs text-[#687769]">
              Distinguishing independently verified achievements from self-reported skills.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#687769]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#26783C]" /> Verified
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DCE6D2]" /> Self-Reported
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {currentUser.skills.map((skill, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-colors ${
                skill.verified
                  ? 'bg-[#EAF1DC]/50 border-[#DCE6D2]'
                  : 'bg-[#FAFCF5] border-[#DCE6D2]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-[#173D2A]">{skill.name}</span>
                {skill.verified ? (
                  <span className="text-[10px] font-bold text-[#26783C] bg-[#E4EDCF] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-[#687769] bg-[#EAF1DC] px-2 py-0.5 rounded-full">
                    Self-Reported
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#687769]">
                <span>Proficiency:</span>
                <span className="font-semibold text-[#173D2A]">{skill.proficiency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Achievements & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#173D2A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#26783C]" />
              Verified Achievements
            </h2>
            <span className="text-xs text-[#26783C] font-semibold">4 Verified</span>
          </div>

          <div className="space-y-3">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#EAF1DC]/40 border border-[#DCE6D2] flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#173D2A] flex items-center gap-1.5">
                    {ach.title}
                    <ShieldCheck className="w-3.5 h-3.5 text-[#26783C]" />
                  </div>
                  <div className="text-[11px] text-[#687769] mt-0.5">
                    Issued by: {ach.issuer}
                  </div>
                </div>
                <span className="text-[10px] text-[#A2BA95] whitespace-nowrap">{ach.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled & Completed Projects in Passport */}
        <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#173D2A] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#26783C]" />
              Project Portfolio
            </h2>
            <span className="text-xs text-[#26783C] font-semibold">
              {completedProjects.length} Initiatives
            </span>
          </div>

          <div className="space-y-3">
            {completedProjects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                className="p-3 rounded-xl bg-[#EAF1DC]/40 border border-[#DCE6D2] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#173D2A]">{proj.title}</div>
                  <div className="text-[11px] text-[#687769]">
                    Role: {proj.userRole || 'Lead'} • {proj.category}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#26783C] bg-[#E4EDCF] px-2 py-0.5 rounded">
                  {proj.progress}% Done
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Passport Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#26783C]" />
                Share Public Skill Passport
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#687769] leading-relaxed">
              Anyone with this link can view your verified campus achievements, reputation score, and project contributions.
            </p>

            <div className="p-2.5 bg-[#EAF1DC] rounded-xl flex items-center justify-between gap-2 text-xs font-mono">
              <span className="truncate text-[#173D2A]">
                {window.location.origin}/users/{currentUser.id}
              </span>
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1 bg-[#26783C] hover:bg-[#1C622F] text-white rounded font-sans text-xs font-semibold flex items-center gap-1 flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
