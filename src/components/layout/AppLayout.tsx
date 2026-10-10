import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MobileNav } from './MobileNav';
import { PeerCraftAIMentor } from '../ai/PeerCraftAIMentor';
import { AvatarPickerModal } from '../modals/AvatarPickerModal';

export const AppLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F7EA] text-[#1D3024] flex w-full overflow-x-hidden">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-[260px] h-full shadow-2xl animate-in slide-in-from-left">
            <Sidebar onCloseMobile={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area - Fluid Full Screen */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen w-full">
        <TopNavbar onToggleMobileMenu={() => setMobileDrawerOpen(true)} />

        <main className="flex-1 pb-20 lg:pb-8 w-full">
          <Outlet />
        </main>

        {/* Mobile Navigation bar */}
        <MobileNav onOpenDrawer={() => setMobileDrawerOpen(true)} />

        {/* Integrated AI Mentor floating assistant */}
        <PeerCraftAIMentor />

        {/* Interactive Avatar Picker Modal */}
        <AvatarPickerModal />
      </div>
    </div>
  );
};
