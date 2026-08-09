'use client';

import React from 'react';
import { SubjectData } from '@/types/learning';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { useProgress } from '@/context/ProgressContext';
import { Calendar, RotateCcw, Sparkles, AlertCircle, CheckCircle2, Database, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  subject: SubjectData | null;
  dailyTasksReturn: UseDailyTasksReturn;
  onOpenImportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ subject, dailyTasksReturn, onOpenImportModal }) => {
  const { resetSubjectProgress, restoreDefaultSubjects, isSyncingDb } = useProgress();
  const { stats } = dailyTasksReturn;

  if (!subject) {
    return (
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-850/90 via-dark-900/90 to-dark-950/90 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
          <Layers className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">No Active Learning Track</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You have cleared all learning tracks. Import your custom JSON roadmap or restore preloaded tracks to continue tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenImportModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
          >
            Import Roadmap JSON
          </button>
          <button
            onClick={restoreDefaultSubjects}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Restore Preloaded Tracks
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-850/90 via-dark-900/90 to-dark-950/90 border border-slate-800/80 p-6 shadow-2xl backdrop-blur-xl">
      {/* Subtle Background Radial Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Info Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {subject.category && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  {subject.category}
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Day {stats.currentDayNumber} of {stats.totalDaysNeeded}
              </span>

              {stats.missedCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {stats.missedCount} Shifted Task{stats.missedCount > 1 ? 's' : ''}
                </span>
              )}

              {/* Database Sync Badge */}
              <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                {isSyncingDb ? 'Syncing DB...' : 'Database Active'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {subject.title}
            </h1>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              {subject.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              onClick={() => {
                if (confirm('Reset subject progress and set start date to Today?')) {
                  resetSubjectProgress();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-400 hover:text-rose-400 hover:border-rose-900/60 text-xs transition-colors"
              title="Reset progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Start Date</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Key Indicators */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Overall Subject Completion</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">
                {stats.completedCount} of {stats.totalTopics} completed
              </span>
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold font-mono text-xs shadow-md">
                {stats.completionPercentage}%
              </span>
            </div>
          </div>

          {/* Visual Track Bar */}
          <div className="w-full h-3 rounded-full bg-slate-800/80 p-0.5 border border-slate-700/50 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 shadow-lg shadow-purple-500/20 relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-subtle" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};
