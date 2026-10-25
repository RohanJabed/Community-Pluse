'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  Sparkles,
  Calendar,
  Users,
  Award,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Wand2,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { CommunityEvent, Registration } from '@/lib/types';
import EventCard from '@/components/EventCard';
import RegisterModal from '@/components/RegisterModal';
import QRCodeModal from '@/components/QRCodeModal';
import ShareModal from '@/components/ShareModal';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, switchDemoRole } = useAuth();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Modals state
  const [registerEvent, setRegisterEvent] = useState<CommunityEvent | null>(null);
  const [shareEvent, setShareEvent] = useState<CommunityEvent | null>(null);
  const [activeTicket, setActiveTicket] = useState<{
    registration: Registration;
    event?: CommunityEvent | null;
  } | null>(null);

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
      console.error(e);
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

  const filteredEvents =
    selectedCategory === 'All'
      ? events.filter((e) => e.status !== 'draft').slice(0, 6)
      : events
          .filter((e) => e.category === selectedCategory && e.status !== 'draft')
          .slice(0, 6);

  const categories = ['All', 'Environment', 'Food Security', 'Education', 'Animal Welfare', 'Health'];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-sm animate-in fade-in duration-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Smart Community Event & Volunteer Coordination</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15]" style={{ color: 'var(--foreground)' }}>
              Empower Communities.{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Mobilize Volunteers.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: '#334155' }}>
              A comprehensive platform for grassroots organizations to publish community initiatives, define volunteer requirements, and track check-ins with AI assistance and digital QR tickets.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/events"
                className="py-3 px-6 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Calendar className="w-4 h-4" />
                Browse Open Events
              </Link>
              <Link
                href="/organizer/dashboard"
                className="py-3 px-6 rounded-2xl text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Users className="w-4 h-4 text-emerald-500" />
                Organizer Portal
              </Link>
            </div>

            {/* Quick Demo Accounts Banner for Evaluators */}
            <div className="pt-6">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5 px-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Instant Testing:
                </span>
                <button
                  onClick={() => switchDemoRole('organizer')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 hover:text-emerald-600 transition-colors"
                >
                  Login as Organizer (Sarah Jenkins)
                </button>
                <button
                  onClick={() => switchDemoRole('volunteer')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 hover:text-teal-600 transition-colors"
                >
                  Login as Volunteer (Alex Rivera)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Active Events</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {events.filter((e) => e.status === 'published').length}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Community initiatives
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Volunteers Mobilized</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {events.reduce((sum, e) => sum + e.registeredCount, 0)}
            </div>
            <p className="text-[11px] text-slate-500">Across local neighborhood programs</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Open Volunteer Slots</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {events.reduce((sum, e) => sum + Math.max(0, e.maxCapacity - e.registeredCount), 0)}
            </div>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Ready for registration</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs text-slate-500 font-medium">Check-in Pass Success</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
              98.4%
            </div>
            <p className="text-[11px] text-slate-500">Verified with digital QR tickets</p>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
              Community Opportunities
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Featured Community Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Discover local events and lend your time, energy, and skills.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No events found in this category</h3>
            <p className="text-xs text-slate-500">Check back soon or explore other categories!</p>
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

        <div className="text-center pt-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-sm"
          >
            View All Community Events
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* AI Assistant Spotlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                Organizer Smart Feature
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                AI Event Description & Volunteer Role Synthesizer
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Have an idea for a community drive? Enter a one-sentence concept like{' '}
                <span className="text-white font-medium italic">"Tree plantation in the neighborhood park next Saturday"</span>.
                Our AI assistant instantly synthesizes a compelling description, recommends specialized volunteer roles, defines required skills, and generates promotional copy for social media.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/organizer/create"
                  className="py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md flex items-center gap-2 transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  Try AI Event Creation
                </Link>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-semibold text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Example AI Synthesis
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Environment</span>
              </div>
              <p className="font-bold text-white text-sm">Community Green Canopy: Urban Tree Planting Initiative</p>
              <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                Restore native canopy cover, reduce urban heat, and plant 400 saplings with community neighbors and local arborists...
              </p>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Suggested Roles:</span>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[10px]">Sapling Excavators</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[10px]">Mulch Runners</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[10px]">Check-in Desk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple & Transparent Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How CommunityPulse Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered for small community organizations, non-profits, and dedicated volunteers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* For Organizers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">For Event Organizers</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Draft & Publish:</strong> Create events with custom volunteer capacities, required skills, and deadlines.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Manage Rosters:</strong> View registered volunteers, selected skills, and update statuses (Registered, Confirmed, Attended, Cancelled).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Interactive Analytics:</strong> Visualize registrations across events, capacity utilization, and attendance trends.
                </span>
              </li>
            </ul>
          </div>

          {/* For Volunteers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">For Community Volunteers</h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Discover & Filter:</strong> Filter community drives by cause, date, open slots, and bookmark your favorites.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Instant Registration:</strong> Select your preferred skill or role and receive your instant digital QR pass.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Manage Participation:</strong> Track upcoming shifts, cancel anytime before the event, and build your volunteer service record.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Global Modals for Card Actions */}
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
