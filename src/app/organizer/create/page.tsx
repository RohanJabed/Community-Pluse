'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ArrowRight,
  ImageIcon,
  Wand2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { EventCategory, AiGeneratedEvent } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import AiAssistantModal from '@/components/AiAssistantModal';

const CATEGORIES: EventCategory[] = [
  'Environment',
  'Food Security',
  'Education',
  'Animal Welfare',
  'Health',
  'Community',
  'Crisis Relief',
  'Arts & Culture',
];

const IMAGE_PRESETS = [
  { label: 'Green / Nature', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80' },
  { label: 'Food Aid', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80' },
  { label: 'Youth Tech', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80' },
  { label: 'Animal Care', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Community', url: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800&auto=format&fit=crop&q=80' },
  { label: 'Water Clean', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('Environment');
  const [maxCapacity, setMaxCapacity] = useState('20');
  const [skillsInput, setSkillsInput] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [isVirtual, setIsVirtual] = useState(false);

  // AI Application handler
  const handleApplyAiData = (data: AiGeneratedEvent) => {
    setTitle(data.title);
    setDescription(data.description);
    setCategory(data.category);
    setMaxCapacity(data.suggestedCapacity.toString());
    setSkillsInput(data.requiredSkills.join(', '));
    showToast('AI draft applied to form fields! Feel free to review & edit.', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !date || !location || !registrationDeadline || !maxCapacity) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    const capacityNum = parseInt(maxCapacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      showToast('Maximum capacity must be a positive number', 'error');
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date: new Date(date).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          location,
          isVirtual,
          category,
          maxCapacity: capacityNum,
          requiredSkills: skillsArray,
          registrationDeadline: new Date(registrationDeadline).toISOString(),
          imageUrl,
          status: 'published',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create event', 'error');
        setSubmitting(false);
        return;
      }

      showToast('Community event published successfully!', 'success');
      router.push('/organizer/events');
    } catch {
      showToast('Network error while publishing event', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner with AI Launch Button */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Smart Event Creator
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Create a New Community Event
          </h2>
          <p className="text-xs text-slate-500">
            Need inspiration? Use our AI assistant to generate titles, descriptions, and volunteer requirements in one click.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAiModalOpen(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
        >
          <Wand2 className="w-4 h-4" />
          AI Event Assistant
        </button>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Event Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Annual Urban Forest & Tree Planting Drive"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Event Description & Volunteer Scope <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the mission, schedule of the day, what supplies are provided, and how volunteers will make a difference..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        {/* Category & Capacity Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Maximum Volunteer Capacity <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                required
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="25"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Registration closes automatically when this capacity is reached.
            </p>
          </div>
        </div>

        {/* Dates & Deadlines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Event Start Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Event End Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Registration Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Location & Virtual Check */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Event Location / Venue <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Riverside Community Park, Sector 4, River Road Entrance"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Required Skills / Volunteer Roles (Comma Separated)
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Tree Planting, First Aid, Logistics, Heavy Lifting, Photography"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Volunteers will choose their preferred role/skill from these options upon registering.
          </p>
        </div>

        {/* Cover Image Preset Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Event Cover Image
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {IMAGE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImageUrl(preset.url)}
                className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  imageUrl === preset.url
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] font-semibold rounded px-1 text-center truncate">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Or enter custom image URL (https://...)"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 mt-2"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                Publish Community Event
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApply={handleApplyAiData}
      />
    </div>
  );
}
