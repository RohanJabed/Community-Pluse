'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  BookmarkCheck,
} from 'lucide-react';
import { Registration, CommunityEvent } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import QRCodeModal from '@/components/QRCodeModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [activeTicket, setActiveTicket] = useState<{
    registration: Registration;
    event?: CommunityEvent | null;
  } | null>(null);
  const [regToCancel, setRegToCancel] = useState<any | null>(null);
  const { showToast } = useToast();

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

  const handleCancelRegistration = async () => {
    if (!regToCancel) return;
    try {
      const res = await fetch(`/api/volunteers/${regToCancel.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to cancel registration', 'error');
        setRegToCancel(null);
        return;
      }

      showToast('Registration cancelled. Your slot has been released for other volunteers.', 'info');
      setRegToCancel(null);
      fetchRegistrations();
    } catch {
      showToast('Network error while cancelling registration', 'error');
    }
  };

  const now = new Date();
  const upcomingRegs = registrations.filter(
    (r) => r.event && new Date(r.event.date) >= now
  );
  const pastRegs = registrations.filter(
    (r) => r.event && new Date(r.event.date) < now
  );

  const displayedList = activeTab === 'upcoming' ? upcomingRegs : pastRegs;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Attended':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300';
      case 'Confirmed':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300';
      case 'Cancelled':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            My Registered Community Events
          </h2>
          <p className="text-xs text-slate-500">
            View participation passes, check shift dates, and manage attendance
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upcoming ({upcomingRegs.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'past'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Past Events ({pastRegs.length})
          </button>
        </div>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <BookmarkCheck className="w-10 h-10 mx-auto text-slate-400" />
          <div>
            <h4 className="font-semibold text-sm">
              {activeTab === 'upcoming'
                ? 'No upcoming event registrations'
                : 'No past completed event history'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'upcoming'
                ? 'You are not currently signed up for any future events. Check out open opportunities!'
                : 'Your attended and completed volunteer shifts will be archived here.'}
            </p>
          </div>
          {activeTab === 'upcoming' && (
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm"
            >
              Discover Events
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((reg) => {
            const isCancelled = reg.status === 'Cancelled';
            const isEventPast = reg.event && new Date(reg.event.date) < now;

            return (
              <div
                key={reg.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Event & Registration Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {reg.event?.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(
                        reg.status
                      )}`}
                    >
                      {reg.status === 'Attended' && <CheckCircle2 className="w-3 h-3" />}
                      {reg.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Ticket: {reg.id}
                    </span>
                  </div>

                  <Link href={`/events/${reg.eventId}`}>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white hover:text-teal-600 transition-colors line-clamp-1">
                      {reg.event?.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(reg.event?.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {reg.event?.location}
                    </span>
                  </div>

                  <div className="pt-1 text-xs">
                    <span className="font-medium text-slate-500">Selected Contribution: </span>
                    <strong className="text-teal-700 dark:text-teal-300">{reg.selectedSkill}</strong>
                    {reg.notes && (
                      <span className="text-slate-400 text-[11px] block italic mt-0.5">
                        Notes: "{reg.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {/* Digital QR Pass Button (Bonus #5) */}
                  <button
                    onClick={() => setActiveTicket({ registration: reg, event: reg.event })}
                    disabled={isCancelled}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm disabled:opacity-40 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Digital Pass (QR)
                  </button>

                  {/* Cancel Registration Button */}
                  {!isCancelled && !isEventPast && (
                    <button
                      onClick={() => setRegToCancel(reg)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Registration
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Ticket Modal */}
      {activeTicket && (
        <QRCodeModal
          registration={activeTicket.registration}
          event={activeTicket.event}
          isOpen={Boolean(activeTicket)}
          onClose={() => setActiveTicket(null)}
        />
      )}

      {/* Cancellation Confirmation Dialog */}
      {regToCancel && (
        <ConfirmDialog
          isOpen={Boolean(regToCancel)}
          title="Cancel Volunteer Registration"
          message={`Are you sure you want to cancel your registration for "${regToCancel.event?.title}"? This will immediately free up your slot so another community volunteer can register.`}
          confirmLabel="Yes, Cancel Registration"
          confirmVariant="danger"
          onConfirm={handleCancelRegistration}
          onCancel={() => setRegToCancel(null)}
        />
      )}
    </div>
  );
}
