'use client';

import React, { useState } from 'react';
import { ProcessedTopic, SubjectData } from '@/types/learning';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { TaskCard } from '@/components/TaskCard';
import { ChevronDown, ChevronRight, CheckCircle2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhaseTimelineProps {
  subject: SubjectData | null;
  dailyTasksReturn: UseDailyTasksReturn;
  onOpenDoc?: (task: ProcessedTopic) => void;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ subject, dailyTasksReturn, onOpenDoc }) => {
  const { allProcessedTopics } = dailyTasksReturn;

  const todayPhaseNumber = dailyTasksReturn.stats.todayPhaseNumber;
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>(() => {
    return todayPhaseNumber !== null && todayPhaseNumber !== undefined
      ? { [todayPhaseNumber]: true }
      : { 1: true };
  });

  if (!subject) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-dark-850/40 p-8 text-center text-slate-400">
        No active roadmap selected.
      </div>
    );
  }

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<number, boolean> = {};
    subject.phases.forEach((p) => {
      allExpanded[p.phase_number] = true;
    });
    setExpandedPhases(allExpanded);
  };

  const collapseAll = () => setExpandedPhases({});

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Roadmap Timeline & Phases</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 text-xs font-mono font-bold border border-purple-800/60">
            {subject.phases.length} Phases
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Phase Cards List */}
      <div className="space-y-4">
        {subject.phases.map((phase, phaseIdx) => {
          const isExpanded = !!expandedPhases[phase.phase_number];

          const phaseTopics = allProcessedTopics.filter(
            (t) => t.phaseNumber === phase.phase_number
          );
          const completedInPhase = phaseTopics.filter((t) => t.status === 'completed').length;
          const totalInPhase = phaseTopics.length;
          const isPhaseCompleted = totalInPhase > 0 && completedInPhase === totalInPhase;
          const isTodayPhase = phaseIdx === dailyTasksReturn.stats.currentDayIndex;

          return (
            <div
              key={phase.phase_number}
              className={`rounded-2xl border overflow-hidden backdrop-blur-md transition-all ${
                isTodayPhase
                  ? isPhaseCompleted
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                    : 'border-blue-500/50 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                  : 'border-slate-800/80 bg-dark-900/60'
              }`}
            >
              {/* Phase Collapsible Header */}
              <button
                onClick={() => togglePhase(phase.phase_number)}
                className="w-full p-4 md:p-5 flex items-center justify-between gap-4 text-left hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm shrink-0 border ${
                      isPhaseCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : isTodayPhase
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-purple-950/60 text-purple-300 border-purple-800/50'
                    }`}
                  >
                    {phase.phase_number}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base md:text-lg text-white truncate">
                        {phase.title}
                      </h3>

                      {isTodayPhase && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isPhaseCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20 animate-pulse'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {isPhaseCompleted ? "Today's Phase Completed 🎉" : "Today's Scheduled Phase"}
                        </span>
                      )}

                      {!isTodayPhase && isPhaseCompleted && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Phase Complete
                        </span>
                      )}
                    </div>

                    {phase.description && (
                      <p className="text-xs text-slate-400 truncate">{phase.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                    {completedInPhase}/{totalInPhase} done
                  </span>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Topics Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-800/60 p-4 md:p-5 space-y-3 bg-dark-950/40"
                  >
                    {phaseTopics.map((topic) => (
                      <TaskCard key={topic.id} task={topic} onOpenDoc={onOpenDoc} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
