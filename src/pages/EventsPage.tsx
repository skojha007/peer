import React, { useState } from 'react';
import {
  CalendarDays,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EventsPage: React.FC = () => {
  const { events, registerForEvent } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const registeredEvents = events.filter((e) => e.isRegistered);

  const filteredEvents = (activeTab === 'upcoming' ? events : registeredEvents).filter((e) => {
    if (
      searchQuery &&
      !e.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleRegister = (eventId: string, title: string) => {
    registerForEvent(eventId);
    setToastMsg(`Successfully registered for "${title}"!`);
    setTimeout(() => setToastMsg(null), 3500);
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

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1DC] text-[#173D2A] text-xs font-semibold mb-2">
          <CalendarDays className="w-3.5 h-3.5 text-[#26783C]" />
          Campus Hackathons & Fests
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173D2A] tracking-tight">
          Events & Hackathons
        </h1>
        <p className="text-sm text-[#687769] mt-1">
          Discover hackathons, developer meetups, coding cups, and campus technical workshops.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DCE6D2] gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 transition-colors ${
            activeTab === 'upcoming'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          Upcoming Events ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('registered')}
          className={`pb-3 transition-colors ${
            activeTab === 'registered'
              ? 'text-[#173D2A] border-b-2 border-[#173D2A]'
              : 'text-[#687769] hover:text-[#173D2A]'
          }`}
        >
          My Registered Events ({registeredEvents.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-[#FAFCF5] p-4 rounded-card border border-[#DCE6D2] shadow-subtle max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687769]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hackathons, topics, workshops..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#EAF1DC]/50 focus:bg-[#FAFCF5] border border-[#DCE6D2] focus:border-[#26783C] rounded-input text-[#1D3024] outline-none"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-[#FAFCF5] border border-[#DCE6D2] rounded-card p-5 shadow-subtle hover:border-[#26783C]/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF1DC] text-[#26783C]">
                  {event.category}
                </span>
                {event.isOnline && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DDEBFA] text-[#173D2A]">
                    Virtual
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-[#173D2A] group-hover:text-[#26783C] transition-colors leading-snug">
                {event.title}
              </h3>

              <div className="mt-3 space-y-1.5 text-xs text-[#687769]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#26783C]" />
                  <span>{event.dateTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#26783C]" />
                  <span>{event.location}</span>
                </div>
                <div className="text-[11px] text-[#A2BA95]">Organized by {event.organizer}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {event.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#EAF1DC] text-[#173D2A] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 text-[11px] text-[#687769]">
                Eligibility: <span className="font-semibold text-[#173D2A]">{event.eligibility}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#DCE6D2] flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#D94A4A] font-medium">
                Deadline: {event.registrationDeadline}
              </span>

              {event.isRegistered ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#26783C] bg-[#E4EDCF] px-3 py-1.5 rounded-btn">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                </span>
              ) : (
                <button
                  onClick={() => handleRegister(event.id, event.title)}
                  className="px-3.5 py-1.5 bg-[#26783C] hover:bg-[#1C622F] text-white text-xs font-bold rounded-btn transition-colors shadow-2xs"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
