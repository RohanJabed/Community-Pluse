'use client';

import React, { useState } from 'react';
import { QrCode, X, CheckCircle2, AlertCircle, Scan, ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckInSuccess: () => void;
}

export default function CheckInModal({ isOpen, onClose, onCheckInSuccess }: CheckInModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<any>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCheckIn = async (codeToSubmit?: string) => {
    const ticketCode = codeToSubmit || code;
    if (!ticketCode.trim()) {
      showToast('Please enter a ticket ID or scan a QR code', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ticketCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Check-in failed', 'error');
        setLoading(false);
        return;
      }

      setLastChecked(data);
      showToast(data.message, 'success');
      setCode('');
      onCheckInSuccess();
    } catch {
      showToast('Network error during ticket check-in', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Volunteer Check-in Station</h3>
              <p className="text-xs text-slate-500">Scan QR Code or enter Ticket Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Ticket ID or Digital Pass Token
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. REG-101-01 or CP-TICKET..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <button
              onClick={() => handleCheckIn()}
              disabled={loading || !code.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Successful verification display */}
        {lastChecked && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lastChecked.message}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
              <p>
                <strong>Volunteer:</strong> {lastChecked.registration?.volunteerName}
              </p>
              <p>
                <strong>Role/Skill:</strong> {lastChecked.registration?.selectedSkill}
              </p>
              <p>
                <strong>New Status:</strong>{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Attended ✓</span>
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
