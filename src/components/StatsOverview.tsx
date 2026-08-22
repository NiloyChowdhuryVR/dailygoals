'use client';

import React from 'react';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { CheckCircle2, AlertCircle, Calendar, Trophy, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsOverviewProps {
  dailyTasksReturn: UseDailyTasksReturn;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ dailyTasksReturn }) => {
  const { stats } = dailyTasksReturn;

  const statCards = [
    {
      label: 'Completion',
      value: `${stats.completionPercentage}%`,
      subtext: `${stats.completedCount} of ${stats.totalTopics} topics`,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      accentBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      cardStyle: 'from-emerald-950/20 via-obsidian-900/60 to-obsidian-900 border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'shadow-emerald-500/5',
    },
    {
      label: 'Overdue Shifted',
      value: stats.missedCount,
      subtext: stats.missedCount > 0 ? 'Shifted to Today' : 'Clean record!',
      icon: <AlertCircle className={`w-4 h-4 ${stats.missedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />,
      accentBg: stats.missedCount > 0 ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-white/[0.04] text-slate-400 border-white/[0.06]',
      cardStyle: stats.missedCount > 0
        ? 'from-rose-950/25 via-obsidian-900/70 to-obsidian-900 border-rose-500/30 hover:border-rose-500/50 shadow-lg shadow-rose-500/10'
        : 'from-obsidian-900/50 to-obsidian-900 border-white/[0.06] hover:border-white/[0.12]',
      glow: stats.missedCount > 0 ? 'shadow-rose-500/10' : '',
    },
    {
      label: stats.isTodayGoalCompleted ? "Today's Goal" : 'Current Day',
      value: stats.isTodayGoalCompleted ? 'Done! 🎉' : `Day ${stats.currentDayNumber}`,
      subtext: stats.isTodayGoalCompleted
        ? (stats.todayPhaseNumber !== null && stats.todayPhaseNumber !== undefined
            ? `Phase ${stats.todayPhaseNumber} Mastered!`
            : "Today's Phase Mastered!")
        : `${stats.todayPhaseCompletedCount}/${stats.todayPhaseTotalCount} topics done`,
      icon: stats.isTodayGoalCompleted ? (
        <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
      ) : (
        <Calendar className="w-4 h-4 text-indigo-400" />
      ),
      accentBg: stats.isTodayGoalCompleted
        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      cardStyle: stats.isTodayGoalCompleted
        ? 'from-amber-950/20 via-obsidian-900/70 to-obsidian-900 border-amber-500/30 shadow-lg shadow-amber-500/10 hover:border-amber-500/50'
        : 'from-indigo-950/20 via-obsidian-900/60 to-obsidian-900 border-indigo-500/20 hover:border-indigo-500/40',
      glow: stats.isTodayGoalCompleted ? 'shadow-amber-500/10' : 'shadow-indigo-500/5',
    },
    {
      label: 'Upcoming Scope',
      value: stats.upcomingCount,
      subtext: 'Scheduled future topics',
      icon: <Clock className="w-4 h-4 text-cyan-400" />,
      accentBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      cardStyle: 'from-cyan-950/15 via-obsidian-900/60 to-obsidian-900 border-cyan-500/20 hover:border-cyan-500/40',
      glow: 'shadow-cyan-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statCards.map((card, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-xl bg-gradient-to-b transition-all shadow-md ${card.cardStyle} ${card.glow}`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">
              {card.label}
            </span>
            <div className={`p-1.5 rounded-xl border shrink-0 ${card.accentBg}`}>
              {card.icon}
            </div>
          </div>

          <div className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-tight leading-none mb-1.5">
            {card.value}
          </div>

          <p className="text-[11px] text-slate-400 truncate font-mono">
            {card.subtext}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

