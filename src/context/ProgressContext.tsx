'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SubjectData, SubjectProgress, AllUserProgress } from '@/types/learning';
import aiEngineerData from '@/data/aiEngineer.json';
import oopsMasteryData from '@/data/oopsMastery.json';
import nextjsMasteryData from '@/data/nextjsMastery.json';
import { format } from 'date-fns';

const DEFAULT_SUBJECTS: SubjectData[] = [
  aiEngineerData as SubjectData,
  oopsMasteryData as SubjectData,
  nextjsMasteryData as SubjectData,
];

const LOCAL_STORAGE_KEY = 'daily_learning_goals_user_progress_v1';
const LOCAL_STORAGE_ACTIVE_KEY = 'daily_learning_goals_active_subject_v1';
const LOCAL_STORAGE_CUSTOM_KEY = 'daily_learning_goals_custom_subjects_v1';
const LOCAL_STORAGE_DELETED_KEY = 'daily_learning_goals_deleted_subjects_v1';

interface ProgressContextType {
  subjects: SubjectData[];
  activeSubject: SubjectData | null;
  activeSubjectId: string | null;
  userProgress: AllUserProgress;
  activeProgress: SubjectProgress | null;
  selectSubject: (id: string) => void;
  toggleTopicCompletion: (topicId: number | string, overrideSubjectId?: string) => void;
  resetSubjectProgress: (subjectId?: string) => void;
  setSubjectStartDate: (subjectId: string, dateIso: string) => void;
  importCustomSubject: (subject: SubjectData) => boolean;
  deleteSubject: (subjectId: string) => void;
  restoreDefaultSubjects: () => void;
  isMounted: boolean;
  isSyncingDb: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customSubjects, setCustomSubjects] = useState<SubjectData[]>([]);
  const [deletedSubjectIds, setDeletedSubjectIds] = useState<string[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>('ai-engineer');
  const [userProgress, setUserProgress] = useState<AllUserProgress>({});
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);

  // Filter out subjects that have been deleted
  const subjects = [...DEFAULT_SUBJECTS, ...customSubjects].filter(
    (s) => !deletedSubjectIds.includes(s.id)
  );

  const activeSubject =
    (activeSubjectId ? subjects.find((s) => s.id === activeSubjectId) : null) ||
    subjects[0] ||
    null;

  const activeProgress: SubjectProgress | null = activeSubject
    ? userProgress[activeSubject.id] || {
        subjectId: activeSubject.id,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        completedTopicIds: [],
      }
    : null;

  // Load initial state on mount
  useEffect(() => {
    async function loadData() {
      // 1. Instant LocalStorage load
      try {
        const storedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
        const storedActiveId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KEY);
        const storedCustom = localStorage.getItem(LOCAL_STORAGE_CUSTOM_KEY);
        const storedDeleted = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);

        if (storedProgress) setUserProgress(JSON.parse(storedProgress));
        if (storedCustom) setCustomSubjects(JSON.parse(storedCustom));
        if (storedDeleted) setDeletedSubjectIds(JSON.parse(storedDeleted));
        if (storedActiveId) setActiveSubjectId(storedActiveId);
      } catch (e) {
        console.error('LocalStorage load error:', e);
      }

      // 2. Async database API load
      try {
        setIsSyncingDb(true);
        const res = await fetch('/api/progress');
        const data = await res.json();
        if (data.success) {
          if (data.progress && Object.keys(data.progress).length > 0) {
            setUserProgress((prev) => ({ ...prev, ...data.progress }));
          }
          if (data.customSubjects && data.customSubjects.length > 0) {
            setCustomSubjects(data.customSubjects);
          }
          if (data.deletedSubjectIds && Array.isArray(data.deletedSubjectIds)) {
            setDeletedSubjectIds(data.deletedSubjectIds);
          }
        }
      } catch (e) {
        console.warn('Database fetch fallback to LocalStorage:', e);
      } finally {
        setIsSyncingDb(false);
        setIsMounted(true);
      }
    }

    loadData();
  }, []);

  // Save state to LocalStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProgress));
      if (activeSubjectId) {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_KEY, activeSubjectId);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_KEY);
      }
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_KEY, JSON.stringify(customSubjects));
      localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(deletedSubjectIds));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [userProgress, activeSubjectId, customSubjects, deletedSubjectIds, isMounted]);

  const selectSubject = (id: string) => {
    setActiveSubjectId(id);
    if (!userProgress[id]) {
      const newProgress: SubjectProgress = {
        subjectId: id,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        completedTopicIds: [],
      };
      setUserProgress((prev) => ({ ...prev, [id]: newProgress }));
    }
  };

  const toggleTopicCompletion = (topicId: number | string, overrideSubjectId?: string) => {
    const targetId = overrideSubjectId || activeSubject?.id;
    if (!targetId) return;

    const existing = userProgress[targetId] || {
      subjectId: targetId,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      completedTopicIds: [],
    };

    const isCompleted = existing.completedTopicIds.includes(topicId);
    const updatedTopicIds = isCompleted
      ? existing.completedTopicIds.filter((id) => id !== topicId)
      : [...existing.completedTopicIds, topicId];

    setUserProgress((prev) => ({
      ...prev,
      [targetId]: {
        ...existing,
        completedTopicIds: updatedTopicIds,
      },
    }));

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: targetId,
        topicId: String(topicId),
        startDate: existing.startDate,
      }),
    }).catch((err) => console.error('Database sync failed:', err));
  };

  const resetSubjectProgress = (subjectId?: string) => {
    const targetId = subjectId || activeSubject?.id;
    if (!targetId) return;

    const todayIso = format(new Date(), 'yyyy-MM-dd');
    setUserProgress((prev) => ({
      ...prev,
      [targetId]: {
        subjectId: targetId,
        startDate: todayIso,
        completedTopicIds: [],
      },
    }));

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESET_PROGRESS',
        subjectId: targetId,
        startDate: todayIso,
      }),
    }).catch((err) => console.error('Database reset sync failed:', err));
  };

  const setSubjectStartDate = (subjectId: string, dateIso: string) => {
    setUserProgress((prev) => {
      const existing = prev[subjectId] || {
        subjectId,
        startDate: dateIso,
        completedTopicIds: [],
      };
      return {
        ...prev,
        [subjectId]: {
          ...existing,
          startDate: dateIso,
        },
      };
    });

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        startDate: dateIso,
      }),
    }).catch((err) => console.error('Database startDate sync failed:', err));
  };

  const importCustomSubject = (newSubject: SubjectData): boolean => {
    if (!newSubject.id || !newSubject.title || !Array.isArray(newSubject.phases)) {
      return false;
    }
    const exists = subjects.some((s) => s.id === newSubject.id);
    const finalId = exists ? `${newSubject.id}-${Date.now()}` : newSubject.id;
    const finalSubject = { ...newSubject, id: finalId };

    setCustomSubjects((prev) => [...prev, finalSubject]);
    setDeletedSubjectIds((prev) => prev.filter((id) => id !== finalId));
    selectSubject(finalId);

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'IMPORT_CUSTOM_SUBJECT',
        subjectId: finalId,
        customSubject: finalSubject,
      }),
    }).catch((err) => console.error('Database import custom subject failed:', err));

    return true;
  };

  const deleteSubject = (subjectId: string) => {
    const updatedDeleted = Array.from(new Set([...deletedSubjectIds, subjectId]));
    setDeletedSubjectIds(updatedDeleted);
    setCustomSubjects((prev) => prev.filter((s) => s.id !== subjectId));

    const remaining = subjects.filter((s) => s.id !== subjectId);
    if (remaining.length > 0) {
      setActiveSubjectId(remaining[0].id);
    } else {
      setActiveSubjectId(null);
    }

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'DELETE_SUBJECT',
        subjectId,
      }),
    }).catch((err) => console.error('Database delete subject failed:', err));
  };

  const restoreDefaultSubjects = () => {
    setDeletedSubjectIds([]);
    setActiveSubjectId(DEFAULT_SUBJECTS[0].id);

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESTORE_DEFAULT_SUBJECTS',
      }),
    }).catch((err) => console.error('Database restore failed:', err));
  };

  return (
    <ProgressContext.Provider
      value={{
        subjects,
        activeSubject,
        activeSubjectId: activeSubject?.id || null,
        userProgress,
        activeProgress,
        selectSubject,
        toggleTopicCompletion,
        resetSubjectProgress,
        setSubjectStartDate,
        importCustomSubject,
        deleteSubject,
        restoreDefaultSubjects,
        isMounted,
        isSyncingDb,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
