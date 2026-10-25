'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-700 hover:text-emerald-600 transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
      )}
    </button>
  );
}
