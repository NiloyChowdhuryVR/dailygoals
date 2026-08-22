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
import { TopicQnaModal } from '@/components/TopicQnaModal';
import { GlobalQnaView } from '@/components/GlobalQnaView';
import { TrashModal } from '@/components/TrashModal';
import { AddResourceModal } from '@/components/AddResourceModal';
import { RoadmapHubModal } from '@/components/RoadmapHubModal';
import { OrbitHero } from '@/components/OrbitHero';
import { Menu, X, CalendarCheck, Layers, Sparkles, Video, HelpCircle, Compass, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { doesResourceMatchSubject } from '@/lib/resourceUtils';

export default function DashboardPage() {
  const {
    subjects,
    activeSubject,
    activeSubjectId,
    selectSubject,
    activeProgress,
    userProgress,
    isMounted,
    savedResources,
    getAllSubjectQnas,
  } = useProgress();

  const dailyTasksReturn = useDailyTasks(activeSubject, activeProgress);

  // View Mode: 'landing' (Orbit Awwwards Poster, no-scroll) vs 'workspace' (Full Roadmaps Dashboard, normal scroll)
  const [viewMode, setViewMode] = useState<'landing' | 'workspace'>('landing');

  const [activeTab, setActiveTab] = useState<'today' | 'timeline' | 'track-vault' | 'global-vault' | 'qna-vault'>('today');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState<boolean>(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState<boolean>(false);
  const [isRoadmapHubOpen, setIsRoadmapHubOpen] = useState<boolean>(false);
  const [roadmapHubTab, setRoadmapHubTab] = useState<'all' | 'ongoing' | 'queue' | 'completed' | 'trash'>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [selectedTopicForDoc, setSelectedTopicForDoc] = useState<ProcessedTopic | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  const [selectedTopicForQna, setSelectedTopicForQna] = useState<ProcessedTopic | null>(null);
  const [isQnaModalOpen, setIsQnaModalOpen] = useState<boolean>(false);

  // Lock body scroll when in landing mode or when drawer is open
  useEffect(() => {
    if (viewMode === 'landing' || isMobileSidebarOpen) {
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
  }, [viewMode, isMobileSidebarOpen]);

  // Compute resource count specific to the active track
  const activeTrackResourcesCount = React.useMemo(() => {
    if (!activeSubject) return 0;
    return savedResources.filter((res) => doesResourceMatchSubject(res, activeSubject)).length;
  }, [savedResources, activeSubject]);

  // Compute Q&A count specific to the active track
  const activeTrackQnaCount = React.useMemo(() => {
    if (!activeSubject) return 0;
    return getAllSubjectQnas(activeSubject.id).length;
  }, [activeSubject, getAllSubjectQnas]);

  const handleOpenDocModal = (topic: ProcessedTopic) => {
    setSelectedTopicForDoc(topic);
    setIsDocModalOpen(true);
  };

  const handleOpenQnaModal = (topic: ProcessedTopic) => {
    setSelectedTopicForQna(topic);
    setIsQnaModalOpen(true);
  };

  const handleOpenHub = (tab: 'all' | 'ongoing' | 'queue' | 'completed' | 'trash' = 'all') => {
    setRoadmapHubTab(tab);
    setIsRoadmapHubOpen(true);
  };

  const handleSelectTrackFromLanding = (subjectId: string) => {
    selectSubject(subjectId);
    setActiveTab('timeline');
    setViewMode('workspace');
  };

  const handleNavigateFromLanding = (tab: 'today' | 'timeline' | 'track-vault' | 'global-vault' | 'qna-vault') => {
    setActiveTab(tab);
    setViewMode('workspace');
  };

  return (
    <div className="min-h-screen bg-[#161616] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative bg-[#161616]">
      {viewMode === 'landing' ? (
        /* 1. NON-SCROLLABLE FULL-VIEWPORT ORBIT POSTER LANDING VIEW */
        <div
          key="landing-view"
          className="fixed inset-0 w-screen h-screen overflow-hidden z-20 bg-[#161616]"
        >
          <OrbitHero
            onOpenRoadmapHub={handleOpenHub}
            onNavigateTab={handleNavigateFromLanding}
            onSelectTrack={handleSelectTrackFromLanding}
            onSwitchToWorkspace={() => setViewMode('workspace')}
            subjects={subjects}
            userProgress={userProgress}
            activeSubjectId={activeSubjectId}
          />
        </div>
      ) : (
        /* 2. FULL INTERACTIVE ROADMAPS & WORKSPACE DASHBOARD (NORMAL SCROLL) */
        <div
          key="workspace-view"
          className="min-h-screen flex flex-col lg:flex-row bg-[#161616] relative animate-fadeIn"
        >
            {/* Sticky Mobile Navigation Top Bar */}
            <div className="lg:hidden sticky top-0 z-40 bg-[#1a1a1a]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-200 hover:text-white active:scale-95 transition-all"
                  aria-label="Open sidebar drawer"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-base text-white tracking-wide">
                    Daily<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Goals</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('landing')}
                  className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 active:scale-95"
                  title="Return to Orbit Poster"
                >
                  <Home className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenHub('all')}
                  className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 active:scale-95"
                  title="Open Roadmap Hub"
                >
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline">Hub</span>
                </button>
              </div>
            </div>

            {/* Desktop Persistent Sticky Sidebar */}
            <div className="hidden lg:block shrink-0 sticky top-0 h-screen overflow-y-auto overscroll-contain no-scrollbar z-30 border-r border-white/[0.06] bg-[#161616]">
              <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => setViewMode('landing')}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Home className="w-3.5 h-3.5 text-indigo-400" />
                  <span>✦ Orbit Poster Home</span>
                </button>
              </div>
              <Sidebar
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onOpenRoadmapHub={handleOpenHub}
                onOpenTrashModal={() => setIsTrashModalOpen(true)}
                onOpenVideoVault={() => setActiveTab('global-vault')}
              />
            </div>

            {/* Mobile Slide-Over Drawer Sidebar */}
            <AnimatePresence>
              {isMobileSidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden touch-none"
                  />

                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs bg-[#161616] border-r border-white/[0.08] shadow-2xl lg:hidden flex flex-col h-full overscroll-contain"
                  >
                    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3.5 bg-[#161616]/95 backdrop-blur-md border-b border-white/[0.08] shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-md">
                          <div className="w-full h-full bg-[#161616] rounded-[10px] flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                          </div>
                        </div>
                        <span className="font-extrabold text-base text-white tracking-wide">
                          Daily<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Goals</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white active:scale-95 transition-all"
                        aria-label="Close sidebar drawer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-3 border-b border-white/[0.06]">
                      <button
                        onClick={() => {
                          setIsMobileSidebarOpen(false);
                          setViewMode('landing');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <Home className="w-3.5 h-3.5 text-indigo-400" />
                        <span>✦ Orbit Poster Home</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overscroll-contain">
                      <Sidebar
                        onOpenImportModal={() => {
                          setIsMobileSidebarOpen(false);
                          setIsImportModalOpen(true);
                        }}
                        onOpenRoadmapHub={(tab) => {
                          setIsMobileSidebarOpen(false);
                          handleOpenHub(tab);
                        }}
                        onOpenTrashModal={() => {
                          setIsMobileSidebarOpen(false);
                          setIsTrashModalOpen(true);
                        }}
                        onOpenVideoVault={() => {
                          setIsMobileSidebarOpen(false);
                          setActiveTab('global-vault');
                        }}
                        isMobileDrawer={true}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Workspace Content Area */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 w-full relative">
              <div className="absolute top-0 left-1/3 w-96 h-48 bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />
              <div className="absolute top-32 right-10 w-80 h-48 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

              {/* Main Subject Tracker Header */}
              <Header
                subject={activeSubject}
                dailyTasksReturn={dailyTasksReturn}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onOpenRoadmapHub={() => handleOpenHub('all')}
              />

              {activeSubject ? (
                <>
                  {/* Quick Stats Bento Grid */}
                  <StatsOverview dailyTasksReturn={dailyTasksReturn} />

                  {/* Navigation Tabs Bar */}
                  <div className="flex items-center gap-1.5 bg-[#1e1e1e]/90 p-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-xl overflow-x-auto no-scrollbar relative shadow-lg">
                    {/* Tab: Today's Goals */}
                    <button
                      onClick={() => setActiveTab('today')}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 z-10 ${
                        activeTab === 'today' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'today' && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/25 z-[-1]"
                          transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                        />
                      )}
                      <CalendarCheck className="w-4 h-4" />
                      <span>Today's Goals</span>
                      {dailyTasksReturn.todayTasks.length > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                            activeTab === 'today'
                              ? 'bg-black/30 text-white'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                          }`}
                        >
                          {dailyTasksReturn.todayTasks.length}
                        </span>
                      )}
                    </button>

                    {/* Tab: Full Roadmap Timeline */}
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 z-10 ${
                        activeTab === 'timeline' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'timeline' && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 z-[-1]"
                          transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                        />
                      )}
                      <Layers className="w-4 h-4" />
                      <span>Full Roadmap ({activeSubject.phases.length} Phases)</span>
                    </button>

                    {/* Tab: Q&A Vault */}
                    <button
                      onClick={() => setActiveTab('qna-vault')}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 z-10 ${
                        activeTab === 'qna-vault' ? 'text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'qna-vault' && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/25 z-[-1]"
                          transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                        />
                      )}
                      <HelpCircle className={`w-4 h-4 ${activeTab === 'qna-vault' ? 'text-slate-950' : 'text-amber-400'}`} />
                      <span>Q&A Vault</span>
                      {activeTrackQnaCount > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                            activeTab === 'qna-vault'
                              ? 'bg-black/20 text-slate-950 font-black'
                              : 'bg-amber-950 text-amber-200 border border-amber-700/60'
                          }`}
                        >
                          {activeTrackQnaCount}
                        </span>
                      )}
                    </button>

                    {/* Tab: Video Vault */}
                    <button
                      onClick={() => setActiveTab('track-vault')}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 z-10 ${
                        activeTab === 'track-vault' || activeTab === 'global-vault'
                          ? 'text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {(activeTab === 'track-vault' || activeTab === 'global-vault') && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 shadow-lg shadow-cyan-500/20 z-[-1]"
                          transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                        />
                      )}
                      <Video className="w-4 h-4 text-cyan-300" />
                      <span>Video Vault</span>
                      {activeTrackResourcesCount > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                            activeTab === 'track-vault' || activeTab === 'global-vault'
                              ? 'bg-black/30 text-white'
                              : 'bg-purple-950 text-purple-200 border border-purple-700/60'
                          }`}
                        >
                          {activeTrackResourcesCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Tab Views */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'today' ? (
                      <motion.div
                        key="today-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TodayTasksList
                          dailyTasksReturn={dailyTasksReturn}
                          onOpenDoc={handleOpenDocModal}
                          onOpenQna={handleOpenQnaModal}
                        />
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
                          onOpenQna={handleOpenQnaModal}
                        />
                      </motion.div>
                    ) : activeTab === 'qna-vault' ? (
                      <motion.div
                        key="qna-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <GlobalQnaView
                          subject={activeSubject}
                          onOpenTopicQna={handleOpenQnaModal}
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
              ) : (
                <div className="rounded-3xl border border-white/[0.08] bg-[#1e1e1e]/60 p-12 text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                    <Compass className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white">No Active Roadmap Selected</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Open the Roadmap Hub to choose an ongoing curriculum or start a new topic.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenHub('all')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Open Roadmap Hub</span>
                  </button>
                </div>
              )}
            </main>
          </div>
        )}

      {/* Comprehensive Roadmap Hub & Catalog Modal */}
      <RoadmapHubModal
        isOpen={isRoadmapHubOpen}
        onClose={() => setIsRoadmapHubOpen(false)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onSelectTrack={handleSelectTrackFromLanding}
        initialTab={roadmapHubTab}
      />

      {/* Topic Rich Text Document Modal */}
      <TopicDocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        topic={selectedTopicForDoc}
        subject={activeSubject}
      />

      {/* Topic Q&A Modal */}
      <TopicQnaModal
        isOpen={isQnaModalOpen}
        onClose={() => setIsQnaModalOpen(false)}
        topic={selectedTopicForQna}
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


