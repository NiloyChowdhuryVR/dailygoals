'use client';

import React, { useState } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { TodayTasksList } from '@/components/TodayTasksList';
import { PhaseTimeline } from '@/components/PhaseTimeline';
import { ImportJsonModal } from '@/components/ImportJsonModal';
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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
      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-dark-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">DailyGoals</span>
        </div>

        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar onOpenImportModal={() => setIsImportModalOpen(true)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto w-full">
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
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <button
                onClick={() => setActiveTab('today')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'today'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Today's Goals</span>
                {dailyTasksReturn.todayTasks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-200 font-mono text-xs border border-blue-800/60">
                    {dailyTasksReturn.todayTasks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
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
                  <TodayTasksList dailyTasksReturn={dailyTasksReturn} />
                </motion.div>
              ) : (
                <motion.div
                  key="timeline-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PhaseTimeline subject={activeSubject} dailyTasksReturn={dailyTasksReturn} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : null}
      </main>

      {/* Import Roadmap Modal */}
      <ImportJsonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
