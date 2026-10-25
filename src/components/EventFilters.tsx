'use client';

import React from 'react';
import { Search, Filter, RotateCcw, Heart, CheckCircle2 } from 'lucide-react';
import { EventCategory } from '@/lib/types';

interface FiltersState {
  search: string;
  category: string;
  timeframe: 'all' | 'upcoming' | 'past';
  location: string;
  onlyAvailable: boolean;
  favoritesOnly: boolean;
}

interface EventFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  categories: (EventCategory | 'All')[];
}

export default function EventFilters({ filters, onChange, categories }: EventFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (cat: string) => {
    onChange({ ...filters, category: cat });
  };

  const handleTimeframeChange = (timeframe: 'all' | 'upcoming' | 'past') => {
    onChange({ ...filters, timeframe });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, location: e.target.value });
  };

  const handleToggleAvailable = () => {
    onChange({ ...filters, onlyAvailable: !filters.onlyAvailable });
  };

  const handleToggleFavorites = () => {
    onChange({ ...filters, favoritesOnly: !filters.favoritesOnly });
  };

  const handleReset = () => {
    onChange({
      search: '',
      category: 'All',
      timeframe: 'upcoming',
      location: '',
      onlyAvailable: false,
      favoritesOnly: false,
    });
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
      {/* Top Search & Location inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search by title / keyword */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search events by title, keyword, or skill..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Location filter */}
        <div className="md:col-span-4 relative">
          <input
            type="text"
            value={filters.location}
            onChange={handleLocationChange}
            placeholder="Filter by city, park, or venue..."
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Reset button */}
        <div className="md:col-span-2">
          <button
            onClick={handleReset}
            className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filters.category === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bottom Toggles: Timeframe, Available Only, Favorites */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Timeframe pill tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => handleTimeframeChange('upcoming')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filters.timeframe === 'upcoming'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => handleTimeframeChange('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filters.timeframe === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleTimeframeChange('past')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filters.timeframe === 'past'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Checkbox Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={handleToggleAvailable}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Open Slots Only</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={handleToggleFavorites}
              className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Favorites Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
