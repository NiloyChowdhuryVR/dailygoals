'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import { Trash2, RotateCcw, X, Clock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-dark-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                  <span>Trash Bin</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 text-xs font-mono border border-rose-800/60">
                    3-Day Auto Cleanup
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Workflows stay in Trash for 3 days before permanent deletion.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner */}
          <div className="p-4 bg-amber-950/20 border-b border-amber-800/40 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Restoring a workflow brings back all finished topics, start dates, and Google Docs study notes <strong>exactly as they were</strong> when deleted.
            </p>
          </div>

          {/* List Content */}
          <div className="p-4 md:p-6 overflow-y-auto space-y-3 min-h-[220px]">
            {trashItems.length > 0 ? (
              trashItems.map((item) => {
                const completedIds = Array.from(new Set((item.snapshot?.progress?.completedTopicIds || []).map(String)));
                const completedCount = completedIds.length;
                const docCount = item.snapshot?.documents ? Object.keys(item.snapshot.documents).length : 0;

                return (
                  <div
                    key={item.subjectId}
                    className="p-4 rounded-xl bg-dark-850/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
                  >
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-white text-base truncate">{item.title}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-rose-400">
                          <Clock className="w-3.5 h-3.5" />
                          {calculateTimeRemaining(item.deletedAt)}
                        </span>
                        <span>•</span>
                        <span>{completedCount} topics completed</span>
                        {docCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-purple-300">{docCount} notes saved</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          await restoreFromTrash(item.subjectId);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-900/30"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Workflow</span>
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Permanently delete "${item.title}"?`)) {
                            await permanentlyDeleteFromTrash(item.subjectId);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 transition-colors"
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
                <p className="text-xs text-slate-600">
                  Any deleted roadmaps will appear here for 3 days.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {trashItems.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-dark-950/80 flex items-center justify-between shrink-0">
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
