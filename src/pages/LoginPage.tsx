import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initialUser, adminUser } from '../data/mockData';

export const LoginPage: React.FC = () => {
  const { switchUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('aryan.sharma@campus.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email.includes('admin') || email.includes('ananya')) {
        switchUser(adminUser);
      } else {
        switchUser(initialUser);
      }
      navigate('/dashboard');
    }, 500);
  };

  const handleQuickDemoLogin = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      switchUser(adminUser);
    } else {
      switchUser(initialUser);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F3F7EA] text-[#1D3024] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-card p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#26783C] to-[#173D2A] text-[#EFC66B] flex items-center justify-center mx-auto shadow-subtle">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-[#173D2A] tracking-tight">
            Sign In to PeerCraft
          </h1>
          <p className="text-xs text-[#687769]">
            Access your campus projects, credits wallet, and team workspaces.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-[#D94A4A]/10 border border-[#D94A4A]/30 text-[#D94A4A] p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Evaluation Buttons */}
        <div className="p-3 bg-[#EAF1DC] rounded-xl border border-[#DCE6D2] space-y-2 text-xs">
          <div className="font-bold text-[#173D2A] text-[11px] uppercase tracking-wider">
            Quick Persona Switch (Evaluation Mode)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="p-2 rounded-lg bg-[#FAFCF5] hover:bg-white border border-[#DCE6D2] text-left transition-colors"
            >
              <div className="font-bold text-[#173D2A] text-[11px]">Aryan Sharma</div>
              <div className="text-[10px] text-[#26783C]">Student Lead (1,250 Credits)</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="p-2 rounded-lg bg-[#FAFCF5] hover:bg-white border border-[#DCE6D2] text-left transition-colors"
            >
              <div className="font-bold text-[#173D2A] text-[11px]">Prof. Ananya Sen</div>
              <div className="text-[10px] text-[#B88718]">Innovation Cell Admin</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#173D2A] mb-1">College Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-[#173D2A]">Password</label>
              <a href="#forgot" className="text-[11px] text-[#26783C] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-[#26783C]"
              />
              <span className="text-[#687769]">Remember me for 30 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#26783C] hover:bg-[#1C622F] disabled:opacity-50 text-white font-bold rounded-btn transition-colors shadow-xs text-xs flex items-center justify-center gap-1.5"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#687769]">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-bold text-[#26783C] hover:underline">
            Register & Claim 1,000 Credits
          </Link>
        </div>
      </div>
    </div>
  );
};
