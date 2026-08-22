'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ProcessedTopic, SubjectData } from '@/types/learning';
import {
  X,
  Save,
  Trash2,
  Copy,
  Check,
  FileText,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Palette,
  Highlighter,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: ProcessedTopic | null;
  subject: SubjectData | null;
}

export const TopicDocumentModal: React.FC<TopicDocumentModalProps> = ({
  isOpen,
  onClose,
  topic,
  subject,
}) => {
  const { getTopicDocument, saveTopicDocument, deleteTopicDocument } = useProgress();

  const [docTitle, setDocTitle] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copied, setCopied] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing document when topic changes or modal opens
  useEffect(() => {
    if (isOpen && topic && subject) {
      const existingDoc = getTopicDocument(subject.id, topic.id);
      const initialTitle = existingDoc?.title || topic.name;
      const initialContent = existingDoc?.content || '';

      setDocTitle(initialTitle);
      setSaveStatus('idle');

      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent;
        updateWordCount();
      }
    }
  }, [isOpen, topic, subject]);

  const updateWordCount = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  const handleEditorInput = () => {
    updateWordCount();
    setSaveStatus('idle');

    // Debounced auto-save after 2 seconds
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  };

  const handleSave = async () => {
    if (!topic || !subject || !editorRef.current) return;

    setSaveStatus('saving');
    const contentHtml = editorRef.current.innerHTML;

    const success = await saveTopicDocument(subject.id, topic.id, contentHtml, docTitle);
    if (success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const handleDelete = async () => {
    if (!topic || !subject) return;
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteTopicDocument(subject.id, topic.id);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setDocTitle(topic.name);
      setSaveStatus('idle');
      updateWordCount();
    }
  };

  const handleCopy = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Rich text formatting commands
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateWordCount();
    }
  };

  if (!isOpen || !topic || !subject) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl bg-obsidian-900 border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Top Bar */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-obsidian-950/70 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document Title..."
                  className="w-full bg-transparent font-bold text-white text-base sm:text-lg focus:outline-none focus:border-b border-indigo-500 tracking-wide truncate"
                />
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>Topic #{topic.id}</span>
                  <span>•</span>
                  <span>Phase {topic.phaseNumber}: {topic.phaseTitle}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Save Status Badge */}
              {saveStatus === 'saving' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-indigo-300 text-xs font-mono">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved
                </span>
              )}

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="px-3 py-2 border-b border-white/[0.06] bg-obsidian-950/90 flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
            {/* Text Style Headings */}
            <button
              onClick={() => executeCommand('formatBlock', '<h1>')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('formatBlock', '<h2>')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('formatBlock', '<h3>')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* Basic Inline Styles */}
            <button
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors font-bold"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors italic"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('underline')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors underline"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('strikeThrough')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors line-through"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* Lists */}
            <button
              onClick={() => executeCommand('insertUnorderedList')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('insertOrderedList')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* Blocks */}
            <button
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('formatBlock', '<pre>')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* Colors */}
            <button
              onClick={() => executeCommand('foreColor', '#38bdf8')}
              className="p-1.5 rounded-lg text-sky-400 hover:bg-white/[0.08] transition-colors"
              title="Blue Text"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('backColor', '#334155')}
              className="p-1.5 rounded-lg text-amber-300 hover:bg-white/[0.08] transition-colors"
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button
              onClick={() => executeCommand('removeFormat')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Clear Formatting"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
              <span className="bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06] font-mono text-[11px]">
                Rich Markdown / HTML Supported
              </span>
            </div>
          </div>

          {/* Formatted Paper Canvas */}
          <div className="flex-1 p-4 md:p-8 bg-obsidian-950 overflow-y-auto min-h-[350px]">
            <div className="max-w-3xl mx-auto bg-obsidian-900 border border-white/[0.08] rounded-2xl shadow-xl p-6 md:p-10 text-slate-100 min-h-[420px] relative">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="focus:outline-none min-h-[360px] prose prose-invert max-w-none prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-white prose-code:bg-obsidian-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-300 prose-pre:bg-obsidian-950 prose-pre:border prose-pre:border-white/[0.08]"
                style={{
                  minHeight: '340px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              />
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 border-t border-white/[0.08] bg-obsidian-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
              <span>{wordCount} words</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Paste directly from ChatGPT or Docs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 text-xs font-medium flex items-center gap-1.5 border border-rose-800/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Notes</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

