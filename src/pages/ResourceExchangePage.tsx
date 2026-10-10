import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Package,
  BookOpen,
  Cpu,
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResourceItem } from '../types';

export const ResourceExchangePage: React.FC = () => {
  const { resources, borrowResource, returnResource, currentUser } = useApp();
  const location = useLocation();

  const isHistoryTab = location.pathname.includes('/history');
  const [activeTab, setActiveTab] = useState<'browse' | 'borrowed'>(
    isHistoryTab ? 'borrowed' : 'browse'
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [borrowModalResource, setBorrowModalResource] = useState<ResourceItem | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; success: boolean } | null>(null);

  const categories = ['All', 'Books', 'Lab Equipment', 'Electronics', 'Learning Materials'];

  const myBorrowedItems = resources.filter(
    (r) => r.borrowedByUserId === currentUser.id
  );

  const filteredResources = (activeTab === 'browse' ? resources : myBorrowedItems).filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleConfirmBorrow = () => {
    if (!borrowModalResource) return;
    const res = borrowResource(borrowModalResource.id);
    setBorrowModalResource(null);
    setToastMsg({ text: res.message, success: res.success });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleReturnItem = (resourceId: string) => {
    const res = returnResource(resourceId);
    setToastMsg({ text: res.message, success: res.success });
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold shadow-card flex items-center justify-between ${
            toastMsg.success ? 'bg-[#26783C] text-white' : 'bg-[#D94A4A] text-white'
          }`}
        >
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <Package className="w-3.5 h-3.5 text-[#26783C]" />
          Campus Resource Exchange
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Resource Exchange
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Share textbooks, electronic dev kits, and lab equipment with verified campus peers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DCE6D2] gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-3 transition-colors ${
            activeTab === 'browse'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Browse Resources ({resources.length})
        </button>

        <button
          onClick={() => setActiveTab('borrowed')}
          className={`pb-3 transition-colors ${
            activeTab === 'borrowed'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          My Borrowed Items ({myBorrowedItems.length})
        </button>
      </div>

      {/* Search & Category filter */}
      <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, sensors, hardware kits..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#EAF1DC]/50 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#173D2A] text-white font-bold'
                    : 'bg-[#EAF1DC]/60 hover:bg-[#E4EDCF] text-[#1D3024] border border-[#DCE6D2]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.length === 0 ? (
          <div className="col-span-full bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-12 text-center text-[#687769]">
            <Package className="w-10 h-10 mx-auto text-[#26783C] opacity-40 mb-2" />
            <div className="font-semibold text-sm text-[#173D2A]">No resources found</div>
            <p className="text-xs mt-1">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          filteredResources.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 bg-[#EAF1DC]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#26783C]">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs ${
                      item.availability === 'Available'
                        ? 'bg-[#26783C]/90 text-white'
                        : 'bg-[#102B20]/80 text-[#EFC66B]'
                    }`}
                  >
                    {item.availability}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#26783C] font-semibold">{item.category}</span>
                  <span className="text-[#687769]">By {item.ownerName}</span>
                </div>

                <h3 className="font-bold text-base text-[#173D2A] group-hover:text-[#26783C] transition-colors line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-[#687769] mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 text-xs text-[#687769] flex items-center justify-between">
                  <span>Loan Duration:</span>
                  <span className="font-bold text-[#173D2A]">{item.borrowingDuration}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[#DCE6D2] flex items-center justify-between">
                {item.borrowedByUserId === currentUser.id ? (
                  <button
                    onClick={() => handleReturnItem(item.id)}
                    className="w-full py-2 bg-[#173D2A] hover:bg-[#102B20] text-white text-xs font-bold rounded-btn transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return Resource</span>
                  </button>
                ) : item.availability === 'Available' ? (
                  <button
                    onClick={() => setBorrowModalResource(item)}
                    className="w-full py-2 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-2xs"
                  >
                    Request to Borrow
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 bg-[#EAF1DC] text-[#687769] text-xs font-medium rounded-btn cursor-not-allowed"
                  >
                    Currently Borrowed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Borrow Request Confirmation Modal */}
      {borrowModalResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAFCF5] rounded-card border border-[#DCE6D2] p-6 max-w-md w-full shadow-card text-[#1D3024] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE6D2]">
              <div className="font-bold text-base text-[#173D2A] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#26783C]" />
                Borrow Campus Resource
              </div>
              <button
                onClick={() => setBorrowModalResource(null)}
                className="text-[#687769] hover:text-[#173D2A] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#EAF1DC] rounded-xl space-y-1">
                <div className="font-bold text-sm text-[#173D2A]">
                  {borrowModalResource.name}
                </div>
                <div className="text-[11px] text-[#687769]">
                  Owner: {borrowModalResource.ownerName} • {borrowModalResource.category}
                </div>
                <div className="text-[11px] text-[#26783C] font-semibold">
                  Borrowing Duration: {borrowModalResource.borrowingDuration}
                </div>
              </div>

              <p className="text-[#687769] leading-relaxed">
                By requesting this item, you agree to handle it carefully and return it on or before the due date. The owner will be notified to confirm physical handover.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setBorrowModalResource(null)}
                className="px-4 py-2 border border-[#DCE6D2] text-[#687769] hover:bg-[#EAF1DC] rounded-btn font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBorrow}
                className="px-4 py-2 bg-[#26783C] hover:bg-[#1C622F] text-white rounded-btn font-bold"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
