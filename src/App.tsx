import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './lib/auth';
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
import { PortfolioPage } from './pages/PortfolioPage';
import { PortfolioProjectFormPage } from './pages/PortfolioProjectFormPage';
import { PortfolioProjectDetailPage } from './pages/PortfolioProjectDetailPage';
import { PublicPortfolioPage } from './pages/PublicPortfolioPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { CommunityPage } from './pages/CommunityPage';
import { MicroGigsPage } from './pages/MicroGigsPage';
import { EventsPage } from './pages/EventsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

/** Redirects to /login when Supabase is configured and there is no session. */
const RequireAuth: React.FC = () => {
  const { configured, loading, session } = useAuth();
  if (!configured) return <AppLayout />;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#687769]">
        Loading your workspace...
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth & Marketing Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Authenticated Workspace Layout */}
          <Route element={<RequireAuth />}>
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

            {/* Proof-of-work portfolio */}
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/projects/new" element={<PortfolioProjectFormPage />} />
            <Route path="/portfolio/projects/:projectId" element={<PortfolioProjectDetailPage />} />
            <Route path="/portfolio/projects/:projectId/edit" element={<PortfolioProjectFormPage />} />
            <Route path="/portfolio/:userId" element={<PublicPortfolioPage />} />
            <Route path="/verification-queue" element={<ReviewQueuePage />} />

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
    </AuthProvider>
  );
};

export default App;
