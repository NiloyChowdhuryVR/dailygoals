'use client';

import React, { useState, useMemo } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { SavedResource } from '@/types/learning';
import {
  Video,
  ListVideo,
  Plus,
  Search,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Tag,
  HelpCircle,
  Clock,
  Sparkles,
  Play,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import { doesResourceMatchSubject } from '@/lib/resourceUtils';

interface VideoVaultViewProps {
  onOpenAddModal: () => void;
  isGlobalView?: boolean;
  onSwitchViewMode?: (isGlobal: boolean) => void;
}

export const VideoVaultView: React.FC<VideoVaultViewProps> = ({
  onOpenAddModal,
  isGlobalView = false,
  onSwitchViewMode,
}) => {
  const { savedResources, activeSubject, toggleResourceWatched, deleteResource } = useProgress();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'playlist'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'later' | 'watched'>('all');

  // Filter resources for track-specific vs global vault
  const baseResources = useMemo(() => {
    if (isGlobalView || !activeSubject) {
      return savedResources;
    }
    return savedResources.filter((res) => doesResourceMatchSubject(res, activeSubject));
  }, [savedResources, activeSubject, isGlobalView]);

  // Extract all unique tags across baseResources
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    baseResources.forEach((res) => {
      (res.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [baseResources]);

  // Filter resources based on search, tag, type, and status
  const filteredResources = useMemo(() => {
    return baseResources.filter((res) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesWhy = (res.whyWatch || '').toLowerCase().includes(q);
        const matchesTags = (res.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesWhy && !matchesTags) return false;
      }

      // Tag filter
      if (selectedTag !== 'all') {
        if (!(res.tags || []).includes(selectedTag)) return false;
      }

      // Type filter
      if (selectedType !== 'all') {
        if (res.type !== selectedType) return false;
      }

      // Status filter
      if (selectedStatus === 'later' && res.isWatched) return false;
      if (selectedStatus === 'watched' && !res.isWatched) return false;

      return true;
    });
  }, [baseResources, searchQuery, selectedTag, selectedType, selectedStatus]);

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

  const handleToggleWatched = (e: React.MouseEvent, res: SavedResource) => {
    e.stopPropagation();

    if (!res.isWatched) {
      // Trigger confetti on marking watched
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x, y },
        colors: ['#10b981', '#6366f1', '#a855f7', '#06b6d4'],
        disableForReducedMotion: true,
      });
    }

    toggleResourceWatched(res.id);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from your Video Vault?`)) {
      deleteResource(id);
    }
  };

  const watchLaterCount = baseResources.filter((r) => !r.isWatched).length;
  const watchedCount = baseResources.filter((r) => r.isWatched).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Video className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {isGlobalView
                ? 'Global Video & Playlist Vault'
                : `${activeSubject?.title || 'Track'} Video Vault`}
            </h2>

            <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-xs font-mono font-bold border border-purple-800/60">
              {baseResources.length} Item{baseResources.length !== 1 ? 's' : ''}
            </span>

            {/* Scope Badge */}
            {!isGlobalView && activeSubject && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 text-xs font-mono font-semibold border border-indigo-800/60">
                Track: {activeSubject.category || activeSubject.title}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-400">
            {isGlobalView
              ? 'Showing all saved concept videos and playlists across all learning tracks.'
              : `Showing saved concept videos and playlists matching ${activeSubject?.title || 'this track'}.`}
          </p>
        </div>

        {/* Top Header Controls: Switch View Mode & Add Button */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          {onSwitchViewMode && (
            <button
              onClick={() => onSwitchViewMode(!isGlobalView)}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-xs font-semibold transition-all active:scale-95"
            >
              {isGlobalView
                ? `Filter by ${activeSubject?.title || 'Active Track'}`
                : `View All Vault Videos (${savedResources.length})`}
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video or Playlist</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-3 bg-obsidian-900/70 p-3.5 sm:p-4 rounded-3xl border border-white/[0.08] backdrop-blur-xl">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved concept videos, playlists, tags, or study notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-obsidian-950 border border-white/[0.08] text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/80 transition-all font-mono"
          />
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status & Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {/* Status Pills */}
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              All Status ({savedResources.length})
            </button>

            <button
              onClick={() => setSelectedStatus('later')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                selectedStatus === 'later'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Watch Later ({watchLaterCount})</span>
            </button>

            <button
              onClick={() => setSelectedStatus('watched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                selectedStatus === 'watched'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mastered ({watchedCount})</span>
            </button>

            {/* Type Pills */}
            <span className="text-white/10 hidden sm:inline">|</span>

            <button
              onClick={() => setSelectedType('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                selectedType === 'video'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>

            <button
              onClick={() => setSelectedType('playlist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                selectedType === 'playlist'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListVideo className="w-3.5 h-3.5" />
              <span>Playlists</span>
            </button>
          </div>
        </div>

        {/* Category Tag Pills Row */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-white/[0.06]">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3 text-purple-400" />
              Tags:
            </span>

            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                selectedTag === 'all'
                  ? 'bg-purple-950 text-purple-200 border border-purple-500/60 font-bold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tags
            </button>

            {availableTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-purple-950 text-purple-200 border-purple-500 font-bold'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Video & Playlist Grid List */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((res) => {
              const thumbnail = getYouTubeThumbnail(res.url);

              return (
                <motion.div
                  key={res.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-3xl border p-4 sm:p-5 backdrop-blur-xl transition-all flex flex-col justify-between space-y-4 shadow-lg ${
                    res.isWatched
                      ? 'bg-emerald-950/15 border-emerald-500/25'
                      : 'bg-obsidian-900/65 border-white/[0.07] hover:border-white/[0.16] hover:bg-obsidian-850/80'
                  }`}
                >
                  {/* Top Thumbnail & Info */}
                  <div className="space-y-3">
                    {/* Thumbnail / Media Banner */}
                    <div className="relative rounded-2xl overflow-hidden bg-obsidian-950 border border-white/[0.08] aspect-video group shadow-inner">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={res.title}
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            res.isWatched ? 'opacity-45 grayscale-[35%]' : 'opacity-85'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/40 to-indigo-950/40 text-slate-400 p-4 text-center">
                          {res.type === 'playlist' ? (
                            <ListVideo className="w-10 h-10 text-indigo-400 mb-1" />
                          ) : (
                            <Video className="w-10 h-10 text-purple-400 mb-1" />
                          )}
                          <span className="text-xs font-mono">{res.type.toUpperCase()}</span>
                        </div>
                      )}

                      {/* Overlaid Play Button & Type Badge */}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </div>
                      </a>

                      {/* Type Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-extrabold font-mono border border-white/20 flex items-center gap-1 text-white">
                        {res.type === 'playlist' ? (
                          <>
                            <ListVideo className="w-3 h-3 text-cyan-400" />
                            <span>PLAYLIST</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-3 h-3 text-purple-400" />
                            <span>VIDEO</span>
                          </>
                        )}
                      </div>

                      {/* Watched Overlay Indicator */}
                      {res.isWatched && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold font-mono shadow-lg flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>MASTERED</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Metadata */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-extrabold text-base sm:text-lg hover:underline leading-snug line-clamp-2 ${
                            res.isWatched ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {res.title}
                        </a>
                      </div>

                      {/* Category Tags */}
                      {res.tags && res.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {res.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-mono font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Why Watch This Note Box */}
                    {res.whyWatch && (
                      <div className="p-3.5 rounded-2xl bg-obsidian-950/80 border border-white/[0.06] space-y-1 text-xs text-slate-300">
                        <div className="flex items-center gap-1 font-bold text-amber-400 text-[11px] font-mono uppercase">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Concept Notes / Key Takeaways:</span>
                        </div>
                        <p className="leading-relaxed line-clamp-3 italic text-slate-300">
                          "{res.whyWatch}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06] shrink-0">
                    <button
                      onClick={(e) => handleToggleWatched(e, res)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border active:scale-95 ${
                        res.isWatched
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${res.isWatched ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{res.isWatched ? 'Mastered ✓' : 'Mark Watched'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-indigo-600/25 active:scale-95"
                      >
                        <span>Watch</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDelete(res.id, res.title)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-white/[0.08] bg-obsidian-900/40 p-8 md:p-12 text-center space-y-4 max-w-lg mx-auto backdrop-blur-xl"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-purple-500/20">
            <Video className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Your Video Vault is Empty</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Save YouTube concept tutorials, lectures, or playlists with study notes on why to watch them.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Save Your First Concept Video</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

