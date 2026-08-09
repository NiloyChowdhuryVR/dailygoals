'use client';

import React, { useState } from 'react';
import { SubjectData } from '@/types/learning';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { TaskCard } from '@/components/TaskCard';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, AlertCircle, Calendar, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhaseTimelineProps {
  subject: SubjectData;
  dailyTasksReturn: UseDailyTasksReturn;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ subject, dailyTasksReturn }) => {
  const { allProcessedTopics } = dailyTasksReturn;

  // Track expanded phases (default Phase 1 expanded)
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true,
  });

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
        {subject.phases.map((phase) => {
          const isExpanded = !!expandedPhases[phase.phase_number];

          // Get topics belonging to this phase
          const phaseTopics = allProcessedTopics.filter(
            (t) => t.phaseNumber === phase.phase_number
          );
          const completedInPhase = phaseTopics.filter((t) => t.status === 'completed').length;
          const totalInPhase = phaseTopics.length;
          const isPhaseCompleted = totalInPhase > 0 && completedInPhase === totalInPhase;

          return (
            <div
              key={phase.phase_number}
              className="rounded-2xl border border-slate-800/80 bg-dark-900/60 overflow-hidden backdrop-blur-md transition-all"
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
                        : 'bg-purple-950/60 text-purple-300 border-purple-800/50'
                    }`}
                  >
                    {phase.phase_number}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base md:text-lg text-white truncate">
                        {phase.title}
                      </h3>

                      {isPhaseCompleted && (
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
                  {/* Phase Progress Badge */}
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
                      <TaskCard key={topic.id} task={topic} />
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
