import React, { useState } from 'react';
import {
  ShieldAlert,
  Coins,
  Settings,
  Code2,
  FolderKanban,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit,
  ExternalLink,
  History,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { adminUser } from '../data/mockData';
import { CodingQuestion, CodingPlatform, QuestionDifficulty } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    switchUser,
    signupBonusAmount,
    setSignupBonusAmount,
    rewardRules,
    updateRewardRule,
    codingQuestions,
    addCodingQuestion,
    updateCodingQuestion,
    verifyQuestionLink,
    auditLogs,
    projects,
    allUsers,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'rules' | 'questions' | 'audit' | 'users'>('rules');
  const [bonusInput, setBonusInput] = useState<number>(signupBonusAmount);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CodingQuestion | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New question form fields
  const [qTitle, setQTitle] = useState('');
  const [qPlatform, setQPlatform] = useState<CodingPlatform>('LeetCode');
  const [qUrl, setQUrl] = useState('');
  const [qDifficulty, setQDifficulty] = useState<QuestionDifficulty>('Medium');
  const [qCategory, setQCategory] = useState<'Free' | 'Premium'>('Premium');
  const [qPrice, setQPrice] = useState(100);
  const [qTopics, setQTopics] = useState('Arrays, Design');
  const [qSummary, setQSummary] = useState('');
  const [qRequirement, setQRequirement] = useState(
    'Curated external link to official LeetCode problem. External platform requires LeetCode Premium subscription.'
  );

  const handleUpdateBonus = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupBonusAmount(bonusInput);
    setToastMsg(`Signup bonus updated to ${bonusInput} Campus Credits!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle || !qUrl) return;

    addCodingQuestion({
      title: qTitle,
      platform: qPlatform,
      questionUrl: qUrl,
      difficulty: qDifficulty,
      category: qCategory,
      creditPrice: qCategory === 'Premium' ? qPrice : 0,
      topics: qTopics.split(',').map((t) => t.trim()).filter(Boolean),
      summary: qSummary || 'Original summary of problem objective and constraints.',
      externalAccessRequirement: qCategory === 'Premium' ? qRequirement : undefined,
      isPublished: true,
      lastLinkVerifiedAt: new Date().toISOString().substring(0, 10),
    });

    setShowAddQuestionModal(false);
    setQTitle('');
    setQUrl('');
    setToastMsg('Published new curated coding question link!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleVerifyLink = (id: string, title: string) => {
    verifyQuestionLink(id);
    setToastMsg(`Verified destination link integrity for "${title}"!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="bg-[#26783C] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}>✕</button>
        </div>
      )}

      {/* Role Notice & Persona Quick Switch if not Admin */}
      {currentUser.role !== 'admin' && (
        <div className="bg-[#EAF1DC] border border-[#26783C] p-4 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#173D2A]">
            <ShieldAlert className="w-5 h-5 text-[#26783C] flex-shrink-0" />
            <span>
              You are currently viewing as <strong>{currentUser.fullName} (Student)</strong>. Switch to the administrative persona to test rule modifications and question directory management.
            </span>
          </div>
          <button
            onClick={() => switchUser(adminUser)}
            className="px-4 py-1.5 bg-[#173D2A] hover:bg-[#102B20] text-white rounded-btn font-bold transition-colors whitespace-nowrap shadow-xs"
          >
            Switch to Admin Persona
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-[#EFC66B]" />
          Platform Governance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Configure credit reward rules, curate coding questions, verify external URLs, and review audit logs.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium">Configured Signup Bonus</div>
          <div className="text-2xl font-black text-[#173D2A] mt-1 flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-[#EFC66B]" />
            {signupBonusAmount} Credits
          </div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium">Curated Coding Questions</div>
          <div className="text-2xl font-black text-[#173D2A] mt-1">
            {codingQuestions.length} Questions
          </div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium">Active Campus Projects</div>
          <div className="text-2xl font-black text-[#26783C] mt-1">
            {projects.length} Initiatives
          </div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle">
          <div className="text-xs text-[#687769] font-medium">Audit Trail Entries</div>
          <div className="text-2xl font-black text-[#173D2A] mt-1">
            {auditLogs.length} Events
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DCE6D2] gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveAdminTab('rules')}
          className={`pb-3 transition-colors ${
            activeAdminTab === 'rules'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Reward & Bonus Rules
        </button>

        <button
          onClick={() => setActiveAdminTab('questions')}
          className={`pb-3 transition-colors ${
            activeAdminTab === 'questions'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Coding Question Directory ({codingQuestions.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`pb-3 transition-colors ${
            activeAdminTab === 'audit'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab: Reward Rules & Signup Bonus Configuration */}
      {activeAdminTab === 'rules' && (
        <div className="space-y-6">
          {/* Signup Bonus Settings Card */}
          <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-[#173D2A] flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#EFC66B]" />
              New User Registration Welcome Bonus
            </h2>
            <p className="text-xs text-[#687769] max-w-2xl leading-relaxed">
              Every eligible new student receives this credit reward atomically upon registration. It is granted strictly once per verified account and logged in the credit ledger.
            </p>

            <form onSubmit={handleUpdateBonus} className="flex items-center gap-3 max-w-sm text-xs">
              <input
                type="number"
                min={100}
                max={5000}
                step={50}
                value={bonusInput}
                onChange={(e) => setBonusInput(Number(e.target.value))}
                className="px-3.5 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] font-bold text-sm outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold transition-colors shadow-xs"
              >
                Update Bonus
              </button>
            </form>
          </div>

          {/* Platform Reward Rules Table */}
          <div className="bg-[#FAFCF5] p-6 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
            <h2 className="text-base font-bold text-[#173D2A]">Developer Platform Reward Rules & Caps</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#EAF1DC]/60 text-[#173D2A] uppercase text-[10px] tracking-wider font-semibold border-b border-[#DCE6D2]">
                  <tr>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Activity Type</th>
                    <th className="py-2.5 px-3">Reward / Activity</th>
                    <th className="py-2.5 px-3">Daily Cap</th>
                    <th className="py-2.5 px-3">Verification Method</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6D2]/60">
                  {rewardRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-[#EEF4E3]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#173D2A] uppercase">{rule.platform}</td>
                      <td className="py-3 px-3 text-[#1D3024]">{rule.activityType}</td>
                      <td className="py-3 px-3 font-semibold text-[#26783C]">+{rule.rewardAmount} Credits</td>
                      <td className="py-3 px-3 font-bold text-[#173D2A]">{rule.dailyCap} Credits / Day</td>
                      <td className="py-3 px-3 text-[#687769]">{rule.verificationMethod}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4EDCF] text-[#26783C]">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Question Management Directory */}
      {activeAdminTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#173D2A]">Curated Question Index</h2>
              <p className="text-xs text-[#687769]">Manage question links, unlock prices, and verified destination URLs.</p>
            </div>
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Curated Question</span>
            </button>
          </div>

          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#EAF1DC]/60 text-[#173D2A] uppercase text-[10px] tracking-wider font-semibold border-b border-[#DCE6D2]">
                  <tr>
                    <th className="py-2.5 px-3">Title & Platform</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Difficulty</th>
                    <th className="py-2.5 px-3">PeerCraft Price</th>
                    <th className="py-2.5 px-3">Last Verified</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6D2]/60">
                  {codingQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-[#EEF4E3]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#173D2A]">{q.title}</div>
                        <div className="text-[11px] text-[#687769] font-mono truncate max-w-xs">
                          {q.questionUrl}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            q.category === 'Premium'
                              ? 'bg-[#EFC66B]/25 text-[#B88718]'
                              : 'bg-[#EAF1DC] text-[#26783C]'
                          }`}
                        >
                          {q.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#1D3024]">{q.difficulty}</td>
                      <td className="py-3 px-3 font-bold text-[#173D2A]">
                        {q.creditPrice > 0 ? `${q.creditPrice} Credits` : 'Free (0)'}
                      </td>
                      <td className="py-3 px-3 text-[#687769]">{q.lastLinkVerifiedAt}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleVerifyLink(q.id, q.title)}
                          className="px-2.5 py-1 bg-[#173D2A] hover:bg-[#102B20] text-white rounded text-[10px] font-bold transition-colors mr-1"
                        >
                          Verify Link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeAdminTab === 'audit' && (
        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-4">
          <h2 className="text-base font-bold text-[#173D2A]">Administrative Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#EAF1DC]/60 text-[#173D2A] uppercase text-[10px] tracking-wider font-semibold border-b border-[#DCE6D2]">
                <tr>
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6D2]/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#EEF4E3]/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-[#687769]">{log.id}</td>
                    <td className="py-3 px-3 font-semibold text-[#173D2A]">{log.adminName}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#26783C]">{log.action}</td>
                    <td className="py-3 px-3 text-[#687769]">{log.targetType}</td>
                    <td className="py-3 px-3 text-[#1D3024]">{log.details}</td>
                    <td className="py-3 px-3 text-[#A2BA95] font-mono text-[10px]">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Curated Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-lg w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#26783C]" />
                Add Curated Coding Question Link
              </div>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  placeholder="e.g. Word Search II"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">Platform</label>
                  <select
                    value={qPlatform}
                    onChange={(e) => setQPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">Difficulty</label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">
                  Destination External URL
                </label>
                <input
                  type="url"
                  required
                  value={qUrl}
                  onChange={(e) => setQUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">Category</label>
                  <select
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  >
                    <option value="Premium">Premium Curated</option>
                    <option value="Free">Free Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#173D2A] mb-1">
                    Credit Price (0 for Free)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={qPrice}
                    onChange={(e) => setQPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">Topic Tags</label>
                <input
                  type="text"
                  value={qTopics}
                  onChange={(e) => setQTopics(e.target.value)}
                  placeholder="Trie, Backtracking, DFS"
                  className="w-full px-3 py-2 bg-[#EAF1DC]/50 border border-[#DCE6D2] rounded-input text-[#1D3024] outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold"
                >
                  Publish Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
