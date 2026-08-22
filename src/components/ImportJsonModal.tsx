'use client';

import React, { useState } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { SubjectData } from '@/types/learning';
import { X, Upload, Code2, AlertTriangle, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_JSON: SubjectData = {
  id: 'custom-system-design',
  title: 'High-Scale System Design Roadmap',
  description: 'Master distributed systems, caching, message queues, database sharding, and resilience patterns.',
  category: 'Software Architecture',
  icon: 'Layers',
  phases: [
    {
      phase_number: 1,
      title: 'Scalability & Load Balancing',
      description: 'Handling millions of concurrent requests.',
      topics: [
        {
          id: 'sys-1',
          name: 'Horizontal vs Vertical Scaling & Load Balancers',
          description: 'L4 vs L7 load balancing, Consistent Hashing algorithms, round-robin, and health checks.',
          estimatedMinutes: 45,
        },
        {
          id: 'sys-2',
          name: 'Caching Strategies (CDN, Redis, Memcached)',
          description: 'Cache-aside, write-through, write-behind, LRU eviction policies, cache stampede prevention.',
          estimatedMinutes: 50,
        },
      ],
    },
    {
      phase_number: 2,
      title: 'Databases & Distributed Storage',
      description: 'Data replication, partitioning, and consistency models.',
      topics: [
        {
          id: 'sys-3',
          name: 'Database Sharding & Read Replicas',
          description: 'Sharding keys, range vs hash partitioning, multi-region replication, and cross-shard queries.',
          estimatedMinutes: 55,
        },
      ],
    },
  ],
};

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({ isOpen, onClose }) => {
  const { importCustomSubject } = useProgress();
  const [jsonText, setJsonText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!jsonText.trim()) {
      setErrorMsg('Please paste a JSON object.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Validate required keys
      if (!parsed.title || typeof parsed.title !== 'string') {
        setErrorMsg('JSON must contain a valid "title" string.');
        return;
      }
      if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
        setErrorMsg('JSON must contain a non-empty "phases" array.');
        return;
      }

      // Format subject ID if missing
      if (!parsed.id) {
        parsed.id = 'custom-' + Date.now();
      }

      const success = importCustomSubject(parsed as SubjectData);
      if (success) {
        setSuccessMsg(`Successfully imported "${parsed.title}"!`);
        setTimeout(() => {
          onClose();
          setJsonText('');
          setSuccessMsg(null);
        }, 1200);
      } else {
        setErrorMsg('Failed to process JSON structure.');
      }
    } catch (e: any) {
      setErrorMsg(`JSON Parse Error: ${e?.message || 'Invalid JSON syntax'}`);
    }
  };

  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON, null, 2));
    setErrorMsg(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-3xl bg-obsidian-900 border border-white/[0.08] p-5 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Import Roadmap JSON</h2>
                <p className="text-xs text-slate-400 font-mono">Paste your custom curriculum structure below</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between text-xs gap-2">
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/50 text-purple-300 hover:bg-purple-900/80 transition-colors font-mono"
            >
              <FileText className="w-3.5 h-3.5" />
              Load Sample JSON
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] cursor-pointer transition-colors font-mono">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upload .json File</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Textarea Code Input */}
          <div className="relative">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`{
  "title": "Your Custom Subject Title",
  "description": "Subject summary...",
  "phases": [
    {
      "phase_number": 1,
      "title": "Phase Title",
      "topics": [
        { "id": 1, "name": "Topic Name", "description": "Details..." }
      ]
    }
  ]
}`}
              rows={12}
              className="w-full rounded-2xl bg-obsidian-950 border border-white/[0.08] p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500/80 resize-none leading-relaxed placeholder:text-slate-600 custom-scrollbar"
            />
          </div>

          {/* Feedback banners */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-semibold hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleImport}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Import & Select Track</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

