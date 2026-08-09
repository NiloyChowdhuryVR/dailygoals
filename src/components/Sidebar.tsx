'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import { Cpu, Layers, Code2, Plus, Sparkles, Trash2, BookOpen, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Code2: <Code2 className="w-5 h-5" />,
};

interface SidebarProps {
  onOpenImportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenImportModal }) => {
  const {
    subjects,
    activeSubjectId,
    selectSubject,
    userProgress,
    deleteSubject,
    restoreDefaultSubjects,
  } = useProgress();

  return (
    <aside className="w-full lg:w-72 bg-dark-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between min-h-screen p-4">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              Daily<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Goals</span>
            </h1>
            <p className="text-xs text-slate-400">Roadmap & Task Shifting</p>
          </div>
        </div>

        {/* Subjects Navigation */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Learning Tracks
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {subjects.length}
              </span>
            </div>
          </div>

          {subjects.length > 0 ? (
            <div className="space-y-2">
              {subjects.map((subject) => {
                const isActive = subject.id === activeSubjectId;
                const progress = userProgress[subject.id];
                const totalTopics = subject.phases.reduce((acc, p) => acc + p.topics.length, 0);
                const completedCount = progress?.completedTopicIds?.length || 0;
                const percent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

                return (
                  <motion.div
                    key={subject.id}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => selectSubject(subject.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left border ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-950/60 to-purple-950/40 border-blue-500/50 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-dark-850/40 border-slate-800/60 text-slate-300 hover:bg-dark-800/60 hover:border-slate-700/80 hover:text-white'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {iconMap[subject.icon || 'BookOpen'] || <BookOpen className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-sm truncate">{subject.title}</span>
                        </div>

                        {subject.category && (
                          <p className="text-[11px] text-slate-400 truncate mb-1.5">
                            {subject.category}
                          </p>
                        )}

                        {/* Mini progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>{completedCount}/{totalTopics} done</span>
                            <span className="font-medium text-slate-300">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                percent === 100
                                  ? 'bg-emerald-400'
                                  : isActive
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
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
                        if (confirm(`Delete "${subject.title}" roadmap from your tracks?`)) {
                          deleteSubject(subject.id);
                        }
                      }}
                      className="absolute right-2.5 top-3.5 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Delete roadmap"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400">No tracks remaining.</p>
              <button
                onClick={restoreDefaultSubjects}
                className="w-full px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold hover:bg-blue-900/80 transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Tracks</span>
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onOpenImportModal}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 hover:border-blue-500/50 text-slate-300 hover:text-blue-400 transition-all font-medium text-sm group"
          >
            <Plus className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Import Roadmap JSON</span>
          </button>

          <button
            onClick={restoreDefaultSubjects}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 text-xs transition-colors"
            title="Restore preloaded AI, OOPs & Next.js roadmaps"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore Preloaded Tracks</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 px-2 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-[11px]">Task Shifting Engine Active</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Hover over any track in the sidebar to delete it. You can import new ones anytime.
        </p>
      </div>
    </aside>
  );
};
