'use client';

import React, { useState, useEffect } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ProcessedTopic, SubjectData, TopicQna } from '@/types/learning';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Save,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicQnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: ProcessedTopic | null;
  subject: SubjectData | null;
}

export const TopicQnaModal: React.FC<TopicQnaModalProps> = ({
  isOpen,
  onClose,
  topic,
  subject,
}) => {
  const { getTopicQnas, saveQna, deleteQna } = useProgress();

  const [expandedQnaIds, setExpandedQnaIds] = useState<Record<string, boolean>>({});
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingQnaId, setEditingQnaId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState<string>('');
  const [answerText, setAnswerText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const topicQnas = topic && subject ? getTopicQnas(subject.id, topic.id) : [];

  // Reset form state when topic changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setIsFormOpen(false);
      setEditingQnaId(null);
      setQuestionText('');
      setAnswerText('');
      // Auto expand first Q&A if available
      if (topicQnas.length > 0) {
        setExpandedQnaIds({ [topicQnas[0].id]: true });
      } else {
        setExpandedQnaIds({});
      }
    }
  }, [isOpen, topic?.id, subject?.id]);

  if (!isOpen || !topic || !subject) return null;

  const toggleAccordion = (id: string) => {
    setExpandedQnaIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStartAdd = () => {
    setEditingQnaId(null);
    setQuestionText('');
    setAnswerText('');
    setIsFormOpen(true);
  };

  const handleStartEdit = (qna: TopicQna) => {
    setEditingQnaId(qna.id);
    setQuestionText(qna.question);
    setAnswerText(qna.answer);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingQnaId(null);
    setQuestionText('');
    setAnswerText('');
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !answerText.trim()) return;

    setIsSubmitting(true);
    const saved = await saveQna(
      subject.id,
      topic.id,
      questionText.trim(),
      answerText.trim(),
      editingQnaId || undefined
    );
    setIsSubmitting(false);

    if (saved) {
      // Automatically expand newly added or edited Q&A
      setExpandedQnaIds((prev) => ({ ...prev, [saved.id]: true }));
      handleCancelForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this Q&A?')) {
      await deleteQna(id, subject.id, topic.id);
    }
  };

  const handleCopy = (qna: TopicQna) => {
    const copyContent = `Q: ${qna.question}\n\nA: ${qna.answer}`;
    navigator.clipboard.writeText(copyContent);
    setCopiedId(qna.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-dark-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 md:p-6 bg-dark-850 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                    Topic Q&A
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-xs font-mono font-bold border border-amber-800/60 shrink-0">
                    {topicQnas.length} Item{topicQnas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  Phase {topic.phaseNumber}: {topic.phaseTitle} • <strong className="text-slate-200">{topic.name}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white transition-all shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Questions & sliding answers stored for this topic</span>
              </div>

              {!isFormOpen && (
                <button
                  onClick={handleStartAdd}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              )}
            </div>

            {/* Add / Edit Form Drawer */}
            <AnimatePresence>
              {isFormOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleSaveForm}
                  className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 md:p-5 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{editingQnaId ? 'Edit Q&A Pair' : 'Create New Q&A Pair'}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Question / Topic Query *
                      </label>
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="e.g. What is the intuitive difference between left-hand and right-hand limits?"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Detailed Answer * (Sliding accordion content)
                      </label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="e.g. The left-hand limit approaches x from values smaller than c, while right-hand approaches from values greater than c..."
                        required
                        rows={4}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors custom-scrollbar resize-y"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? 'Saving...' : editingQnaId ? 'Update Q&A' : 'Save Q&A'}</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Q&A Accordion List */}
            {topicQnas.length > 0 ? (
              <div className="space-y-3">
                {topicQnas.map((qna, idx) => {
                  const isExpanded = !!expandedQnaIds[qna.id];
                  return (
                    <div
                      key={qna.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        isExpanded
                          ? 'border-amber-500/50 bg-amber-950/10 shadow-lg shadow-amber-500/5'
                          : 'border-slate-800 bg-dark-850/60 hover:border-slate-700'
                      }`}
                    >
                      {/* Question Header Button */}
                      <button
                        onClick={() => toggleAccordion(qna.id)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <h4 className="text-sm font-semibold text-white leading-snug">
                            {qna.question}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
                            {isExpanded ? 'Hide Answer' : 'Show Answer'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
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
                            className="border-t border-slate-800/80 bg-dark-950/60 p-4 space-y-3"
                          >
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold font-mono text-amber-400 uppercase tracking-wider">
                                Answer:
                              </span>
                              <p className="text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                                {qna.answer}
                              </p>
                            </div>

                            {/* Q&A Item Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 text-xs">
                              <span className="text-[10px] font-mono text-slate-500">
                                Added {new Date(qna.createdAt).toLocaleDateString()}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(qna)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                                  title="Copy Q&A text"
                                >
                                  {copiedId === qna.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(qna)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700 hover:text-amber-300 text-slate-300 text-[11px] transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(qna.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-[11px] transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
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
              <div className="rounded-2xl border border-dashed border-slate-800 bg-dark-850/40 p-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 text-slate-500 border border-slate-700/60 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-300">No Questions Added Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Add Q&A pairs for this topic so you can test your knowledge or store tricky concept solutions.
                  </p>
                </div>
                <button
                  onClick={handleStartAdd}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Question</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
