import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Sparkles,
  Download,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const CampusCreditsPage: React.FC = () => {
  const { availableCredits, lifetimeEarned, lifetimeSpent, transactions } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample weekly ledger trend data
  const chartData = [
    { period: 'Aug 15', earned: 1000, spent: 0 },
    { period: 'Sep 01', earned: 0, spent: 0 },
    { period: 'Sep 12', earned: 100, spent: 0 },
    { period: 'Sep 20', earned: 100, spent: 0 },
    { period: 'Oct 01', earned: 50, spent: 0 },
    { period: 'Current', earned: 0, spent: lifetimeSpent },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'earned' && tx.amount <= 0) return false;
    if (filterType === 'spent' && tx.amount >= 0) return false;
    if (
      searchQuery &&
      !tx.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tx.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Wallet className="w-3.5 h-3.5 text-[#26783C]" />
            Campus Credits Wallet
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
            Campus Credits
          </h1>
          <p className="text-sm text-[#687769] mt-1">
            Verified campus economy: Earn through engineering activity, invest in learning.
          </p>
        </div>

        <Link
          to="/credits/earn"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors w-fit shadow-xs"
        >
          <Coins className="w-4 h-4 text-[#EFC66B]" />
          <span>Earn More Credits</span>
        </Link>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#173D2A] text-white p-5 rounded-card shadow-card relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#A2BA95] font-medium flex items-center justify-between">
              <span>Available Balance</span>
              <Coins className="w-5 h-5 text-[#EFC66B] fill-[#EFC66B]" />
            </div>
            <div className="text-3xl font-black tracking-tight mt-2 text-white">
              {availableCredits.toLocaleString()} <span className="text-sm font-normal text-[#E4EDCF]">Credits</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#26783C]/60 text-[11px] text-[#A2BA95] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#EFC66B]" />
            <span>Audited & backed by campus ledger</span>
          </div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#687769] font-medium flex items-center justify-between">
              <span>Lifetime Earned</span>
              <ArrowUpRight className="w-5 h-5 text-[#26783C]" />
            </div>
            <div className="text-2xl font-black text-[#26783C] tracking-tight mt-2">
              +{lifetimeEarned.toLocaleString()}
            </div>
          </div>
          <div className="text-[11px] text-[#687769] mt-4 pt-3 border-t border-[#DCE6D2]">
            Includes 1,000 signup bonus & platform rewards
          </div>
        </div>

        <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#687769] font-medium flex items-center justify-between">
              <span>Lifetime Spent</span>
              <ArrowDownLeft className="w-5 h-5 text-[#D94A4A]" />
            </div>
            <div className="text-2xl font-black text-[#D94A4A] tracking-tight mt-2">
              -{lifetimeSpent.toLocaleString()}
            </div>
          </div>
          <div className="text-[11px] text-[#687769] mt-4 pt-3 border-t border-[#DCE6D2]">
            Used for curated premium question links
          </div>
        </div>
      </div>

      {/* Earnings & Spendings Chart */}
      <div className="bg-[#FAFCF5] p-5 rounded-card border border-[#DCE6D2] shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#173D2A]">Credit Activity Flow</h2>
            <p className="text-xs text-[#687769]">Historical credit additions and redemptions over time.</p>
          </div>
          <span className="text-xs font-semibold text-[#26783C] bg-[#EAF1DC] px-2.5 py-1 rounded-full">
            All Transactions Reconciled
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE6D2" opacity={0.6} />
              <XAxis dataKey="period" stroke="#687769" fontSize={11} />
              <YAxis stroke="#687769" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAFCF5',
                  borderColor: '#DCE6D2',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="earned" name="Credits Earned" fill="#26783C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Credits Spent" fill="#D94A4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-subtle p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#173D2A]">Audit-Proof Transaction Ledger</h2>
            <p className="text-xs text-[#687769]">Immutable log of every credit event and transaction ID.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="flex rounded-lg border border-[#DCE6D2] overflow-hidden text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  filterType === 'all' ? 'bg-[#173D2A] text-white font-bold' : 'hover:bg-[#EAF1DC]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('earned')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  filterType === 'earned' ? 'bg-[#173D2A] text-white font-bold' : 'hover:bg-[#EAF1DC]'
                }`}
              >
                Earned
              </button>
              <button
                onClick={() => setFilterType('spent')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  filterType === 'spent' ? 'bg-[#173D2A] text-white font-bold' : 'hover:bg-[#EAF1DC]'
                }`}
              >
                Spent
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#EAF1DC]/60 text-[#173D2A] uppercase text-[10px] tracking-wider font-semibold border-b border-[#DCE6D2]">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Type / Source</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6D2]/60">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#EEF4E3]/60 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-[#687769]">{tx.id}</td>
                  <td className="py-3 px-3 font-medium text-[#1D3024] max-w-xs">{tx.description}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#EAF1DC] text-[#173D2A] font-semibold text-[10px]">
                      {tx.sourcePlatform || tx.transactionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#687769] whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#26783C] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#26783C]" />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-sm whitespace-nowrap">
                    {tx.amount > 0 ? (
                      <span className="text-[#26783C]">+{tx.amount}</span>
                    ) : (
                      <span className="text-[#D94A4A]">{tx.amount}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
