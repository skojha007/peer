import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderPlus,
  ArrowLeft,
  Sparkles,
  Layers,
  Users,
  Calendar,
  Globe,
  GitBranch,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CreateProjectPage: React.FC = () => {
  const { createProject } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [techInput, setTechInput] = useState('React, TypeScript, Tailwind, Node.js');
  const [skillsInput, setSkillsInput] = useState('Frontend Architecture, API Design');
  const [maxMembers, setMaxMembers] = useState(4);
  const [repoUrl, setRepoUrl] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600'
  );
  const [timeline, setTimeline] = useState('3 Months (Fall Semester)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const technologies = techInput.split(',').map((s) => s.trim()).filter(Boolean);
    const requiredSkills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);

    createProject({
      title,
      description,
      category,
      technologies,
      requiredSkills,
      status: 'Active',
      progress: 15,
      maxMembers,
      repoUrl: repoUrl || undefined,
      coverImage: coverImage || undefined,
    });

    navigate('/projects');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#26783C] hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Create New Campus Project
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Form your team, recruit peer talent, and start building with verified milestones.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-5 text-xs"
      >
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-[#173D2A] mb-1.5">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campus Peer Tutoring Portal"
              className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none text-sm font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-[#173D2A] mb-1.5">Description & Goals</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, target audience, core deliverables, and technical approach..."
              className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#173D2A] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/70 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-medium"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
                <option value="IoT & Embedded Hardware">IoT & Embedded Hardware</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#173D2A] mb-1.5">Target Team Size</label>
              <input
                type="number"
                min={2}
                max={10}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#173D2A] mb-1.5">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="React, TypeScript, Node.js, PostgreSQL"
                className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#173D2A] mb-1.5">
                Required Teammate Skills
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="UI Design, REST API, Database Optimization"
                className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#173D2A] mb-1.5">
                Optional GitHub Repository
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#173D2A] mb-1.5">
                Estimated Timeline
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 2 Months"
                className="w-full px-3.5 py-2.5 bg-[#EAF1DC]/50 border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#DCE6D2] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-5 py-2.5 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold transition-colors shadow-xs"
          >
            Create & Enroll as Lead
          </button>
        </div>
      </form>
    </div>
  );
};
