'use client';

import React, { useState } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { X, Video, ListVideo, Sparkles, Plus, Tag, Link2, HelpCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_TAGS = [
  'AI / LLMs',
  'Machine Learning',
  'Next.js / Web',
  'Python',
  'System Design',
  'OOP & Architecture',
  'Data Science',
];

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose }) => {
  const { addResource, activeSubject, subjects } = useProgress();

  const [url, setUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<'video' | 'playlist'>('video');
  const [whyWatch, setWhyWatch] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set default category tag based on active subject when opened
  React.useEffect(() => {
    if (isOpen) {
      const defaultCategory = activeSubject?.category || activeSubject?.title || 'General';
      setSelectedTags([defaultCategory]);
    }
  }, [isOpen, activeSubject]);

  if (!isOpen) return null;

  // Auto-detect YouTube URL type & playlist parameters
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);

    if (val.includes('list=') || val.includes('playlist')) {
      setType('playlist');
    } else if (val.includes('youtube.com/watch') || val.includes('youtu.be/')) {
      setType('video');
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      const newTag = customTag.trim();
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag]);
      }
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!url.trim()) {
      setErrorMsg('Please enter a valid video or playlist URL.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a title for this concept.');
      return;
    }

    setIsSubmitting(true);

    const success = await addResource({
      title: title.trim(),
      url: url.trim(),
      type,
      whyWatch: whyWatch.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : ['General'],
      subjectId: activeSubject?.id,
      topicId: selectedTopicId || undefined,
    });

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setUrl('');
      setTitle('');
      setType('video');
      setWhyWatch('');
      setSelectedTags(['AI / LLMs']);
      setSelectedTopicId('');
      onClose();
    } else {
      setErrorMsg('Failed to save resource to database.');
    }
  };

  // Helper: Extract YouTube video thumbnail
  const getYouTubeThumbnail = (videoUrl: string) => {
    try {
      if (videoUrl.includes('youtu.be/')) {
        const id = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
      if (videoUrl.includes('watch?v=')) {
        const id = videoUrl.split('watch?v=')[1]?.split('&')[0];
        if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const thumbnailPreview = getYouTubeThumbnail(url);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-dark-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-lg sm:text-xl tracking-tight">
                  Save Video or Playlist
                </h2>
                <p className="text-xs text-slate-400">
                  Store concept tutorials, lectures, and playlists to watch later.
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

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Video / Playlist Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('video')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    type === 'video'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md shadow-purple-500/10'
                      : 'bg-dark-850/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Video className="w-4 h-4 text-purple-400" />
                  <span>Single Video 🎬</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('playlist')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-xs transition-all ${
                    type === 'playlist'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10'
                      : 'bg-dark-850/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ListVideo className="w-4 h-4 text-blue-400" />
                  <span>Playlist 📚</span>
                </button>
              </div>
            </div>

            {/* Video / Playlist URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Video or Playlist Link *</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Paste YouTube video or playlist URL (e.g. https://www.youtube.com/watch?v=...)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
              />

              {/* YouTube Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-36 bg-black">
                  <img
                    src={thumbnailPreview}
                    alt="Video thumbnail"
                    className="w-full h-36 object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-500/40">
                    Thumbnail Detected ✓
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Title / Concept Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Transformer & Attention Mechanism Deep Dive"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Why Watch This (Notes) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Why Watch This? (Notes / Motivation)</span>
              </label>
              <textarea
                value={whyWatch}
                onChange={(e) => setWhyWatch(e.target.value)}
                rows={3}
                placeholder="e.g. Explains self-attention math intuitively before Phase 4 LLM fine-tuning."
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Tags Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>Category Tags</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {Array.from(
                  new Set([
                    ...(activeSubject?.category ? [activeSubject.category] : []),
                    ...subjects.map((s) => s.category).filter(Boolean),
                    ...PRESET_TAGS,
                  ])
                ).map((tag) => {
                  const isSelected = selectedTags.includes(tag as string);
                  return (
                    <button
                      key={tag as string}
                      type="button"
                      onClick={() => toggleTag(tag as string)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm font-bold'
                          : 'bg-dark-850/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      <span>{tag as string}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div className="pt-1">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  placeholder="Type a custom tag and press Enter..."
                  className="w-full px-3 py-2 rounded-xl bg-dark-850 border border-slate-800 text-slate-300 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Optional Subject Topic Link */}
            {activeSubject && activeSubject.phases && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Link to Roadmap Topic (Optional)
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="">-- None (General Learning Resource) --</option>
                  {activeSubject.phases.map((phase) => (
                    <optgroup key={phase.phase_number} label={`Phase ${phase.phase_number}: ${phase.title}`}>
                      {phase.topics.map((t) => (
                        <option key={t.id} value={String(t.id)}>
                          Topic #{t.id}: {t.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-lg shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save to Vault'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
