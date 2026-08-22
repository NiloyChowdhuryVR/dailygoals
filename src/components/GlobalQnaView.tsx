'use client';

import React, { useState, useMemo } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { SubjectData, TopicQna, ProcessedTopic } from '@/types/learning';
import {
  HelpCircle,
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  BookOpen,
  MessageSquare,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalQnaViewProps {
  subject: SubjectData | null;
  onOpenTopicQna?: (topic: ProcessedTopic) => void;
}

export const GlobalQnaView: React.FC<GlobalQnaViewProps> = ({ subject, onOpenTopicQna }) => {
  const { getAllSubjectQnas, saveQna, deleteQna } = useProgress();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<number | 'all'>('all');
  const [expandedQnaIds, setExpandedQnaIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Add Modal state within Global Q&A
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [targetTopicId, setTargetTopicId] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [editingQna, setEditingQna] = useState<TopicQna | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Map topicId -> topic name and phase info
  const topicMetaMap = useMemo(() => {
    const map: Record<string, { topicName: string; phaseNumber: number; phaseTitle: string }> = {};
    if (!subject) return map;

    subject.phases.forEach((phase) => {
      phase.topics.forEach((topic) => {
        map[String(topic.id)] = {
          topicName: topic.name,
          phaseNumber: phase.phase_number,
          phaseTitle: phase.title,
        };
      });
    });

    return map;
  }, [subject]);

  const allTrackQnas = useMemo(() => {
    if (!subject) return [];
    return getAllSubjectQnas(subject.id);
  }, [subject, getAllSubjectQnas]);

  // Filtered Q&A items based on search and phase selection
  const filteredQnas = useMemo(() => {
    return allTrackQnas.filter((qna) => {
      const meta = topicMetaMap[qna.topicId];
      const phaseNum = meta?.phaseNumber;

      // Phase filter
      if (selectedPhaseFilter !== 'all' && phaseNum !== selectedPhaseFilter) {
        return false;
      }

      // Search query filter (matches question, answer, topic name, phase title)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = qna.question.toLowerCase().includes(query);
        const matchesAnswer = qna.answer.toLowerCase().includes(query);
        const matchesTopic = meta?.topicName?.toLowerCase().includes(query);
        const matchesPhase = meta?.phaseTitle?.toLowerCase().includes(query);

        return matchesQuestion || matchesAnswer || matchesTopic || matchesPhase;
      }

      return true;
    });
  }, [allTrackQnas, selectedPhaseFilter, searchQuery, topicMetaMap]);

  if (!subject) {
    return (
      <div className="rounded-3xl border border-white/[0.08] bg-obsidian-900/40 p-8 text-center text-slate-400">
        No active roadmap selected.
      </div>
    );
  }

  const toggleAccordion = (id: string) => {
    setExpandedQnaIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<number | string, boolean> = {};
    filteredQnas.forEach((q) => {
      allExpanded[q.id] = true;
    });
    setExpandedQnaIds(allExpanded);
  };

  const collapseAll = () => setExpandedQnaIds({});

  const handleCopy = (qna: TopicQna) => {
    const meta = topicMetaMap[qna.topicId];
    const copyContent = `[Phase ${meta?.phaseNumber ?? ''}: ${meta?.topicName ?? ''}]\nQ: ${qna.question}\n\nA: ${qna.answer}`;
    navigator.clipboard.writeText(copyContent);
    setCopiedId(qna.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (qna: TopicQna) => {
    if (confirm('Are you sure you want to delete this Q&A from the global bank?')) {
      await deleteQna(qna.id, subject.id, qna.topicId);
    }
  };

  const handleStartAddGlobal = () => {
    setEditingQna(null);
    setTargetTopicId(subject.phases[0]?.topics[0]?.id ? String(subject.phases[0].topics[0].id) : '');
    setNewQuestion('');
    setNewAnswer('');
    setIsAddModalOpen(true);
  };

  const handleStartEditGlobal = (qna: TopicQna) => {
    setEditingQna(qna);
    setTargetTopicId(qna.topicId);
    setNewQuestion(qna.question);
    setNewAnswer(qna.answer);
    setIsAddModalOpen(true);
  };

  const handleSaveGlobalForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTopicId || !newQuestion.trim() || !newAnswer.trim()) return;

    setIsSubmitting(true);
    const saved = await saveQna(
      subject.id,
      targetTopicId,
      newQuestion.trim(),
      newAnswer.trim(),
      editingQna?.id
    );
    setIsSubmitting(false);

    if (saved) {
      setExpandedQnaIds((prev) => ({ ...prev, [saved.id]: true }));
      setIsAddModalOpen(false);
    }
  };

  // Flattened topics for selection in modal form
  const allFlattenedTopics = subject.phases.flatMap((phase) =>
    phase.topics.map((t) => ({
      topicId: String(t.id),
      label: `Phase ${phase.phase_number}: ${t.name}`,
    }))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-obsidian-900/80 to-amber-950/20 p-5 sm:p-7 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Global Question Bank
              </span>
              <span className="px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 text-xs font-mono border border-white/[0.08]">
                {subject.title}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Roadmap Q&A Vault ({allTrackQnas.length} Total)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every concept question and sliding answer stored across all phases. Search, expand answers, and revise key topics effortlessly.
            </p>
          </div>

          <button
            onClick={handleStartAddGlobal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Q&A</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, answers, or topic titles..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-obsidian-900 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Phase Filter & Accordion Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 bg-obsidian-900 px-2 py-1 rounded-xl border border-white/[0.08]">
            <Filter className="w-3.5 h-3.5 text-amber-400 ml-1" />
            <select
              value={selectedPhaseFilter}
              onChange={(e) =>
                setSelectedPhaseFilter(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="bg-transparent text-xs text-slate-200 focus:outline-none pr-2 py-1 cursor-pointer"
            >
              <option value="all" className="bg-obsidian-950 text-white">All Phases ({subject.phases.length})</option>
              {subject.phases.map((p) => (
                <option key={p.phase_number} value={p.phase_number} className="bg-obsidian-950 text-white">
                  Phase {p.phase_number}: {p.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={expandAll}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-colors"
          >
            Expand All Answers
          </button>
          <button
            onClick={collapseAll}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Global Q&A List */}
      {filteredQnas.length > 0 ? (
        <div className="space-y-4">
          {filteredQnas.map((qna, idx) => {
            const meta = topicMetaMap[qna.topicId];
            const isExpanded = !!expandedQnaIds[qna.id];

            return (
              <div
                key={qna.id}
                className={`rounded-3xl border transition-all overflow-hidden backdrop-blur-xl ${
                  isExpanded
                    ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/20 via-obsidian-900/90 to-obsidian-900 shadow-xl shadow-amber-500/5'
                    : 'border-white/[0.07] bg-obsidian-900/60 hover:border-white/[0.14]'
                }`}
              >
                {/* Q&A Top Topic Ribbon */}
                <div className="px-4 sm:px-5 py-2.5 bg-obsidian-950/80 border-b border-white/[0.06] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0 font-mono text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/50 shrink-0 font-bold">
                      Phase {meta?.phaseNumber ?? '?'}
                    </span>
                    <span className="text-slate-300 truncate font-semibold">
                      {meta?.topicName ?? 'Topic'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {new Date(qna.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Question Accordion Header */}
                <button
                  onClick={() => toggleAccordion(qna.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-2xl bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/40">
                      Q{idx + 1}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug tracking-tight">
                      {qna.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[11px] font-mono text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/50">
                      {isExpanded ? 'Hide Answer' : 'View Answer'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Sliding Accordion Answer Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="border-t border-white/[0.06] bg-obsidian-950/90 p-4 sm:p-5 space-y-4"
                    >
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Detailed Answer:</span>
                        </span>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                          {qna.answer}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                        <div className="text-[11px] text-slate-400 font-mono">
                          Topic: <span className="text-slate-200">{meta?.topicName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(qna)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 text-xs transition-colors"
                            title="Copy Q&A text"
                          >
                            {copiedId === qna.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Q&A</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEditGlobal(qna)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:text-amber-300 text-slate-300 text-xs transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(qna)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 text-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/[0.1] bg-obsidian-900/40 p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-200">
              {searchQuery ? 'No Matching Q&As Found' : 'No Q&As Created Yet'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchQuery
                ? `No questions or answers matched "${searchQuery}". Try clearing filters.`
                : 'Start adding questions & sliding answers on specific topic cards, or click the button below to add your first Q&A!'}
            </p>
          </div>

          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPhaseFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-xs font-semibold transition-all"
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={handleStartAddGlobal}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Roadmap Q&A</span>
            </button>
          )}
        </div>
      )}

      {/* Global Add / Edit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-obsidian-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {editingQna ? 'Edit Q&A' : 'Add Q&A to Roadmap'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGlobalForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Target Topic *
                  </label>
                  <select
                    value={targetTopicId}
                    onChange={(e) => setTargetTopicId(e.target.value)}
                    required
                    disabled={!!editingQna}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-obsidian-950 border border-white/[0.08] text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {allFlattenedTopics.map((item) => (
                      <option key={item.topicId} value={item.topicId} className="bg-obsidian-950 text-white">
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Question / Topic Query *
                  </label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. How does backpropagation update weights in a neural network?"
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-obsidian-950 border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sliding Answer Content *
                  </label>
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write the detailed explanation or code solution..."
                    required
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-obsidian-950 border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-y custom-scrollbar"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingQna ? 'Update Q&A' : 'Save to Q&A Vault'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

