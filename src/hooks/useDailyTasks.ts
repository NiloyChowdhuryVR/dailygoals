import { useMemo } from 'react';
import { SubjectData, SubjectProgress, ProcessedTopic, TaskStatus } from '@/types/learning';
import { parseISO, format, addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { getEffectiveDate, getEffectiveTodayIso } from '@/lib/dateUtils';

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
    currentDayIndex: number;
    currentDayNumber: number;
    totalDaysNeeded: number;
    todayPhaseNumber: number | null;
    todayPhaseTitle: string | null;
    startDateFormatted: string;
    effectiveDateFormatted: string;
    isStarted: boolean;
    isTodayPhaseCompleted: boolean;
    isTodayGoalCompleted: boolean;
    todayPhaseCompletedCount: number;
    todayPhaseTotalCount: number;
  };
}

export function useDailyTasks(
  subjectData: SubjectData | null,
  subjectProgress?: SubjectProgress | null
): UseDailyTasksReturn {
  return useMemo(() => {
    // 4:00 AM Daily Reset Boundary
    const baseToday = getEffectiveDate(new Date());

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
          currentDayIndex: 0,
          currentDayNumber: 0,
          totalDaysNeeded: 0,
          todayPhaseNumber: null,
          todayPhaseTitle: null,
          startDateFormatted: '-',
          effectiveDateFormatted: format(baseToday, 'EEE, MMM d, yyyy'),
          isStarted: true,
          isTodayPhaseCompleted: false,
          isTodayGoalCompleted: false,
          todayPhaseCompletedCount: 0,
          todayPhaseTotalCount: 0,
        },
      };
    }

    const isStarted = Boolean(subjectProgress?.isStarted);

    // Start date calculation
    const startDateIso = subjectProgress?.startDate || getEffectiveTodayIso(new Date());
    let startDate: Date;
    try {
      startDate = startOfDay(parseISO(startDateIso));
    } catch {
      startDate = baseToday;
    }

    // Days elapsed since start date (If not started yet, clamp to 0 - Day 1)
    let currentDayIndex = isStarted ? differenceInCalendarDays(baseToday, startDate) : 0;
    if (currentDayIndex < 0) {
      currentDayIndex = 0;
    }

    const completedIds = new Set((subjectProgress?.completedTopicIds || []).map((id) => String(id)));
    const allTopics: ProcessedTopic[] = [];
    let globalTopicIndex = 0;

    subjectData.phases.forEach((phase, phaseIdx) => {
      const scheduledDayIndex = phaseIdx; // Phase 1 -> Index 0 (Day 1)
      const scheduledDateObj = addDays(startDate, scheduledDayIndex);
      const scheduledDateIso = format(scheduledDateObj, 'yyyy-MM-dd');

      // If track is NOT started yet, no past phase days exist
      const isPastPhaseDay = isStarted && scheduledDayIndex < currentDayIndex;
      const isTodayPhaseDay = scheduledDayIndex === currentDayIndex;

      phase.topics.forEach((topic) => {
        const isCompleted = completedIds.has(String(topic.id));

        let status: TaskStatus = 'upcoming';
        let isMissedShifted = false;
        let shiftedFromDayIndex: number | undefined = undefined;
        let shiftedFromDate: string | undefined = undefined;

        if (isCompleted) {
          status = 'completed';
        } else if (isPastPhaseDay) {
          status = 'missed-shifted';
          isMissedShifted = true;
          shiftedFromDayIndex = scheduledDayIndex + 1;
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

    const todayTasks: ProcessedTopic[] = [
      ...shiftedMissedTasks,
      ...todayNativeTasks,
    ];

    const todayPhaseObj = subjectData.phases[currentDayIndex];
    const todayPhaseTopics = allTopics.filter((t) => t.scheduledDayIndex === currentDayIndex);
    const todayPhaseCompletedCount = todayPhaseTopics.filter((t) => t.status === 'completed').length;
    const todayPhaseTotalCount = todayPhaseTopics.length;
    const isTodayPhaseCompleted = todayPhaseTotalCount > 0 && todayPhaseCompletedCount === todayPhaseTotalCount;
    const isTodayGoalCompleted = isTodayPhaseCompleted && shiftedMissedTasks.length === 0;

    const totalTopics = allTopics.length;
    const completedCount = completedTasks.length;
    const missedCount = shiftedMissedTasks.length;
    const todayCount = todayTasks.length;
    const upcomingCount = upcomingTasks.length;
    const completionPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    const totalDaysNeeded = subjectData.phases.length;

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
        currentDayIndex,
        currentDayNumber: currentDayIndex + 1,
        totalDaysNeeded,
        todayPhaseNumber: todayPhaseObj ? todayPhaseObj.phase_number : null,
        todayPhaseTitle: todayPhaseObj ? todayPhaseObj.title : null,
        startDateFormatted: format(startDate, 'MMM d, yyyy'),
        effectiveDateFormatted: format(baseToday, 'EEE, MMM d, yyyy'),
        isStarted,
        isTodayPhaseCompleted,
        isTodayGoalCompleted,
        todayPhaseCompletedCount,
        todayPhaseTotalCount,
      },
    };
  }, [subjectData, subjectProgress]);
}
