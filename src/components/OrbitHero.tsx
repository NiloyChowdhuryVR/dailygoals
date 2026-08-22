'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Compass, Layers, HelpCircle, Video, ArrowRight, BookOpen, CheckCircle2, X } from 'lucide-react';
import { SubjectData, SubjectProgress } from '@/types/learning';
import { motion, AnimatePresence } from 'framer-motion';

interface OrbitHeroProps {
  onOpenRoadmapHub?: (tab?: 'all' | 'ongoing' | 'queue' | 'completed' | 'trash') => void;
  onNavigateTab?: (tab: 'today' | 'timeline' | 'track-vault' | 'global-vault' | 'qna-vault') => void;
  onSelectTrack?: (subjectId: string) => void;
  onSwitchToWorkspace?: () => void;
  subjects?: SubjectData[];
  userProgress?: Record<string, SubjectProgress>;
  activeSubjectId?: string | null;
}

export const OrbitHero: React.FC<OrbitHeroProps> = ({
  onOpenRoadmapHub,
  onNavigateTab,
  onSelectTrack,
  onSwitchToWorkspace,
  subjects = [],
  userProgress = {},
  activeSubjectId,
}) => {
  const stageRef = useRef<HTMLElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const layerBgRef = useRef<HTMLDivElement>(null);
  const layerTopRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoadmapSidebarOpen, setIsRoadmapSidebarOpen] = useState(false);

  // Categorize subjects into ongoing (only started, uncompleted)
  const ongoingSubjects = React.useMemo(() => {
    return subjects.filter((subject) => {
      const progress = userProgress[subject.id];
      const isTrackStarted = Boolean(progress?.isStarted);
      const totalTopics = subject.phases.reduce((acc, p) => acc + p.topics.length, 0);
      const completedIds = Array.from(new Set((progress?.completedTopicIds || []).map(String)));
      const percent = totalTopics > 0 ? Math.round((completedIds.length / totalTopics) * 100) : 0;
      return isTrackStarted && percent < 100;
    });
  }, [subjects, userProgress]);

  // Entrance animation cleanup after completion
  useEffect(() => {
    document.documentElement.classList.add('anim');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('anim');
    }, 2200);

    return () => {
      clearTimeout(timer);
      document.documentElement.classList.remove('anim');
    };
  }, []);

  // Morph-Reveal Dual Canvas Engine
  useEffect(() => {
    const stage = stageRef.current;
    const flower = flowerRef.current;
    const layerBg = layerBgRef.current;
    const layerTop = layerTopRef.current;

    if (!stage || !flower || !layerBg || !layerTop) return;

    const TRAIL_MAX_POINTS = 60;
    const TRAIL_HEAD_R = 140;
    const TRAIL_NOISE_AMP = 44;
    const TRAIL_BLOB_PTS = 24;
    const TRAIL_FADE_SPEED = 0.92;
    const TRAIL_SAMPLE_DIST = 8;

    const canvasBg = document.createElement('canvas');
    const ctxBg = canvasBg.getContext('2d');
    const canvasTop = document.createElement('canvas');
    const ctxTop = canvasTop.getContext('2d');

    if (!ctxBg || !ctxTop) return;

    let headRadius = 0;
    let hovering = false;
    let mousePos = { x: -9999, y: -9999 };
    let lastSample = { x: -9999, y: -9999 };
    let trail: Array<{ x: number; y: number; r: number; alpha: number; seed: number }> = [];
    let time = 0;
    let isIdle = true;
    let animFrameId: number;

    const resizeCanvases = () => {
      const rect = flower.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      if (canvasBg.width !== width || canvasBg.height !== height) {
        canvasBg.width = width;
        canvasBg.height = height;
        canvasTop.width = width;
        canvasTop.height = height;
        isIdle = false;
      }
    };

    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    const updateMouseCoords = (clientX: number, clientY: number) => {
      const rect = flower.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const scaleX = canvasBg.width / rect.width;
      const scaleY = canvasBg.height / rect.height;
      mousePos.x = (clientX - rect.left) * scaleX;
      mousePos.y = (clientY - rect.top) * scaleY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      hovering = true;
      isIdle = false;
      updateMouseCoords(e.clientX, e.clientY);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      hovering = true;
      isIdle = false;
      updateMouseCoords(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      hovering = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        hovering = true;
        isIdle = false;
        updateMouseCoords(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        hovering = true;
        isIdle = false;
        updateMouseCoords(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      hovering = false;
    };

    stage.addEventListener('mousemove', handleMouseMove);
    stage.addEventListener('mouseenter', handleMouseEnter);
    stage.addEventListener('mouseleave', handleMouseLeave);
    stage.addEventListener('touchstart', handleTouchStart, { passive: true });
    stage.addEventListener('touchmove', handleTouchMove, { passive: true });
    stage.addEventListener('touchend', handleTouchEnd);

    const drawMorphBlob = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      r: number,
      t: number,
      seed: number
    ) => {
      if (r < 2) return;
      const points: Array<{ x: number; y: number }> = [];

      for (let i = 0; i < TRAIL_BLOB_PTS; i++) {
        const angle = (i / TRAIL_BLOB_PTS) * Math.PI * 2;
        const n1 = Math.sin(angle * 3 + t * 1.4 + seed) * 0.45;
        const n2 = Math.sin(angle * 5 - t * 0.9 + seed * 2.3) * 0.3;
        const n3 = Math.cos(angle * 2 + t * 1.8 + seed * 0.7) * 0.25;
        const noise = (n1 + n2 + n3) * TRAIL_NOISE_AMP * (r / TRAIL_HEAD_R);
        const radius = Math.max(1, r + noise);
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        points.push({ x: px, y: py });
      }

      ctx.beginPath();
      const len = points.length;
      const midX0 = (points[len - 1].x + points[0].x) / 2;
      const midY0 = (points[len - 1].y + points[0].y) / 2;
      ctx.moveTo(midX0, midY0);
      for (let i = 0; i < len; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % len];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }
      ctx.closePath();
      ctx.fill();
    };

    const resetToStaticMasks = () => {
      layerBg.style.webkitMaskImage = 'none';
      layerBg.style.maskImage = 'none';
      layerTop.style.webkitMaskImage = 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))';
      layerTop.style.maskImage = 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))';
    };

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const targetR = hovering ? TRAIL_HEAD_R : 0;
      headRadius += (targetR - headRadius) * (hovering ? 0.14 : 0.04);
      time += 0.016;

      if (hovering && headRadius > 5) {
        const dx = mousePos.x - lastSample.x;
        const dy = mousePos.y - lastSample.y;
        const dist = Math.hypot(dx, dy);

        if (dist > TRAIL_SAMPLE_DIST || lastSample.x === -9999) {
          trail.push({
            x: mousePos.x,
            y: mousePos.y,
            r: headRadius,
            alpha: 1.0,
            seed: Math.random() * 100,
          });
          if (trail.length > TRAIL_MAX_POINTS) {
            trail.shift();
          }
          lastSample = { x: mousePos.x, y: mousePos.y };
          isIdle = false;
        }
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        const pt = trail[i];
        pt.alpha *= TRAIL_FADE_SPEED;
        pt.r *= 0.995;
        if (pt.alpha < 0.01) {
          trail.splice(i, 1);
        }
      }

      const hasActive = (hovering && headRadius > 2) || trail.length > 0;

      if (!hasActive) {
        if (!isIdle) {
          resetToStaticMasks();
          isIdle = true;
        }
        return;
      }

      const w = canvasBg.width;
      const h = canvasBg.height;
      if (w === 0 || h === 0) return;

      // 1. BG Layer Mask (Solid white, punch holes with destination-out)
      ctxBg.clearRect(0, 0, w, h);
      ctxBg.globalCompositeOperation = 'source-over';
      ctxBg.fillStyle = '#ffffff';
      ctxBg.globalAlpha = 1.0;
      ctxBg.fillRect(0, 0, w, h);

      ctxBg.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < trail.length; i++) {
        const pt = trail[i];
        ctxBg.globalAlpha = pt.alpha;
        drawMorphBlob(ctxBg, pt.x, pt.y, pt.r, time, pt.seed);
      }
      if (hovering && headRadius > 2) {
        ctxBg.globalAlpha = 1.0;
        drawMorphBlob(ctxBg, mousePos.x, mousePos.y, headRadius, time, 0);
      }

      // 2. TOP Layer Mask (Transparent, paint white blobs with source-over)
      ctxTop.clearRect(0, 0, w, h);
      ctxTop.globalCompositeOperation = 'source-over';
      ctxTop.fillStyle = '#ffffff';

      for (let i = 0; i < trail.length; i++) {
        const pt = trail[i];
        ctxTop.globalAlpha = pt.alpha;
        drawMorphBlob(ctxTop, pt.x, pt.y, pt.r, time, pt.seed);
      }
      if (hovering && headRadius > 2) {
        ctxTop.globalAlpha = 1.0;
        drawMorphBlob(ctxTop, mousePos.x, mousePos.y, headRadius, time, 0);
      }

      const dataBg = canvasBg.toDataURL('image/png');
      const dataTop = canvasTop.toDataURL('image/png');

      layerBg.style.webkitMaskImage = `url(${dataBg})`;
      layerBg.style.maskImage = `url(${dataBg})`;
      layerTop.style.webkitMaskImage = `url(${dataTop})`;
      layerTop.style.maskImage = `url(${dataTop})`;
    };

    const sizerImg = flower.querySelector('.flower__sizer') as HTMLImageElement | null;
    if (sizerImg) {
      if (sizerImg.complete) {
        resizeCanvases();
      } else {
        sizerImg.addEventListener('load', resizeCanvases, { once: true });
      }
    }

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeCanvases);
      stage.removeEventListener('mousemove', handleMouseMove);
      stage.removeEventListener('mouseenter', handleMouseEnter);
      stage.removeEventListener('mouseleave', handleMouseLeave);
      stage.removeEventListener('touchstart', handleTouchStart);
      stage.removeEventListener('touchmove', handleTouchMove);
      stage.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#161616] select-none z-10">
      <section ref={stageRef} className="absolute inset-0 w-full h-full contain-strict isolate overflow-hidden">
        {/* BRAND MARK (4-STROKE ASTERISK) */}
        <svg
          className="orb-anim-brand absolute top-[2.141745dvh] left-[3.854167vw] w-[clamp(34px,min(3.4375vw,5.2dvh),66px)] h-auto text-white z-[4] cursor-pointer"
          viewBox="0 0 66 62"
          aria-label="Orbit"
          role="img"
          onClick={() => onOpenRoadmapHub?.('all')}
        >
          <line x1="33" y1="1" x2="33" y2="61" stroke="currentColor" strokeWidth="5" strokeLinecap="square" />
          <line x1="3" y1="31" x2="63" y2="31" stroke="currentColor" strokeWidth="5" strokeLinecap="square" />
          <line x1="11.8" y1="9.8" x2="54.2" y2="52.2" stroke="currentColor" strokeWidth="5" strokeLinecap="square" />
          <line x1="54.2" y1="9.8" x2="11.8" y2="52.2" stroke="currentColor" strokeWidth="5" strokeLinecap="square" />
        </svg>

        {/* PRIMARY NAVIGATION */}
        <nav
          className="hidden md:block absolute inset-0 pointer-events-none z-[4] text-white font-sans text-[clamp(13px,min(1.302083vw,2.05dvh),25px)]"
          aria-label="Primary"
        >
          <ul className="list-none m-0 p-0">
            <li
              className="orb-anim-nav-1 absolute top-[3.426791dvh] left-[10.104167vw] origin-top-left"
              style={{ transform: 'scaleX(1.165)' }}
            >
              <button
                onClick={() => onNavigateTab?.('today')}
                className="pointer-events-auto bg-transparent border-none text-white hover:opacity-70 transition-opacity cursor-pointer font-sans text-inherit p-0"
              >
                Today's Goals
              </button>
            </li>
            <li
              className="orb-anim-nav-2 absolute top-[3.426791dvh] left-[18.2vw] origin-top-left"
              style={{ transform: 'scaleX(1.052)' }}
            >
              <button
                onClick={() => setIsRoadmapSidebarOpen(true)}
                className="pointer-events-auto bg-transparent border-none text-white hover:opacity-70 transition-opacity cursor-pointer font-sans text-inherit p-0 flex items-center gap-1.5"
              >
                <span>Roadmaps</span>
                {ongoingSubjects.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            </li>
            <li
              className="orb-anim-nav-3 absolute top-[3.426791dvh] left-[27.578125vw] origin-top-left"
              style={{ transform: 'scaleX(1.126)' }}
            >
              <button
                onClick={() => onNavigateTab?.('qna-vault')}
                className="pointer-events-auto bg-transparent border-none text-white hover:opacity-70 transition-opacity cursor-pointer font-sans text-inherit p-0"
              >
                Q&A Vault
              </button>
            </li>
            <li
              className="orb-anim-nav-4 absolute top-[3.426791dvh] left-[36.171875vw] origin-top-left"
              style={{ transform: 'scaleX(1.168)' }}
            >
              <button
                onClick={() => onNavigateTab?.('global-vault')}
                className="pointer-events-auto bg-transparent border-none text-white hover:opacity-70 transition-opacity cursor-pointer font-sans text-inherit p-0"
              >
                Video Vault
              </button>
            </li>
          </ul>
        </nav>

        {/* SECURE SYSTEM / ROADMAP LAUNCHER PILL */}
        <div className="orb-anim-pill absolute top-[2.336449dvh] right-[7.5vw] z-[4] flex items-center gap-3">
          <button
            onClick={() => onOpenRoadmapHub?.('all')}
            className="hidden sm:inline-flex h-[clamp(34px,4.439252dvh,57px)] px-[clamp(16px,1.8vw,32px)] rounded-full bg-white text-[#161616] font-sans font-bold text-[clamp(12px,min(1.145833vw,1.87dvh),22px)] tracking-[0.026923em] items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-xl"
            aria-label="Secure system"
          >
            <span>Secure system</span>
          </button>

          {/* ROADMAP TRACKER SIDEBAR TRIGGER BUTTON */}
          <button
            onClick={() => setIsRoadmapSidebarOpen(true)}
            className="h-[clamp(34px,4.439252dvh,57px)] px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-sans font-semibold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 shadow-lg"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Track Roadmaps</span>
            {ongoingSubjects.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                {ongoingSubjects.length}
              </span>
            )}
          </button>
        </div>

        {/* GIANT WORDMARK NILOY */}
        <h1
          className="absolute top-[11.565421dvh] left-[4.348958vw] md:left-[4.348958vw] max-md:left-0 max-md:w-full max-md:text-center z-[1] m-0 p-0 pointer-events-none font-serif font-normal text-[min(27.8125vw,55dvh)] max-md:text-[min(27.5vw,18dvh)] tracking-[0.033708em] leading-[0.82]"
          aria-label="Niloy"
        >
          <span className="inline-block pt-[0.08em] pb-[0.15em] -mt-[0.08em] -mb-[0.15em] overflow-hidden">
            <span className="orb-anim-word inline-block whitespace-nowrap">
              <span className="text-white inline-block">
                <span className="inline-block origin-center mr-[0.042135em]" style={{ transform: 'scaleX(1.0866)' }}>
                  N
                </span>
                I
              </span>
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(180deg, #ffc5dc 0%, #fd86db 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                LOY
              </span>
            </span>
          </span>
        </h1>

        {/* FLOWER STACK (FRONT + REVEAL) */}
        <div
          ref={flowerRef}
          className="orb-anim-flower absolute top-[14.749065dvh] max-md:top-[23dvh] left-[49.121328vw] h-[106.109034dvh] max-md:h-[min(55dvh,110vw)] -translate-x-1/2 pointer-events-none z-[2]"
        >
          <img
            className="flower__sizer h-full w-auto block invisible pointer-events-none max-w-none"
            src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260808_192942_e1086505-d7da-433b-a59b-8220f4e6c808.png&w=1280&q=85"
            alt=""
            aria-hidden="true"
          />
          <div ref={layerBgRef} className="flower__layer absolute inset-0 w-full h-full pointer-events-none">
            <img
              src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260808_192942_e1086505-d7da-433b-a59b-8220f4e6c808.png&w=1280&q=85"
              alt="Pixel-art pink and violet lily"
              className="w-full h-full object-cover block pointer-events-none"
            />
          </div>
          <div
            ref={layerTopRef}
            className="flower__layer absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
            style={{
              WebkitMaskImage: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))',
              maskImage: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))',
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
            }}
          >
            <img
              src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260808_151324_bf318a5f-5525-4fc7-aab5-e9a341018828.png&w=1280&q=85"
              alt=""
              className="w-full h-full object-cover block pointer-events-none"
            />
          </div>
        </div>

        {/* CORNER COPY (LEFT & RIGHT) */}
        <div
          className="absolute bottom-[4.361371dvh] left-[3.177083vw] max-md:left-[5vw] max-md:bottom-[3.2dvh] z-[3] text-[#f7f7f7] font-sans text-[clamp(14px,min(1.40625vw,2.102804dvh),27px)] max-md:text-[clamp(12px,3.2vw,18px)] leading-[1.28] pointer-events-none origin-bottom-left"
          style={{ transform: 'scaleX(1.073)' }}
        >
          <div className="orb-anim-corner-left">
            Every workflow,
            <br />
            intelligently connected.
          </div>
        </div>

        <div
          className="absolute bottom-[4.361371dvh] left-[78.28125vw] max-md:left-auto max-md:right-[5vw] max-md:bottom-[3.2dvh] max-md:text-right z-[3] text-[#f7f7f7] font-sans text-[clamp(14px,min(1.40625vw,2.102804dvh),27px)] max-md:text-[clamp(12px,3.2vw,18px)] leading-[1.28] pointer-events-none origin-bottom-left"
          style={{ transform: 'scaleX(1.058)' }}
        >
          <div className="orb-anim-corner-right">
            Less manual work.
            <br />
            More meaningful output.
          </div>
        </div>

        {/* MOBILE BURGER BUTTON */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="orb-anim-burger md:hidden absolute top-[2.2dvh] right-[5vw] w-11 h-11 rounded-full bg-white border-none cursor-pointer z-[12] flex flex-col items-center justify-center gap-1.5 shadow-lg active:scale-95"
          aria-label="Toggle navigation menu"
        >
          <span className="w-4 h-0.5 bg-[#161616] rounded-full" />
          <span className="w-4 h-0.5 bg-[#161616] rounded-full" />
        </button>

        {/* ROADMAP QUICK SIDEBAR DRAWER ON LANDING POSTER */}
        <AnimatePresence>
          {isRoadmapSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsRoadmapSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[20]"
              />

              {/* Sidebar Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                className="fixed inset-y-0 right-0 z-[21] w-full max-w-sm bg-[#161616] border-l border-white/[0.08] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-extrabold text-white text-base">Select Roadmap</h2>
                        <p className="text-xs text-slate-400 font-mono">1-click to open track workspace</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsRoadmapSidebarOpen(false)}
                      className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Active Ongoing Roadmaps List */}
                  <div className="space-y-2.5">
                    {ongoingSubjects.length > 0 ? (
                      ongoingSubjects.map((subject) => {
                        const isSelected = subject.id === activeSubjectId;
                        const progress = userProgress[subject.id];
                        const totalTopics = subject.phases.reduce((acc, p) => acc + p.topics.length, 0);
                        const completedIds = Array.from(new Set((progress?.completedTopicIds || []).map(String)));
                        const percent = totalTopics > 0 ? Math.round((completedIds.length / totalTopics) * 100) : 0;

                        return (
                          <button
                            key={subject.id}
                            onClick={() => {
                              setIsRoadmapSidebarOpen(false);
                              onSelectTrack?.(subject.id);
                            }}
                            className={`w-full p-4 rounded-2xl border text-left transition-all group flex items-start gap-3.5 ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-950/80 via-purple-950/40 to-black border-indigo-500/60 shadow-lg shadow-indigo-500/20'
                                : 'bg-[#1e1e1e]/60 border-white/[0.07] hover:border-indigo-500/40 hover:bg-[#222]'
                            }`}
                          >
                            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                              <BookOpen className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-white text-sm truncate">{subject.title}</h3>
                                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono font-semibold border border-emerald-800/60">
                                  Active Track
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {subject.phases.length} Phases • {completedIds.length}/{totalTopics}
                                </span>
                              </div>

                              <div className="w-full h-1.5 rounded-full bg-black border border-white/[0.08] overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-dashed border-white/[0.08] text-center space-y-2">
                        <p className="text-xs text-slate-400 font-mono">No ongoing roadmaps active.</p>
                        <p className="text-[11px] text-slate-500">Open the catalog below to watch or start any roadmap!</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsRoadmapSidebarOpen(false);
                      onOpenRoadmapHub?.('all');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Open Roadmap Hub Catalog</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      setIsRoadmapSidebarOpen(false);
                      onSwitchToWorkspace?.();
                    }}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs transition-colors"
                  >
                    Open Workspace Dashboard →
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MOBILE SCRIM & SHEET */}
        {isMobileMenuOpen && (
          <>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9]"
            />
            <div className="fixed top-3 inset-x-3 max-w-sm mx-auto bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 z-[10] shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">Orbit Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center border-none cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateTab?.('today');
                  }}
                  className="text-left py-2 text-white text-lg font-medium border-b border-white/5"
                >
                  Today's Goals
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsRoadmapSidebarOpen(true);
                  }}
                  className="text-left py-2 text-white text-lg font-medium border-b border-white/5 flex items-center justify-between"
                >
                  <span>Track Roadmaps</span>
                  <Compass className="w-5 h-5 text-indigo-400" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateTab?.('qna-vault');
                  }}
                  className="text-left py-2 text-white text-lg font-medium border-b border-white/5 flex items-center justify-between"
                >
                  <span>Q&A Vault</span>
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateTab?.('global-vault');
                  }}
                  className="text-left py-2 text-white text-lg font-medium border-b border-white/5 flex items-center justify-between"
                >
                  <span>Video Vault</span>
                  <Video className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenRoadmapHub?.('all');
                }}
                className="w-full h-12 rounded-full bg-white text-[#161616] font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg active:scale-95"
              >
                Secure system
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

