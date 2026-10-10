import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { TeamFinderPage } from './pages/TeamFinderPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { EarnCreditsPage } from './pages/EarnCreditsPage';
import { CodingArenaPage } from './pages/CodingArenaPage';
import { CampusCreditsPage } from './pages/CampusCreditsPage';
import { ResourceExchangePage } from './pages/ResourceExchangePage';
import { SkillPassportPage } from './pages/SkillPassportPage';
import { CommunityPage } from './pages/CommunityPage';
import { MicroGigsPage } from './pages/MicroGigsPage';
import { EventsPage } from './pages/EventsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth & Marketing Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Authenticated Workspace Layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users/:id" element={<PublicProfilePage />} />
            <Route path="/team-finder" element={<TeamFinderPage />} />

            {/* Projects */}
            <Route path="/projects" element={<ProjectWorkspacePage />} />
            <Route path="/projects/discover" element={<ProjectWorkspacePage />} />
            <Route path="/projects/create" element={<CreateProjectPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />

            {/* Credits & Earning */}
            <Route path="/credits/earn" element={<EarnCreditsPage />} />
            <Route path="/credits" element={<CampusCreditsPage />} />
            <Route path="/credits/transactions" element={<CampusCreditsPage />} />

            {/* Coding Arena */}
            <Route path="/coding-arena" element={<CodingArenaPage />} />
            <Route path="/coding-arena/premium" element={<CodingArenaPage />} />
            <Route path="/coding-arena/unlocked" element={<CodingArenaPage />} />

            {/* Resources & Skills */}
            <Route path="/resources" element={<ResourceExchangePage />} />
            <Route path="/resources/history" element={<ResourceExchangePage />} />
            <Route path="/skills" element={<SkillPassportPage />} />

            {/* Community, Gigs, Events */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/micro-gigs" element={<MicroGigsPage />} />
            <Route path="/events" element={<EventsPage />} />

            {/* Alerts & Preferences */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Administrative */}
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
