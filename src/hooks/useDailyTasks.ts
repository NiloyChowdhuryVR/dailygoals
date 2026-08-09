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

    // Days elapsed since start date (0-indexed)
    let currentDayIndex = differenceInCalendarDays(baseToday, startDate);
    if (currentDayIndex < 0) {
      currentDayIndex = 0;
    }

    const completedIds = new Set(subjectProgress?.completedTopicIds || []);

    // Flatten all topics across all phases into sequential list
    const allTopics: ProcessedTopic[] = [];
    let globalIndex = 0;

    subjectData.phases.forEach((phase) => {
      phase.topics.forEach((topic) => {
        const scheduledDayIndex = globalIndex;
        const scheduledDateObj = addDays(startDate, scheduledDayIndex);
        const scheduledDateIso = format(scheduledDateObj, 'yyyy-MM-dd');

        const isCompleted = completedIds.has(topic.id);
        const isPastDay = scheduledDayIndex < currentDayIndex;
        const isTodayDay = scheduledDayIndex === currentDayIndex;

        let status: TaskStatus = 'upcoming';
        let isMissedShifted = false;
        let shiftedFromDayIndex: number | undefined = undefined;
        let shiftedFromDate: string | undefined = undefined;

        if (isCompleted) {
          status = 'completed';
        } else if (isPastDay) {
          status = 'missed-shifted';
          isMissedShifted = true;
          shiftedFromDayIndex = scheduledDayIndex + 1;
          shiftedFromDate = scheduledDateIso;
        } else if (isTodayDay) {
          status = 'today';
        } else {
          status = 'upcoming';
        }

        allTopics.push({
          ...topic,
          globalIndex,
          phaseNumber: phase.phase_number,
          phaseTitle: phase.title,
          scheduledDayIndex,
          scheduledDate: scheduledDateIso,
          status,
          isMissedShifted,
          shiftedFromDayIndex,
          shiftedFromDate,
        });

        globalIndex++;
      });
    });

    const shiftedMissedTasks = allTopics.filter((t) => t.status === 'missed-shifted');
    const todayNativeTask = allTopics.find((t) => t.status === 'today') || null;
    const completedTasks = allTopics.filter((t) => t.status === 'completed');
    const upcomingTasks = allTopics.filter((t) => t.status === 'upcoming');

    // Today's actionable tasks = Shifted Missed Tasks + Scheduled Today Task (if uncompleted)
    const todayTasks: ProcessedTopic[] = [
      ...shiftedMissedTasks,
      ...(todayNativeTask ? [todayNativeTask] : []),
    ];

    const totalTopics = allTopics.length;
    const completedCount = completedTasks.length;
    const missedCount = shiftedMissedTasks.length;
    const todayCount = todayTasks.length;
    const upcomingCount = upcomingTasks.length;
    const completionPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    return {
      todayTasks,
      shiftedMissedTasks,
      todayNativeTask,
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
        totalDaysNeeded: totalTopics,
        startDateFormatted: format(startDate, 'MMM d, yyyy'),
        effectiveDateFormatted: format(baseToday, 'EEE, MMM d, yyyy'),
      },
    };
  }, [subjectData, subjectProgress]);
}
