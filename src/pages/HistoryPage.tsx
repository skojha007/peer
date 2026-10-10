import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Coins,
  FolderKanban,
  Code2,
  Package,
  Calendar,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryPage: React.FC = () => {
  const { history } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Activity');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All Activity',
    'Credits Earned',
    'Credits Spent',
    'Projects',
    'Developer Platforms',
    'Team Invitations',
    'Resources',
    'Events',
    'Profile Updates',
    'Coding Arena',
  ];

  // Filtering
  const filteredHistory = history.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Activity' ||
      item.category === selectedCategory ||
      (selectedCategory === 'Credits Earned' && item.creditDelta && item.creditDelta > 0) ||
      (selectedCategory === 'Credits Spent' && item.creditDelta && item.creditDelta < 0);

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getEventIcon = (category: string, delta?: number) => {
    if (delta && delta > 0) return <ArrowUpRight className="w-4 h-4 text-[#26783C]" />;
    if (delta && delta < 0) return <ArrowDownLeft className="w-4 h-4 text-[#D94A4A]" />;
    if (category === 'Projects') return <FolderKanban className="w-4 h-4 text-[#26783C]" />;
    if (category === 'Coding Arena') return <Code2 className="w-4 h-4 text-[#173D2A]" />;
    if (category === 'Resources') return <Package className="w-4 h-4 text-[#173D2A]" />;
    if (category === 'Events') return <CalendarDays className="w-4 h-4 text-[#173D2A]" />;
    return <History className="w-4 h-4 text-[#687769]" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <History className="w-3.5 h-3.5 text-[#26783C]" />
          Verified Activity Trail
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Your History
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Every milestone, contribution, and credit in one place.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle space-y-3">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities, projects, milestones..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-[#EAF1DC]/50 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] placeholder-[#687769] outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-[#173D2A] text-white shadow-xs font-semibold'
                  : 'bg-[#EAF1DC]/70 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] shadow-subtle p-4 sm:p-6">
        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-[#687769] space-y-2">
            <History className="w-8 h-8 mx-auto opacity-40 text-[#173D2A]" />
            <div className="font-semibold text-sm text-[#173D2A]">No activity entries found</div>
            <p className="text-xs">Try selecting another filter or clearing the search box.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCE6D2]">
            {filteredHistory.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-[#FAFCF5] border-2 border-[#26783C] flex items-center justify-center shadow-xs">
                  {getEventIcon(item.category, item.creditDelta)}
                </div>

                {/* Content Box */}
                <div className="bg-[#FAFCF5] hover:bg-[#EEF4E3] p-4 rounded-xl border border-[#DCE6D2] transition-colors shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#173D2A]">{item.title}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#EAF1DC] text-[#173D2A]">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {item.creditDelta !== undefined && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.creditDelta > 0
                              ? 'bg-[#E4EDCF] text-[#26783C]'
                              : 'bg-[#E9E1FA] text-[#D94A4A]'
                          }`}
                        >
                          {item.creditDelta > 0 ? `+${item.creditDelta}` : item.creditDelta} Credits
                        </span>
                      )}
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#EAF1DC] text-[#687769]">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#687769] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#DCE6D2]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#A2BA95]">{item.timestamp}</span>
                    {item.linkUrl && (
                      <Link
                        to={item.linkUrl}
                        className="font-semibold text-[#26783C] hover:text-[#1C622F] flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
