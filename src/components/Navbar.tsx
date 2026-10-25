'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  HeartHandshake,
  Calendar,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  BookmarkCheck,
  UserCheck,
  Menu,
  X,
  LogOut,
  Sparkles,
  ChevronDown,
  Shield,
  Heart,
  ExternalLink,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchDemoRole, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isOrganizer = user?.role === 'organizer';
  const isVolunteer = user?.role === 'volunteer';

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) =>
    `relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? isOrganizer
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
          : 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Community<span className="text-emerald-500">Pulse</span>
              </span>
              {isOrganizer && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white">
                  Studio
                </span>
              )}
              {isVolunteer && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-white">
                  Hub
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Nav Links — centered pill style */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-full px-2 py-1.5">
            {isOrganizer ? (
              <>
                <Link href="/organizer/dashboard" className={navLinkClass('/organizer/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/organizer/events" className={navLinkClass('/organizer/events')}>
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link href="/organizer/create" className={navLinkClass('/organizer/create')}>
                  <PlusCircle className="w-4 h-4" />
                  Create
                </Link>
                <Link href="/organizer/analytics" className={navLinkClass('/organizer/analytics')}>
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
                <Link href="/events" className={navLinkClass('/events')}>
                  <ExternalLink className="w-4 h-4" />
                  Browse
                </Link>
              </>
            ) : isVolunteer ? (
              <>
                <Link href="/volunteer/dashboard" className={navLinkClass('/volunteer/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/events" className={navLinkClass('/events')}>
                  <Calendar className="w-4 h-4" />
                  Browse
                </Link>
                <Link href="/volunteer/my-events" className={navLinkClass('/volunteer/my-events')}>
                  <BookmarkCheck className="w-4 h-4" />
                  My Events
                </Link>
                <Link href="/volunteer/profile" className={navLinkClass('/volunteer/profile')}>
                  <UserCheck className="w-4 h-4" />
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/events" className={navLinkClass('/events')}>
                  <Calendar className="w-4 h-4" />
                  Browse Events
                </Link>
                <Link href="/login" className={navLinkClass('/login')}>
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Role Switcher */}
            <div className="hidden sm:flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs gap-0.5">
              <button
                onClick={() => switchDemoRole('organizer')}
                title="Switch to Organizer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all duration-200 ${
                  isOrganizer
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Organizer
              </button>
              <button
                onClick={() => switchDemoRole('volunteer')}
                title="Switch to Volunteer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all duration-200 ${
                  isVolunteer
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                Volunteer
              </button>
            </div>

            <ThemeToggle />

            {/* User Dropdown */}
            {!loading && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-slate-900 transition-all shadow-sm"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-400/40"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOrganizer ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {isOrganizer && (
                        <>
                          <Link href="/organizer/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
                            <LayoutDashboard className="w-4 h-4 text-emerald-500" /> Dashboard
                          </Link>
                          <Link href="/organizer/create" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
                            <Sparkles className="w-4 h-4 text-amber-500" /> Create Event with AI
                          </Link>
                        </>
                      )}
                      {isVolunteer && (
                        <>
                          <Link href="/volunteer/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
                            <LayoutDashboard className="w-4 h-4 text-teal-500" /> Dashboard
                          </Link>
                          <Link href="/volunteer/my-events" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
                            <BookmarkCheck className="w-4 h-4 text-teal-500" /> My Events & Passes
                          </Link>
                          <Link href="/volunteer/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
                            <UserCheck className="w-4 h-4 text-teal-500" /> Profile
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => { setUserDropdownOpen(false); logout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-1.5 text-sm font-bold rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30 transition-all">
                  Join Us
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-1">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs mb-3">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Demo Role:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => { switchDemoRole('organizer'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded-full font-semibold text-xs ${isOrganizer ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >Organizer</button>
              <button
                onClick={() => { switchDemoRole('volunteer'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded-full font-semibold text-xs ${isVolunteer ? 'bg-teal-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >Volunteer</button>
            </div>
          </div>

          {isOrganizer ? (
            <>
              {[
                { href: '/organizer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-emerald-500" /> },
                { href: '/organizer/events', label: 'Manage Events', icon: <Calendar className="w-4 h-4" /> },
                { href: '/organizer/create', label: 'Create Event', icon: <PlusCircle className="w-4 h-4 text-amber-500" /> },
                { href: '/organizer/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
                { href: '/events', label: 'Browse Public', icon: <ExternalLink className="w-4 h-4" /> },
              ].map(({ href, label, icon }) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {icon}{label}
                </Link>
              ))}
            </>
          ) : isVolunteer ? (
            <>
              {[
                { href: '/volunteer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-teal-500" /> },
                { href: '/events', label: 'Browse Events', icon: <Calendar className="w-4 h-4" /> },
                { href: '/volunteer/my-events', label: 'My Events', icon: <BookmarkCheck className="w-4 h-4 text-teal-500" /> },
                { href: '/volunteer/profile', label: 'Profile', icon: <UserCheck className="w-4 h-4" /> },
              ].map(({ href, label, icon }) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {icon}{label}
                </Link>
              ))}
            </>
          ) : (
            <>
              <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Calendar className="w-4 h-4" /> Browse Events
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                Sign In
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
