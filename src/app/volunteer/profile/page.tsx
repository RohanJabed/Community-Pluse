'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  User,
  Mail,
  Phone,
  Sparkles,
  Award,
  Tag,
  Heart,
  Save,
  CheckCircle2,
  Calendar,
  Shield,
} from 'lucide-react';

const ALL_SKILLS = [
  'Tree Planting',
  'First Aid & CPR',
  'Event Setup & Logistics',
  'Youth Mentoring',
  'Food Preparation & Hygiene',
  'Inventory & Packing',
  'Crowd Coordination',
  'Animal Handling & Comfort',
  'Teaching & Tutoring',
  'Senior Care',
  'Bilingual Translation',
];

const ALL_INTERESTS = [
  'Environment',
  'Food Security',
  'Education',
  'Animal Welfare',
  'Health',
  'Community',
  'Crisis Relief',
  'Arts & Culture',
];

export default function VolunteerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [bio, setBio] = useState(
    user?.bio ||
      'Enthusiastic community advocate committed to local environmental initiatives, youth mentorship, and emergency relief programs.'
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user?.skills || ['Tree Planting', 'First Aid & CPR', 'Event Setup & Logistics']
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.interests || ['Environment', 'Food Security', 'Education']
  );
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // In demo environment, simulate profile update save
    setTimeout(() => {
      setSaving(false);
      showToast('Volunteer profile updated successfully!', 'success');
    }, 400);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={
            user.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
          }
          alt={user.name}
          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-teal-500/20 shadow-md"
        />

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 uppercase tracking-wider">
              Verified Volunteer
            </span>
          </div>

          <p className="text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {phone}
            </span>
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 max-w-xl">
            {bio}
          </p>
        </div>
      </div>

      {/* Badges / Impact Achievements (Bonus #3) */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Community Badges & Milestones
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-1">
            <span className="text-2xl">🌱</span>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Eco Guardian</p>
            <p className="text-[10px] text-slate-400">Planted 50+ trees</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-1">
            <span className="text-2xl">🥣</span>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Hunger Hero</p>
            <p className="text-[10px] text-slate-400">3 pantry shifts</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-1">
            <span className="text-2xl">⭐</span>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Reliable Star</p>
            <p className="text-[10px] text-slate-400">100% check-in rate</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center space-y-1">
            <span className="text-2xl">🐾</span>
            <p className="font-bold text-xs text-slate-900 dark:text-white">Animal Friend</p>
            <p className="text-[10px] text-slate-400">Shelter grooming</p>
          </div>
        </div>
      </div>

      {/* Edit Form: Bio, Skills & Interests */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Customize Volunteer Profile
          </h3>
          <p className="text-xs text-slate-500">
            Keep your skills and civic interests updated so organizers can match you with suitable roles.
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Skills Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>My Skills & Capabilities</span>
            <span className="text-slate-400 font-normal">Click to toggle</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {active ? `✓ ${skill}` : `+ ${skill}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interests Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Causes & Passions</span>
            <span className="text-slate-400 font-normal">Click to toggle</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_INTERESTS.map((interest) => {
              const active = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {active ? `✓ ${interest}` : `+ ${interest}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02]"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
