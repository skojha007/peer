import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';

export const SignupPage: React.FC = () => {
  const { switchUser, availableCredits, signupBonusAmount } = useApp();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('National Institute of Technology');
  const [branch, setBranch] = useState('Computer Science Engineering');
  const [academicYear, setAcademicYear] = useState('Third Year');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [hackerrankUrl, setHackerrankUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!termsAccepted) {
      setErrorMsg('Please accept the campus community terms and conditions.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Create new user profile with 1,000 starting credits
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        fullName,
        firstName: fullName.split(' ')[0],
        email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        college,
        branch,
        academicYear,
        bio: 'Enthusiastic campus developer ready to build and collaborate.',
        role: 'student',
        reputation: 5.0,
        profileVisibility: 'public',
        interests: ['Full-Stack', 'Algorithms', 'Collaboration'],
        skills: [
          { name: 'JavaScript', proficiency: 'Intermediate', verified: true },
          { name: 'Git', proficiency: 'Intermediate', verified: true },
        ],
        githubUrl: githubUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        leetcodeUrl: leetcodeUrl || undefined,
        hackerrankUrl: hackerrankUrl || undefined,
        completedProjectsCount: 0,
        signupBonusAwarded: true,
        createdAt: new Date().toISOString(),
      };

      // Set user and award signup credits atomically
      switchUser(newUser);

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26783C', '#EFC66B', '#E4EDCF', '#173D2A'],
      });

      setShowRewardModal(true);
    }, 800);
  };

  const handleExplorePlatform = () => {
    setShowRewardModal(false);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F3F7EA] text-[#1D3024] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-card p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#26783C] to-[#173D2A] text-[#EFC66B] flex items-center justify-center mx-auto shadow-subtle">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-[#173D2A] tracking-tight">
            Create Your PeerCraft Account
          </h1>
          <p className="text-xs text-[#687769]">
            Join your college engineering cohort & claim your 1,000 Campus Credits reward.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#D94A4A]/10 border border-[#D94A4A]/30 text-[#D94A4A] p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-[#173D2A] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aryan Sharma"
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#173D2A] mb-1">College Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aryan.sharma@campus.edu"
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-[#173D2A] mb-1">College / University</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#173D2A] mb-1">Academic Branch</label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Computer Science Engineering"
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#173D2A] mb-1">Year of Study</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
            >
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Final Year">Final Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-[#173D2A] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-3 pr-8 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687769]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#173D2A] mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-[#DCE6D2]">
            <div className="text-[11px] font-bold text-[#173D2A]">
              Optional Developer Profiles (Can link later in Earn Credits)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="GitHub Profile URL"
                className="px-2.5 py-1.5 bg-[#EAF1DC]/40 border border-[#DCE6D2] rounded text-[#1D3024] outline-none"
              />
              <input
                type="url"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
                placeholder="LeetCode Profile URL"
                className="px-2.5 py-1.5 bg-[#EAF1DC]/40 border border-[#DCE6D2] rounded text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 text-[#26783C]"
            />
            <span className="text-[11px] text-[#687769]">
              I agree to the PeerCraft Code of Conduct, Academic Integrity Guidelines, and Campus Terms of Service.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#26783C] hover:bg-[#1C622F] disabled:opacity-50 text-white font-bold rounded-btn transition-colors shadow-xs text-xs"
          >
            {isLoading ? 'Creating Account & Verifying Bonus...' : 'Register & Claim 1,000 Credits'}
          </button>
        </form>

        <div className="text-center text-xs text-[#687769]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#26783C] hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Mandatory Welcome Reward Modal from Section 5 */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border-2 border-[#26783C] p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#E4EDCF] text-[#26783C] flex items-center justify-center mx-auto shadow-subtle border border-[#26783C]/30">
              <Coins className="w-8 h-8 text-[#EFC66B] fill-[#EFC66B] animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#173D2A] tracking-tight">
                Welcome to PeerCraft!
              </h2>
              <p className="text-sm font-medium text-[#26783C] leading-relaxed">
                "You've received {signupBonusAmount.toLocaleString()} credits to start building your campus journey."
              </p>
              <p className="text-xs text-[#687769]">
                These credits have been added to your wallet ledger. You can use them to unlock curated premium coding question links or collaborate on projects.
              </p>
            </div>

            <div className="p-3 bg-[#EAF1DC] rounded-xl text-xs text-[#173D2A] font-semibold flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#26783C]" />
              <span>Available Wallet Balance: {signupBonusAmount} Credits</span>
            </div>

            <button
              onClick={handleExplorePlatform}
              className="w-full py-3 bg-[#26783C] hover:bg-[#1C622F] text-white font-extrabold text-sm rounded-btn transition-colors shadow-card flex items-center justify-center gap-2"
            >
              <span>Explore PeerCraft</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
