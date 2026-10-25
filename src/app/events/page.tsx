'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Search, Filter, RotateCcw, Sparkles } from 'lucide-react';
import { CommunityEvent, EventCategory, Registration } from '@/lib/types';
import EventCard from '@/components/EventCard';
import EventFilters from '@/components/EventFilters';
import RegisterModal from '@/components/RegisterModal';
import QRCodeModal from '@/components/QRCodeModal';
import ShareModal from '@/components/ShareModal';

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Modals
  const [registerEvent, setRegisterEvent] = useState<CommunityEvent | null>(null);
  const [shareEvent, setShareEvent] = useState<CommunityEvent | null>(null);
  const [activeTicket, setActiveTicket] = useState<{
    registration: Registration;
    event?: CommunityEvent | null;
  } | null>(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    timeframe: 'upcoming' as 'all' | 'upcoming' | 'past',
    location: '',
    onlyAvailable: false,
    favoritesOnly: false,
  });

  const categories: (EventCategory | 'All')[] = [
    'All',
    'Environment',
    'Food Security',
    'Education',
    'Animal Welfare',
    'Health',
    'Community',
    'Crisis Relief',
    'Arts & Culture',
  ];

  useEffect(() => {
    fetchEvents();
    const saved = localStorage.getItem('cp_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }
    } catch (e) {
      console.error('Error fetching events:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('cp_favorites', JSON.stringify(updated));
  };

  // Filtered and searched events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Don't show draft events on public browse
      if (evt.status === 'draft') return false;

      // Category filter
      if (filters.category !== 'All' && evt.category !== filters.category) {
        return false;
      }

      // Timeframe filter
      const eventDate = new Date(evt.date);
      const now = new Date();
      if (filters.timeframe === 'upcoming' && eventDate < now) {
        return false;
      }
      if (filters.timeframe === 'past' && eventDate >= now) {
        return false;
      }

      // Location filter
      if (filters.location.trim()) {
        const loc = filters.location.toLowerCase();
        if (!evt.location.toLowerCase().includes(loc)) {
          return false;
        }
      }

      // Search keyword filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        const matchesSkills = evt.requiredSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSkills) {
          return false;
        }
      }

      // Only available slots filter
      if (filters.onlyAvailable) {
        const slotsLeft = evt.maxCapacity - evt.registeredCount;
        if (slotsLeft <= 0 || evt.status !== 'published') {
          return false;
        }
      }

      // Favorites only filter
      if (filters.favoritesOnly && !favorites.includes(evt.id)) {
        return false;
      }

      return true;
    });
  }, [events, filters, favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Calendar className="w-4 h-4" />
          Volunteer Opportunities Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Discover Community Events
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Find meaningful local initiatives matching your passion and availability. Register in seconds and receive your instant volunteer digital pass.
        </p>
      </div>

      {/* Filters Bar */}
      <EventFilters
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />

      {/* Results Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredEvents.length}</strong> community {filteredEvents.length === 1 ? 'event' : 'events'}
        </span>
        {filters.favoritesOnly && (
          <span className="text-rose-500 font-semibold">Favorites Filter Active</span>
        )}
      </div>

      {/* Grid of Event Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">No matching events found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              We couldn't find any events matching your active search and filter criteria. Try adjusting your keywords or clearing filters.
            </p>
          </div>
          <button
            onClick={() =>
              setFilters({
                search: '',
                category: 'All',
                timeframe: 'upcoming',
                location: '',
                onlyAvailable: false,
                favoritesOnly: false,
              })
            }
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isFavorite={favorites.includes(evt.id)}
              onToggleFavorite={toggleFavorite}
              onRegister={(e) => setRegisterEvent(e)}
              onShare={(e) => setShareEvent(e)}
            />
          ))}
        </div>
      )}

      {/* Action Modals */}
      {registerEvent && (
        <RegisterModal
          event={registerEvent}
          isOpen={Boolean(registerEvent)}
          onClose={() => setRegisterEvent(null)}
          onSuccess={fetchEvents}
          onOpenTicket={(reg) => {
            setActiveTicket({ registration: reg, event: registerEvent });
          }}
        />
      )}

      {shareEvent && (
        <ShareModal
          event={shareEvent}
          isOpen={Boolean(shareEvent)}
          onClose={() => setShareEvent(null)}
        />
      )}

      {activeTicket && (
        <QRCodeModal
          registration={activeTicket.registration}
          event={activeTicket.event}
          isOpen={Boolean(activeTicket)}
          onClose={() => setActiveTicket(null)}
        />
      )}
    </div>
  );
}
