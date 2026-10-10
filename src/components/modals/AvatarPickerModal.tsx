import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Camera,
  Upload,
  Smile,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { avatarPresets } from '../../data/mockData';

export const AvatarPickerModal: React.FC = () => {
  const { currentUser, showAvatarPicker, setShowAvatarPicker, updateAvatar } = useApp();

  const [selectedUrl, setSelectedUrl] = useState(currentUser.avatarUrl);
  const [selectedStatus, setSelectedStatus] = useState(currentUser.statusEmoji || '⚡ Coding');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customUrl, setCustomUrl] = useState('');

  if (!showAvatarPicker) return null;

  const categories = ['All', '3D Modern', 'Campus Tech', 'Illustrated', 'Anime Dev'];
  const statusOptions = [
    '⚡ Coding',
    '🚀 Shipping',
    '☕ Brainstorming',
    '📚 In Library',
    '🎯 Hackathon Mode',
    '🔬 In Lab',
  ];

  const filteredPresets = avatarPresets.filter(
    (p) => activeCategory === 'All' || p.category === activeCategory
  );

  const handleApply = () => {
    updateAvatar(selectedUrl, selectedStatus);
  };

  const handleApplyCustom = () => {
    if (customUrl.trim()) {
      setSelectedUrl(customUrl.trim());
      updateAvatar(customUrl.trim(), selectedStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#FAFCF5] rounded-card border-2 border-[#DCE6D2] p-6 max-w-xl w-full shadow-2xl text-[#1D3024] space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE6D2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF1DC] text-[#26783C] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#173D2A] leading-tight">
                Developer Avatar & Status
              </h2>
              <p className="text-[11px] text-[#687769]">
                Choose an engaging avatar & campus activity halo for your profile.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAvatarPicker(false)}
            className="p-1 rounded text-[#687769] hover:text-[#173D2A] hover:bg-[#EAF1DC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="bg-gradient-to-r from-[#EAF1DC] to-[#E4EDCF]/60 p-4 rounded-xl border border-[#DCE6D2] flex items-center gap-4">
          <div className="relative">
            <img
              src={selectedUrl}
              alt="Avatar Preview"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-[#26783C] shadow-subtle bg-white"
            />
            <span
              className="absolute -bottom-1 -right-1 text-sm bg-[#173D2A] text-white p-0.5 px-1 rounded-full border border-white shadow-xs"
              title="Status Emoji"
            >
              {selectedStatus.split(' ')[0]}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm text-[#173D2A] flex items-center gap-1.5">
              <span>{currentUser.fullName}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#173D2A] text-[#E4EDCF]">
                {selectedStatus}
              </span>
            </div>
            <div className="text-[11px] text-[#687769]">
              {currentUser.branch} • {currentUser.academicYear}
            </div>
            <div className="text-[10px] text-[#26783C] font-semibold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Campus Verified
            </div>
          </div>
        </div>

        {/* Status Emoji Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#173D2A]">
            Current Activity / Campus Status:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-[#173D2A] text-white shadow-xs font-bold'
                    : 'bg-[#EAF1DC]/70 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 border-b border-[#DCE6D2] pb-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-[#26783C] text-white'
                  : 'text-[#687769] hover:bg-[#EAF1DC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Avatars Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-1 hide-scrollbar">
          {filteredPresets.map((preset) => {
            const isSelected = selectedUrl === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedUrl(preset.url)}
                className={`relative rounded-xl p-1.5 flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'ring-2 ring-[#26783C] bg-[#EAF1DC] scale-105'
                    : 'hover:bg-[#EAF1DC]/50 border border-transparent'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-12 h-12 rounded-full object-cover bg-white border border-[#DCE6D2]"
                />
                <span className="text-[9px] font-medium text-[#1D3024] text-center truncate w-full">
                  {preset.name}
                </span>
                {isSelected && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#26783C] text-white flex items-center justify-center text-[9px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom URL Input */}
        <div className="pt-2 border-t border-[#DCE6D2] space-y-1.5 text-xs">
          <label className="block font-semibold text-[#173D2A]">Or Paste Custom Image URL:</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-1.5 bg-[#EAF1DC]/40 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none text-xs font-mono"
            />
            <button
              type="button"
              onClick={handleApplyCustom}
              disabled={!customUrl.trim()}
              className="px-3 py-1.5 bg-[#173D2A] disabled:opacity-40 text-white rounded-btn font-semibold hover:bg-[#102B20] text-xs whitespace-nowrap"
            >
              Use Link
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#DCE6D2] flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowAvatarPicker(false)}
            className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
