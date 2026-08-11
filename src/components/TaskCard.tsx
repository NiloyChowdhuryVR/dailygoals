'use client';

import React from 'react';
import { ProcessedTopic } from '@/types/learning';
import { useProgress } from '@/context/ProgressContext';
import { Check, AlertTriangle, Calendar, Clock, ExternalLink, Sparkles, AlertCircle, FileText, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: ProcessedTopic;
  isCompact?: boolean;
  onOpenDoc?: (task: ProcessedTopic) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isCompact = false, onOpenDoc }) => {
  const { toggleTopicCompletion, activeSubject, getTopicDocument } = useProgress();

  const isCompleted = task.status === 'completed';
  const isMissedShifted = task.status === 'missed-shifted' || task.isMissedShifted;
  const isToday = task.status === 'today';

  const doc = activeSubject ? getTopicDocument(activeSubject.id, task.id) : null;
  const hasDoc = !!(doc && doc.content && doc.content.trim().length > 0);

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
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#38bdf8'],
        disableForReducedMotion: true,
      });
    }

    toggleTopicCompletion(task.id);
  };

  // Card Border & Background styling variants
  const getCardStyles = () => {
    if (isCompleted) {
      return 'bg-emerald-950/10 border-emerald-500/20 text-slate-300 hover:border-emerald-500/40';
    }
    if (isMissedShifted) {
      return 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-500/10 text-white hover:border-rose-500 animate-pulse-subtle';
    }
    if (isToday) {
      return 'bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-purple-950/30 border-blue-500/60 shadow-xl shadow-blue-500/10 text-white hover:border-blue-400';
    }
    return 'bg-dark-850/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-dark-800/60';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group rounded-2xl border p-4 md:p-5 transition-all duration-300 backdrop-blur-md ${getCardStyles()}`}
    >
      <div className="flex items-start gap-4">
        {/* Animated Custom Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className="relative shrink-0 mt-0.5 group/check focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                : isMissedShifted
                ? 'border-rose-500/80 bg-rose-950/40 group-hover/check:border-rose-400'
                : isToday
                ? 'border-blue-500/80 bg-blue-950/40 group-hover/check:border-blue-400'
                : 'border-slate-700 bg-slate-900/60 group-hover/check:border-slate-500'
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
          <div className="flex flex-wrap items-center gap-2">
            {/* Shifted Missed Task Badge */}
            {isMissedShifted && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-semibold tracking-wide uppercase font-mono">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                Shifted from Day {task.shiftedFromDayIndex || task.scheduledDayIndex + 1}
              </span>
            )}

            {/* Today Native Task Badge */}
            {isToday && !isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[11px] font-semibold tracking-wide uppercase font-mono">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Today's Scheduled Goal
              </span>
            )}

            {/* Document Saved Badge */}
            {hasDoc && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[11px] font-semibold font-mono shadow-sm shadow-purple-500/20">
                <FileText className="w-3 h-3 text-purple-400" />
                Doc Saved
              </span>
            )}

            {/* Phase Identifier */}
            <span className="text-[11px] font-medium text-slate-400 font-mono">
              Phase {task.phaseNumber}: {task.phaseTitle}
            </span>
          </div>

          {/* Title & Strikethrough Animation */}
          <h3
            className={`font-semibold text-base md:text-lg transition-all duration-300 leading-snug ${
              isCompleted
                ? 'line-through text-slate-400 font-normal'
                : 'text-white'
            }`}
          >
            {task.name}
          </h3>

          {/* Description */}
          {!isCompact && (
            <p
              className={`text-xs md:text-sm leading-relaxed ${
                isCompleted ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Footer Metadata & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/40">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Day {task.scheduledDayIndex + 1}
              </span>

              {task.estimatedMinutes && (
                <span className="flex items-center gap-1 font-mono">
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    hasDoc
                      ? 'bg-purple-950/80 border-purple-700/80 text-purple-300 hover:bg-purple-900'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700/80 hover:border-blue-500/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>{hasDoc ? 'View Notes' : 'Add Notes'}</span>
                </button>
              )}

              {task.resourceUrl && (
                <a
                  href={task.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline font-medium"
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

