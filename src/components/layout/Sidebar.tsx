import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  UserRound,
  UsersRound,
  FolderKanban,
  Coins,
  Code2,
  Wallet,
  Package,
  BadgeCheck,
  MessagesSquare,
  BriefcaseBusiness,
  CalendarDays,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { adminUser, initialUser } from '../../data/mockData';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const {
    currentUser,
    switchUser,
    availableCredits,
    unreadNotificationsCount,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    setShowAvatarPicker,
  } = useApp();

  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Exact navigation order specified in Section 4:
  const primaryNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'My Profile', icon: UserRound },
    { to: '/team-finder', label: 'AI Team Finder', icon: UsersRound },
    { to: '/projects', label: 'Project Workspace', icon: FolderKanban },
    { to: '/credits/earn', label: 'Earn Credits', icon: Coins },
    { to: '/coding-arena', label: 'Coding Arena', icon: Code2 },
    { to: '/credits', label: 'Campus Credits', icon: Wallet },
    { to: '/resources', label: 'Resource Exchange', icon: Package },
    { to: '/skills', label: 'Skill Passport', icon: BadgeCheck },
    { to: '/community', label: 'Community', icon: MessagesSquare },
    { to: '/micro-gigs', label: 'Micro-Gigs', icon: BriefcaseBusiness },
    { to: '/events', label: 'Events & Hackathons', icon: CalendarDays },
  ];

  const handleLogout = () => {
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const toggleAdminView = () => {
    if (currentUser.role === 'admin') {
      switchUser(initialUser);
    } else {
      switchUser(adminUser);
    }
  };

  return (
    <>
      <aside
        className={`flex-shrink-0 bg-[#102B20] text-white flex flex-col h-screen sticky top-0 border-r border-[#173D2A]/60 select-none z-30 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {/* Top Brand Section */}
        <div className="p-3.5 border-b border-[#173D2A]/80 flex items-center justify-between">
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 group overflow-hidden"
            title="PeerCraft Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#26783C] to-[#173D2A] border border-[#E4EDCF]/30 flex items-center justify-center text-[#E4EDCF] shadow-subtle group-hover:scale-105 transition-transform flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#EFC66B]" />
            </div>

            {!isSidebarCollapsed && (
              <div className="overflow-hidden transition-all duration-200">
                <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                  PeerCraft
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#26783C]/70 text-[#E4EDCF]">
                    v2.0
                  </span>
                </div>
                <div className="text-[10px] text-[#A2BA95] font-medium tracking-wide whitespace-nowrap">
                  Build • Collaborate • Grow
                </div>
              </div>
            )}
          </NavLink>

          {/* Sidebar Collapse Toggle Button (Desktop/Laptop) */}
          <button
            onClick={toggleSidebarCollapse}
            className="hidden lg:flex p-1 rounded-lg text-[#A2BA95] hover:text-white hover:bg-[#173D2A] transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Primary Navigation - Exactly matching order */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-sm font-medium hide-scrollbar">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                title={isSidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg transition-all duration-150 relative ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-[#E4EDCF] text-[#173D2A] font-semibold shadow-sm'
                      : 'text-[#D3E0C8] hover:text-white hover:bg-[#173D2A]/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-[#173D2A]' : 'text-[#A2BA95]'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate text-[13px]">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Admin link if user is admin */}
          <div className="pt-2 border-t border-[#173D2A]/60">
            <NavLink
              to="/admin"
              onClick={onCloseMobile}
              title={isSidebarCollapsed ? 'Admin Console' : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg transition-colors text-[13px] ${
                  isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                } ${
                  isActive
                    ? 'bg-[#E4EDCF] text-[#173D2A] font-semibold'
                    : 'text-[#EFC66B] hover:bg-[#173D2A]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-[#EFC66B] flex-shrink-0" />
                {!isSidebarCollapsed && <span>Admin Console</span>}
              </div>
              {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </NavLink>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-2 border-t border-[#173D2A]/80 bg-[#0C2219]/90 space-y-1 text-xs">
          <NavLink
            to="/notifications"
            onClick={onCloseMobile}
            title={isSidebarCollapsed ? 'Notifications' : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg transition-colors ${
                isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
              } ${
                isActive
                  ? 'bg-[#E4EDCF] text-[#173D2A] font-semibold'
                  : 'text-[#D3E0C8] hover:bg-[#173D2A]/60'
              }`
            }
          >
            <div className="flex items-center gap-2.5 relative">
              <Bell className="w-4 h-4 text-[#A2BA95] flex-shrink-0" />
              {!isSidebarCollapsed && <span>Notifications</span>}
              {unreadNotificationsCount > 0 && isSidebarCollapsed && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EFC66B] rounded-full" />
              )}
            </div>
            {!isSidebarCollapsed && unreadNotificationsCount > 0 && (
              <span className="bg-[#EFC66B] text-[#173D2A] font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            title={isSidebarCollapsed ? 'Settings' : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg transition-colors ${
                isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
              } ${
                isActive
                  ? 'bg-[#E4EDCF] text-[#173D2A] font-semibold'
                  : 'text-[#D3E0C8] hover:bg-[#173D2A]/60'
              }`
            }
          >
            <Settings className="w-4 h-4 text-[#A2BA95] flex-shrink-0" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </NavLink>

          <button
            onClick={() => setShowHelpModal(true)}
            title={isSidebarCollapsed ? 'Help & Support' : undefined}
            className={`w-full flex items-center rounded-lg text-[#D3E0C8] hover:bg-[#173D2A]/60 text-left transition-colors ${
              isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#A2BA95] flex-shrink-0" />
            {!isSidebarCollapsed && <span>Help & Support</span>}
          </button>

          {/* User profile widget & Role quick switch */}
          <div className="mt-2 pt-2 border-t border-[#173D2A] flex flex-col gap-1.5">
            <div
              className={`flex items-center ${
                isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'
              }`}
            >
              <div
                onClick={() => setShowAvatarPicker(true)}
                className="flex items-center gap-2 overflow-hidden cursor-pointer group"
                title="Change Avatar & Status"
              >
                <div className="relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#A2BA95] group-hover:border-[#EFC66B] transition-colors"
                  />
                  {currentUser.statusEmoji && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-[#102B20] rounded-full">
                      {currentUser.statusEmoji.split(' ')[0]}
                    </span>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="truncate">
                    <div className="text-[12px] font-semibold text-white truncate flex items-center gap-1">
                      <span>{currentUser.firstName}</span>
                      <Camera className="w-3 h-3 text-[#A2BA95] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-[#A2BA95] truncate">
                      {currentUser.role === 'admin' ? 'Faculty Admin' : 'Student Lead'}
                    </div>
                  </div>
                )}
              </div>

              {!isSidebarCollapsed && (
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1 rounded text-[#A2BA95] hover:text-white hover:bg-[#173D2A]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Demo Switcher Button */}
            {!isSidebarCollapsed ? (
              <button
                onClick={toggleAdminView}
                className="text-[10px] py-1 px-2 rounded bg-[#173D2A] hover:bg-[#26783C] text-[#E4EDCF] font-medium flex items-center justify-center gap-1.5 transition-colors border border-[#26783C]/50 mt-1"
              >
                <span>Persona:</span>
                <span className="font-bold underline text-[#EFC66B]">
                  {currentUser.role === 'admin' ? 'Admin' : 'Student (Aryan)'}
                </span>
              </button>
            ) : (
              <button
                onClick={toggleAdminView}
                className="w-full py-1 rounded bg-[#173D2A] hover:bg-[#26783C] text-[#EFC66B] font-bold text-[10px] flex items-center justify-center"
                title={`Switch persona: currently ${currentUser.role}`}
              >
                {currentUser.role === 'admin' ? 'ADM' : 'STU'}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6D2]">
              <div className="font-bold text-lg text-[#173D2A] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#26783C]" />
                PeerCraft Campus Support
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#687769] hover:text-[#173D2A] font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm text-[#687769]">
              <p>
                Welcome to <strong>PeerCraft — Build • Collaborate • Grow</strong>.
              </p>
              <div className="bg-[#EAF1DC] p-3 rounded-lg text-xs space-y-1 text-[#1D3024]">
                <div className="font-semibold text-[#173D2A]">Quick Guide:</div>
                <div>• <strong>1,000 Signup Bonus:</strong> Automatically credited to your wallet.</div>
                <div>• <strong>Coding Arena:</strong> Practice free or unlock curated links for 100 credits.</div>
                <div>• <strong>Active Projects:</strong> Track projects you are enrolled in.</div>
                <div>• <strong>AI Mentor:</strong> Instant algorithmic guidance at bottom right.</div>
                <div>• <strong>Collapsible Sidebar:</strong> Use the toggle button on top of sidebar for full-screen laptop focus!</div>
              </div>
              <p className="text-xs">
                Need direct technical help or want to report a broken external question link? Contact innovation lab team at <span className="font-mono text-[#173D2A]">support@campus.edu</span>.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#26783C] text-white rounded-btn text-xs font-semibold hover:bg-[#1C622F]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
