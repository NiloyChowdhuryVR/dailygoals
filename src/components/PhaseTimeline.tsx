'use client';

import React, { useState } from 'react';
import { ProcessedTopic, SubjectData } from '@/types/learning';
import { UseDailyTasksReturn } from '@/hooks/useDailyTasks';
import { TaskCard } from '@/components/TaskCard';
import { ChevronDown, ChevronRight, CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhaseTimelineProps {
  subject: SubjectData | null;
  dailyTasksReturn: UseDailyTasksReturn;
  onOpenDoc?: (task: ProcessedTopic) => void;
  onOpenQna?: (task: ProcessedTopic) => void;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({
  subject,
  dailyTasksReturn,
  onOpenDoc,
  onOpenQna,
}) => {
  const { allProcessedTopics } = dailyTasksReturn;

  const todayPhaseNumber = dailyTasksReturn.stats.todayPhaseNumber;
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>(() => {
    return todayPhaseNumber !== null && todayPhaseNumber !== undefined
      ? { [todayPhaseNumber]: true }
      : { 1: true };
  });

  if (!subject) {
    return (
      <div className="rounded-3xl border border-white/[0.08] bg-obsidian-900/40 p-8 text-center text-slate-400">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-extrabold text-white tracking-tight">Roadmap Timeline & Phases</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-xs font-mono font-bold border border-purple-800/60">
            {subject.phases.length} Phases
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-colors"
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
              className={`rounded-3xl border overflow-hidden backdrop-blur-xl transition-all shadow-md ${
                isTodayPhase
                  ? isPhaseCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/20 shadow-emerald-500/10'
                    : 'border-indigo-500/50 bg-gradient-to-r from-indigo-950/30 via-obsidian-900/80 to-purple-950/20 shadow-indigo-500/10'
                  : 'border-white/[0.07] bg-obsidian-900/60 hover:border-white/[0.14]'
              }`}
            >
              {/* Phase Collapsible Header */}
              <button
                onClick={() => togglePhase(phase.phase_number)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold font-mono text-sm shrink-0 border ${
                      isPhaseCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : isTodayPhase
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
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
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                            isPhaseCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20 animate-pulse'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {isPhaseCompleted ? "Today's Phase Mastered 🎉" : "Today's Scheduled Phase"}
                        </span>
                      )}

                      {!isTodayPhase && isPhaseCompleted && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
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
                  <span className="text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/[0.08]">
                    {completedInPhase}/{totalInPhase} done
                  </span>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-indigo-400" />
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
                    className="border-t border-white/[0.06] p-4 sm:p-5 space-y-3.5 bg-obsidian-950/60"
                  >
                    {phaseTopics.map((topic) => (
                      <TaskCard key={topic.id} task={topic} onOpenDoc={onOpenDoc} onOpenQna={onOpenQna} />
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

