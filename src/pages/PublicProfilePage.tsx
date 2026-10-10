import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const GithubIcon = () => (
  <svg className="w-4 h-4 fill-current text-[#173D2A]" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-4 h-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { allUsers, currentUser } = useApp();

  const user = allUsers.find((u) => u.id === id) || currentUser;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link
        to="/team-finder"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#26783C] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Team Finder
      </Link>

      {/* Main Profile Header */}
      <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#26783C]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#173D2A]">{user.fullName}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#26783C]">
                <ShieldCheck className="w-3.5 h-3.5" /> Campus Verified
              </span>
            </div>
            <div className="text-xs text-[#687769] mt-0.5">
              {user.branch} • {user.academicYear} • {user.college}
            </div>
            <p className="text-xs text-[#1D3024] mt-2 max-w-xl">{user.bio}</p>
          </div>
        </div>

        <div className="bg-[#EAF1DC] p-4 rounded-xl border border-[#DCE6D2] text-center min-w-[180px]">
          <div className="text-[11px] uppercase font-bold text-[#687769] tracking-wider">
            Reputation
          </div>
          <div className="text-3xl font-black text-[#173D2A] mt-1 flex items-center justify-center gap-1">
            <Star className="w-6 h-6 fill-[#EFC66B] text-[#EFC66B]" />
            <span>{user.reputation}</span>
            <span className="text-xs text-[#687769] font-normal">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-[#173D2A]">Technical Skills</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {user.skills.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#EAF1DC]/50 border border-[#DCE6D2] flex items-center justify-between text-xs"
            >
              <span className="font-bold text-[#173D2A]">{s.name}</span>
              <span className="text-[10px] text-[#26783C] font-semibold">{s.proficiency}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-[#173D2A]">Verified Developer Links</h2>
        <div className="flex flex-wrap gap-3">
          {user.githubUrl && (
            <a
              href={user.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#EAF1DC]/60 border border-[#DCE6D2] text-xs font-semibold text-[#173D2A] flex items-center gap-2 hover:bg-[#EAF1DC]"
            >
              <GithubIcon /> GitHub <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {user.linkedinUrl && (
            <a
              href={user.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#EAF1DC]/60 border border-[#DCE6D2] text-xs font-semibold text-[#173D2A] flex items-center gap-2 hover:bg-[#EAF1DC]"
            >
              <LinkedinIcon /> LinkedIn <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
