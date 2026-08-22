'use client';

import React from 'react';
import { SubjectData } from '@/types/learning';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { useProgress } from '@/context/ProgressContext';
import {
  Calendar,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Database,
  Layers,
  PlayCircle,
  Clock,
  Moon,
  Compass,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  subject: SubjectData | null;
  dailyTasksReturn: UseDailyTasksReturn;
  onOpenImportModal: () => void;
  onOpenRoadmapHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  subject,
  dailyTasksReturn,
  onOpenImportModal,
  onOpenRoadmapHub,
}) => {
  const { startSubjectTrack, resetSubjectProgress, restoreDefaultSubjects, isSyncingDb } = useProgress();
  const { stats } = dailyTasksReturn;

  if (!subject) {
    return (
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.05] via-obsidian-900/90 to-obsidian-950/90 border border-white/[0.08] p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-4 glass-panel">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            No Active Learning Track
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Choose an ongoing curriculum from your Roadmap Hub, import custom JSON, or restore preloaded tracks.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {onOpenRoadmapHub && (
            <button
              onClick={onOpenRoadmapHub}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Open Roadmap Hub</span>
            </button>
          )}
          <button
            onClick={onOpenImportModal}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold transition-all"
          >
            Import JSON
          </button>
          <button
            onClick={restoreDefaultSubjects}
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-xs font-semibold transition-all"
          >
            Restore Default Curriculums
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.04] via-obsidian-900/85 to-obsidian-950/90 border border-white/[0.08] p-5 sm:p-7 shadow-2xl backdrop-blur-2xl glass-panel">
      {/* Background Radial Atmosphere Mesh */}
      <div className="absolute -top-28 -right-28 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Info Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-2.5 max-w-3xl">
            {/* Status Pills Row */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {subject.category && (
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  {subject.category}
                </span>
              )}

              {stats.isTodayGoalCompleted ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 animate-pulse font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Today's Goal Completed! 🎉
                </span>
              ) : stats.isTodayPhaseCompleted ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Today's Phase Done ({stats.todayPhaseCompletedCount}/{stats.todayPhaseTotalCount})
                </span>
              ) : null}

              {!stats.isStarted ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Preview / Watch Mode
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono px-3 py-1 rounded-full border ${
                    stats.isTodayGoalCompleted
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/[0.04] text-slate-300 border-white/[0.08]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Day {stats.currentDayNumber} of {stats.totalDaysNeeded} (1 Phase/Day)
                </span>
              )}

              {stats.missedCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse font-mono">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  {stats.missedCount} Shifted Topic{stats.missedCount > 1 ? 's' : ''}
                </span>
              )}

              {/* 4:00 AM Daily Reset Badge */}
              <span
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/50"
                title="Daily reset happens at 4:00 AM so late night focus sessions count toward the current day!"
              >
                <Moon className="w-3 h-3 text-purple-400" />
                4 AM Reset
              </span>

              {/* Database Sync Badge */}
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                <Database className="w-3 h-3 text-emerald-400" />
                {isSyncingDb ? 'Syncing...' : 'DB Active'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {subject.title}
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              {subject.description}
            </p>
          </div>

          {/* Action Buttons Right Row */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-1 md:pt-0 shrink-0">
            {onOpenRoadmapHub && (
              <button
                onClick={onOpenRoadmapHub}
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                title="Switch curriculum or browse library"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Roadmap Hub</span>
              </button>
            )}

            {!stats.isStarted ? (
              <button
                onClick={() => startSubjectTrack(subject.id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Start Daily Tracker</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (confirm('Reset subject progress and set start date to Today?')) {
                    resetSubjectProgress();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-rose-400 hover:border-rose-900/60 text-xs transition-colors"
                title="Reset start date to Today"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Start Date</span>
              </button>
            )}
          </div>
        </div>

        {/* Unstarted / Preview Banner */}
        {!stats.isStarted && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-obsidian-900 to-purple-950/30 border border-indigo-500/30 text-xs text-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <span>
              👁️ <strong>Preview / Watch Mode:</strong> You are freely watching & exploring this roadmap. Browse phases, topic notes, and videos anytime. Click <strong>"Start Daily Tracker"</strong> when you want daily 1-phase goal tracking!
            </span>
            <button
              onClick={() => startSubjectTrack(subject.id)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-extrabold hover:from-emerald-400 hover:to-indigo-500 transition-all shrink-0 shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Start Daily Tracker</span>
            </button>
          </div>
        )}

        {/* Radiant Progress Bar & Key Indicators */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Overall Track Progress</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">
                {stats.completedCount} of {stats.totalTopics} topics
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold font-mono text-xs shadow-md shadow-indigo-500/20">
                {stats.completionPercentage}%
              </span>
            </div>
          </div>

          {/* Visual Track Bar */}
          <div className="w-full h-3 rounded-full bg-obsidian-950 p-0.5 border border-white/[0.08] overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-lg shadow-indigo-500/25 relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-subtle" />
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

