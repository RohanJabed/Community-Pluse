'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Edit,
  Trash2,
  PlusCircle,
  Eye,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Search,
} from 'lucide-react';
import { CommunityEvent } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ManageEventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventToDelete, setEventToDelete] = useState<CommunityEvent | null>(null);
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

  const handleToggleStatus = async (event: CommunityEvent) => {
    const nextStatus = event.status === 'published' ? 'closed' : 'published';
    try {
      const res = await fetch(`/api/events/${event.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast(
          nextStatus === 'closed'
            ? `Registrations closed for "${event.title}"`
            : `Registrations reopened for "${event.title}"`,
          'success'
        );
        fetchEvents();
      }
    } catch {
      showToast('Error changing registration status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      const res = await fetch(`/api/events/${eventToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Event deleted successfully', 'success');
        setEventToDelete(null);
        fetchEvents();
      } else {
        showToast('Failed to delete event', 'error');
      }
    } catch {
      showToast('Network error while deleting event', 'error');
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Organized Events</h2>
          <p className="text-xs text-slate-500">
            Publish, edit, monitor capacity, and manage volunteer rosters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter events..."
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Link
            href="/organizer/create"
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-400" />
            <h4 className="font-semibold text-sm">No events found</h4>
            <p className="text-xs text-slate-500">Create your first community event to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Location</th>
                  <th className="py-3.5 px-4">Volunteer Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredEvents.map((evt) => {
                  const isFull = evt.registeredCount >= evt.maxCapacity;
                  const capacityPercent = Math.min(
                    100,
                    Math.round((evt.registeredCount / evt.maxCapacity) * 100)
                  );

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Title & image */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100'}
                            alt={evt.title}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <Link
                              href={`/events/${evt.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors line-clamp-1"
                            >
                              {evt.title}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono">{evt.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {evt.category}
                        </span>
                      </td>

                      {/* Date & Location */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Date(evt.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{evt.location}</p>
                      </td>

                      {/* Volunteer Capacity */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span>
                              {evt.registeredCount} / {evt.maxCapacity}
                            </span>
                            <span className={isFull ? 'text-rose-500' : 'text-emerald-600'}>
                              {capacityPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFull ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${capacityPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            evt.status === 'published'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : evt.status === 'closed'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Volunteers Link */}
                          <Link
                            href={`/organizer/events/${evt.id}/volunteers`}
                            title="View registered volunteers"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          {/* Edit Link */}
                          <Link
                            href={`/organizer/events/${evt.id}/edit`}
                            title="Edit event"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Toggle Status (Close/Open) */}
                          <button
                            onClick={() => handleToggleStatus(evt)}
                            title={evt.status === 'published' ? 'Close registrations' : 'Open registrations'}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-colors"
                          >
                            {evt.status === 'published' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setEventToDelete(evt)}
                            title="Delete event"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {eventToDelete && (
        <ConfirmDialog
          isOpen={Boolean(eventToDelete)}
          title="Delete Event"
          message={`Are you sure you want to permanently delete "${eventToDelete.title}"? All existing volunteer registrations for this event will also be removed.`}
          confirmLabel="Delete Event"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setEventToDelete(null)}
        />
      )}
    </div>
  );
}
