export interface Topic {
  id: number | string;
  name: string;
  description: string;
  estimatedMinutes?: number;
  resourceUrl?: string;
  tags?: string[];
}

export interface Phase {
  phase_number: number;
  title: string;
  description?: string;
  topics: Topic[];
}

export interface SubjectData {
  id: string;
  title: string;
  description: string;
  category?: string;
  icon?: string;
  phases: Phase[];
}

export type TaskStatus = 'completed' | 'today' | 'missed-shifted' | 'upcoming';

export interface ProcessedTopic extends Topic {
  globalIndex: number;
  phaseNumber: number;
  phaseTitle: string;
  scheduledDayIndex: number;
  scheduledDate: string; // ISO yyyy-MM-dd
  status: TaskStatus;
  isMissedShifted: boolean;
  shiftedFromDayIndex?: number;
  shiftedFromDate?: string;
}

export interface SubjectProgress {
  subjectId: string;
  startDate: string; // ISO yyyy-MM-dd
  isStarted?: boolean; // false if imported but not officially started yet
  completedTopicIds: (number | string)[];
  customJSON?: SubjectData;
}

export type AllUserProgress = Record<string, SubjectProgress>;
