'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, switchDemoRole } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  // Route protection
  if (!user || user.role !== 'organizer') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Organizer Portal Protected</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This section is reserved for verified event organizers. Volunteers and guests cannot access the organizer studio or modify community events.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => switchDemoRole('organizer')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Switch to Demo Organizer (Sarah Jenkins)
            </button>
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Sign In with Custom Organizer Credentials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { name: 'Dashboard', href: '/organizer/dashboard', icon: LayoutDashboard },
    { name: 'Manage Events', href: '/organizer/events', icon: Calendar },
    { name: 'Create Event (AI)', href: '/organizer/create', icon: PlusCircle },
    { name: 'Analytics', href: '/organizer/analytics', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/organizer/events' && pathname.includes('/volunteers')) return true;
    if (path === '/organizer/events' && pathname.includes('/edit')) return true;
    return pathname === path;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Sub-Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Organizer Studio
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 font-medium">{user.organization || 'Community Coordinator'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Community Event Hub
          </h1>
        </div>

        {/* Subnav Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Organizer Main View */}
      <div>{children}</div>
    </div>
  );
}
