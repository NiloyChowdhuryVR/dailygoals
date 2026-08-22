'use client';

import React from 'react';
import { ProcessedTopic } from '@/types/learning';
import { useProgress } from '@/context/ProgressContext';
import {
  Check,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: ProcessedTopic;
  isCompact?: boolean;
  onOpenDoc?: (task: ProcessedTopic) => void;
  onOpenQna?: (task: ProcessedTopic) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompact = false,
  onOpenDoc,
  onOpenQna,
}) => {
  const { toggleTopicCompletion, activeSubject, getTopicDocument, getTopicQnas } = useProgress();

  const isCompleted = task.status === 'completed';
  const isMissedShifted = task.status === 'missed-shifted' || task.isMissedShifted;
  const isToday = task.status === 'today';

  const doc = activeSubject ? getTopicDocument(activeSubject.id, task.id) : null;
  const hasDoc = !!(doc && doc.content && doc.content.trim().length > 0);

  const qnas = activeSubject ? getTopicQnas(activeSubject.id, task.id) : [];
  const qnaCount = qnas.length;
  const hasQna = qnaCount > 0;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isCompleted) {
      // Trigger subtle confetti burst on completion
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x, y },
        colors: ['#10b981', '#6366f1', '#a855f7', '#06b6d4'],
        disableForReducedMotion: true,
      });
    }

    toggleTopicCompletion(task.id);
  };

  // Card Border & Background styling variants
  const getCardStyles = () => {
    if (isCompleted) {
      return 'bg-emerald-950/15 border-emerald-500/25 text-slate-300 hover:border-emerald-500/40 shadow-sm';
    }
    if (isMissedShifted) {
      return 'bg-gradient-to-br from-rose-950/25 via-obsidian-900/80 to-obsidian-900 border-rose-500/50 shadow-xl shadow-rose-500/10 text-white hover:border-rose-400 animate-pulse-subtle';
    }
    if (isToday) {
      return 'bg-gradient-to-br from-indigo-950/35 via-obsidian-900/80 to-purple-950/25 border-indigo-500/50 shadow-xl shadow-indigo-500/15 text-white hover:border-indigo-400';
    }
    return 'bg-obsidian-900/60 border-white/[0.07] text-slate-300 hover:border-white/[0.15] hover:bg-obsidian-850/80';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group rounded-3xl border p-4 sm:p-5 transition-all duration-300 backdrop-blur-xl ${getCardStyles()}`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Animated Custom Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className="relative shrink-0 mt-0.5 p-1 -m-1 group/check focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-2xl"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
              isCompleted
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                : isMissedShifted
                ? 'border-rose-500/80 bg-rose-950/40 group-hover/check:border-rose-400'
                : isToday
                ? 'border-indigo-500/80 bg-indigo-950/40 group-hover/check:border-indigo-400'
                : 'border-white/20 bg-obsidian-950/80 group-hover/check:border-white/40'
            }`}
          >
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </motion.div>
            )}
          </motion.div>
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Shifted Missed Task Badge */}
            {isMissedShifted && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase font-mono">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                Shifted from Day {task.shiftedFromDayIndex || task.scheduledDayIndex + 1}
              </span>
            )}

            {/* Today Native Task Badge */}
            {isToday && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase font-mono">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Today's Goal
              </span>
            )}

            {/* Document Saved Badge */}
            {hasDoc && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] sm:text-[11px] font-semibold font-mono shadow-sm shadow-purple-500/20">
                <FileText className="w-3 h-3 text-purple-400" />
                Notes Saved
              </span>
            )}

            {/* Q&As Badge */}
            {hasQna && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] sm:text-[11px] font-semibold font-mono shadow-sm shadow-amber-500/20">
                <HelpCircle className="w-3 h-3 text-amber-400" />
                {qnaCount} Q&A{qnaCount !== 1 ? 's' : ''}
              </span>
            )}

            {/* Phase Identifier */}
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 font-mono truncate">
              Phase {task.phaseNumber}: {task.phaseTitle}
            </span>
          </div>

          {/* Title & Strikethrough Animation */}
          <h3
            className={`font-bold text-sm sm:text-base md:text-lg transition-all duration-300 leading-snug tracking-tight ${
              isCompleted
                ? 'line-through text-slate-500 font-normal'
                : 'text-white'
            }`}
          >
            {task.name}
          </h3>

          {/* Description */}
          {!isCompact && (
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isCompleted ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Footer Metadata & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 text-xs text-slate-400 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Day {task.scheduledDayIndex + 1}
              </span>

              {task.estimatedMinutes && (
                <span className="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {task.estimatedMinutes} mins
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Save / Edit Study Notes Button */}
              {onOpenDoc && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDoc(task);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border active:scale-95 ${
                    hasDoc
                      ? 'bg-purple-950/80 border-purple-600/60 text-purple-300 hover:bg-purple-900'
                      : 'bg-white/[0.05] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.1] hover:border-purple-500/40'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>{hasDoc ? 'View Notes' : 'Add Notes'}</span>
                </button>
              )}

              {/* Topic Q&A Button */}
              {onOpenQna && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQna(task);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border active:scale-95 ${
                    hasQna
                      ? 'bg-amber-950/80 border-amber-600/60 text-amber-300 hover:bg-amber-900'
                      : 'bg-white/[0.05] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.1] hover:border-amber-500/40'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{hasQna ? `Q&A (${qnaCount})` : 'Q&A'}</span>
                </button>
              )}

              {task.resourceUrl && (
                <a
                  href={task.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 hover:text-indigo-300 text-xs font-medium active:scale-95"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


