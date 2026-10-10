import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Coins,
  ChevronDown,
  User,
  Settings,
  Shield,
  LogOut,
  FolderKanban,
  Code2,
  Package,
  Menu,
  Maximize2,
  Minimize2,
  Flame,
  Camera,
  Activity,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { adminUser, initialUser } from '../../data/mockData';

interface TopNavbarProps {
  onToggleMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentUser,
    switchUser,
    availableCredits,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    searchQuery,
    setSearchQuery,
    projects,
    codingQuestions,
    resources,
    setShowAvatarPicker,
    isFullscreen,
    toggleFullscreen,
  } = useApp();

  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePersona = () => {
    if (currentUser.role === 'admin') {
      switchUser(initialUser);
    } else {
      switchUser(adminUser);
    }
  };

  // Filter global search results
  const matchingProjects = searchQuery.trim()
    ? projects.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const matchingQuestions = searchQuery.trim()
    ? codingQuestions.filter((q) => q.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const matchingResources = searchQuery.trim()
    ? resources.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasSearchResults =
    matchingProjects.length > 0 || matchingQuestions.length > 0 || matchingResources.length > 0;

  return (
    <header className="sticky top-0 z-20 bg-[#FAFCF5]/95 backdrop-blur-md border-b border-[#DCE6D2] px-3 sm:px-6 py-2 transition-colors">
      <div className="flex items-center justify-between gap-3 md:gap-4">
        {/* Left: Mobile hamburger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-lg text-[#1D3024] hover:bg-[#EAF1DC] transition-colors lg:hidden"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>

        {/* Center: Global Search Bar with Ctrl+K shortcut */}
        <div ref={searchRef} className="relative flex-1 max-w-lg mx-2 hidden sm:block">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769] group-focus-within:text-[#26783C] transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search teammates, projects, resources, events..."
              className="w-full pl-9 pr-14 py-1.5 text-xs bg-[#EAF1DC]/60 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] placeholder-[#687769] outline-none transition-all shadow-2xs"
            />
            {/* Keyboard shortcut badge */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#FAFCF5] text-[#687769] border border-[#DCE6D2] rounded shadow-2xs">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Quick Search Autocomplete Dropdown */}
          {showSearchResults && searchQuery.trim().length > 1 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#FAFCF5] border border-[#DCE6D2] rounded-card shadow-card p-3 max-h-96 overflow-y-auto z-50 text-xs">
              {!hasSearchResults ? (
                <div className="py-4 text-center text-[#687769]">
                  No direct results for "{searchQuery}". Try browsing categories.
                </div>
              ) : (
                <div className="space-y-3">
                  {matchingProjects.length > 0 && (
                    <div>
                      <div className="font-semibold text-[#173D2A] mb-1.5 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[#687769]">
                        <FolderKanban className="w-3.5 h-3.5 text-[#26783C]" /> Projects
                      </div>
                      <div className="space-y-1">
                        {matchingProjects.slice(0, 3).map((p) => (
                          <Link
                            key={p.id}
                            to={`/projects/${p.id}`}
                            onClick={() => setShowSearchResults(false)}
                            className="block p-2 rounded-lg hover:bg-[#EAF1DC] transition-colors"
                          >
                            <div className="font-medium text-[#1D3024]">{p.title}</div>
                            <div className="text-[11px] text-[#687769] truncate">
                              {p.category} • {p.technologies.slice(0, 3).join(', ')}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingQuestions.length > 0 && (
                    <div className="pt-2 border-t border-[#DCE6D2]">
                      <div className="font-semibold text-[#173D2A] mb-1.5 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[#687769]">
                        <Code2 className="w-3.5 h-3.5 text-[#26783C]" /> Coding Arena
                      </div>
                      <div className="space-y-1">
                        {matchingQuestions.slice(0, 3).map((q) => (
                          <Link
                            key={q.id}
                            to="/coding-arena"
                            onClick={() => setShowSearchResults(false)}
                            className="block p-2 rounded-lg hover:bg-[#EAF1DC] transition-colors"
                          >
                            <div className="font-medium text-[#1D3024] flex items-center justify-between">
                              <span>{q.title}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E4EDCF] text-[#173D2A]">
                                {q.platform}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#687769]">
                              {q.difficulty} • {q.topics.join(', ')}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchingResources.length > 0 && (
                    <div className="pt-2 border-t border-[#DCE6D2]">
                      <div className="font-semibold text-[#173D2A] mb-1.5 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-[#687769]">
                        <Package className="w-3.5 h-3.5 text-[#26783C]" /> Campus Resources
                      </div>
                      <div className="space-y-1">
                        {matchingResources.slice(0, 3).map((r) => (
                          <Link
                            key={r.id}
                            to="/resources"
                            onClick={() => setShowSearchResults(false)}
                            className="block p-2 rounded-lg hover:bg-[#EAF1DC] transition-colors"
                          >
                            <div className="font-medium text-[#1D3024]">{r.name}</div>
                            <div className="text-[11px] text-[#687769]">
                              {r.category} • Status: {r.availability}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-[#1D3024] hover:bg-[#EAF1DC] border border-[#DCE6D2]/60 transition-colors hidden sm:flex items-center justify-center"
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-[#26783C]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[#687769]" />
            )}
          </button>

          {/* Quick Persona Switch Pill */}
          <button
            onClick={togglePersona}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#DCE6D2] bg-[#FAFCF5] hover:bg-[#EAF1DC] text-[11px] font-semibold text-[#173D2A] transition-colors"
            title="Toggle between student and admin view"
          >
            <span className="text-[#687769]">Role:</span>
            <span className="font-bold text-[#26783C]">
              {currentUser.role === 'admin' ? 'Faculty Admin' : 'Student (Aryan)'}
            </span>
          </button>

          {/* Engaging Streak & Credits Pill */}
          <Link
            to="/credits"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF1DC] hover:bg-[#E4EDCF] text-[#173D2A] border border-[#DCE6D2] rounded-full text-xs font-bold shadow-2xs transition-colors"
            title="Campus Credits Wallet"
          >
            <Coins className="w-4 h-4 text-[#EFC66B] fill-[#EFC66B]" />
            <span>{availableCredits.toLocaleString()}</span>
            <span className="hidden xl:inline text-[10px] font-medium text-[#687769]">Credits</span>
          </Link>

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-1.5 rounded-lg text-[#1D3024] hover:bg-[#EAF1DC] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#26783C] rounded-full ring-2 ring-[#FAFCF5]" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-[#FAFCF5] border border-[#DCE6D2] rounded-card shadow-card p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCE6D2]">
                  <span className="font-bold text-[#173D2A]">Notifications</span>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotificationDropdown(false)}
                    className="text-[11px] text-[#26783C] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkUrl) navigate(n.linkUrl);
                        setShowNotificationDropdown(false);
                      }}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        !n.isRead ? 'bg-[#EAF1DC]/90 font-medium' : 'hover:bg-[#EEF4E3]'
                      }`}
                    >
                      <div className="text-[12px] text-[#173D2A]">{n.title}</div>
                      <div className="text-[11px] text-[#687769] line-clamp-1">{n.message}</div>
                      <div className="text-[10px] text-[#687769] mt-0.5">{n.createdAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Avatar Picker Trigger */}
          <div ref={profileRef} className="relative flex items-center">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border border-[#DCE6D2] hover:bg-[#EAF1DC] transition-colors"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#26783C]"
                />
                {currentUser.statusEmoji && (
                  <span className="absolute -bottom-1 -right-1 text-[9px] bg-[#173D2A] text-white rounded-full px-0.5">
                    {currentUser.statusEmoji.split(' ')[0]}
                  </span>
                )}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-[#173D2A] leading-tight flex items-center gap-1">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-[#687769] leading-tight">
                  {currentUser.branch.split(' ')[0]} • {currentUser.academicYear}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#687769]" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-[#FAFCF5] border border-[#DCE6D2] rounded-card shadow-card p-1.5 z-50 text-xs animate-in fade-in">
                <div className="p-2 border-b border-[#DCE6D2] mb-1">
                  <div className="font-bold text-[#173D2A] flex items-center justify-between">
                    <span>{currentUser.fullName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E4EDCF] text-[#26783C] font-bold">
                      {currentUser.statusEmoji || 'Active'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#687769] truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-[#26783C] font-medium mt-0.5">
                    {currentUser.college}
                  </div>
                </div>

                {/* Change Avatar Button */}
                <button
                  onClick={() => {
                    setShowAvatarPicker(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#EAF1DC] text-[#1D3024] font-semibold transition-colors text-left"
                >
                  <Camera className="w-3.5 h-3.5 text-[#EFC66B]" />
                  <span>Choose Avatar & Status</span>
                </button>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#EAF1DC] text-[#1D3024] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#26783C]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#EAF1DC] text-[#1D3024] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#26783C]" />
                  <span>Account Settings</span>
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#EAF1DC] text-[#1D3024] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-[#EFC66B]" />
                  <span>Admin Console</span>
                </Link>

                <div className="pt-1 mt-1 border-t border-[#DCE6D2]">
                  <Link
                    to="/login"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#D94A4A]/10 text-[#D94A4A] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
