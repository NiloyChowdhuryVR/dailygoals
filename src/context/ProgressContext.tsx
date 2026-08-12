'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SubjectData,
  SubjectProgress,
  AllUserProgress,
  TopicDocument,
  AllTopicDocuments,
  TrashWorkflowItem,
} from '@/types/learning';
import aiEngineerData from '@/data/aiEngineer.json';
import oopsMasteryData from '@/data/oopsMastery.json';
import nextjsMasteryData from '@/data/nextjsMastery.json';
import { format } from 'date-fns';
import { getEffectiveTodayIso } from '@/lib/dateUtils';

const DEFAULT_SUBJECTS: SubjectData[] = [
  aiEngineerData as SubjectData,
  oopsMasteryData as SubjectData,
  nextjsMasteryData as SubjectData,
];

const LOCAL_STORAGE_KEY = 'daily_learning_goals_user_progress_v1';
const LOCAL_STORAGE_ACTIVE_KEY = 'daily_learning_goals_active_subject_v1';
const LOCAL_STORAGE_CUSTOM_KEY = 'daily_learning_goals_custom_subjects_v1';
const LOCAL_STORAGE_DELETED_KEY = 'daily_learning_goals_deleted_subjects_v1';
const LOCAL_STORAGE_DOCS_KEY = 'daily_learning_goals_topic_documents_v1';
const LOCAL_STORAGE_TRASH_KEY = 'daily_learning_goals_trash_items_v1';

