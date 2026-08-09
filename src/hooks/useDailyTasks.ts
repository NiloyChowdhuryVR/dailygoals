import { useMemo } from 'react';
import { SubjectData, SubjectProgress, ProcessedTopic, TaskStatus } from '@/types/learning';
import { parseISO, format, addDays, differenceInCalendarDays, startOfDay } from 'date-fns';

export interface UseDailyTasksReturn {
  todayTasks: ProcessedTopic[];
  shiftedMissedTasks: ProcessedTopic[];
  todayNativeTask: ProcessedTopic | null;
  upcomingTasks: ProcessedTopic[];
  completedTasks: ProcessedTopic[];
  allProcessedTopics: ProcessedTopic[];
  stats: {
    totalTopics: number;
    completedCount: number;
    missedCount: number;
    todayCount: number;
    upcomingCount: number;
    completionPercentage: number;
    currentDayNumber: number;
    totalDaysNeeded: number;
    startDateFormatted: string;
    effectiveDateFormatted: string;
  };
}

export function useDailyTasks(
  subjectData: SubjectData | null,
  subjectProgress?: SubjectProgress | null
): UseDailyTasksReturn {
  return useMemo(() => {
    const baseToday = startOfDay(new Date());

    if (!subjectData) {
      return {
        todayTasks: [],
        shiftedMissedTasks: [],
        todayNativeTask: null,
        upcomingTasks: [],
        completedTasks: [],
        allProcessedTopics: [],
        stats: {
          totalTopics: 0,
          completedCount: 0,
          missedCount: 0,
          todayCount: 0,
          upcomingCount: 0,
          completionPercentage: 0,
          currentDayNumber: 0,
          totalDaysNeeded: 0,
          startDateFormatted: '-',
          effectiveDateFormatted: format(baseToday, 'EEE, MMM d, yyyy'),
        },
      };
    }

    // Start date calculation
    const startDateIso = subjectProgress?.startDate || format(baseToday, 'yyyy-MM-dd');
    let startDate: Date;
    try {
      startDate = startOfDay(parseISO(startDateIso));
    } catch {
      startDate = baseToday;
    }

    // Days elapsed since start date (0-indexed: Day 0 = Phase 1 [index 0], Day 1 = Phase 2 [index 1])
    let currentDayIndex = differenceInCalendarDays(baseToday, startDate);
    if (currentDayIndex < 0) {
      currentDayIndex = 0;
    }

    const completedIds = new Set(subjectProgress?.completedTopicIds || []);

    const allTopics: ProcessedTopic[] = [];
    let globalTopicIndex = 0;

    // Process phase by phase (Each phase = 1 Day!)
    subjectData.phases.forEach((phase, phaseIdx) => {
      const scheduledDayIndex = phaseIdx; // Phase 1 -> Index 0 (Day 1), Phase 2 -> Index 1 (Day 2)
      const scheduledDateObj = addDays(startDate, scheduledDayIndex);
      const scheduledDateIso = format(scheduledDateObj, 'yyyy-MM-dd');

      const isPastPhaseDay = scheduledDayIndex < currentDayIndex;
      const isTodayPhaseDay = scheduledDayIndex === currentDayIndex;

      phase.topics.forEach((topic) => {
        const isCompleted = completedIds.has(topic.id);

        let status: TaskStatus = 'upcoming';
        let isMissedShifted = false;
        let shiftedFromDayIndex: number | undefined = undefined;
        let shiftedFromDate: string | undefined = undefined;

        if (isCompleted) {
          status = 'completed';
        } else if (isPastPhaseDay) {
          status = 'missed-shifted';
          isMissedShifted = true;
          shiftedFromDayIndex = scheduledDayIndex + 1; // 1-indexed phase day
          shiftedFromDate = scheduledDateIso;
        } else if (isTodayPhaseDay) {
          status = 'today';
        } else {
          status = 'upcoming';
        }

        allTopics.push({
          ...topic,
          globalIndex: globalTopicIndex,
          phaseNumber: phase.phase_number,
          phaseTitle: phase.title,
          scheduledDayIndex,
          scheduledDate: scheduledDateIso,
          status,
          isMissedShifted,
          shiftedFromDayIndex,
          shiftedFromDate,
        });

        globalTopicIndex++;
      });
    });

    const shiftedMissedTasks = allTopics.filter((t) => t.status === 'missed-shifted');
    const todayNativeTasks = allTopics.filter((t) => t.status === 'today');
    const completedTasks = allTopics.filter((t) => t.status === 'completed');
    const upcomingTasks = allTopics.filter((t) => t.status === 'upcoming');

    // Today's goals = All uncompleted topics from past missed phase days + All topics from today's phase
    const todayTasks: ProcessedTopic[] = [
      ...shiftedMissedTasks,
      ...todayNativeTasks,
    ];

    const totalTopics = allTopics.length;
    const completedCount = completedTasks.length;
    const missedCount = shiftedMissedTasks.length;
    const todayCount = todayTasks.length;
    const upcomingCount = upcomingTasks.length;
    const completionPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const totalDaysNeeded = subjectData.phases.length; // Each phase = 1 day

    return {
      todayTasks,
      shiftedMissedTasks,
      todayNativeTask: todayNativeTasks[0] || null,
      upcomingTasks,
      completedTasks,
      allProcessedTopics: allTopics,
      stats: {
        totalTopics,
        completedCount,
        missedCount,
        todayCount,
        upcomingCount,
        completionPercentage,
        currentDayNumber: currentDayIndex + 1,
        totalDaysNeeded,
        startDateFormatted: format(startDate, 'MMM d, yyyy'),
        effectiveDateFormatted: format(baseToday, 'EEE, MMM d, yyyy'),
      },
    };
  }, [subjectData, subjectProgress]);
}
