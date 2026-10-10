import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  FolderKanban,
  Coins,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  onOpenDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenDrawer }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAFCF5]/95 backdrop-blur-md border-t border-[#DCE6D2] px-2 py-1.5 flex items-center justify-around text-[10px]">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            isActive ? 'text-[#173D2A] font-bold' : 'text-[#687769]'
          }`
        }
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/coding-arena"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            isActive ? 'text-[#173D2A] font-bold' : 'text-[#687769]'
          }`
        }
      >
        <Code2 className="w-4 h-4" />
        <span>Arena</span>
      </NavLink>

      <NavLink
        to="/projects"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            isActive ? 'text-[#173D2A] font-bold' : 'text-[#687769]'
          }`
        }
      >
        <FolderKanban className="w-4 h-4" />
        <span>Projects</span>
      </NavLink>

      <NavLink
        to="/credits"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors ${
            isActive ? 'text-[#173D2A] font-bold' : 'text-[#687769]'
          }`
        }
      >
        <Coins className="w-4 h-4 text-[#EFC66B]" />
        <span>Credits</span>
      </NavLink>

      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[#687769] hover:text-[#173D2A]"
      >
        <Menu className="w-4 h-4" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
