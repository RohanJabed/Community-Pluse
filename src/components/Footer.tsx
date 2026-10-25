import React from 'react';
import Link from 'next/link';
import { HeartHandshake, Shield, Sparkles, Calendar, Users, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Community<span className="text-emerald-500">Pulse</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Empowering grassroots community organizations, event organizers, and local volunteers to connect, collaborate, and make meaningful social impact.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Assisted Event Planning & Digital Passes
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/events" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Browse All Events
                </Link>
              </li>
              <li>
                <Link href="/events?category=Environment" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Environmental Drives
                </Link>
              </li>
              <li>
                <Link href="/events?category=Food+Security" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Food & Pantry Aid
                </Link>
              </li>
              <li>
                <Link href="/events?category=Education" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Youth & Education
                </Link>
              </li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/organizer/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/organizer/create" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Create Event (with AI)
                </Link>
              </li>
              <li>
                <Link href="/volunteer/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Volunteer Portal
                </Link>
              </li>
              <li>
                <Link href="/volunteer/my-events" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  My Registrations & QR Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Credentials Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Shield className="w-4 h-4 text-emerald-500" />
              Demo Credentials
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Organizer:</span>{' '}
                <code className="text-[11px] bg-slate-200/80 dark:bg-slate-700/80 px-1 py-0.5 rounded">
                  organizer@communitypulse.org
                </code>
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Volunteer:</span>{' '}
                <code className="text-[11px] bg-slate-200/80 dark:bg-slate-700/80 px-1 py-0.5 rounded">
                  alex.volunteer@gmail.com
                </code>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                Password: <code className="bg-slate-200/80 dark:bg-slate-700/80 px-1 py-0.5 rounded">admin123</code> /{' '}
                <code className="bg-slate-200/80 dark:bg-slate-700/80 px-1 py-0.5 rounded">volunteer123</code>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p>© 2026 CommunityPulse Platform. Built with Next.js App Router, TypeScript & Tailwind CSS.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Role-Based Authorization
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-teal-500" />
              Technical Instructor Assessment
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
