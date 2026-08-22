'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import {
  Cpu,
  Layers,
  Code2,
  Plus,
  Sparkles,
  Trash2,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Video,
  Clock,
  Trophy,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { parseISO, differenceInCalendarDays, startOfDay } from 'date-fns';
import { getEffectiveDate, getEffectiveTodayIso } from '@/lib/dateUtils';

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Code2: <Code2 className="w-5 h-5" />,
};

interface SidebarProps {
  onOpenImportModal: () => void;
  onOpenRoadmapHub?: (initialTab?: 'all' | 'ongoing' | 'queue' | 'completed' | 'trash') => void;
  onOpenTrashModal?: () => void;
  onOpenVideoVault?: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenImportModal,
  onOpenRoadmapHub,
  onOpenTrashModal,
  onOpenVideoVault,
  isMobileDrawer = false,
}) => {
  const {
    subjects,
    activeSubjectId,
    selectSubject,
    userProgress,
    trashItems,
    savedResources,
    deleteSubject,
    restoreDefaultSubjects,
  } = useProgress();

  // Categorize subjects into Ongoing vs Queue vs Completed
  const { ongoingSubjects, queueCount, completedCount } = React.useMemo(() => {
    let queue = 0;
    let completed = 0;
    const ongoing: typeof subjects = [];

    subjects.forEach((subject) => {
      const progress = userProgress[subject.id];
      const isTrackStarted = progress ? progress.isStarted !== false : true;
      const totalTopics = subject.phases.reduce((acc, p) => acc + p.topics.length, 0);
      const completedIds = Array.from(new Set((progress?.completedTopicIds || []).map(String)));
      const count = completedIds.length;
      const percent = totalTopics > 0 ? Math.round((count / totalTopics) * 100) : 0;

      if (percent === 100 && totalTopics > 0) {
        completed++;
      } else if (!isTrackStarted) {
        queue++;
      } else {
        ongoing.push(subject);
      }
    });

    return {
      ongoingSubjects: ongoing,
      queueCount: queue,
      completedCount: completed,
    };
  }, [subjects, userProgress]);

  return (
    <aside
      className={
        isMobileDrawer
          ? 'w-full flex flex-col justify-between space-y-6 p-4 pb-12'
          : 'w-full lg:w-72 bg-obsidian-950/80 backdrop-blur-2xl border-r border-white/[0.07] flex flex-col justify-between p-4 space-y-6 pb-12 h-screen'
      }
    >
      <div className="space-y-5">
        {/* Brand Logo (Desktop only or non-drawer) */}
        {!isMobileDrawer && (
          <div className="flex items-center gap-3 px-2 py-3 border-b border-white/[0.07]">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-obsidian-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-wide flex items-center gap-1">
                Daily<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Goals</span>
              </h1>
              <p className="text-[11px] font-mono text-slate-400 tracking-wider">ROADMAP ENGINE</p>
            </div>
          </div>
        )}

        {/* Roadmap Hub Launcher Banner (Opens full catalog without clutter) */}
        {onOpenRoadmapHub && (
          <button
            onClick={() => onOpenRoadmapHub('all')}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-obsidian-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all text-left shadow-lg shadow-indigo-500/10 group active:scale-[0.98]"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
                </div>
                <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  Roadmap Hub
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              {queueCount > 0 && (
                <span className="text-amber-400/90 font-medium">
                  {queueCount} in Queue
                </span>
              )}
              {queueCount > 0 && completedCount > 0 && <span>•</span>}
              {completedCount > 0 && (
                <span className="text-emerald-400/90 font-medium">
                  {completedCount} Mastered
                </span>
              )}
              {queueCount === 0 && completedCount === 0 && (
                <span>Browse & Start Tracks</span>
              )}
            </div>
          </button>
        )}

        {/* Active Ongoing Roadmaps Navigation */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Ongoing Roadmaps
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 font-mono border border-white/[0.08]">
              {ongoingSubjects.length}
            </span>
          </div>

          {ongoingSubjects.length > 0 ? (
            <div className="space-y-2">
              {ongoingSubjects.map((subject) => {
                const isSelected = subject.id === activeSubjectId;
                const progress = userProgress[subject.id];
                const totalTopics = subject.phases.reduce((acc, p) => acc + p.topics.length, 0);
                const completedIds = Array.from(new Set((progress?.completedTopicIds || []).map(String)));
                const completedSet = new Set(completedIds);
                const completedCount = completedIds.length;
                const percent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

                // Calculate today's goal completion for this track
                const baseToday = getEffectiveDate(new Date());
                const startDateIso = progress?.startDate || getEffectiveTodayIso(new Date());
                let startDateObj: Date;
                try {
                  startDateObj = startOfDay(parseISO(startDateIso));
                } catch {
                  startDateObj = baseToday;
                }
                let dayIndex = differenceInCalendarDays(baseToday, startDateObj);
                if (dayIndex < 0) dayIndex = 0;

                const currentPhase = subject.phases[dayIndex] || subject.phases[subject.phases.length - 1];
                const todayPhaseTopics = currentPhase ? currentPhase.topics : [];
                const todayPhaseDone = todayPhaseTopics.length > 0 && todayPhaseTopics.every((t) => completedSet.has(String(t.id)));
                let hasUncompletedOverdue = false;
                for (let pIdx = 0; pIdx < Math.min(dayIndex, subject.phases.length); pIdx++) {
                  if (subject.phases[pIdx].topics.some((t) => !completedSet.has(String(t.id)))) {
                    hasUncompletedOverdue = true;
                    break;
                  }
                }
                const isTodayGoalCompleted = todayPhaseDone && !hasUncompletedOverdue;

                return (
                  <motion.div
                    key={subject.id}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.15 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => selectSubject(subject.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all duration-200 text-left border ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-obsidian-900 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/15'
                          : 'bg-obsidian-900/50 border-white/[0.06] text-slate-300 hover:bg-obsidian-850/80 hover:border-white/[0.12] hover:text-white'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl mt-0.5 shrink-0 border ${
                          isSelected
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                            : 'bg-white/[0.04] text-slate-400 border-white/[0.06] group-hover:text-slate-200'
                        }`}
                      >
                        {iconMap[subject.icon || 'BookOpen'] || <BookOpen className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0 pr-5">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="font-bold text-xs sm:text-sm truncate">{subject.title}</span>
                        </div>

                        {/* Active / Goal Met Status Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {isTodayGoalCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold font-mono">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Goal Met ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-[10px] font-semibold font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          )}

                          {subject.category && (
                            <span className="text-[10px] text-slate-400 truncate font-mono">
                              {subject.category}
                            </span>
                          )}
                        </div>

                        {/* Mini progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>{completedCount}/{totalTopics} done</span>
                            <span className="font-semibold text-slate-300">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-obsidian-950 border border-white/[0.06] overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'
                                  : 'bg-slate-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Delete roadmap button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        deleteSubject(subject.id);
                      }}
                      className="absolute right-2 top-3 z-10 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/80 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Distraction-Free Empty Focus State */
            <div className="p-4 rounded-2xl bg-obsidian-900/60 border border-dashed border-white/[0.08] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">No Ongoing Tracks</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Start a track from your Roadmap Hub whenever you are ready!
                </p>
              </div>
              {onOpenRoadmapHub && (
                <button
                  onClick={() => onOpenRoadmapHub('queue')}
                  className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Choose from Queue</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global Vaults & Action Tools */}
        <div className="space-y-2 pt-1 border-t border-white/[0.06]">
          {onOpenVideoVault && (
            <button
              onClick={onOpenVideoVault}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-500/20 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-500/40 text-purple-200 transition-all font-semibold text-xs group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Video Vault</span>
              </div>
              {savedResources.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-200 font-mono text-[10px] font-bold border border-purple-700/60">
                  {savedResources.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenImportModal}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-white/[0.1] bg-obsidian-900/40 hover:bg-white/[0.05] hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 transition-all font-medium text-xs group"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Import Roadmap JSON</span>
          </button>

          {onOpenTrashModal && trashItems.length > 0 && (
            <button
              onClick={onOpenTrashModal}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-rose-500/20 bg-rose-950/20 hover:bg-rose-900/30 text-rose-300 transition-all font-medium text-xs group"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Trash Bin</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-900/80 text-rose-200 font-mono text-[10px] font-bold">
                {trashItems.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/[0.06] px-1 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-[11px] text-emerald-300 font-semibold">
            Task Shifting Active (4 AM)
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Missed tasks automatically roll into your next day's goals without loss.
        </p>
      </div>
    </aside>
  );
};

