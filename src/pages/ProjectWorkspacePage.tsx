import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Compass,
  Search,
  Filter,
  UsersRound,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  GitBranch,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProjectWorkspacePage: React.FC = () => {
  const { projects, currentUser } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'enrolled' | 'created' | 'completed' | 'discover'>('enrolled');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const enrolledProjects = projects.filter((p) => p.isUserEnrolled && p.status !== 'Completed');
  const createdProjects = projects.filter((p) => p.ownerId === currentUser.id);
  const completedProjects = projects.filter((p) => p.status === 'Completed');
  const discoverProjects = projects.filter((p) => !p.isUserEnrolled);

  const getActiveList = () => {
    switch (activeTab) {
      case 'enrolled':
        return enrolledProjects;
      case 'created':
        return createdProjects;
      case 'completed':
        return completedProjects;
      case 'discover':
        return discoverProjects;
    }
  };

  const filteredProjects = getActiveList().filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (
      searchQuery.trim() &&
      !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
            <FolderKanban className="w-3.5 h-3.5 text-[#26783C]" />
            Campus Project Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
            Project Workspace
          </h1>
          <p className="text-sm text-[#687769] mt-1">
            Build software, coordinate team milestones, and track verified project achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DCE6D2] gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('enrolled')}
          className={`pb-3 transition-colors ${
            activeTab === 'enrolled'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Enrolled ({enrolledProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('created')}
          className={`pb-3 transition-colors ${
            activeTab === 'created'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Created by Me ({createdProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`pb-3 transition-colors ${
            activeTab === 'discover'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Discover & Join ({discoverProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 transition-colors ${
            activeTab === 'completed'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Completed ({completedProjects.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or technology..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#EAF1DC]/50 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#687769] font-medium">Status:</span>
          {['All', 'In Progress', 'Planning', 'Active'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[#173D2A] text-white'
                  : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-12 text-center text-[#687769]">
            <FolderKanban className="w-10 h-10 mx-auto text-[#26783C] opacity-40 mb-2" />
            <div className="font-semibold text-sm text-[#173D2A]">No projects found in this view</div>
            <p className="text-xs mt-1">Try switching tabs or creating a new initiative.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Cover & Badges */}
                <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-[#EAF1DC]">
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
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#102B20]/80 text-[#E4EDCF] backdrop-blur-xs">
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#26783C] font-semibold">{project.category}</span>
                  <span className="text-[#687769]">By {project.ownerName}</span>
                </div>

                <h3 className="font-bold text-base text-[#173D2A] group-hover:text-[#26783C] transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-[#687769] mt-1 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {project.technologies.slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF1DC] text-[#1D3024] font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF1DC] text-[#687769]">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress & Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[#DCE6D2] space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#687769] mb-1">
                    <span>Progress</span>
                    <span className="font-bold text-[#173D2A]">{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EAF1DC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#26783C] rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
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
                    <span className="text-[11px] text-[#687769] pl-2.5 font-medium flex items-center">
                      {project.memberCount} members
                    </span>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="px-3.5 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-2xs"
                  >
                    Open Project
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
