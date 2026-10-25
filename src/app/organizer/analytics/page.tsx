'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Calendar,
  CheckCircle2,
  Award,
} from 'lucide-react';

const CATEGORY_COLORS = [
  '#059669', // Emerald
  '#0d9488', // Teal
  '#0284c7', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#f97316', // Orange
];

const STATUS_COLORS: Record<string, string> = {
  Attended: '#059669', // Emerald
  Confirmed: '#0284c7', // Sky
  Registered: '#f59e0b', // Amber
  Cancelled: '#f43f5e', // Rose
};

export default function OrganizerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json.analytics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <BarChart3 className="w-4 h-4" />
          Executive Analytics & Impact Insights
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          Community Engagement & Capacity Metrics
        </h1>
        <p className="text-xs text-slate-500">
          Real-time volunteer registration data, event distributions, and capacity utilization rates
        </p>
      </div>

      {/* KPI Ticker Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Capacity Utilization
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {data.utilizationRate}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${data.utilizationRate}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Total Slots Offered
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{data.totalSlots}</div>
          <p className="text-[11px] text-slate-400">Across all organized events</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Active Volunteers
          </span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{data.totalVolunteers}</div>
          <p className="text-[11px] text-slate-400">Excluding cancelled shifts</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Open Slots Remaining
          </span>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">{data.availableSlots}</div>
          <p className="text-[11px] text-slate-400">Ready for volunteer signups</p>
        </div>
      </div>

      {/* Chart 1: Volunteer Registration Across Events */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Volunteer Registrations vs Capacity by Event
            </h3>
            <p className="text-xs text-slate-500">
              Comparing active registered volunteers against total maximum capacity per event
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Top Community Events</span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.registrationsByEvent}
              margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey="eventTitle"
                angle={-15}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="registered" name="Registered Volunteers" fill="#059669" radius={[6, 6, 0, 0]} />
              <Bar dataKey="capacity" name="Max Capacity" fill="#94a3b8" radius={[6, 6, 0, 0]} opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns Grid: Chart 2 & Chart 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Events by Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-500" />
              Events by Category Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Proportion of initiatives across community focus sectors
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {data.categoryDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Participation Status Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Volunteer Participation Status Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of Registered, Confirmed, Attended, and Cancelled volunteers
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                  label={(entry: any) => `${entry.name || entry.status}: ${entry.value || entry.count}`}
                >
                  {data.statusBreakdown.map((entry: any, index: number) => (
                    <Cell
                      key={`status-cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