interface ProgressContextType {
  subjects: SubjectData[];
  activeSubject: SubjectData | null;
  activeSubjectId: string | null;
  userProgress: AllUserProgress;
  activeProgress: SubjectProgress | null;
  topicDocuments: AllTopicDocuments;
  trashItems: TrashWorkflowItem[];
  selectSubject: (id: string) => void;
  startSubjectTrack: (subjectId?: string) => void;
  toggleTopicCompletion: (topicId: number | string, overrideSubjectId?: string) => void;
  resetSubjectProgress: (subjectId?: string) => void;
  setSubjectStartDate: (subjectId: string, dateIso: string) => void;
  importCustomSubject: (subject: SubjectData) => boolean;
  deleteSubject: (subjectId: string) => void;
  restoreDefaultSubjects: () => void;
  getTopicDocument: (subjectId: string, topicId: number | string) => TopicDocument | null;
  saveTopicDocument: (
    subjectId: string,
    topicId: number | string,
    content: string,
    title?: string
  ) => Promise<boolean>;
  deleteTopicDocument: (subjectId: string, topicId: number | string) => Promise<boolean>;
  restoreFromTrash: (subjectId: string) => Promise<boolean>;
  permanentlyDeleteFromTrash: (subjectId?: string) => Promise<boolean>;
  isMounted: boolean;
  isSyncingDb: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customSubjects, setCustomSubjects] = useState<SubjectData[]>([]);
  const [deletedSubjectIds, setDeletedSubjectIds] = useState<string[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>('ai-engineer');
  const [userProgress, setUserProgress] = useState<AllUserProgress>({});
  const [topicDocuments, setTopicDocuments] = useState<AllTopicDocuments>({});
  const [trashItems, setTrashItems] = useState<TrashWorkflowItem[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);

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
        startDate: getEffectiveTodayIso(),
        isStarted: true,
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
        const storedDocs = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
        const storedTrash = localStorage.getItem(LOCAL_STORAGE_TRASH_KEY);

        if (storedProgress) {
          const parsed = JSON.parse(storedProgress);
          const normalized: AllUserProgress = {};
          Object.keys(parsed).forEach((key) => {
            normalized[key] = {
              ...parsed[key],
              completedTopicIds: (parsed[key].completedTopicIds || []).map((id: any) => String(id)),
            };
          });
          setUserProgress(normalized);
        }
        if (storedCustom) setCustomSubjects(JSON.parse(storedCustom));
        if (storedDeleted) setDeletedSubjectIds(JSON.parse(storedDeleted));
        if (storedActiveId) setActiveSubjectId(storedActiveId);
        if (storedDocs) setTopicDocuments(JSON.parse(storedDocs));
        if (storedTrash) setTrashItems(JSON.parse(storedTrash));
      } catch (e) {
        console.error('LocalStorage load error:', e);
      }

      // 2. Async database API load (Progress, Documents & Trash)
      try {
        setIsSyncingDb(true);

        const [progressRes, docsRes, trashRes] = await Promise.all([
          fetch('/api/progress'),
          fetch('/api/documents'),
          fetch('/api/trash'),
        ]);

        const data = await progressRes.json();
        if (data.success) {
          if (data.progress && Object.keys(data.progress).length > 0) {
            setUserProgress((prev) => {
              const updated: AllUserProgress = { ...prev };
              Object.keys(data.progress).forEach((sId) => {
                const dbItem = data.progress[sId];
                const prevItem = updated[sId];

                const dbTopicIds = (dbItem.completedTopicIds || []).map((id: any) => String(id));
                const prevTopicIds = (prevItem?.completedTopicIds || []).map((id: any) => String(id));

                // Union of DB and LocalStorage completed IDs so no progress is ever lost
                const mergedCompletedIds = Array.from(new Set([...dbTopicIds, ...prevTopicIds]));

                updated[sId] = {
                  ...(prevItem || {}),
                  ...dbItem,
                  completedTopicIds: mergedCompletedIds,
                };
              });
              return updated;
            });
          }
          if (data.customSubjects && data.customSubjects.length > 0) {
            setCustomSubjects(data.customSubjects);
          }
          if (data.deletedSubjectIds && Array.isArray(data.deletedSubjectIds)) {
            setDeletedSubjectIds(data.deletedSubjectIds);
          }
        }

        const docsData = await docsRes.json();
        if (docsData.success && docsData.documents) {
          setTopicDocuments((prev) => ({ ...prev, ...docsData.documents }));
        }

        const trashData = await trashRes.json();
        if (trashData.success && Array.isArray(trashData.trashItems)) {
          setTrashItems(trashData.trashItems);
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
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(topicDocuments));
      localStorage.setItem(LOCAL_STORAGE_TRASH_KEY, JSON.stringify(trashItems));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [userProgress, activeSubjectId, customSubjects, deletedSubjectIds, topicDocuments, trashItems, isMounted]);

  const selectSubject = (id: string) => {
    setActiveSubjectId(id);
    if (!userProgress[id]) {
      const newProgress: SubjectProgress = {
        subjectId: id,
        startDate: getEffectiveTodayIso(),
        isStarted: true,
        completedTopicIds: [],
      };
      setUserProgress((prev) => ({ ...prev, [id]: newProgress }));
    }
  };

  const startSubjectTrack = (subjectId?: string) => {
    const targetId = subjectId || activeSubject?.id;
    if (!targetId) return;

    const todayIso = getEffectiveTodayIso();
    setUserProgress((prev) => {
      const existing = prev[targetId] || {
        subjectId: targetId,
        startDate: todayIso,
        isStarted: true,
        completedTopicIds: [],
      };
      return {
        ...prev,
        [targetId]: {
          ...existing,
          startDate: todayIso,
          isStarted: true,
        },
      };
    });

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'START_SUBJECT',
        subjectId: targetId,
      }),
    }).catch((err) => console.error('Database start track sync failed:', err));
  };

  const toggleTopicCompletion = (topicId: number | string, overrideSubjectId?: string) => {
    const targetId = overrideSubjectId || activeSubject?.id;
    if (!targetId) return;

    const existing = userProgress[targetId] || {
      subjectId: targetId,
      startDate: getEffectiveTodayIso(),
      isStarted: true,
      completedTopicIds: [],
    };

    const topicIdStr = String(topicId);
    const existingIdsStr = (existing.completedTopicIds || []).map((id) => String(id));
    const isCompleted = existingIdsStr.includes(topicIdStr);
    const nextCompletedState = !isCompleted;

    const updatedTopicIds = nextCompletedState
      ? Array.from(new Set([...existingIdsStr, topicIdStr]))
      : existingIdsStr.filter((id) => id !== topicIdStr);

    // If completed a topic, mark as started automatically if not started
    setUserProgress((prev) => ({
      ...prev,
      [targetId]: {
        ...existing,
        isStarted: true,
        completedTopicIds: updatedTopicIds,
      },
    }));

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: targetId,
        topicId: topicIdStr,
        completed: nextCompletedState,
        startDate: existing.startDate,
        isStarted: true,
      }),
    }).catch((err) => console.error('Database sync failed:', err));
  };

  const resetSubjectProgress = (subjectId?: string) => {
    const targetId = subjectId || activeSubject?.id;
    if (!targetId) return;

    const todayIso = getEffectiveTodayIso();
    setUserProgress((prev) => ({
      ...prev,
      [targetId]: {
        subjectId: targetId,
        startDate: todayIso,
        isStarted: false,
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
        isStarted: false,
      }),
    }).catch((err) => console.error('Database reset sync failed:', err));
  };

  const setSubjectStartDate = (subjectId: string, dateIso: string) => {
    setUserProgress((prev) => {
      const existing = prev[subjectId] || {
        subjectId,
        startDate: dateIso,
        isStarted: true,
        completedTopicIds: [],
      };
      return {
        ...prev,
        [subjectId]: {
          ...existing,
          startDate: dateIso,
          isStarted: true,
        },
      };
    });

    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId,
        startDate: dateIso,
        isStarted: true,
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

    // Initialize imported subject as NOT STARTED YET
    const todayIso = getEffectiveTodayIso();
    setUserProgress((prev) => ({
      ...prev,
      [finalId]: {
        subjectId: finalId,
        startDate: todayIso,
        isStarted: false,
        completedTopicIds: [],
      },
    }));

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
    const targetSubject = subjects.find((s) => s.id === subjectId);
    const targetProgress = userProgress[subjectId];
    const targetCustom = customSubjects.find((s) => s.id === subjectId);
    const targetDocs = topicDocuments[subjectId] || {};

    const snapshot = {
      progress: targetProgress,
      customSubject: targetCustom,
      documents: targetDocs,
    };

    const newTrashItem: TrashWorkflowItem = {
      subjectId,
      title: targetSubject?.title || subjectId,
      snapshot,
      deletedAt: new Date().toISOString(),
    };

    // Update local state for trash and active lists
    setTrashItems((prev) => [newTrashItem, ...prev.filter((t) => t.subjectId !== subjectId)]);
    setDeletedSubjectIds((prev) => Array.from(new Set([...prev, subjectId])));
    setCustomSubjects((prev) => prev.filter((s) => s.id !== subjectId));

    const remaining = subjects.filter((s) => s.id !== subjectId);
    if (remaining.length > 0) {
      setActiveSubjectId(remaining[0].id);
    } else {
      setActiveSubjectId(null);
    }

    // Call DB API to move to Trash (3 days retention)
    fetch('/api/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'MOVE_TO_TRASH',
        subjectId,
        title: targetSubject?.title || subjectId,
        snapshot,
      }),
    }).catch((err) => console.error('Database move to trash failed:', err));
  };

  const restoreFromTrash = async (subjectId: string): Promise<boolean> => {
    const trashItem = trashItems.find((t) => t.subjectId === subjectId);
    if (!trashItem) return false;

    const { snapshot } = trashItem;
    const { progress, customSubject, documents } = snapshot;

    // Restore local states
    if (customSubject) {
      setCustomSubjects((prev) => {
        const exists = prev.some((s) => s.id === customSubject.id);
        return exists ? prev : [...prev, customSubject];
      });
    }

    if (progress) {
      setUserProgress((prev) => ({
        ...prev,
        [subjectId]: {
          ...progress,
          completedTopicIds: (progress.completedTopicIds || []).map((id: any) => String(id)),
        },
      }));
    }

    if (documents) {
      setTopicDocuments((prev) => ({
        ...prev,
        [subjectId]: documents,
      }));
    }

    setDeletedSubjectIds((prev) => prev.filter((id) => id !== subjectId));
    setTrashItems((prev) => prev.filter((t) => t.subjectId !== subjectId));
    setActiveSubjectId(subjectId);

    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESTORE',
          subjectId,
        }),
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.error('Restore from trash API error:', err);
      return false;
    }
  };

  const permanentlyDeleteFromTrash = async (subjectId?: string): Promise<boolean> => {
    if (subjectId) {
      setTrashItems((prev) => prev.filter((t) => t.subjectId !== subjectId));
    } else {
      setTrashItems([]);
    }

    try {
      const url = subjectId ? `/api/trash?subjectId=${subjectId}` : '/api/trash';
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.error('Permanent delete from trash API error:', err);
      return false;
    }
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

  // Helper: Get document for topic
  const getTopicDocument = (subjectId: string, topicId: number | string): TopicDocument | null => {
    const topicIdStr = String(topicId);
    return topicDocuments[subjectId]?.[topicIdStr] || null;
  };

  // Helper: Save document for topic
  const saveTopicDocument = async (
    subjectId: string,
    topicId: number | string,
    content: string,
    title?: string
  ): Promise<boolean> => {
    const topicIdStr = String(topicId);
    const updatedDoc: TopicDocument = {
      subjectId,
      topicId: topicIdStr,
      title: title || undefined,
      content,
      updatedAt: new Date().toISOString(),
    };

    // Update local state immediately
    setTopicDocuments((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {}),
        [topicIdStr]: updatedDoc,
      },
    }));

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          topicId: topicIdStr,
          title: title || null,
          content,
        }),
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.error('Save topic document DB error:', err);
      return false;
    }
  };

  // Helper: Delete document for topic
  const deleteTopicDocument = async (
    subjectId: string,
    topicId: number | string
  ): Promise<boolean> => {
    const topicIdStr = String(topicId);

    setTopicDocuments((prev) => {
      const subjectDocs = { ...(prev[subjectId] || {}) };
      delete subjectDocs[topicIdStr];
      return {
        ...prev,
        [subjectId]: subjectDocs,
      };
    });

    try {
      const res = await fetch(`/api/documents?subjectId=${subjectId}&topicId=${topicIdStr}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      console.error('Delete topic document DB error:', err);
      return false;
    }
  };

  return (
    <ProgressContext.Provider
      value={{
        subjects,
        activeSubject,
        activeSubjectId: activeSubject?.id || null,
        userProgress,
        activeProgress,
        topicDocuments,
        trashItems,
        selectSubject,
        startSubjectTrack,
        toggleTopicCompletion,
        resetSubjectProgress,
        setSubjectStartDate,
        importCustomSubject,
        deleteSubject,
        restoreDefaultSubjects,
        getTopicDocument,
        saveTopicDocument,
        deleteTopicDocument,
        restoreFromTrash,
        permanentlyDeleteFromTrash,
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
