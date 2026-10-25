'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { CommunityEvent } from '@/lib/types';

interface EventCardProps {
  event: CommunityEvent;
  onRegister?: (event: CommunityEvent) => void;
  onShare?: (event: CommunityEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function EventCard({
  event,
  onRegister,
  onShare,
  isFavorite = false,
  onToggleFavorite,
}: EventCardProps) {
  const isFull = event.registeredCount >= event.maxCapacity;
  const slotsLeft = Math.max(0, event.maxCapacity - event.registeredCount);
  const capacityPercent = Math.min(100, Math.round((event.registeredCount / event.maxCapacity) * 100));

  const isPast = new Date(event.date) < new Date();
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();

  // Category Color mapping
  const categoryColors: Record<string, string> = {
    Environment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    'Food Security': 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
    Education: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
    'Animal Welfare': 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    Health: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
    Community: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300',
    'Crisis Relief': 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300',
    'Arts & Culture': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Image & Badges Banner */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${
                categoryColors[event.category] || 'bg-slate-100 text-slate-800'
              }`}
            >
              {event.category}
            </span>

            {event.status === 'completed' || isPast ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800/80 text-white backdrop-blur-md">
                Completed
              </span>
            ) : isFull ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm backdrop-blur-md animate-pulse">
                Capacity Full
              </span>
            ) : isDeadlinePassed ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white shadow-sm backdrop-blur-md">
                Registration Closed
              </span>
            ) : null}
          </div>

          {/* Action Buttons: Favorite & Share */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(event.id)}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all transform active:scale-90"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                  }`}
                />
              </button>
            )}
            {onShare && (
              <button
                onClick={() => onShare(event)}
                title="Share event link"
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all transform active:scale-90"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Date & Time pill bottom left of image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-xs font-medium backdrop-blur-md bg-black/50 px-3 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div>
            <Link href={`/events/${event.id}`}>
              <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {event.title}
              </h3>
            </Link>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Capacity Progress Bar */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Volunteers
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {event.registeredCount} / {event.maxCapacity}
                {isFull ? (
                  <span className="ml-1.5 text-[11px] font-bold text-rose-500">(Full)</span>
                ) : (
                  <span className="ml-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    ({slotsLeft} slots left)
                  </span>
                )}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
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
          </div>

          {/* Required Skills tags */}
          {event.requiredSkills && event.requiredSkills.length > 0 && (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                {event.requiredSkills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
                {event.requiredSkills.length > 3 && (
                  <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                    +{event.requiredSkills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <Link
          href={`/events/${event.id}`}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          View Details
        </Link>

        {onRegister && (
          <button
            onClick={() => onRegister(event)}
            disabled={isFull || isPast || isDeadlinePassed || event.status !== 'published'}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isFull
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : isPast || isDeadlinePassed
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {isFull ? (
              'Event Full'
            ) : isPast ? (
              'Closed'
            ) : (
              <>
                Register
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
