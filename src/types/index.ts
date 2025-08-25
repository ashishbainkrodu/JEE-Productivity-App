export interface StudySession {
  id: string;
  subject: Subject;
  duration: number; // in minutes
  date: string; // ISO date string
  notes: string;
  topics: string[];
  examType: ExamType;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string; // ISO date string
  completed: boolean;
  subject?: Subject;
  examType?: ExamType;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  type: EventType;
  subject?: Subject;
  examType?: ExamType;
  color: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  progress: number; // 0-100
  totalTopics: number;
  completedTopics: number;
  examType: ExamType;
}

export interface Progress {
  overall: number; // 0-100
  subjects: {
    [key: string]: number; // subjectId -> progress
  };
  examType: ExamType;
}

export interface Streak {
  current: number;
  longest: number;
  lastStudyDate: string;
}

export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  lastReviewed: string;
  reviewCount: number;
}

export interface PomodoroSession {
  id: string;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  currentSession: number;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  scheduledFor: string;
  isRead: boolean;
  actionData?: any;
}

export type SubjectType = 'physics' | 'chemistry' | 'math';
export type ExamType = 'jeeMains' | 'jeeAdvanced';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type EventType = 'class' | 'test' | 'deadline' | 'study' | 'exam' | 'reminder';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type NotificationType = 'reminder' | 'streak' | 'exam' | 'achievement';

export interface TimeAnalytics {
  daily: {
    [date: string]: number; // date -> minutes studied
  };
  weekly: {
    [week: string]: number; // week -> minutes studied
  };
  monthly: {
    [month: string]: number; // month -> minutes studied
  };
  bySubject: {
    [subject: string]: number; // subject -> total minutes
  };
}

export interface ExamCountdown {
  jeeMains: {
    nextDate: string;
    daysLeft: number;
    topicsRemaining: number;
  };
  jeeAdvanced: {
    nextDate: string;
    daysLeft: number;
    topicsRemaining: number;
  };
}
