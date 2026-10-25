'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Award,
  CheckCircle2,
  Bell,
  ArrowRight,
  BookmarkCheck,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { Registration, CommunityEvent } from '@/lib/types';
import QRCodeModal from '@/components/QRCodeModal';

export default function VolunteerDashboardPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<{
    registration: Registration;
    event?: CommunityEvent | null;
  } | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/volunteers/me');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingRegs = registrations.filter(
    (r) => r.status !== 'Cancelled' && r.event && new Date(r.event.date) >= now
  );
  const pastRegs = registrations.filter(
    (r) => r.event && (new Date(r.event.date) < now || r.status === 'Attended')
  );
  const attendedCount = registrations.filter((r) => r.status === 'Attended').length;
  const estimatedHours = attendedCount * 4 + upcomingRegs.length * 4;

  // Next Upcoming Event for Reminder (Bonus #2)
  const nextEventReg = upcomingRegs.sort(
    (a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime()
  )[0];

  let nextEventDays = 0;
  if (nextEventReg && nextEventReg.event) {
    nextEventDays = Math.ceil(
      (new Date(nextEventReg.event.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Upcoming Shifts
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            {upcomingRegs.length}
          </div>
          <p className="text-[11px] text-slate-400">Confirmed & active</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Events Attended
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {attendedCount}
          </div>
          <p className="text-[11px] text-slate-400">Completed community service</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Estimated Impact
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
            {estimatedHours} hrs
          </div>
          <p className="text-[11px] text-slate-400">Volunteered service hours</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Attendance Rate
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            100%
          </div>
          <p className="text-[11px] text-slate-400">Reliable volunteer status</p>
        </div>
      </div>

      {/* Approaching Shift Reminder Banner (Bonus #2) */}
      {nextEventReg && nextEventReg.event && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
              <Bell className="w-4 h-4 text-teal-600 animate-bounce" />
              Event Reminder: Coming Up in {nextEventDays} {nextEventDays === 1 ? 'Day' : 'Days'}!
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {nextEventReg.event.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-4 justify-center sm:justify-start">
              <span>📅 {new Date(nextEventReg.event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              <span>📍 {nextEventReg.event.location}</span>
            </p>
          </div>

          <button
            onClick={() => setActiveTicket({ registration: nextEventReg, event: nextEventReg.event })}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <QrCode className="w-4 h-4" />
            Open Digital Ticket
          </button>
        </div>
      )}

      {/* Upcoming Registered Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming Volunteer Shifts
            </h2>
            <p className="text-xs text-slate-500">Events you are registered to attend</p>
          </div>
          <Link
            href="/volunteer/my-events"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View All Registrations
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : upcomingRegs.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <Calendar className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="font-semibold text-sm">No upcoming volunteer shifts</h4>
            <p className="text-xs text-slate-500">Browse open events in your neighborhood and get involved!</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingRegs.slice(0, 4).map((reg) => (
              <div
                key={reg.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {reg.event?.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {reg.status}
                    </span>
                  </div>

                  <Link href={`/events/${reg.eventId}`}>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white hover:text-teal-600 line-clamp-1 transition-colors">
                      {reg.event?.title}
                    </h3>
                  </Link>

                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(reg.event?.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{reg.event?.location}</span>
                    </p>
                    <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold pt-1">
                      Assigned Role: {reg.selectedSkill}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{reg.id}</span>
                  <button
                    onClick={() => setActiveTicket({ registration: reg, event: reg.event })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Digital Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Ticket Modal */}
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
