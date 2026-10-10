import React, { useState } from 'react';
import {
  UserRound,
  Edit3,
  ShieldCheck,
  Star,
  ExternalLink,
  Code2,
  FolderKanban,
  CheckCircle2,
  Save,
  Globe,
  Lock,
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

export const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile, projects } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [bio, setBio] = useState(currentUser.bio);
  const [branch, setBranch] = useState(currentUser.branch);
  const [academicYear, setAcademicYear] = useState(currentUser.academicYear);
  const [college, setCollege] = useState(currentUser.college);
  const [githubUrl, setGithubUrl] = useState(currentUser.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.linkedinUrl || '');
  const [leetcodeUrl, setLeetcodeUrl] = useState(currentUser.leetcodeUrl || '');
  const [hackerrankUrl, setHackerrankUrl] = useState(currentUser.hackerrankUrl || '');
  const [profileVisibility, setProfileVisibility] = useState(currentUser.profileVisibility);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const enrolledProjects = projects.filter((p) => p.isUserEnrolled);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      firstName: fullName.split(' ')[0],
      bio,
      branch,
      academicYear,
      college,
      githubUrl,
      linkedinUrl,
      leetcodeUrl,
      hackerrankUrl,
      profileVisibility,
    });
    setIsEditing(false);
    setToastMsg('Profile updated successfully!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="bg-[#26783C] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
            <UserRound className="w-3.5 h-3.5 text-[#26783C]" />
            Student Identity
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-[#687769] mt-1">
            Manage your academic credentials, verified platform links, and project portfolio.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors w-fit shadow-xs"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
        </button>
      </div>

      {isEditing ? (
        /* Edit Form */
        <form
          onSubmit={handleSave}
          className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4 text-xs"
        >
          <h2 className="font-bold text-sm text-[#173D2A] border-b border-[#DCE6D2] pb-2">
            Edit Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">College / University</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Academic Branch</label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Year of Study</label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#173D2A] mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
            />
          </div>

          <h3 className="font-bold text-sm text-[#173D2A] pt-3 border-t border-[#DCE6D2]">
            Developer Profile URLs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">LeetCode URL</label>
              <input
                type="url"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">HackerRank URL</label>
              <input
                type="url"
                value={hackerrankUrl}
                onChange={(e) => setHackerrankUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#DCE6D2] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Read View */
        <div className="space-y-6">
          {/* Main Profile Info Banner */}
          <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#26783C]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#173D2A]">{currentUser.fullName}</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#26783C]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <div className="text-xs text-[#687769] mt-0.5">
                  {currentUser.branch} • {currentUser.academicYear}
                </div>
                <div className="text-xs text-[#26783C] font-semibold mt-0.5">
                  {currentUser.college}
                </div>
                <p className="text-xs text-[#1D3024] mt-2 max-w-xl">{currentUser.bio}</p>
              </div>
            </div>

            <div className="bg-[#EAF1DC] p-4 rounded-xl border border-[#DCE6D2] text-center min-w-[180px]">
              <div className="text-[11px] uppercase font-bold text-[#687769] tracking-wider">
                Peer Reputation
              </div>
              <div className="text-3xl font-black text-[#173D2A] mt-1 flex items-center justify-center gap-1">
                <Star className="w-6 h-6 fill-[#EFC66B] text-[#EFC66B]" />
                <span>{currentUser.reputation}</span>
                <span className="text-xs text-[#687769] font-normal">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Connected Developer Accounts */}
          <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-[#173D2A]">Connected Developer Platforms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {currentUser.githubUrl && (
                <a
                  href={currentUser.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#EAF1DC]/50 border border-[#DCE6D2] hover:bg-[#EAF1DC] transition-colors flex items-center justify-between text-xs font-semibold text-[#173D2A]"
                >
                  <div className="flex items-center gap-2">
                    <GithubIcon />
                    <span>GitHub Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#687769]" />
                </a>
              )}

              {currentUser.linkedinUrl && (
                <a
                  href={currentUser.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#EAF1DC]/50 border border-[#DCE6D2] hover:bg-[#EAF1DC] transition-colors flex items-center justify-between text-xs font-semibold text-[#173D2A]"
                >
                  <div className="flex items-center gap-2">
                    <LinkedinIcon />
                    <span>LinkedIn Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#687769]" />
                </a>
              )}

              {currentUser.leetcodeUrl && (
                <a
                  href={currentUser.leetcodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#EAF1DC]/50 border border-[#DCE6D2] hover:bg-[#EAF1DC] transition-colors flex items-center justify-between text-xs font-semibold text-[#173D2A]"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#FFA116]" />
                    <span>LeetCode Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#687769]" />
                </a>
              )}

              {currentUser.hackerrankUrl && (
                <a
                  href={currentUser.hackerrankUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#EAF1DC]/50 border border-[#DCE6D2] hover:bg-[#EAF1DC] transition-colors flex items-center justify-between text-xs font-semibold text-[#173D2A]"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#2EC866]" />
                    <span>HackerRank Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#687769]" />
                </a>
              )}
            </div>
          </div>

          {/* Active Projects in Profile */}
          <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-[#173D2A]">Active Project Contributions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {enrolledProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-[#EAF1DC]/40 border border-[#DCE6D2] text-xs space-y-2"
                >
                  <div className="font-bold text-[#173D2A] text-sm">{p.title}</div>
                  <div className="text-[11px] text-[#26783C] font-semibold">{p.userRole}</div>
                  <p className="text-[#687769] line-clamp-2">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
