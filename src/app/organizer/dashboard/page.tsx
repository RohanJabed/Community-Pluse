'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Eye,
  Edit,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { CommunityEvent } from '@/lib/types';
import { useToast } from '@/context/ToastContext';

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchEvents();
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

  const toggleEventRegistration = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'closed' : 'published';
    try {
      const res = await fetch(`/api/events/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(
          nextStatus === 'closed'
            ? 'Registration closed for this event'
            : 'Registration reopened for this event',
          'success'
        );
        fetchEvents();
      }
    } catch {
      showToast('Error updating status', 'error');
    }
  };

  const now = new Date();
  const totalEvents = events.length;
  const upcomingEventsList = events.filter(
    (e) => new Date(e.date) >= now && e.status !== 'cancelled'
  );
  const upcomingEventsCount = upcomingEventsList.length;
  const completedEventsCount = events.filter(
    (e) => new Date(e.date) < now || e.status === 'completed'
  ).length;

  const totalVolunteers = events.reduce((sum, e) => sum + e.registeredCount, 0);
  const totalMaxSlots = events.reduce((sum, e) => sum + e.maxCapacity, 0);
  const availableSlots = Math.max(0, totalMaxSlots - totalVolunteers);
  const capacityUtilization = totalMaxSlots > 0 ? Math.round((totalVolunteers / totalMaxSlots) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Events */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Events</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalEvents}
          </div>
          <p className="text-[11px] text-slate-400">Created on platform</p>
        </div>

        {/* Upcoming Events */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span>Upcoming Events</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {upcomingEventsCount}
          </div>
          <p className="text-[11px] text-slate-400">Active or in planning</p>
        </div>

        {/* Total Volunteers */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 text-xs font-semibold">
            <span>Total Volunteers</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            {totalVolunteers}
          </div>
          <p className="text-[11px] text-slate-400">Registrations logged</p>
        </div>

        {/* Available Volunteer Slots */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 text-xs font-semibold">
            <span>Available Slots</span>
            <PlusCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
            {availableSlots}
          </div>
          <p className="text-[11px] text-slate-400">Remaining capacity</p>
        </div>

        {/* Completed Events */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed Events</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {completedEventsCount}
          </div>
          <p className="text-[11px] text-slate-400">Successfully executed</p>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            AI-Powered Assistant Ready
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Draft an event in seconds with smart auto-completion
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your idea, and our AI synthesizer will draft the title, roles, required skills, and social promo text.
          </p>
        </div>
        <Link
          href="/organizer/create"
          className="shrink-0 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Create Event with AI
        </Link>
      </div>

      {/* Upcoming Events List with Capacity Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming Events & Capacity Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Live volunteer registration counts and operational actions
            </p>
          </div>
          <Link
            href="/organizer/events"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Manage All Events
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : upcomingEventsList.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <Calendar className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="font-semibold text-sm">No upcoming events scheduled</h4>
            <p className="text-xs text-slate-500">Create your next community event to start mobilizing volunteers.</p>
            <Link
              href="/organizer/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {upcomingEventsList.map((evt) => {
              const isFull = evt.registeredCount >= evt.maxCapacity;
              const slotsLeft = Math.max(0, evt.maxCapacity - evt.registeredCount);
              const capacityPercent = Math.min(
                100,
                Math.round((evt.registeredCount / evt.maxCapacity) * 100)
              );

              return (
                <div
                  key={evt.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {evt.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          evt.status === 'published'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : evt.status === 'closed'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {evt.status}
                      </span>
                      {isFull && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          Capacity Full
                        </span>
                      )}
                    </div>

                    <Link href={`/events/${evt.id}`}>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {evt.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>
                        📅{' '}
                        {new Date(evt.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="truncate">📍 {evt.location}</span>
                    </div>
                  </div>

                  {/* Middle: Capacity Progress Bar */}
                  <div className="w-full lg:w-72 space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Capacity Meter:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {evt.registeredCount} / {evt.maxCapacity} ({capacityPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull
                            ? 'bg-rose-500'
                            : capacityPercent > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                    <div className="text-right text-[11px]">
                      {isFull ? (
                        <span className="font-bold text-rose-500">All slots filled</span>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {slotsLeft} slots open
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Link
                      href={`/organizer/events/${evt.id}/volunteers`}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      View Volunteers ({evt.registeredCount})
                    </Link>

                    <Link
                      href={`/organizer/events/${evt.id}/edit`}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>

                    <button
                      onClick={() => toggleEventRegistration(evt.id, evt.status)}
                      title={evt.status === 'published' ? 'Close registrations' : 'Open registrations'}
                      className="py-2 px-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {evt.status === 'published' ? 'Close Reg' : 'Open Reg'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
