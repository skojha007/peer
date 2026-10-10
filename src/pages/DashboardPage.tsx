import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Coins,
  FolderKanban,
  Package,
  BadgeCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  ExternalLink,
  Sparkles,
  Compass,
  Repeat,
  Wallet,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { otherStudents } from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    availableCredits,
    activeProjectsCount,
    borrowedResourcesCount,
    projects,
    history,
  } = useApp();

  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedInviteUser, setSelectedInviteUser] = useState<string | null>(null);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // Time-aware greeting without emoji
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning, ${currentUser.firstName}!`;
    if (hour < 17) return `Good Afternoon, ${currentUser.firstName}!`;
    return `Good Evening, ${currentUser.firstName}!`;
  };

  // Only projects the current user is enrolled in
  const enrolledProjects = projects.filter((p) => p.isUserEnrolled);

  // Scroll handlers for project carousel
  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
  }, [enrolledProjects]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 340;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  const handleSendInvite = (studentName: string) => {
    setSelectedInviteUser(null);
    setInviteSuccessMsg(`Project invitation sent to ${studentName}!`);
    setTimeout(() => setInviteSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Invite Notification Toast */}
      {inviteSuccessMsg && (
        <div className="bg-[#26783C] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between">
          <span>{inviteSuccessMsg}</span>
          <button onClick={() => setInviteSuccessMsg(null)} className="text-white ml-3">✕</button>
        </div>
      )}

      {/* A. Personalized Welcome Banner */}
      <section className="bg-gradient-to-r from-[#173D2A] via-[#1A4530] to-[#20523A] text-white rounded-card p-6 md:p-8 shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E4EDCF]/15 text-[#E4EDCF] text-xs font-semibold mb-3 border border-[#E4EDCF]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EFC66B]" />
            PeerCraft Workspace
          </div>
          {/* Greeting: exact format, NO emoji appended */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {getGreeting()}
          </h1>
          <p className="text-sm md:text-base text-[#D3E0C8] font-normal leading-relaxed">
            Build something amazing with the right people, skills, and opportunities.
          </p>
        </div>

        {/* Minimal botanical geometric illustration */}
        <div className="absolute right-4 bottom-0 top-0 hidden md:flex items-center opacity-25 pointer-events-none">
          <svg className="w-64 h-64 text-[#E4EDCF]" viewBox="0 0 200 200" fill="currentColor">
            <path d="M45,-60C58,-52,68,-39,72,-24C77,-9,76,8,70,23C64,38,53,50,40,58C27,66,12,70,-3,74C-18,78,-35,82,-47,75C-59,68,-66,50,-71,33C-76,16,-79,0,-75,-14C-71,-28,-63,-40,-52,-49C-41,-58,-27,-64,-12,-63C3,-62,19,-68,45,-60Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>

      {/* B. Four Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Your Credits */}
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle hover:shadow-card hover:border-[#26783C]/40 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#687769] font-medium mb-2">
              <span>Your Credits</span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1DC] flex items-center justify-center text-[#EFC66B]">
                <Coins className="w-4 h-4 fill-[#EFC66B]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#173D2A] tracking-tight">
              {availableCredits.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#687769] mt-0.5">
              Available for coding questions & tools
            </div>
          </div>
          <Link
            to="/credits"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#26783C] group-hover:text-[#1C622F] transition-colors"
          >
            <span>View Wallet</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Active Projects */}
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle hover:shadow-card hover:border-[#26783C]/40 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#687769] font-medium mb-2">
              <span>Active Projects</span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1DC] flex items-center justify-center text-[#26783C]">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#173D2A] tracking-tight">
              {activeProjectsCount}
            </div>
            <div className="text-[11px] text-[#687769] mt-0.5">
              Enrolled active campus initiatives
            </div>
          </div>
          <Link
            to="/projects"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#26783C] group-hover:text-[#1C622F] transition-colors"
          >
            <span>View My Projects</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Resources Borrowed */}
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle hover:shadow-card hover:border-[#26783C]/40 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#687769] font-medium mb-2">
              <span>Resources Borrowed</span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1DC] flex items-center justify-center text-[#173D2A]">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#173D2A] tracking-tight">
              {borrowedResourcesCount}
            </div>
            <div className="text-[11px] text-[#687769] mt-0.5">
              Active books & equipment loans
            </div>
          </div>
          <Link
            to="/resources/history"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#26783C] group-hover:text-[#1C622F] transition-colors"
          >
            <span>View History</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Your Reputation */}
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle hover:shadow-card hover:border-[#26783C]/40 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#687769] font-medium mb-2">
              <span>Your Reputation</span>
              <div className="w-8 h-8 rounded-lg bg-[#EAF1DC] flex items-center justify-center text-[#26783C]">
                <BadgeCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#173D2A] tracking-tight">
              {currentUser.reputation} <span className="text-sm font-normal text-[#687769]">/ 5.0</span>
            </div>
            <div className="text-[11px] text-[#687769] mt-0.5">
              Verified peer & mentor endorsements
            </div>
          </div>
          <Link
            to="/skills"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#26783C] group-hover:text-[#1C622F] transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* C. Earn More Credits Banner (Compact, does not show complete platform rewards) */}
      <section className="bg-[#EAF1DC] border border-[#DCE6D2] rounded-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#26783C] text-[#EFC66B] flex items-center justify-center flex-shrink-0 shadow-subtle">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#173D2A]">
              Your Skills Deserve Rewards.
            </h3>
            <p className="text-xs text-[#687769]">
              Earn Campus Credits through verified coding, development, and professional activities.
            </p>
          </div>
        </div>
        <Link
          to="/credits/earn"
          className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors whitespace-nowrap shadow-xs"
        >
          Start Earning
        </Link>
      </section>

      {/* D. My Active Projects Carousel & E. Quick Actions Side-by-Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: My Active Projects Carousel (8 cols) */}
        <section className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#173D2A] flex items-center gap-2">
                My Active Projects
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#173D2A] font-semibold">
                  {enrolledProjects.length}
                </span>
              </h2>
              <p className="text-xs text-[#687769]">
                Initiatives you have joined and are actively collaborating on.
              </p>
            </div>

            {/* Carousel navigation buttons */}
            {enrolledProjects.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollCarousel('left')}
                  disabled={!canScrollLeft}
                  className="p-1.5 rounded-lg border border-[#DCE6D2] bg-[#FAFCF5] hover:bg-[#EAF1DC] disabled:opacity-30 disabled:pointer-events-none transition-colors text-[#173D2A]"
                  title="Previous project"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  disabled={!canScrollRight}
                  className="p-1.5 rounded-lg border border-[#DCE6D2] bg-[#FAFCF5] hover:bg-[#EAF1DC] disabled:opacity-30 disabled:pointer-events-none transition-colors text-[#173D2A]"
                  title="Next project"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Carousel container */}
          {enrolledProjects.length === 0 ? (
            <div className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-8 text-center space-y-3">
              <FolderKanban className="w-10 h-10 text-[#687769] mx-auto opacity-50" />
              <div className="text-sm font-semibold text-[#173D2A]">
                You haven't joined an active project yet.
              </div>
              <p className="text-xs text-[#687769] max-w-sm mx-auto">
                Explore campus repositories, connect with creators, and start building with your peers.
              </p>
              <Link
                to="/projects/discover"
                className="inline-block px-4 py-2 bg-[#26783C] text-white text-xs font-bold rounded-btn hover:bg-[#1C622F]"
              >
                Discover Projects
              </Link>
            </div>
          ) : (
            <div
              ref={carouselRef}
              onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
            >
              {enrolledProjects.map((project) => (
                <div
                  key={project.id}
                  className="w-[280px] sm:w-[320px] flex-shrink-0 bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-4 shadow-subtle hover:shadow-card hover:border-[#26783C]/40 transition-all duration-300 flex flex-col justify-between group snap-start"
                >
                  <div>
                    {/* Cover / Icon & Status */}
                    <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-[#EAF1DC]">
                      {project.coverImage ? (
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#26783C]">
                          <FolderKanban className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#102B20]/80 text-[#E4EDCF] backdrop-blur-xs">
                        {project.status}
                      </span>
                    </div>

                    {/* Role & Category */}
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#26783C] font-semibold">{project.category}</span>
                      <span className="text-[#687769] font-medium">{project.userRole || 'Member'}</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#173D2A] line-clamp-1 group-hover:text-[#26783C] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#687769] line-clamp-2 mt-1">
                      {project.description}
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {project.technologies.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF1DC] text-[#173D2A] font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-[#EAF1DC] text-[#687769]">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DCE6D2]/80 space-y-2.5">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#687769] mb-1 font-medium">
                        <span>Milestone Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#EAF1DC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#26783C] rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Team avatars & CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {project.members.slice(0, 3).map((m, idx) => (
                          <img
                            key={idx}
                            src={m.avatarUrl}
                            alt={m.name}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#FAFCF5]"
                            title={m.name}
                          />
                        ))}
                        {project.members.length > 3 && (
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#DCE6D2] text-[9px] font-bold text-[#173D2A] ring-2 ring-[#FAFCF5]">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/projects/${project.id}`}
                        className="px-3 py-1 bg-[#26783C] hover:bg-[#1C622F] text-white text-[11px] font-bold rounded-btn transition-colors"
                      >
                        Open Project
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right: Quick Actions (4 cols) */}
        <section className="lg:col-span-4 space-y-3">
          <div>
            <h2 className="text-lg font-bold text-[#173D2A]">Quick Actions</h2>
            <p className="text-xs text-[#687769]">Rapid campus navigation shortcuts.</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { title: 'Find Teammates', desc: 'Match project skills', icon: UsersRound, to: '/team-finder' },
              { title: 'Browse Projects', desc: 'Join active cohorts', icon: FolderKanban, to: '/projects/discover' },
              { title: 'Exchange Resources', desc: 'Borrow kits & books', icon: Package, to: '/resources' },
              { title: 'View Credits', desc: 'Ledger & rewards', icon: Wallet, to: '/credits' },
              { title: 'Update Profile', desc: 'Showcase skills', icon: UserCheck, to: '/profile' },
              { title: 'Explore Events', desc: 'Hackathons & fests', icon: Calendar, to: '/events' },
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  to={action.to}
                  className="p-3 bg-[#FAFCF5] hover:bg-[#EEF4E3] border border-[#DCE6D2] hover:border-[#26783C]/40 rounded-card transition-all group flex flex-col justify-between"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EAF1DC] text-[#26783C] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#173D2A] group-hover:text-[#26783C] transition-colors leading-tight">
                      {action.title}
                    </div>
                    <div className="text-[10px] text-[#687769] leading-tight mt-0.5">
                      {action.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* F. Recommended Teammates & G. Recent Activity Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Teammates (7 cols) */}
        <section className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#173D2A]">Recommended Teammates</h2>
              <p className="text-xs text-[#687769]">
                Compatibility calculated from verified skills, branch, and role interests.
              </p>
            </div>
            <Link
              to="/team-finder"
              className="text-xs font-bold text-[#26783C] hover:underline"
            >
              Explore All
            </Link>
          </div>

          <div className="space-y-3">
            {otherStudents.slice(0, 3).map((student, idx) => {
              const matchScore = idx === 0 ? 96 : idx === 1 ? 92 : 88;
              const matchReason =
                idx === 0
                  ? 'Strong UI/UX design match for Campus Navigation App'
                  : idx === 1
                  ? 'Hardware & IoT specialist for sensor automation'
                  : 'Machine learning & Python pipelines contributor';

              return (
                <div
                  key={student.id}
                  className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-4 hover:border-[#26783C]/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-11 h-11 rounded-full object-cover border border-[#26783C]/30 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#173D2A]">{student.fullName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E4EDCF] text-[#173D2A]">
                          {matchScore}% Match
                        </span>
                      </div>
                      <div className="text-[11px] text-[#687769]">
                        {student.branch} • {student.academicYear}
                      </div>
                      <div className="text-[11px] text-[#26783C] font-medium mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#EFC66B]" />
                        <span>{matchReason}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {student.skills.slice(0, 3).map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF1DC] text-[#1D3024]"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                    <Link
                      to={`/users/${student.id}`}
                      className="flex-1 sm:flex-initial px-3 py-1.5 border border-[#DCE6D2] hover:bg-[#EAF1DC] text-[#173D2A] rounded-btn text-xs font-semibold text-center transition-colors"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleSendInvite(student.fullName)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn text-xs font-semibold text-center transition-colors"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Activity Preview (5 cols) */}
        <section className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#173D2A]">Recent Activity</h2>
              <p className="text-xs text-[#687769]">Your latest verified actions.</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-bold text-[#26783C] hover:underline"
            >
              View History
            </Link>
          </div>

          <div className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-4 space-y-3 divide-y divide-[#DCE6D2]/60">
            {history.slice(0, 4).map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-xs text-[#173D2A] flex items-center gap-1.5">
                    {item.title}
                    {item.creditDelta && item.creditDelta > 0 && (
                      <span className="text-[10px] font-bold text-[#26783C] bg-[#E4EDCF] px-1 rounded">
                        +{item.creditDelta}
                      </span>
                    )}
                    {item.creditDelta && item.creditDelta < 0 && (
                      <span className="text-[10px] font-bold text-[#D94A4A] bg-[#E9E1FA] px-1 rounded">
                        {item.creditDelta}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#687769] line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-[#A2BA95] block mt-0.5">
                    {item.timestamp}
                  </span>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EAF1DC] text-[#173D2A] flex-shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
