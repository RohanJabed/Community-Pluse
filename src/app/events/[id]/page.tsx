'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  Share2,
  Heart,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  QrCode,
  Tag,
  Building2,
  Mail,
  Bell,
  Sparkles,
} from 'lucide-react';
import { CommunityEvent, Registration } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import RegisterModal from '@/components/RegisterModal';
import QRCodeModal from '@/components/QRCodeModal';
import ShareModal from '@/components/ShareModal';

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, switchDemoRole } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    checkFavorite();
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        showToast('Event not found', 'error');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEvent(data.event);

      // If user is volunteer, check if registered
      if (user && user.role === 'volunteer') {
        const regRes = await fetch('/api/volunteers/me');
        if (regRes.ok) {
          const regData = await regRes.json();
          const match = regData.registrations?.find(
            (r: any) => r.eventId === id && r.status !== 'Cancelled'
          );
          setUserRegistration(match || null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = () => {
    const saved = localStorage.getItem('cp_favorites');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        setIsFavorite(list.includes(id));
      } catch {}
    }
  };

  const toggleFavorite = () => {
    const saved = localStorage.getItem('cp_favorites');
    let list: string[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {}
    }
    const next = list.includes(id) ? list.filter((i) => i !== id) : [...list, id];
    localStorage.setItem('cp_favorites', JSON.stringify(next));
    setIsFavorite(!isFavorite);
    showToast(isFavorite ? 'Removed from saved events' : 'Saved to favorites!', 'info');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
        <h2 className="text-xl font-bold">Event Not Found</h2>
        <p className="text-xs text-slate-500">The event you are looking for may have been removed or does not exist.</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.maxCapacity;
  const isPast = new Date(event.date) < new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
  const isOrganizer = user?.role === 'organizer';
  const slotsLeft = Math.max(0, event.maxCapacity - event.registeredCount);
  const capacityPercent = Math.min(100, Math.round((event.registeredCount / event.maxCapacity) * 100));

  // Event Reminder (Bonus #2)
  const eventDateObj = new Date(event.date);
  const diffDays = Math.ceil((eventDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isApproaching = diffDays > 0 && diffDays <= 7;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button & actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-4 h-4 text-slate-400" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Approaching Reminder Banner (Bonus #2) */}
      {isApproaching && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>
              <strong>Event Reminder:</strong> This event is scheduled to take place in {diffDays} {diffDays === 1 ? 'day' : 'days'}!
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900 px-2.5 py-0.5 rounded-full">
            Starting Soon
          </span>
        </div>
      )}

      {/* Main Grid: Details Left, Registration Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media & Story */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero Banner */}
          <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
            <img
              src={event.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                {event.category}
              </span>
              {isFull && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md animate-pulse">
                  Event Full
                </span>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Quick Date, Time & Venue Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-500 font-medium">Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-slate-500 font-medium">Time</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {event.endDate ? ` - ${new Date(event.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-slate-500 font-medium">Location</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">About the Event</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Required Skills & Volunteer Opportunities */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Volunteer Roles & Required Skills</h3>
            <p className="text-xs text-slate-500">
              Volunteers will assist with the following core responsibilities and specializations:
            </p>
            <div className="flex flex-wrap gap-2">
              {event.requiredSkills && event.requiredSkills.length > 0 ? (
                event.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">General volunteers welcome!</span>
              )}
            </div>
          </div>

          {/* Organizer Card */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{event.organizerName}</p>
              <p className="text-slate-500">Organizer & Community Coordinator</p>
            </div>
            <a
              href={`mailto:${event.organizerEmail}`}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-emerald-600"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right Column: Registration Card & Capacity Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Volunteer Registration</h3>
              <p className="text-xs text-slate-500">
                Deadline:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </strong>
              </p>
            </div>

            {/* Capacity Meter */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Slots Filled:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {event.registeredCount} / {event.maxCapacity}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull
                      ? 'bg-rose-500'
                      : capacityPercent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
              <div className="text-right">
                {isFull ? (
                  <span className="text-[11px] font-bold text-rose-600">Capacity Reached (0 slots left)</span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {slotsLeft} {slotsLeft === 1 ? 'slot' : 'slots'} remaining
                  </span>
                )}
              </div>
            </div>

            {/* Registration Status Branching */}
            {userRegistration ? (
              /* Already Registered Card */
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>You're registered for this event!</span>
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <p>
                    <strong>Ticket ID:</strong> {userRegistration.id}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {userRegistration.status}
                    </span>
                  </p>
                  <p>
                    <strong>Role/Skill:</strong> {userRegistration.selectedSkill}
                  </p>
                </div>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  View Digital Pass (QR Code)
                </button>
              </div>
            ) : isOrganizer ? (
              /* Organizer Role Warning */
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold">Organizer Account Active</p>
                <p className="text-[11px] leading-relaxed">
                  Per security rules, organizers cannot register as volunteers. Switch to volunteer mode to test registering.
                </p>
                <button
                  onClick={() => switchDemoRole('volunteer')}
                  className="w-full py-2 px-3 rounded-xl font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors text-xs"
                >
                  Switch to Volunteer (Alex Rivera)
                </button>
              </div>
            ) : isFull ? (
              /* Full Capacity */
              <div className="space-y-2 text-center">
                <button
                  disabled
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                >
                  Registration Closed (Capacity Full)
                </button>
                <p className="text-[11px] text-slate-400">All volunteer slots have been claimed.</p>
              </div>
            ) : isDeadlinePassed || isPast ? (
              /* Deadline passed */
              <div className="space-y-2 text-center">
                <button
                  disabled
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                >
                  Registration Closed
                </button>
                <p className="text-[11px] text-slate-400">
                  {isPast ? 'This event has concluded.' : 'The sign-up deadline has passed.'}
                </p>
              </div>
            ) : (
              /* Open for registration */
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02]"
              >
                Register as Volunteer
              </button>
            )}

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>✓ Free participation • Supplies provided</p>
              <p>✓ Digital QR check-in & hours verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegisterModal
        event={event}
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => fetchEventDetails()}
        onOpenTicket={(reg) => {
          setUserRegistration(reg);
          setQrModalOpen(true);
        }}
      />

      {userRegistration && (
        <QRCodeModal
          registration={userRegistration}
          event={event}
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
        />
      )}

      <ShareModal
        event={event}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
