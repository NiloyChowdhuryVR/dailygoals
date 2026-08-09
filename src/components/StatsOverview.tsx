'use client';

import React from 'react';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { CheckCircle2, AlertCircle, Calendar, Layers, Trophy, Clock } from 'lucide-react';

interface StatsOverviewProps {
  dailyTasksReturn: UseDailyTasksReturn;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ dailyTasksReturn }) => {
  const { stats } = dailyTasksReturn;

  const statCards = [
    {
      label: 'Completion',
      value: `${stats.completionPercentage}%`,
      subtext: `${stats.completedCount} / ${stats.totalTopics} topics`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-300',
    },
    {
      label: 'Overdue Shifted',
      value: stats.missedCount,
      subtext: stats.missedCount > 0 ? 'Shifted to Today' : 'Clean record!',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      color: stats.missedCount > 0 ? 'border-rose-500/40 bg-rose-950/20 text-rose-300' : 'border-slate-800 bg-dark-850/40 text-slate-400',
    },
    {
      label: 'Current Schedule',
      value: `Day ${stats.currentDayNumber}`,
      subtext: `Target: ${stats.totalDaysNeeded} Days`,
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-950/10 text-blue-300',
    },
    {
      label: 'Upcoming Goals',
      value: stats.upcomingCount,
      subtext: 'Scheduled for future days',
      icon: <Clock className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-950/10 text-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border p-4 backdrop-blur-md transition-all ${card.color}`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {card.label}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
              {card.icon}
            </div>
          </div>

          <div className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
            {card.value}
          </div>

          <p className="text-[11px] text-slate-400 mt-1 truncate font-mono">
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
};
