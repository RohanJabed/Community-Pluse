'use client';

import React, { useState } from 'react';
import { Sparkles, X, Wand2, Check, ArrowRight, Lightbulb, Copy } from 'lucide-react';
import { AiGeneratedEvent } from '@/lib/types';
import { useToast } from '@/context/ToastContext';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: AiGeneratedEvent) => void;
}

const PRESET_IDEAS = [
  '🌳 Tree plantation & urban park greening with 400 saplings',
  '🍲 Weekend community soup kitchen and grocery box packing',
  '💻 Youth digital literacy and intro to web coding bootcamp',
  '🐾 Animal shelter dog walking, grooming & adoption photos',
  '🌊 Riverbank trash cleanup and eco-sorting initiative',
  '🩺 Community wellness clinic and senior blood pressure checks',
];

export default function AiAssistantModal({ isOpen, onClose, onApply }: AiAssistantModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiGeneratedEvent | null>(null);
  const [promoCopied, setPromoCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleGenerate = async (ideaPrompt?: string) => {
    const textToUse = ideaPrompt || prompt;
    if (!textToUse.trim()) {
      showToast('Please enter an event idea first', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToUse }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'AI generation failed', 'error');
        setLoading(false);
        return;
      }
      setResult(data.data);
      showToast('Event details synthesized successfully!', 'success');
    } catch {
      showToast('Error generating event with AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyPromo = () => {
    if (result?.promotionalMessage && navigator.clipboard) {
      navigator.clipboard.writeText(result.promotionalMessage);
      setPromoCopied(true);
      setTimeout(() => setPromoCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Event Description Assistant</h3>
              <p className="text-xs text-slate-500">Transform a simple idea into an inspiring, complete event draft</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              What kind of community event do you want to organize?
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "We want to organize a tree plantation program in Central Park next Saturday with native saplings."'
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Quick Idea Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500">Or pick an inspiration prompt:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IDEAS.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(idea);
                    handleGenerate(idea);
                  }}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleGenerate()}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Synthesizing Event Details...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Event Details
              </>
            )}
          </button>

          {/* Results Preview */}
          {result && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Synthesized Event Proposal
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {result.category} • Rec. Capacity: {result.suggestedCapacity}
                </span>
              </div>

              {/* Title */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Proposed Title</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{result.title}</p>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Full Description</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* Suggested Roles & Required Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Suggested Roles</span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {result.suggestedVolunteerRoles.map((role, idx) => (
                      <li key={idx} className="line-clamp-1">{role}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recommended Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {result.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Promotional Message */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Social Media / Promotional Snippet
                  </span>
                  <button
                    type="button"
                    onClick={copyPromo}
                    className="flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-300 hover:underline"
                  >
                    {promoCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {promoCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-teal-900 dark:text-teal-100 italic">
                  "{result.promotionalMessage}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {result && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            >
              Apply to Event Form
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
