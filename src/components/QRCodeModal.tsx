'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Download, Calendar, MapPin, User, CheckCircle2 } from 'lucide-react';
import { Registration, CommunityEvent } from '@/lib/types';

interface QRCodeModalProps {
  registration: Registration;
  event?: CommunityEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ registration, event, isOpen, onClose }: QRCodeModalProps) {
  if (!isOpen) return null;

  const eventDate = event ? new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }) : 'Event Date';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Volunteer Digital Pass</h3>
              <p className="text-[11px] text-slate-500">Scan at check-in station</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Canvas */}
        <div className="bg-white p-5 rounded-2xl shadow-inner border border-slate-100 inline-block mx-auto">
          <QRCodeSVG
            value={registration.qrCodeToken || registration.id}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Ticket Details */}
        <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Ticket ID:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{registration.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Volunteer:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{registration.volunteerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Role / Skill:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{registration.selectedSkill}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Status:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              {registration.status}
            </span>
          </div>
          {event && (
            <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{event.title}</p>
              <p className="text-slate-500 flex items-center gap-1 mt-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {eventDate}
              </p>
              <p className="text-slate-500 flex items-center gap-1 mt-0.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Print / Save Digital Ticket
        </button>
      </div>
    </div>
  );
}
