import React, { useState } from 'react';
import {
  Coins,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PlatformConnection } from '../types';

export const EarnCreditsPage: React.FC = () => {
  const {
    availableCredits,
    platformConnections,
    updatePlatformConnection,
    claimPlatformReward,
  } = useApp();

  const [editingPlatform, setEditingPlatform] = useState<PlatformConnection | null>(null);
  const [inputUsername, setInputUsername] = useState('');
  const [inputProfileUrl, setInputProfileUrl] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  // Calculate summary metrics
  const totalEarnedToday = platformConnections.reduce((sum, p) => sum + p.creditsEarnedToday, 0);
  const totalDailyCap = platformConnections.reduce((sum, p) => sum + p.dailyCap, 0);
  const remainingLimit = Math.max(0, totalDailyCap - totalEarnedToday);
  const connectedCount = platformConnections.filter((p) => p.isConnected).length;

  const handleOpenEdit = (p: PlatformConnection) => {
    setEditingPlatform(p);
    setInputUsername(p.username);
    setInputProfileUrl(p.profileUrl);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlatform) return;

    if (!inputProfileUrl.startsWith('https://')) {
      setFeedbackMsg({ text: 'Profile URL must be a valid HTTPS link.', type: 'error' });
      return;
    }

    updatePlatformConnection(editingPlatform.platform, inputUsername, inputProfileUrl);
    setEditingPlatform(null);
    setFeedbackMsg({
      text: `Successfully updated ${editingPlatform.displayName} profile connection!`,
      type: 'success',
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleVerifyAndClaim = (platform: PlatformConnection, activity: string, amount: number) => {
    setIsVerifying(platform.id);
    setTimeout(() => {
      const res = claimPlatformReward(platform.platform, activity, amount);
      setIsVerifying(null);
      setFeedbackMsg({
        text: res.message,
        type: res.success ? 'success' : 'error',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }, 600);
  };

  const getPlatformIcon = (key: string) => {
    switch (key) {
      case 'leetcode':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#FFA116]/10 text-[#FFA116] flex items-center justify-center font-bold text-lg border border-[#FFA116]/30">
            LC
          </div>
        );
      case 'hackerrank':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#2EC866]/10 text-[#2EC866] flex items-center justify-center font-bold text-lg border border-[#2EC866]/30">
            HR
          </div>
        );
      case 'github':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#24292e]/10 text-[#173D2A] flex items-center justify-center font-bold text-lg border border-[#173D2A]/30">
            GH
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center font-bold text-lg border border-[#0A66C2]/30">
            IN
          </div>
        );
      default:
        return <LinkIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`px-4 py-3 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between ${
            feedbackMsg.type === 'success' ? 'bg-[#26783C] text-white' : 'bg-[#D94A4A] text-white'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="ml-3">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#EFC66B]" />
          External Developer Rewards
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Earn Credits
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Connect your verified coding and engineering accounts to earn daily platform rewards.
        </p>
      </div>

      {/* A. Summary Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium mb-1">Available Credits</div>
          <div className="text-2xl font-black text-[#173D2A] flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#EFC66B] fill-[#EFC66B]" />
            {availableCredits.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#687769] mt-1">Synced across PeerCraft</div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium mb-1">Credits Earned Today</div>
          <div className="text-2xl font-black text-[#26783C]">
            +{totalEarnedToday}
          </div>
          <div className="text-[11px] text-[#687769] mt-1">Across connected platforms</div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium mb-1">Remaining Daily Limit</div>
          <div className="text-2xl font-black text-[#173D2A]">
            {remainingLimit} <span className="text-xs text-[#687769] font-normal">/ {totalDailyCap}</span>
          </div>
          <div className="text-[11px] text-[#687769] mt-1">Resets at midnight UTC</div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium mb-1">Connected Platforms</div>
          <div className="text-2xl font-black text-[#173D2A]">
            {connectedCount} <span className="text-xs text-[#687769] font-normal">/ {platformConnections.length}</span>
          </div>
          <div className="text-[11px] text-[#26783C] font-semibold mt-1">Active sync enabled</div>
        </div>
      </div>

      {/* B. Platform Cards (2 columns on desktop, 1 on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platformConnections.map((platform) => {
          const capPercent = Math.min(100, (platform.creditsEarnedToday / platform.dailyCap) * 100);

          return (
            <div
              key={platform.id}
              className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Header with Logo & Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(platform.platform)}
                    <div>
                      <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                        {platform.displayName}
                        {platform.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#26783C]">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#687769]">
                        {platform.isConnected ? `@${platform.username}` : 'Not connected'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(platform)}
                    className="p-1.5 rounded-lg border border-[#DCE6D2] hover:bg-[#EAF1DC] text-[#687769] hover:text-[#173D2A] transition-colors"
                    title="Edit or reconnect profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Daily Progress */}
                <div className="bg-[#EAF1DC]/60 p-3 rounded-xl mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#173D2A]">
                    <span>Today's Earning</span>
                    <span>
                      {platform.creditsEarnedToday} / {platform.dailyCap} Credits
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#DCE6D2] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#26783C] rounded-full transition-all duration-300"
                      style={{ width: `${capPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#687769] text-right">
                    {platform.dailyCap - platform.creditsEarnedToday} credits remaining today
                  </div>
                </div>

                {/* Eligible Activities */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs font-bold text-[#173D2A]">Eligible Activities & Rewards:</div>
                  <div className="space-y-1.5">
                    {platform.eligibleActivities.map((act, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 rounded-lg bg-[#FAFCF5] border border-[#DCE6D2] flex items-center justify-between gap-2"
                      >
                        <span className="text-[#1D3024]">{act}</span>
                        <button
                          onClick={() => handleVerifyAndClaim(platform, act, 25)}
                          disabled={
                            isVerifying === platform.id ||
                            platform.creditsEarnedToday >= platform.dailyCap ||
                            !platform.isConnected
                          }
                          className="px-2.5 py-1 bg-[#26783C] hover:bg-[#1C622F] disabled:opacity-40 text-white rounded text-[10px] font-bold transition-colors whitespace-nowrap"
                        >
                          {isVerifying === platform.id ? 'Verifying...' : 'Sync & Claim'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#DCE6D2] flex items-center justify-between gap-2">
                {platform.isConnected ? (
                  <a
                    href={platform.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173D2A] hover:bg-[#102B20] text-white text-xs font-semibold rounded-btn transition-colors"
                  >
                    <span>Open {platform.displayName} Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleOpenEdit(platform)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-semibold rounded-btn transition-colors"
                  >
                    <span>Connect Profile</span>
                  </button>
                )}

                <span className="text-[10px] text-[#687769]">
                  Last synced: {platform.lastSyncAt || 'Never'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Profile Modal */}
      {editingPlatform && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#26783C]" />
                Connect / Edit {editingPlatform.displayName} Profile
              </div>
              <button
                onClick={() => setEditingPlatform(null)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  {editingPlatform.displayName} Username
                </label>
                <input
                  type="text"
                  required
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder={`e.g. ${editingPlatform.username || 'username'}`}
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  Public Profile URL (HTTPS)
                </label>
                <input
                  type="url"
                  required
                  value={inputProfileUrl}
                  onChange={(e) => setInputProfileUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none font-mono text-[11px]"
                />
                <p className="text-[10px] text-[#687769] mt-1">
                  Must link to your public profile page so rewards can be verified.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlatform(null)}
                  className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-semibold"
                >
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
