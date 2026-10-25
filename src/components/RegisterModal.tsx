'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, AlertCircle, HeartHandshake, QrCode, ArrowRight } from 'lucide-react';
import { CommunityEvent, Registration } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface RegisterModalProps {
  event: CommunityEvent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenTicket?: (reg: Registration) => void;
}

export default function RegisterModal({
  event,
  isOpen,
  onClose,
  onSuccess,
  onOpenTicket,
}: RegisterModalProps) {
  const { user, switchDemoRole } = useAuth();
  const { showToast } = useToast();

  const [selectedSkill, setSelectedSkill] = useState(
    event.requiredSkills && event.requiredSkills.length > 0 ? event.requiredSkills[0] : 'General Assistance'
  );
  const [notes, setNotes] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredItem, setRegisteredItem] = useState<Registration | null>(null);

  if (!isOpen) return null;

  const isOrganizer = user?.role === 'organizer';
  const isFull = event.registeredCount >= event.maxCapacity;
  const isPast = new Date(event.date) < new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in or select a demo role first', 'error');
      return;
    }

    if (isOrganizer) {
      showToast('Organizers cannot register as volunteers', 'error');
      return;
    }

    if (!selectedSkill) {
      showToast('Please select a volunteer skill or contribution role', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedSkill,
          notes,
          emergencyContact,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to complete registration', 'error');
        setLoading(false);
        return;
      }

      // Celebrate with confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      showToast('Successfully registered for this event!', 'success');
      setRegisteredItem(data.registration);
      onSuccess();
    } catch {
      showToast('Network error while registering', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Volunteer Registration</h3>
              <p className="text-xs text-slate-500">Sign up to make an impact in this event</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Succeeded in this session */}
        {registeredItem ? (
          <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">You're Registered!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Thank you for stepping up to serve our community. Your registration has been confirmed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Event:</span>
                <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Skill:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{registeredItem.selectedSkill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registration ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{registeredItem.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {onOpenTicket && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTicket(registeredItem);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  View Digital Pass (QR)
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Summary Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{event.title}</p>
              <div className="flex items-center justify-between text-slate-500 pt-1">
                <span>Category: <strong className="text-slate-700 dark:text-slate-300">{event.category}</strong></span>
                <span>
                  Slots Available:{' '}
                  <strong className={event.maxCapacity - event.registeredCount <= 3 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {Math.max(0, event.maxCapacity - event.registeredCount)} of {event.maxCapacity}
                  </strong>
                </span>
              </div>
            </div>

            {/* Edge Case Warning: Organizer Role */}
            {isOrganizer && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Organizer Role Detected
                </div>
                <p>
                  You are currently logged in as an Organizer. Per platform security rules, organizers cannot register as volunteers.
                </p>
                <button
                  type="button"
                  onClick={() => switchDemoRole('volunteer')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm transition-colors"
                >
                  Switch to Demo Volunteer (Alex Rivera)
                </button>
              </div>
            )}

            {/* Edge Case: Capacity Full / Deadline / Past */}
            {(isFull || isPast || isDeadlinePassed) && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {isFull
                    ? 'Registration disabled: Event volunteer capacity is completely full.'
                    : isPast
                    ? 'This event has already taken place.'
                    : 'The registration deadline for this event has passed.'}
                </span>
              </div>
            )}

            {/* Volunteer Details Pre-fill */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Volunteer Name</label>
                <input
                  type="text"
                  readOnly
                  value={user ? user.name : 'Guest (Sign in required)'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user ? user.email : 'guest@example.com'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium"
                />
              </div>
            </div>

            {/* Selected Skill / Role */}
            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Select Your Contribution Role / Skill <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                disabled={isOrganizer || isFull || isPast || isDeadlinePassed}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {event.requiredSkills && event.requiredSkills.length > 0 ? (
                  event.requiredSkills.map((skill, idx) => (
                    <option key={idx} value={skill}>
                      {skill}
                    </option>
                  ))
                ) : (
                  <option value="General Assistance">General Assistance</option>
                )}
                <option value="General Assistance & Logistics">General Assistance & Logistics</option>
                <option value="Hospitality & Greeter">Hospitality & Greeter</option>
                <option value="First Aid & Safety">First Aid & Safety</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1 text-xs">
              <label className="block font-medium text-slate-600 dark:text-slate-400">
                Emergency Contact Name & Phone (Optional)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Elena Rivera (555-901-2345)"
                disabled={isOrganizer || isFull || isPast || isDeadlinePassed}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Notes / Special Requests */}
            <div className="space-y-1 text-xs">
              <label className="block font-medium text-slate-600 dark:text-slate-400">
                Notes for Organizer / Special Equipment (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bringing my own gardening gloves and boots. Can arrive early."
                disabled={isOrganizer || isFull || isPast || isDeadlinePassed}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isOrganizer || isFull || isPast || isDeadlinePassed}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
