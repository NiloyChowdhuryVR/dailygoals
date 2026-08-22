'use client';

import React, { useState } from 'react';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { ProcessedTopic } from '@/types/learning';
import { TaskCard } from '@/components/TaskCard';
import { AlertCircle, CheckCircle2, CalendarCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TodayTasksListProps {
  dailyTasksReturn: UseDailyTasksReturn;
  onOpenDoc?: (task: ProcessedTopic) => void;
  onOpenQna?: (task: ProcessedTopic) => void;
}

export const TodayTasksList: React.FC<TodayTasksListProps> = ({ dailyTasksReturn, onOpenDoc, onOpenQna }) => {
  const { todayTasks, shiftedMissedTasks, stats } = dailyTasksReturn;
  const [activeFilter, setActiveFilter] = useState<'all' | 'missed' | 'today'>('all');

  const todayNativeCount = todayTasks.filter((t) => t.status === 'today').length;

  const displayedTasks = todayTasks.filter((task) => {
    if (activeFilter === 'missed') return task.status === 'missed-shifted';
    if (activeFilter === 'today') return task.status === 'today';
    return true;
  });

  const uncompletedTodayCount = todayTasks.filter((t) => t.status !== 'completed').length;
  const isAllTodayCompleted = uncompletedTodayCount === 0 && todayTasks.length > 0;

  return (
    <div className="space-y-6">
      {/* Shifted Missed Tasks Glowing Warning Banner */}
      {shiftedMissedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-r from-rose-950/40 via-obsidian-900/80 to-rose-950/30 border border-rose-500/40 p-4 sm:p-5 shadow-xl shadow-rose-500/10 flex items-start gap-4 backdrop-blur-xl"
        >
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-200 flex items-center gap-2">
              <span>Phase Task Shifting Active</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/40">
                {shiftedMissedTasks.length} Overdue Topic{shiftedMissedTasks.length > 1 ? 's' : ''}
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You missed topics from previous phase days! They have been automatically shifted into your{' '}
              <strong className="text-white">Today's Goals</strong> focus list so you never fall behind.
            </p>
          </div>
        </motion.div>
      )}

      {/* Dashboard Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <CalendarCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-extrabold text-white tracking-tight">Today's Focus (Day {stats.currentDayNumber})</h2>
          {stats.isTodayGoalCompleted ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Goal Met 🎉
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono font-bold border border-indigo-800/60">
              {todayTasks.length} topic{todayTasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-obsidian-900 p-1 rounded-xl border border-white/[0.08] overflow-x-auto no-scrollbar w-full sm:w-auto shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Today ({todayTasks.length})
          </button>

          {shiftedMissedTasks.length > 0 && (
            <button
              onClick={() => setActiveFilter('missed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                activeFilter === 'missed'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Overdue</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-200 text-[10px] font-mono">
                {shiftedMissedTasks.length}
              </span>
            </button>
          )}

          {todayNativeCount > 0 && (
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeFilter === 'today'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today's Phase ({todayNativeCount})
            </button>
          )}
        </div>
      </div>

      {/* Task List Rendering */}
      {displayedTasks.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpenDoc={onOpenDoc} onOpenQna={onOpenQna} />
            ))}
          </AnimatePresence>
        </div>
      ) : isAllTodayCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 sm:p-12 text-center space-y-3 backdrop-blur-xl"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-300">Phase Completed for Today!</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Awesome job! You finished all topics for today's scheduled phase. Keep up the high velocity and momentum!
          </p>
        </motion.div>
      ) : (
        <div className="rounded-3xl border border-white/[0.08] bg-obsidian-900/40 p-8 text-center space-y-2 text-slate-400">
          <p className="text-xs font-mono">No tasks found for this view.</p>
        </div>
      )}
    </div>
  );
};

