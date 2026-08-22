'use client';

import React, { useState, useMemo } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { SubjectData } from '@/types/learning';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  PlayCircle,
  Trophy,
  Trash2,
  RotateCcw,
  Plus,
  X,
  Layers,
  ArrowRight,
  BookOpen,
  Cpu,
  Code2,
  ExternalLink,
  ChevronRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Code2: <Code2 className="w-5 h-5" />,
};

interface RoadmapHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportModal: () => void;
  initialTab?: 'all' | 'ongoing' | 'queue' | 'completed' | 'trash';
}

export const RoadmapHubModal: React.FC<RoadmapHubModalProps> = ({
  isOpen,
  onClose,
  onOpenImportModal,
  initialTab = 'all',
}) => {
  const {
    subjects,
    activeSubjectId,
    selectSubject,
    startSubjectTrack,
    userProgress,
    trashItems,
    deleteSubject,
    restoreFromTrash,
    permanentlyDeleteFromTrash,
    restoreDefaultSubjects,
    resetSubjectProgress,
  } = useProgress();

  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'queue' | 'completed' | 'trash'>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Update activeTab when initialTab changes on open
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen, initialTab]);

  // Compute stats for all subjects
  const subjectStats = useMemo(() => {
    return subjects.map((subject) => {
      const progress = userProgress[subject.id];
      const isTrackStarted = progress ? progress.isStarted !== false : true;
      const totalTopics = subject.phases.reduce((acc, p) => acc + p.topics.length, 0);
      const completedIds = Array.from(new Set((progress?.completedTopicIds || []).map(String)));
      const completedCount = completedIds.length;
      const percent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
      const isCompleted = percent === 100 && totalTopics > 0;
      const isOngoing = isTrackStarted && !isCompleted;
      const isQueue = !isTrackStarted && !isCompleted;

      return {
        subject,
        progress,
        isTrackStarted,
        totalTopics,
        completedCount,
        percent,
        isCompleted,
        isOngoing,
        isQueue,
      };
    });
  }, [subjects, userProgress]);

  const ongoingTracks = useMemo(() => subjectStats.filter((s) => s.isOngoing), [subjectStats]);
  const queueTracks = useMemo(() => subjectStats.filter((s) => s.isQueue), [subjectStats]);
  const completedTracks = useMemo(() => subjectStats.filter((s) => s.isCompleted), [subjectStats]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [subjects]);

  // Filtered tracks based on tab, search, and category
  const filteredTracks = useMemo(() => {
    let list = subjectStats;

    if (activeTab === 'ongoing') list = ongoingTracks;
    else if (activeTab === 'queue') list = queueTracks;
    else if (activeTab === 'completed') list = completedTracks;

    return list.filter(({ subject }) => {
      if (selectedCategory !== 'all' && subject.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = subject.title.toLowerCase().includes(q);
        const matchesDesc = (subject.description || '').toLowerCase().includes(q);
        const matchesCat = (subject.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [subjectStats, ongoingTracks, queueTracks, completedTracks, activeTab, selectedCategory, searchQuery]);

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

    if (days > 0) return `Expires in ${days}d ${hours}h`;
    return `Expires in ${hours}h`;
  };

  const handleSelectAndClose = (subjectId: string) => {
    selectSubject(subjectId);
    onClose();
  };

  const handleStartTrackAndSelect = (subjectId: string) => {
    startSubjectTrack(subjectId);
    selectSubject(subjectId);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-5xl bg-obsidian-900/95 border border-white/[0.08] rounded-3xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[90vh] glass-panel"
        >
          {/* Top Hero Header */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-b from-white/[0.04] to-transparent border-b border-white/[0.07] shrink-0">
            <div className="absolute top-0 right-1/4 w-72 h-36 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute -top-10 left-10 w-60 h-40 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
                  <div className="w-full h-full bg-obsidian-950 rounded-[14px] flex items-center justify-center">
                    <Layers className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                      Roadmap Hub & Catalog
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                      {subjects.length} Tracks Available
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Explore all curriculums. Only your active ongoing tracks appear on the main sidebar.
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => {
                    onClose();
                    onOpenImportModal();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import JSON</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-2 mt-5 overflow-x-auto no-scrollbar pt-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  activeTab === 'all'
                    ? 'bg-white/[0.12] border-white/20 text-white shadow-md'
                    : 'bg-white/[0.02] border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Tracks</span>
                <span className="px-2 py-0.5 rounded-full bg-obsidian-950 text-slate-300 font-mono text-[10px]">
                  {subjectStats.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ongoing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  activeTab === 'ongoing'
                    ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200 shadow-md shadow-indigo-500/10'
                    : 'bg-white/[0.02] border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ongoing in Sidebar</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-mono text-[10px]">
                  {ongoingTracks.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  activeTab === 'queue'
                    ? 'bg-amber-600/30 border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/10'
                    : 'bg-white/[0.02] border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Queue / Not Started</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800/60 text-amber-300 font-mono text-[10px]">
                  {queueTracks.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  activeTab === 'completed'
                    ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200 shadow-md shadow-emerald-500/10'
                    : 'bg-white/[0.02] border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span>Mastered (100%)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-300 font-mono text-[10px]">
                  {completedTracks.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('trash')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                  activeTab === 'trash'
                    ? 'bg-rose-600/30 border-rose-500/50 text-rose-200 shadow-md shadow-rose-500/10'
                    : 'bg-white/[0.02] border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                }`}
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Trash Bin</span>
                {trashItems.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800/60 text-rose-300 font-mono text-[10px]">
                    {trashItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search & Category Filter Toolbar (for non-trash tabs) */}
          {activeTab !== 'trash' && (
            <div className="p-4 sm:px-6 bg-obsidian-950/60 border-b border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search roadmaps by title or topic..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-obsidian-900 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Main Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
            {activeTab === 'trash' ? (
              /* Trash Bin Content */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300">3-Day Auto-Retention Trash</p>
                    <p className="text-amber-200/80 mt-0.5">
                      Deleted roadmaps stay here for 3 days. Restoring brings back all checked topics and Google Docs study notes intact!
                    </p>
                  </div>
                </div>

                {trashItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trashItems.map((item) => {
                      const completedIds = Array.from(new Set((item.snapshot?.progress?.completedTopicIds || []).map(String)));
                      const completedCount = completedIds.length;
                      const docCount = item.snapshot?.documents ? Object.keys(item.snapshot.documents).length : 0;

                      return (
                        <div
                          key={item.subjectId}
                          className="p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-white text-base truncate">{item.title}</h3>
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono">
                                {calculateTimeRemaining(item.deletedAt)}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 font-mono">
                              {completedCount} topics completed • {docCount} study notes saved
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                            <button
                              onClick={async () => {
                                await restoreFromTrash(item.subjectId);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore to Hub</span>
                            </button>

                            <button
                              onClick={async () => {
                                if (window.confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) {
                                  await permanentlyDeleteFromTrash(item.subjectId);
                                }
                              }}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-medium text-slate-300">Trash Bin is Empty</p>
                    <p className="text-xs text-slate-500">Deleted roadmaps will appear here safely for 3 days.</p>
                  </div>
                )}
              </div>
            ) : filteredTracks.length > 0 ? (
              /* Grid of Track Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {filteredTracks.map(
                  ({
                    subject,
                    isTrackStarted,
                    totalTopics,
                    completedCount,
                    percent,
                    isCompleted,
                    isOngoing,
                  }) => {
                    const isSelected = subject.id === activeSubjectId;

                    return (
                      <motion.div
                        key={subject.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between space-y-4 group relative ${
                          isSelected
                            ? 'bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-obsidian-900 border-indigo-500/60 shadow-xl shadow-indigo-500/10'
                            : 'bg-obsidian-900/60 border-white/[0.07] hover:border-white/[0.16] hover:bg-obsidian-850/80'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top Tag & Status Badges */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 border ${
                                  isSelected
                                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                                    : 'bg-white/[0.04] text-slate-400 border-white/[0.06]'
                                }`}
                              >
                                {iconMap[subject.icon || 'BookOpen'] || <BookOpen className="w-5 h-5" />}
                              </div>

                              <div className="min-w-0">
                                {subject.category && (
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block truncate">
                                    {subject.category}
                                  </span>
                                )}
                                <h3 className="font-bold text-white text-base truncate">{subject.title}</h3>
                              </div>
                            </div>

                            {/* Status Pills */}
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold font-mono shrink-0">
                                <Trophy className="w-3 h-3 text-emerald-400" />
                                Mastered 100%
                              </span>
                            ) : isOngoing ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-semibold font-mono shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active in Sidebar
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold font-mono shrink-0">
                                <Clock className="w-3 h-3 text-amber-400" />
                                In Queue
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {subject.description || 'No description provided.'}
                          </p>

                          {/* Phases & Topics Meta */}
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                            <span>{subject.phases.length} Phases</span>
                            <span>•</span>
                            <span>{totalTopics} Topics</span>
                            {subject.phases.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{subject.phases.length} Days Schedule</span>
                              </>
                            )}
                          </div>

                          {/* Progress Meter */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">
                                {completedCount}/{totalTopics} Completed
                              </span>
                              <span className="font-bold text-slate-200">{percent}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-obsidian-950 border border-white/[0.06] overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  percent === 100
                                    ? 'bg-emerald-400'
                                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06] shrink-0">
                          <div className="flex items-center gap-2">
                            {!isTrackStarted ? (
                              <button
                                onClick={() => handleStartTrackAndSelect(subject.id)}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                              >
                                <PlayCircle className="w-4 h-4" />
                                <span>Start Tracking Today</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSelectAndClose(subject.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                                }`}
                              >
                                <span>{isSelected ? 'Currently Viewing' : 'Switch to Track'}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isTrackStarted && (
                              <button
                                onClick={() => {
                                  if (confirm(`Reset progress for "${subject.title}" to start date today?`)) {
                                    resetSubjectProgress(subject.id);
                                  }
                                }}
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                                title="Reset track start date"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              if (confirm(`Move "${subject.title}" to Trash Bin?`)) {
                                deleteSubject(subject.id);
                              }
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete roadmap"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            ) : (
              /* Empty state */
              <div className="p-12 text-center text-slate-500 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.04] text-slate-400 border border-white/[0.08] flex items-center justify-center">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-300">No Roadmaps Match This Filter</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `No tracks matched "${searchQuery}". Try clearing filters.`
                      : 'You can import custom JSON roadmaps or restore preloaded tracks anytime.'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.12]"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={restoreDefaultSubjects}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/30 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default Curriculums</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Bottom Footer */}
          <div className="p-4 sm:px-6 bg-obsidian-950/80 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0 font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Only ongoing tracks remain visible in your workspace sidebar.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={restoreDefaultSubjects}
                className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Defaults</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
