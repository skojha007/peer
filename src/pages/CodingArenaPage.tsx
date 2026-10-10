import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Code2,
  Lock,
  Unlock,
  ExternalLink,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  Bot,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CodingQuestion, QuestionDifficulty } from '../types';

export const CodingArenaPage: React.FC = () => {
  const {
    codingQuestions,
    unlockedQuestionIds,
    unlockQuestion,
    availableCredits,
    setSelectedQuestionContext,
    setIsAiMentorOpen,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Handle tab from URL path or local state
  const activeTab: 'all' | 'free' | 'premium' | 'unlocked' =
    location.pathname.includes('/premium')
      ? 'premium'
      : location.pathname.includes('/unlocked')
      ? 'unlocked'
      : 'free';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [confirmUnlockQuestion, setConfirmUnlockQuestion] = useState<CodingQuestion | null>(null);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

  const topicsList = [
    'All',
    'Arrays',
    'Strings',
    'Linked Lists',
    'Hash Table',
    'Graphs',
    'Dynamic Programming',
    'Design',
    'Intervals',
  ];

  // Filtering questions
  const filteredQuestions = codingQuestions.filter((q) => {
    // Tab filtering
    if (activeTab === 'free' && q.category !== 'Free') return false;
    if (activeTab === 'premium' && q.category !== 'Premium') return false;
    if (activeTab === 'unlocked' && !unlockedQuestionIds.includes(q.id)) return false;

    // Platform filtering
    if (selectedPlatform !== 'All' && q.platform !== selectedPlatform) return false;

    // Difficulty filtering
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;

    // Topic filtering
    if (selectedTopic !== 'All' && !q.topics.includes(selectedTopic)) return false;

    // Search query
    if (
      searchQuery.trim() &&
      !q.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !q.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    return true;
  });

  const unlockedCount = unlockedQuestionIds.length;

  const handleStartUnlock = (question: CodingQuestion) => {
    setConfirmUnlockQuestion(question);
  };

  const handleConfirmUnlock = () => {
    if (!confirmUnlockQuestion) return;

    const result = unlockQuestion(confirmUnlockQuestion.id);

    if (!result.success) {
      if (result.reason === 'insufficient_credits') {
        setErrorModal({
          title: 'Insufficient Campus Credits',
          message: `This curated premium question link costs ${confirmUnlockQuestion.creditPrice} credits. Your current balance is ${availableCredits} credits. Complete developer activities or connect your profiles to earn more credits.`,
        });
      } else {
        setErrorModal({
          title: 'Unlock Failed',
          message: result.reason || 'An unexpected error occurred.',
        });
      }
    }

    setConfirmUnlockQuestion(null);
  };

  const handleOpenAiWithContext = (q: CodingQuestion) => {
    setSelectedQuestionContext(q);
    setIsAiMentorOpen(true);
  };

  const getDifficultyBadge = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case 'Easy':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E4EDCF] text-[#26783C]">Easy</span>;
      case 'Medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFC66B]/20 text-[#B88718]">Medium</span>;
      case 'Hard':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D94A4A]/15 text-[#D94A4A]">Hard</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* A. Coding Arena Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <Code2 className="w-3.5 h-3.5 text-[#26783C]" />
          PeerCraft Coding Arena
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Coding Arena
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Practice anywhere. Learn everywhere. Build your skills.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-xs text-[#687769] font-medium">Available Campus Credits</div>
            <div className="text-2xl font-black text-[#173D2A] mt-1 flex items-center gap-1.5">
              <Coins className="w-5 h-5 text-[#EFC66B] fill-[#EFC66B]" />
              {availableCredits.toLocaleString()}
            </div>
          </div>
          <Link
            to="/credits/earn"
            className="text-xs font-bold text-[#26783C] hover:underline"
          >
            + Earn More
          </Link>
        </div>

        <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-xs text-[#687769] font-medium">Questions Unlocked</div>
            <div className="text-2xl font-black text-[#173D2A] mt-1">
              {unlockedCount}
            </div>
          </div>
          <Link
            to="/coding-arena/unlocked"
            className="text-xs font-bold text-[#26783C] hover:underline"
          >
            View Unlocked
          </Link>
        </div>

        <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-xs text-[#687769] font-medium">Verified Solutions</div>
            <div className="text-2xl font-black text-[#26783C] mt-1">
              External Sync
            </div>
          </div>
          <span className="text-[10px] text-[#687769] bg-[#EAF1DC] px-2 py-1 rounded">
            Tracked on Platform
          </span>
        </div>
      </div>

      {/* Mandatory External Access Disclosure Notice */}
      <div className="bg-[#EAF1DC] border border-[#DCE6D2] rounded-xl p-4 flex items-start gap-3 text-xs text-[#1D3024]">
        <ShieldAlert className="w-5 h-5 text-[#26783C] flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#173D2A]">External Platform Access Notice: </strong>
          PeerCraft acts as a question discovery and curated indexing platform. Questions are hosted and evaluated directly on their original external platforms (LeetCode, HackerRank, GeeksforGeeks). Unlocking a premium question link uses PeerCraft credits to reveal the curated question link within PeerCraft; any paid subscription or account required by the destination service is separate and not bypassed by PeerCraft.
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[#DCE6D2] gap-6 text-sm font-semibold">
        <button
          onClick={() => navigate('/coding-arena')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'free'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Free Practice
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#EAF1DC] text-[#26783C]">
            {codingQuestions.filter((q) => q.category === 'Free').length}
          </span>
        </button>

        <button
          onClick={() => navigate('/coding-arena/premium')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'premium'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Premium Questions
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#EFC66B]/20 text-[#B88718]">
            100 Credits
          </span>
        </button>

        <button
          onClick={() => navigate('/coding-arena/unlocked')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'unlocked'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          My Unlocked Links
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#173D2A]">
            {unlockedCount}
          </span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem title or algorithmic concept..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#EAF1DC]/50 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1.5 bg-[#EAF1DC]/70 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-medium"
            >
              <option value="All">All Platforms</option>
              <option value="LeetCode">LeetCode</option>
              <option value="HackerRank">HackerRank</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1.5 bg-[#EAF1DC]/70 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-medium"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {topicsList.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                selectedTopic === topic
                  ? 'bg-[#173D2A] text-white font-semibold'
                  : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.length === 0 ? (
          <div className="col-span-full bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-12 text-center text-[#687769]">
            <Code2 className="w-10 h-10 mx-auto text-[#26783C] opacity-40 mb-2" />
            <div className="font-semibold text-sm text-[#173D2A]">No questions match current criteria</div>
            <p className="text-xs mt-1">Try resetting filters or searching for another topic.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isUnlocked = unlockedQuestionIds.includes(q.id);
            const isPremium = q.category === 'Premium';

            return (
              <div
                key={q.id}
                className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Platform & Difficulty & Price */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#173D2A] px-2 py-0.5 rounded bg-[#EAF1DC]">
                        {q.platform}
                      </span>
                      {getDifficultyBadge(q.difficulty)}
                    </div>

                    {isPremium ? (
                      isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#26783C] bg-[#E4EDCF] px-2 py-0.5 rounded-full">
                          <Unlock className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B88718] bg-[#EFC66B]/20 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> {q.creditPrice} Credits
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] font-semibold text-[#26783C] bg-[#EAF1DC] px-2 py-0.5 rounded-full">
                        Free Practice
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base text-[#173D2A] group-hover:text-[#26783C] transition-colors">
                    {q.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-[#687769] mt-1.5 line-clamp-2 leading-relaxed">
                    {q.summary}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {q.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#EAF1DC] text-[#1D3024] font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* External access notice if premium */}
                  {isPremium && q.externalAccessRequirement && (
                    <div className="mt-3 p-2 rounded bg-[#EAF1DC]/60 text-[10px] text-[#687769] flex items-start gap-1.5">
                      <HelpCircle className="w-3 h-3 text-[#B88718] flex-shrink-0 mt-0.5" />
                      <span>{q.externalAccessRequirement}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-[#DCE6D2] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenAiWithContext(q)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-btn border border-[#DCE6D2] hover:bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold transition-colors"
                    title="Ask AI Mentor for hints or explanation"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#26783C]" />
                    <span>AI Guidance</span>
                  </button>

                  <div>
                    {!isPremium ? (
                      /* Free question: opens external URL with NO credit deduction */
                      <a
                        href={q.questionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
                      >
                        <span>Solve on {q.platform}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : isUnlocked ? (
                      /* Already unlocked: opens external URL directly without re-charging */
                      <a
                        href={q.questionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#173D2A] hover:bg-[#102B20] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
                      >
                        <span>Open Premium Question</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      /* Locked premium question: triggers unlock modal */
                      <button
                        onClick={() => handleStartUnlock(q)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#173D2A] hover:bg-[#26783C] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#EFC66B]" />
                        <span>Unlock ({q.creditPrice} Credits)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Premium Question Unlock Confirmation Dialog */}
      {confirmUnlockQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#EFC66B]" />
                Confirm Question Link Unlock
              </div>
              <button
                onClick={() => setConfirmUnlockQuestion(null)}
                className="text-[#687769] hover:text-[#173D2A] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#EAF1DC] rounded-xl space-y-1">
                <div className="text-[11px] text-[#687769]">Question Title:</div>
                <div className="font-bold text-sm text-[#173D2A]">
                  {confirmUnlockQuestion.title}
                </div>
                <div className="text-[11px] text-[#26783C]">
                  Platform: {confirmUnlockQuestion.platform} • {confirmUnlockQuestion.difficulty}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 p-3 bg-[#FAFCF5] border border-[#DCE6D2] rounded-xl">
                <div className="flex justify-between">
                  <span className="text-[#687769]">PeerCraft Unlock Price:</span>
                  <span className="font-bold text-[#D94A4A]">
                    -{confirmUnlockQuestion.creditPrice} Credits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#687769]">Current Credit Balance:</span>
                  <span className="font-bold text-[#173D2A]">{availableCredits} Credits</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#DCE6D2] font-bold">
                  <span className="text-[#173D2A]">Balance After Purchase:</span>
                  <span
                    className={
                      availableCredits - confirmUnlockQuestion.creditPrice >= 0
                        ? 'text-[#26783C]'
                        : 'text-[#D94A4A]'
                    }
                  >
                    {availableCredits - confirmUnlockQuestion.creditPrice} Credits
                  </span>
                </div>
              </div>

              {/* Mandatory External Subscription Disclosure */}
              <div className="p-3 bg-[#EAF1DC]/70 border border-[#DCE6D2] rounded-xl text-[11px] text-[#687769] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B88718] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Notice:</strong> Unlocking this question uses PeerCraft credits to reveal its curated external link. Any subscription or payment required by the original platform ({confirmUnlockQuestion.platform}) is separate.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmUnlockQuestion(null)}
                className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                disabled={availableCredits < confirmUnlockQuestion.creditPrice}
                className="px-4 py-2 bg-[#173D2A] hover:bg-[#26783C] disabled:opacity-40 text-white rounded-btn font-bold transition-colors"
              >
                Confirm & Unlock Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error / Insufficient Credits Modal */}
      {errorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center gap-2 text-[#D94A4A] font-bold text-base pb-2 border-b border-[#DCE6D2]">
              <AlertTriangle className="w-5 h-5" />
              {errorModal.title}
            </div>
            <p className="text-xs text-[#687769] leading-relaxed">{errorModal.message}</p>
            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <Link
                to="/credits/earn"
                onClick={() => setErrorModal(null)}
                className="px-4 py-2 bg-[#26783C] text-white rounded-btn font-bold hover:bg-[#1C622F]"
              >
                Earn More Credits
              </Link>
              <button
                onClick={() => setErrorModal(null)}
                className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
