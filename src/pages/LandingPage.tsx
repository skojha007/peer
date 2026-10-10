import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FolderKanban,
  Code2,
  Coins,
  BadgeCheck,
  UsersRound,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F3F7EA] text-[#1D3024] flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#DCE6D2] bg-[#FAFCF5]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#26783C] to-[#173D2A] flex items-center justify-center text-[#EFC66B] shadow-subtle">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-[#173D2A]">PeerCraft</div>
            <div className="text-[10px] text-[#687769] font-medium -mt-1">
              Build • Collaborate • Grow
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold text-[#173D2A] hover:text-[#26783C] transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
          >
            Get Started (+1,000 Credits)
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center space-y-6 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-bold border border-[#DCE6D2]">
          <span className="w-2 h-2 rounded-full bg-[#26783C] animate-pulse" />
          The Modern Campus Collaboration & Developer Growth Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#173D2A] tracking-tight max-w-4xl leading-tight">
          Where College Developers{' '}
          <span className="text-[#26783C] underline decoration-[#EFC66B] decoration-4 underline-offset-8">
            Build, Collaborate & Grow
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#687769] max-w-2xl leading-relaxed mx-auto">
          Create multidisciplinary project teams, earn platform credits through verified GitHub and LeetCode activity, unlock curated coding links, and establish your verified skill passport.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <Link
            to="/signup"
            className="px-6 py-3.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-sm font-extrabold rounded-btn transition-all shadow-card flex items-center gap-2 hover:scale-102"
          >
            <span>Claim 1,000 Signup Credits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/dashboard"
            className="px-6 py-3.5 bg-[#FAFCF5] hover:bg-[#EEF4E3] border border-[#DCE6D2] text-[#173D2A] text-sm font-bold rounded-btn transition-colors shadow-subtle"
          >
            Explore Interactive Demo
          </Link>
        </div>

        {/* Feature Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-16 text-left w-full">
          <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#EAF1DC] text-[#26783C] flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#173D2A]">Active Project Workspace</h3>
            <p className="text-xs text-[#687769] leading-relaxed">
              Track enrolled team milestones, manage contributors, and log verified deliverables.
            </p>
          </div>

          <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#EAF1DC] text-[#EFC66B] flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#173D2A]">Verified Credit Economy</h3>
            <p className="text-xs text-[#687769] leading-relaxed">
              Earn Campus Credits for qualifying pull requests and solved challenges on LeetCode.
            </p>
          </div>

          <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#EAF1DC] text-[#26783C] flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#173D2A]">Curated Coding Arena</h3>
            <p className="text-xs text-[#687769] leading-relaxed">
              Discover free practice links or unlock curated premium question links for 100 credits.
            </p>
          </div>

          <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#EAF1DC] text-[#26783C] flex items-center justify-center">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#173D2A]">Verified Skill Passport</h3>
            <p className="text-xs text-[#687769] leading-relaxed">
              Showcase tamper-proof technical proficiencies and verified peer reputation scores.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DCE6D2] bg-[#FAFCF5] px-6 py-6 text-center text-xs text-[#687769]">
        <div className="font-bold text-[#173D2A]">PeerCraft — Build • Collaborate • Grow</div>
        <p className="mt-1">
          Designed for college students, engineering clubs, and hackathon teams.
        </p>
      </footer>
    </div>
  );
};
