import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Lock,
  Eye,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, resetToDemoDefaults } = useApp();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [projectAlerts, setProjectAlerts] = useState(true);
  const [creditAlerts, setCreditAlerts] = useState(true);
  const [visibility, setVisibility] = useState(currentUser.profileVisibility);
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('Settings updated successfully!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmReset = () => {
    resetToDemoDefaults();
    setConfirmResetModal(false);
    setToastMsg('All application state restored to default demo state!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="bg-[#26783C] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5 text-[#26783C]" />
          Platform Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Configure security, notifications, profile privacy, and local data persistence.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6 text-xs">
        {/* Account & Profile Privacy */}
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-[#173D2A] flex items-center gap-2 border-b border-[#DCE6D2] pb-2">
            <Eye className="w-4 h-4 text-[#26783C]" />
            Profile Visibility & Campus Privacy
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
                className="mt-0.5 text-[#26783C]"
              />
              <div>
                <div className="font-bold text-[#173D2A]">Public (Recommended)</div>
                <div className="text-[11px] text-[#687769]">
                  Visible to all campus teammates, project owners, and external public link viewers.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={visibility === 'campus_only'}
                onChange={() => setVisibility('campus_only')}
                className="mt-0.5 text-[#26783C]"
              />
              <div>
                <div className="font-bold text-[#173D2A]">Campus Only</div>
                <div className="text-[11px] text-[#687769]">
                  Only authenticated college peers with verified @campus.edu emails can view.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications Preferences */}
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-[#173D2A] flex items-center gap-2 border-b border-[#DCE6D2] pb-2">
            <Bell className="w-4 h-4 text-[#26783C]" />
            Notification Preferences
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-bold text-[#173D2A]">Campus Credit Rewards Alerts</div>
                <div className="text-[11px] text-[#687769]">
                  Notify immediately when GitHub commits or LeetCode challenges yield credits.
                </div>
              </div>
              <input
                type="checkbox"
                checked={creditAlerts}
                onChange={(e) => setCreditAlerts(e.target.checked)}
                className="w-4 h-4 text-[#26783C]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-bold text-[#173D2A]">Project Invitations & Updates</div>
                <div className="text-[11px] text-[#687769]">
                  Receive alerts when someone invites you to a project or updates milestones.
                </div>
              </div>
              <input
                type="checkbox"
                checked={projectAlerts}
                onChange={(e) => setProjectAlerts(e.target.checked)}
                className="w-4 h-4 text-[#26783C]"
              />
            </label>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-[#173D2A] flex items-center gap-2 border-b border-[#DCE6D2] pb-2">
            <Lock className="w-4 h-4 text-[#26783C]" />
            Authentication & Security
          </h2>

          <div className="space-y-2">
            <div className="text-[#687769]">
              Signed in as: <strong className="text-[#173D2A]">{currentUser.email}</strong>
            </div>
            <div className="text-[11px] text-[#26783C] font-semibold">
              ✓ Multi-factor authentication protected via Campus SSO
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold transition-colors shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Demo Reset / Danger Zone */}
      <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#D94A4A]/30 shadow-subtle space-y-3">
        <h2 className="text-sm font-bold text-[#D94A4A] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Prototype & Demo State Reset
        </h2>
        <p className="text-xs text-[#687769] leading-relaxed">
          Need to test the initial state with Aryan Sharma (1,250 credits, 3 enrolled projects) from scratch? Resetting will clear LocalStorage modifications and re-seed the exact demo baseline.
        </p>
        <button
          onClick={() => setConfirmResetModal(true)}
          className="px-4 py-2 border border-[#D94A4A] text-[#D94A4A] hover:bg-[#D94A4A]/10 rounded-btn text-xs font-bold transition-colors"
        >
          Reset Demo to Factory Defaults
        </button>
      </div>

      {/* Confirm Reset Modal */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center gap-2 text-[#D94A4A] font-bold text-base pb-2 border-b border-[#DCE6D2]">
              <AlertTriangle className="w-5 h-5" />
              Confirm Demo State Reset
            </div>
            <p className="text-xs text-[#687769] leading-relaxed">
              Are you sure? This will restore all demo balances, projects, question unlock statuses, and connected accounts back to their initial state.
            </p>
            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmResetModal(false)}
                className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-[#D94A4A] hover:bg-[#b83b3b] text-white rounded-btn font-bold"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
