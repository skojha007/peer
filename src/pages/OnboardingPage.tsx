import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Code2,
  FolderKanban,
  ExternalLink,
  Camera,
  Coins,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingPage: React.FC = () => {
  const { currentUser, updateUserProfile } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Wizard state
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'System Architecture',
    'AI Prompt Engineering',
  ]);
  const [preferredRole, setPreferredRole] = useState('Full-Stack Engineer');

  const availableSkills = [
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'Python',
    'Docker',
    'Tailwind CSS',
    'FastAPI',
    'Embedded C',
    'UI/UX Design',
    'Figma',
  ];

  const availableInterests = [
    'System Architecture',
    'Cloud Native',
    'AI Prompt Engineering',
    'Competitive Coding',
    'IoT & Hardware',
    'Mobile Apps',
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      updateUserProfile({
        bio,
        interests: selectedInterests,
      });
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F3F7EA] text-[#1D3024] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-card p-6 sm:p-8 space-y-6">
        {/* Progress Bar & Header */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#687769] mb-2 font-medium">
            <span>Step {step} of {totalSteps}</span>
            <button
              onClick={handleSkip}
              className="text-[#26783C] hover:underline font-bold"
            >
              Skip to Dashboard
            </button>
          </div>
          <div className="w-full h-2 bg-[#EAF1DC] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#26783C] rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Personal & Academic Details */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-xl font-bold text-[#173D2A]">Welcome, {currentUser.firstName}!</h2>
              <p className="text-[#687769] mt-1">Let's refine your campus student presence.</p>
            </div>
            <div>
              <label className="block font-bold text-[#173D2A] mb-1">Your Bio / One-liner</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe what you like building or engineering topics you're excited about..."
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Technical Skills */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-xl font-bold text-[#173D2A]">Select Your Primary Skills</h2>
              <p className="text-[#687769] mt-1">
                Choose the tools and technologies you are confident working with.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((s) => {
                const isSelected = selectedSkills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSkills((prev) =>
                        isSelected ? prev.filter((item) => item !== s) : [...prev, s]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                      isSelected
                        ? 'bg-[#173D2A] text-white shadow-xs font-bold'
                        : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
                    }`}
                  >
                    {s} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Interests & Preferred Roles */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-xl font-bold text-[#173D2A]">Preferred Project Roles</h2>
              <p className="text-[#687769] mt-1">What role do you prefer in campus project teams?</p>
            </div>
            <div>
              <label className="block font-bold text-[#173D2A] mb-1">Target Role</label>
              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
              >
                <option value="Full-Stack Engineer">Full-Stack Engineer</option>
                <option value="Frontend Lead">Frontend Lead</option>
                <option value="Backend Architect">Backend Architect</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="Embedded Systems Specialist">Embedded Systems Specialist</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#173D2A] mb-1.5">Collaboration Interests</label>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        setSelectedInterests((prev) =>
                          isSelected ? prev.filter((i) => i !== interest) : [...prev, interest]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                        isSelected
                          ? 'bg-[#26783C] text-white font-bold'
                          : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Developer Platform Sync */}
        {step === 4 && (
          <div className="space-y-4 text-xs">
            <div>
              <h2 className="text-xl font-bold text-[#173D2A]">Developer Platforms</h2>
              <p className="text-[#687769] mt-1">
                Your linked accounts let you claim daily Campus Credits in Earn Credits.
              </p>
            </div>
            <div className="p-4 bg-[#EAF1DC] rounded-xl space-y-2">
              <div className="font-bold text-[#173D2A]">Connected Profiles:</div>
              <div className="text-[11px] text-[#26783C] space-y-1">
                <div>✓ GitHub: @{currentUser.githubUrl ? 'connected' : 'ready to connect'}</div>
                <div>✓ LeetCode: @{currentUser.leetcodeUrl ? 'connected' : 'ready to connect'}</div>
              </div>
              <p className="text-[10px] text-[#687769] mt-2">
                You can fine-tune your connection details anytime from the Earn Credits sidebar item.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Profile Picture Preview */}
        {step === 5 && (
          <div className="space-y-4 text-xs text-center">
            <div>
              <h2 className="text-xl font-bold text-[#173D2A]">Your Avatar & Badge</h2>
              <p className="text-[#687769] mt-1">This avatar will represent you in project teams.</p>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#26783C] shadow-subtle"
              />
              <span className="mt-3 text-sm font-bold text-[#173D2A]">{currentUser.fullName}</span>
              <span className="text-xs text-[#687769]">{currentUser.branch}</span>
            </div>
          </div>
        )}

        {/* Step 6: Completion Summary */}
        {step === 6 && (
          <div className="space-y-4 text-xs text-center">
            <div className="w-12 h-12 rounded-full bg-[#E4EDCF] text-[#26783C] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#173D2A]">You're All Set!</h2>
              <p className="text-[#687769] mt-1">
                Your profile is active, 1,000 credits are ready, and your workspace is waiting.
              </p>
            </div>
            <div className="bg-[#EAF1DC] p-4 rounded-xl text-left space-y-1.5 text-xs text-[#1D3024]">
              <div>• <strong>Available Credits:</strong> 1,000 Campus Credits</div>
              <div>• <strong>Role:</strong> {preferredRole}</div>
              <div>• <strong>Key Skills:</strong> {selectedSkills.join(', ')}</div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#DCE6D2] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-[#DCE6D2] hover:bg-[#EAF1DC] rounded-btn font-semibold text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <span>{step === totalSteps ? 'Enter PeerCraft' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
