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
}

export const TodayTasksList: React.FC<TodayTasksListProps> = ({ dailyTasksReturn, onOpenDoc }) => {
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
      {/* Shifted Missed Tasks Warning Banner */}
      {shiftedMissedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-rose-950/60 via-dark-900 to-rose-950/40 border border-rose-500/50 p-4 md:p-5 shadow-xl shadow-rose-500/10 flex items-start gap-4"
        >
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
            <AlertCircle className="w-6 h-6 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <span>Phase Task Shifting Active</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-900/80 text-rose-200 font-mono">
                {shiftedMissedTasks.length} Overdue Topic{shiftedMissedTasks.length > 1 ? 's' : ''}
              </span>
            </h3>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              You missed topics from previous phase days! They have been automatically shifted into your{' '}
              <strong className="text-white">Today's Goals</strong> list so you can catch up on uncompleted phases.
            </p>
          </div>
        </motion.div>
      )}

      {/* Dashboard Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Today's Goals (Day {stats.currentDayNumber})</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 text-xs font-mono font-bold border border-blue-800/60">
            {todayTasks.length} topic{todayTasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-xl border border-slate-800/80 shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Today ({todayTasks.length})
          </button>

          {shiftedMissedTasks.length > 0 && (
            <button
              onClick={() => setActiveFilter('missed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                activeFilter === 'missed'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Overdue</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-200 text-[10px]">
                {shiftedMissedTasks.length}
              </span>
            </button>
          )}

          {todayNativeCount > 0 && (
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === 'today'
                  ? 'bg-purple-600 text-white shadow-md'
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
              <TaskCard key={task.id} task={task} onOpenDoc={onOpenDoc} />
            ))}
          </AnimatePresence>
        </div>
      ) : isAllTodayCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center space-y-3"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-emerald-300">Phase Completed for Today!</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Awesome job! You finished all topics for today's scheduled phase. Keep up the high velocity!
          </p>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-dark-850/40 p-8 text-center space-y-2 text-slate-400">
          <p>No tasks found for this view.</p>
        </div>
      )}
    </div>
  );
};
