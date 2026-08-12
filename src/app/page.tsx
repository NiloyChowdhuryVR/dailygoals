'use client';

import React, { useState } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { ProcessedTopic } from '@/types/learning';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { TodayTasksList } from '@/components/TodayTasksList';
import { PhaseTimeline } from '@/components/PhaseTimeline';
import { ImportJsonModal } from '@/components/ImportJsonModal';
import { TopicDocumentModal } from '@/components/TopicDocumentModal';
import { TrashModal } from '@/components/TrashModal';
import { Menu, X, CalendarCheck, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const {
    activeSubject,
    activeProgress,
    isMounted,
  } = useProgress();

  const dailyTasksReturn = useDailyTasks(activeSubject, activeProgress);

  const [activeTab, setActiveTab] = useState<'today' | 'timeline'>('today');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [selectedTopicForDoc, setSelectedTopicForDoc] = useState<ProcessedTopic | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  const handleOpenDocModal = (topic: ProcessedTopic) => {
    setSelectedTopicForDoc(topic);
    setIsDocModalOpen(true);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm">Loading Learning Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col lg:flex-row antialiased">
      {/* Mobile Top Sticky Navbar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-dark-900/90 border-b border-slate-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm text-white tracking-wide">DailyGoals</span>
            {activeSubject && (
              <span className="text-[11px] text-slate-400 truncate max-w-[170px] sm:max-w-[260px]">
                {activeSubject.title}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-white shrink-0"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block">
        <Sidebar
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenTrashModal={() => setIsTrashModalOpen(true)}
        />
      </div>

      {/* Mobile Slide-over Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-over Content Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs bg-dark-900 border-r border-slate-800 shadow-2xl lg:hidden flex flex-col justify-between"
            >
              <div className="relative">
                {/* Close Drawer Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white z-10"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>

                <Sidebar
                  onOpenImportModal={() => {
                    setIsMobileSidebarOpen(false);
                    setIsImportModalOpen(true);
                  }}
                  onOpenTrashModal={() => {
                    setIsMobileSidebarOpen(false);
                    setIsTrashModalOpen(true);
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
              ) : (
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
    </div>
  );
}
