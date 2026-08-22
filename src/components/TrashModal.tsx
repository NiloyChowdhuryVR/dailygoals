'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import { Trash2, RotateCcw, X, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({ isOpen, onClose }) => {
  const { trashItems, restoreFromTrash, permanentlyDeleteFromTrash } = useProgress();

  if (!isOpen) return null;

  const calculateTimeRemaining = (deletedAtIso: string) => {
    const deletedTime = new Date(deletedAtIso).getTime();
    const expiresTime = deletedTime + 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diffMs = expiresTime - now;

    if (diffMs <= 0) return 'Expiring now';

    const hoursTotal = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hoursTotal / 24);
    const hours = hoursTotal % 24;

    if (days > 0) {
      return `Expires in ${days}d ${hours}h`;
    }
    return `Expires in ${hours}h`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-obsidian-900 border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-obsidian-950/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <span>Trash Bin</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 text-xs font-mono font-bold border border-rose-800/60">
                    3-Day Retention
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Deleted roadmaps stay in Trash for 3 days before auto cleanup.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner */}
          <div className="p-4 bg-amber-950/25 border-b border-amber-800/30 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Restoring a roadmap recovers all completed topic checks, start dates, and study notes <strong>exactly as they were</strong>.
            </p>
          </div>

          {/* List Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 min-h-[220px]">
            {trashItems.length > 0 ? (
              trashItems.map((item) => {
                const completedIds = Array.from(new Set((item.snapshot?.progress?.completedTopicIds || []).map(String)));
                const completedCount = completedIds.length;
                const docCount = item.snapshot?.documents ? Object.keys(item.snapshot.documents).length : 0;

                return (
                  <div
                    key={item.subjectId}
                    className="p-4 rounded-2xl bg-obsidian-950/80 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-white/[0.15]"
                  >
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-white text-base truncate">{item.title}</h3>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {calculateTimeRemaining(item.deletedAt)}
                        </span>
                        <span>•</span>
                        <span>{completedCount} topics done</span>
                        {docCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-purple-300">{docCount} notes</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          await restoreFromTrash(item.subjectId);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Permanently delete "${item.title}"?`)) {
                            await permanentlyDeleteFromTrash(item.subjectId);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium">Trash is empty.</p>
                <p className="text-xs text-slate-600 font-mono">
                  Deleted learning tracks will stay here safely for 3 days.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {trashItems.length > 0 && (
            <div className="p-4 border-t border-white/[0.08] bg-obsidian-950/80 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                {trashItems.length} item{trashItems.length > 1 ? 's' : ''} in trash
              </span>

              <button
                onClick={async () => {
                  if (window.confirm('Empty entire Trash Bin permanently?')) {
                    await permanentlyDeleteFromTrash();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

