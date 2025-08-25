import {
  StudySession,
  TodoItem,
  CalendarEvent,
  Subject,
  Progress,
  Streak,
  FlashCard,
  PomodoroSession,
  Notification,
} from '../types';

class WebDatabaseService {
  private storageKey = 'JEEProductivityApp_';

  async initDatabase(): Promise<void> {
    // Initialize default data if not exists
    if (!this.getFromStorage('subjects')) {
      await this.insertDefaultData();
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

  async getSubjects(): Promise<Subject[]> {
    return this.getFromStorage<Subject[]>('subjects') || [];
  }

  async getProgress(): Promise<Progress | null> {
    return this.getFromStorage<Progress>('progress');
  }

  async getStreak(): Promise<Streak | null> {
    return this.getFromStorage<Streak>('streak');
  }

  async getTodoItems(): Promise<TodoItem[]> {
    return this.getFromStorage<TodoItem[]>('todoItems') || [];
  }

  async getStudySessions(date: string): Promise<StudySession[]> {
    const sessions = this.getFromStorage<StudySession[]>('studySessions') || [];
    return sessions.filter(session => session.date === date);
  }

  async getCalendarEvents(date: string): Promise<CalendarEvent[]> {
    const events = this.getFromStorage<CalendarEvent[]>('calendarEvents') || [];
    return events.filter(event => event.date === date);
  }

  async saveSubject(subject: Subject): Promise<void> {
    const subjects = await this.getSubjects();
    const existingIndex = subjects.findIndex(s => s.id === subject.id);
    
    if (existingIndex >= 0) {
      subjects[existingIndex] = subject;
    } else {
      subjects.push(subject);
    }
    
    this.setToStorage('subjects', subjects);
  }

  async saveTodoItem(todo: TodoItem): Promise<void> {
    const todos = await this.getTodoItems();
    const existingIndex = todos.findIndex(t => t.id === todo.id);
    
    if (existingIndex >= 0) {
      todos[existingIndex] = todo;
    } else {
      todos.push(todo);
    }
    
    this.setToStorage('todoItems', todos);
  }

  async saveStudySession(session: StudySession): Promise<void> {
    const sessions = this.getFromStorage<StudySession[]>('studySessions') || [];
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    this.setToStorage('studySessions', sessions);
  }

  async saveCalendarEvent(event: CalendarEvent): Promise<void> {
    const events = this.getFromStorage<CalendarEvent[]>('calendarEvents') || [];
    const existingIndex = events.findIndex(e => e.id === event.id);
    
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.push(event);
    }
    
    this.setToStorage('calendarEvents', events);
  }

  async updateProgress(progress: Progress): Promise<void> {
    this.setToStorage('progress', progress);
  }

  async updateStreak(streak: Streak): Promise<void> {
    this.setToStorage('streak', streak);
  }

  private async insertDefaultData(): Promise<void> {
    const defaultSubjects: Subject[] = [
      {
        id: 'physics',
        name: 'Physics',
        color: '#FF6B6B',
        progress: 0,
        totalTopics: 25,
        completedTopics: 0,
        examType: 'jeeMains'
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        color: '#4ECDC4',
        progress: 0,
        totalTopics: 20,
        completedTopics: 0,
        examType: 'jeeMains'
      },
      {
        id: 'mathematics',
        name: 'Mathematics',
        color: '#45B7D1',
        progress: 0,
        totalTopics: 30,
        completedTopics: 0,
        examType: 'jeeMains'
      }
    ];

    const defaultProgress: Progress = {
      overall: 0,
      subjects: {
        physics: 0,
        chemistry: 0,
        mathematics: 0
      },
      examType: 'jeeMains'
    };

    const defaultStreak: Streak = {
      current: 0,
      longest: 0,
      lastStudyDate: new Date().toISOString()
    };

    this.setToStorage('subjects', defaultSubjects);
    this.setToStorage('progress', defaultProgress);
    this.setToStorage('streak', defaultStreak);
    this.setToStorage('todoItems', []);
    this.setToStorage('studySessions', []);
    this.setToStorage('calendarEvents', []);
  }
}

export const webDatabaseService = new WebDatabaseService();
