'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Scan,
  Download,
  Filter,
  Check,
  UserCheck,
  XCircle,
  Mail,
} from 'lucide-react';
import { CommunityEvent, Registration, ParticipationStatus } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import CheckInModal from '@/components/CheckInModal';

const STATUS_OPTIONS: ParticipationStatus[] = ['Registered', 'Confirmed', 'Attended', 'Cancelled'];

export default function EventVolunteersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [volunteers, setVolunteers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Fetch Event
      const eventRes = await fetch(`/api/events/${id}`);
      if (!eventRes.ok) {
        showToast('Event not found', 'error');
        router.push('/organizer/events');
        return;
      }
      const eventData = await eventRes.json();
      setEvent(eventData.event);

      // 2. Fetch Volunteers
      const volRes = await fetch(`/api/events/${id}/volunteers`);
      if (volRes.ok) {
        const volData = await volRes.json();
        setVolunteers(volData.volunteers || []);
      }
    } catch {
      showToast('Error loading volunteer roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (registrationId: string, newStatus: ParticipationStatus) => {
    setUpdatingId(registrationId);
    try {
      const res = await fetch(`/api/volunteers/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to update status', 'error');
        setUpdatingId(null);
        return;
      }

      showToast(`Volunteer status updated to ${newStatus}`, 'success');
      // Update local state
      setVolunteers((prev) =>
        prev.map((v) => (v.id === registrationId ? { ...v, status: newStatus } : v))
      );
      // Refresh event count
      const eventRes = await fetch(`/api/events/${id}`);
      if (eventRes.ok) {
        const data = await eventRes.json();
        setEvent(data.event);
      }
    } catch {
      showToast('Error communicating with server', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredVolunteers =
    statusFilter === 'All'
      ? volunteers
      : volunteers.filter((v) => v.status === statusFilter);

  const statusBadge = (status: ParticipationStatus) => {
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

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/organizer/events')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Management
        </button>

        {/* Action: Check-in Desk Scanner Button (Bonus #5) */}
        <button
          onClick={() => setCheckInModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
        >
          <Scan className="w-4 h-4" />
          Check-in Desk (QR Scanner)
        </button>
      </div>

      {/* Event Overview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {event.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {event.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-4 mt-1">
              <span>📅 {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              <span>📍 {event.location}</span>
            </p>
          </div>

          {/* Quick Roster Stats */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center text-xs">
              <span className="text-slate-400 block text-[10px]">Registered</span>
              <strong className="text-base text-slate-900 dark:text-white">
                {event.registeredCount} / {event.maxCapacity}
              </strong>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 text-center text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 block text-[10px]">Attended</span>
              <strong className="text-base text-emerald-700 dark:text-emerald-300">
                {volunteers.filter((v) => v.status === 'Attended').length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Controls: Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['All', 'Registered', 'Confirmed', 'Attended', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {status} ({status === 'All' ? volunteers.length : volunteers.filter((v) => v.status === status).length})
            </button>
          ))}
        </div>

        <button
          onClick={() => window.print()}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5" />
          Print Roster
        </button>
      </div>

      {/* Volunteers Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        {filteredVolunteers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 mx-auto text-slate-400" />
            <h4 className="font-semibold text-sm">No volunteers in this view</h4>
            <p className="text-xs text-slate-500">
              {statusFilter === 'All'
                ? 'No one has registered for this event yet.'
                : `No volunteers currently have the status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Volunteer</th>
                  <th className="py-3.5 px-4">Selected Skill / Role</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Participation Status</th>
                  <th className="py-3.5 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredVolunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Name & Email */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{vol.volunteerName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {vol.volunteerEmail}
                        </p>
                        {vol.emergencyContact && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Emergency: {vol.emergencyContact}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Skill */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        {vol.selectedSkill}
                      </span>
                      {vol.notes && (
                        <p className="text-[10px] text-slate-400 mt-1 italic max-w-xs line-clamp-1">
                          "{vol.notes}"
                        </p>
                      )}
                    </td>

                    {/* Registration Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {new Date(vol.registeredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Ticket ID */}
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {vol.id}
                    </td>

                    {/* Current Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(
                          vol.status
                        )}`}
                      >
                        {vol.status === 'Attended' && <CheckCircle2 className="w-3 h-3" />}
                        {vol.status}
                      </span>
                    </td>

                    {/* Status Update Dropdown */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <select
                        disabled={updatingId === vol.id}
                        value={vol.status}
                        onChange={(e) =>
                          handleUpdateStatus(vol.id, e.target.value as ParticipationStatus)
                        }
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        onCheckInSuccess={() => fetchData()}
      />
    </div>
  );
}
