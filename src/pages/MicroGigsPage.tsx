import React, { useState } from 'react';
import {
  BriefcaseBusiness,
  Plus,
  Coins,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Send,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MicroGig } from '../types';

export const MicroGigsPage: React.FC = () => {
  const { microGigs, applyToGig, createGig, availableCredits } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [applyGig, setApplyGig] = useState<MicroGig | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [proposalNote, setProposalNote] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New gig form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Frontend Design');
  const [newSkills, setNewSkills] = useState('React, Tailwind CSS');
  const [newReward, setNewReward] = useState(250);
  const [newDeadline, setNewDeadline] = useState('Oct 30, 2026');

  const categories = ['All', 'Frontend Design', 'Data Science', 'Frontend Bugfix', 'Documentation'];

  const filteredGigs = microGigs.filter((g) => {
    if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !g.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !g.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleConfirmApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyGig) return;

    applyToGig(applyGig.id);
    setApplyGig(null);
    setProposalNote('');
    setToastMsg(`Application submitted for "${applyGig.title}"!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePostGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    createGig({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      requiredSkills: newSkills.split(',').map((s) => s.trim()).filter(Boolean),
      deadline: newDeadline,
      rewardCredits: newReward,
    });

    setShowPostModal(false);
    setNewTitle('');
    setNewDescription('');
    setToastMsg('Campus Micro-Gig published successfully!');
    setTimeout(() => setToastMsg(null), 3500);
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
            <BriefcaseBusiness className="w-3.5 h-3.5 text-[#26783C]" />
            Peer Project Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
            Campus Micro-Gigs
          </h1>
          <p className="text-sm text-[#687769] mt-1">
            Solve discrete technical tasks for campus clubs and peer teams to earn Campus Credits.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors w-fit shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Micro-Gig</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gigs, skills, deliverables..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#EAF1DC]/50 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#173D2A] text-white font-bold'
                  : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gigs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGigs.map((gig) => (
          <div
            key={gig.id}
            className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF1DC] text-[#26783C]">
                  {gig.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#173D2A] bg-[#EFC66B]/25 px-2.5 py-0.5 rounded-full">
                  <Coins className="w-3.5 h-3.5 text-[#EFC66B] fill-[#EFC66B]" />
                  +{gig.rewardCredits} Credits
                </span>
              </div>

              <h3 className="font-bold text-base text-[#173D2A] group-hover:text-[#26783C] transition-colors">
                {gig.title}
              </h3>
              <p className="text-xs text-[#687769] mt-2 line-clamp-2 leading-relaxed">
                {gig.description}
              </p>

              {/* Required Skills */}
              <div className="flex flex-wrap gap-1 mt-3">
                {gig.requiredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#EAF1DC] text-[#1D3024] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCE6D2] text-xs text-[#687769] flex items-center justify-between">
                <span>By {gig.creatorName}</span>
                <span className="flex items-center gap-1 text-[#D94A4A] font-medium">
                  <Clock className="w-3 h-3" /> Due {gig.deadline}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#A2BA95]">{gig.applicantsCount} Applicants</span>
              <button
                onClick={() => setApplyGig(gig)}
                className="px-3.5 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-2xs"
              >
                Apply for Gig
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {applyGig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#26783C]" />
                Apply for Micro-Gig
              </div>
              <button
                onClick={() => setApplyGig(null)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmApply} className="space-y-3 text-xs">
              <div className="p-3 bg-[#EAF1DC] rounded-xl space-y-1">
                <div className="font-bold text-sm text-[#173D2A]">{applyGig.title}</div>
                <div className="text-[11px] text-[#26783C] font-semibold">
                  Reward: +{applyGig.rewardCredits} Campus Credits
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  Why are you a good fit? (Proposal / Approach)
                </label>
                <textarea
                  required
                  rows={3}
                  value={proposalNote}
                  onChange={(e) => setProposalNote(e.target.value)}
                  placeholder="I have built similar React components and can deliver before the deadline..."
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApplyGig(null)}
                  className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Gig Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-lg w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#26783C]" />
                Post Campus Micro-Gig
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostGig} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Gig Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Build interactive audio player component in React"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detailed requirements, deliverables, and acceptance criteria..."
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  >
                    <option value="Frontend Design">Frontend Design</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Frontend Bugfix">Frontend Bugfix</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">Credit Bounty</label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    value={newReward}
                    onChange={(e) => setNewReward(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">Required Skills</label>
                  <input
                    type="text"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="React, CSS"
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">Deadline</label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="e.g. Nov 05, 2026"
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold"
                >
                  Post Gig
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
