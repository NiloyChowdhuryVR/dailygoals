'use client';

import React, { useState, useEffect } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { ProcessedTopic } from '@/types/learning';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { TodayTasksList } from '@/components/TodayTasksList';
import { PhaseTimeline } from '@/components/PhaseTimeline';
import { VideoVaultView } from '@/components/VideoVaultView';
import { ImportJsonModal } from '@/components/ImportJsonModal';
import { TopicDocumentModal } from '@/components/TopicDocumentModal';
import { TrashModal } from '@/components/TrashModal';
import { AddResourceModal } from '@/components/AddResourceModal';
import { Menu, X, CalendarCheck, Layers, Sparkles, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { doesResourceMatchSubject } from '@/lib/resourceUtils';

export default function DashboardPage() {
  const {
    activeSubject,
    activeProgress,
    isMounted,
    savedResources,
  } = useProgress();

  const dailyTasksReturn = useDailyTasks(activeSubject, activeProgress);

  const [activeTab, setActiveTab] = useState<'today' | 'timeline' | 'track-vault' | 'global-vault'>('today');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState<boolean>(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [selectedTopicForDoc, setSelectedTopicForDoc] = useState<ProcessedTopic | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  // Compute resource count specific to the active track
  const activeTrackResourcesCount = React.useMemo(() => {
    if (!activeSubject) return 0;
    return savedResources.filter((res) => doesResourceMatchSubject(res, activeSubject)).length;
  }, [savedResources, activeSubject]);

  // Lock background body scrolling when mobile sidebar drawer is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileSidebarOpen]);

  const handleOpenDocModal = (topic: ProcessedTopic) => {
    setSelectedTopicForDoc(topic);
    setIsDocModalOpen(true);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 animate-spin flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-mono text-slate-400 animate-pulse">Loading Roadmap Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-500 selection:text-white relative">
      {/* Sticky Mobile Navigation Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-dark-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-white active:scale-95 transition-all"
            aria-label="Open sidebar drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base text-white tracking-wide">
              Daily<span className="text-blue-400">Goals</span>
            </span>
          </div>
        </div>

        {activeSubject && (
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 truncate max-w-[130px]">
            {activeSubject.title}
          </span>
        )}
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenTrashModal={() => setIsTrashModalOpen(true)}
          onOpenVideoVault={() => setActiveTab('global-vault')}
        />
      </div>

      {/* Mobile Slide-Over Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden touch-none"
            />

            {/* Slide-over Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs bg-dark-900 border-r border-slate-800 shadow-2xl lg:hidden flex flex-col h-full overscroll-contain"
            >
              {/* Sticky Top Header inside Drawer */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-dark-950/95 backdrop-blur-md border-b border-slate-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-base text-white tracking-wide">
                    Daily<span className="text-blue-400">Goals</span>
                  </span>
                </div>

                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white active:scale-95 transition-all"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-20 space-y-6 no-scrollbar">
                <Sidebar
                  isMobileDrawer={true}
                  onOpenImportModal={() => {
                    setIsMobileSidebarOpen(false);
                    setIsImportModalOpen(true);
                  }}
                  onOpenTrashModal={() => {
                    setIsMobileSidebarOpen(false);
                    setIsTrashModalOpen(true);
                  }}
                  onOpenVideoVault={() => {
                    setIsMobileSidebarOpen(false);
                    setActiveTab('global-vault');
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 space-y-5 md:space-y-8 max-w-6xl mx-auto w-full">
        {/* Header Hero */}
        <Header
          subject={activeSubject}
          dailyTasksReturn={dailyTasksReturn}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />

        {activeSubject ? (
          <>
            {/* Quick KPI Stats Overview */}
            <StatsOverview dailyTasksReturn={dailyTasksReturn} />

            {/* Primary View Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('today')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shrink-0 ${
                  activeTab === 'today'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Today's Goals</span>
                {dailyTasksReturn.todayTasks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-200 font-mono text-[11px] border border-blue-800/60">
                    {dailyTasksReturn.todayTasks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shrink-0 ${
                  activeTab === 'timeline'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Full Roadmap ({activeSubject.phases.length} Phases)</span>
              </button>

              <button
                onClick={() => setActiveTab('track-vault')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shrink-0 ${
                  activeTab === 'track-vault' || activeTab === 'global-vault'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Video className="w-4 h-4 text-purple-300" />
                <span>Video Vault</span>
                {activeTrackResourcesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-200 font-mono text-[11px] border border-purple-700/60">
                    {activeTrackResourcesCount}
                  </span>
                )}
              </button>
            </div>

            {/* View Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'today' ? (
                <motion.div
                  key="today-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TodayTasksList dailyTasksReturn={dailyTasksReturn} onOpenDoc={handleOpenDocModal} />
                </motion.div>
              ) : activeTab === 'timeline' ? (
                <motion.div
                  key="timeline-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PhaseTimeline
                    subject={activeSubject}
                    dailyTasksReturn={dailyTasksReturn}
                    onOpenDoc={handleOpenDocModal}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="vault-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <VideoVaultView
                    isGlobalView={activeTab === 'global-vault'}
                    onSwitchViewMode={(isGlobal) =>
                      setActiveTab(isGlobal ? 'global-vault' : 'track-vault')
                    }
                    onOpenAddModal={() => setIsAddResourceModalOpen(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : null}
      </main>

      {/* Topic Rich Text Document Modal */}
      <TopicDocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        topic={selectedTopicForDoc}
        subject={activeSubject}
      />

      {/* Trash Bin Modal */}
      <TrashModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
      />

      {/* Import Roadmap Modal */}
      <ImportJsonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Add Video/Playlist Resource Modal */}
      <AddResourceModal
        isOpen={isAddResourceModalOpen}
        onClose={() => setIsAddResourceModalOpen(false)}
      />
    </div>
  );
}
