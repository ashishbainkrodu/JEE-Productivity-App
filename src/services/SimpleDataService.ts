import { Subject, StudySession, Progress } from '../types';

interface SimpleStudySession {
  id: string;
  subject: string;
  chapter: string;
  duration: number; // in minutes
  date: string;
  notes?: string;
}

interface SimpleSubject {
  id: string;
  name: string;
  color: string;
  chapters: string[];
  totalTime: number; // in minutes
}

class SimpleDataService {
  private storageKey = 'JEEProductivityApp_';

  // Initialize with default subjects
  async initData(): Promise<void> {
    if (!this.getFromStorage('subjects')) {
      const defaultSubjects: SimpleSubject[] = [
        {
          id: 'physics',
          name: 'Physics',
          color: '#FF6B6B',
          chapters: [
            'Mechanics', 'Thermodynamics', 'Electromagnetism', 
            'Optics', 'Modern Physics', 'Wave Motion'
          ],
          totalTime: 0
        },
        {
          id: 'chemistry',
          name: 'Chemistry',
          color: '#4ECDC4',
          chapters: [
            'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry',
            'Chemical Bonding', 'Thermodynamics', 'Kinetics'
          ],
          totalTime: 0
        },
        {
          id: 'mathematics',
          name: 'Mathematics',
          color: '#45B7D1',
          chapters: [
            'Algebra', 'Calculus', 'Trigonometry', 'Geometry',
            'Vectors', 'Probability', 'Statistics'
          ],
          totalTime: 0
        }
      ];

      this.setToStorage('subjects', defaultSubjects);
      this.setToStorage('studySessions', []);
      this.setToStorage('progress', {
        overall: 0,
        subjects: {
          physics: 0,
          chemistry: 0,
          mathematics: 0
        },
        examType: 'jeeMains'
      });
    }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.storageKey + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private setToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.storageKey + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Get all subjects
  async getSubjects(): Promise<Subject[]> {
    const simpleSubjects = this.getFromStorage<SimpleSubject[]>('subjects') || [];
    return simpleSubjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      progress: this.calculateSubjectProgress(subject.id),
      totalTopics: subject.chapters.length,
      completedTopics: this.getCompletedChapters(subject.id).length,
      examType: 'jeeMains' as const
    }));
  }

  // Get study sessions for a subject
  async getStudySessions(subjectId: string): Promise<StudySession[]> {
    const sessions = this.getFromStorage<SimpleStudySession[]>('studySessions') || [];
    const subjectSessions = sessions.filter(s => s.subject === subjectId);
    
    return subjectSessions.map(session => ({
      id: session.id,
      subject: {
        id: session.subject,
        name: this.getSubjectName(session.subject),
        color: this.getSubjectColor(session.subject),
        progress: 0,
        totalTopics: 0,
        completedTopics: 0,
        examType: 'jeeMains'
      },
      duration: session.duration,
      date: session.date,
      notes: session.notes || '',
      topics: [session.chapter],
      examType: 'jeeMains'
    }));
  }

  // Add a new study session
  async addStudySession(subjectId: string, chapter: string, duration: number, notes?: string): Promise<void> {
    const sessions = this.getFromStorage<SimpleStudySession[]>('studySessions') || [];
    const subjects = this.getFromStorage<SimpleSubject[]>('subjects') || [];
    
    const newSession: SimpleStudySession = {
      id: `session_${Date.now()}`,
      subject: subjectId,
      chapter,
      duration,
      date: new Date().toISOString(),
      notes
    };

    sessions.push(newSession);
    this.setToStorage('studySessions', sessions);

    // Update subject total time
    const subjectIndex = subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex >= 0) {
      subjects[subjectIndex].totalTime += duration;
      this.setToStorage('subjects', subjects);
    }
  }

  // Get progress data
  async getProgress(): Promise<Progress | null> {
    return this.getFromStorage<Progress>('progress');
  }

  // Get completed chapters for a subject
  private getCompletedChapters(subjectId: string): string[] {
    const sessions = this.getFromStorage<SimpleStudySession[]>('studySessions') || [];
    const subjectSessions = sessions.filter(s => s.subject === subjectId);
    return [...new Set(subjectSessions.map(s => s.chapter))];
  }

  // Calculate subject progress
  private calculateSubjectProgress(subjectId: string): number {
    const subjects = this.getFromStorage<SimpleSubject[]>('subjects') || [];
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0;

    const completedChapters = this.getCompletedChapters(subjectId);
    return Math.round((completedChapters.length / subject.chapters.length) * 100);
  }

  // Get subject name
  private getSubjectName(subjectId: string): string {
    const subjects = this.getFromStorage<SimpleSubject[]>('subjects') || [];
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown';
  }

  // Get subject color
  private getSubjectColor(subjectId: string): string {
    const subjects = this.getFromStorage<SimpleSubject[]>('subjects') || [];
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#666';
  }

  // Get all study sessions
  async getAllStudySessions(): Promise<SimpleStudySession[]> {
    return this.getFromStorage<SimpleStudySession[]>('studySessions') || [];
  }

  // Get total study time
  async getTotalStudyTime(): Promise<number> {
    const sessions = this.getFromStorage<SimpleStudySession[]>('studySessions') || [];
    return sessions.reduce((total, session) => total + session.duration, 0);
  }

  // Get study time by subject
  async getStudyTimeBySubject(): Promise<{ [key: string]: number }> {
    const subjects = this.getFromStorage<SimpleSubject[]>('subjects') || [];
    const result: { [key: string]: number } = {};
    
    subjects.forEach(subject => {
      result[subject.id] = subject.totalTime;
    });
    
    return result;
  }
}

export const simpleDataService = new SimpleDataService();
export type { SimpleStudySession, SimpleSubject };
