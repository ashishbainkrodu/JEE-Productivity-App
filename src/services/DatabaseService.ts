import SQLite from 'react-native-sqlite-storage';
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

SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: 'JEEProductivityApp.db',
        location: 'default',
      });

      await this.createTables();
      await this.insertDefaultData();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const createTablesQueries = [
      // Subjects table
      `CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        progress REAL DEFAULT 0,
        totalTopics INTEGER DEFAULT 0,
        completedTopics INTEGER DEFAULT 0,
        examType TEXT NOT NULL
      )`,

      // Study sessions table
      `CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY,
        subjectId TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        topics TEXT,
        examType TEXT NOT NULL,
        FOREIGN KEY (subjectId) REFERENCES subjects (id)
      )`,

      // Todo items table
      `CREATE TABLE IF NOT EXISTS todo_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL,
        deadline TEXT,
        completed INTEGER DEFAULT 0,
        subjectId TEXT,
        examType TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (subjectId) REFERENCES subjects (id)
      )`,

      // Calendar events table
      `CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        startTime TEXT,
        endTime TEXT,
        type TEXT NOT NULL,
        subjectId TEXT,
        examType TEXT,
        color TEXT NOT NULL,
        FOREIGN KEY (subjectId) REFERENCES subjects (id)
      )`,

      // Progress table
      `CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        overall REAL DEFAULT 0,
        subjects TEXT NOT NULL,
        examType TEXT NOT NULL
      )`,

      // Streak table
      `CREATE TABLE IF NOT EXISTS streak (
        id TEXT PRIMARY KEY,
        current INTEGER DEFAULT 0,
        longest INTEGER DEFAULT 0,
        lastStudyDate TEXT
      )`,

      // Flash cards table
      `CREATE TABLE IF NOT EXISTS flash_cards (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        subjectId TEXT NOT NULL,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        lastReviewed TEXT,
        reviewCount INTEGER DEFAULT 0,
        FOREIGN KEY (subjectId) REFERENCES subjects (id)
      )`,

      // Pomodoro sessions table
      `CREATE TABLE IF NOT EXISTS pomodoro_sessions (
        id TEXT PRIMARY KEY,
        workDuration INTEGER NOT NULL,
        breakDuration INTEGER NOT NULL,
        longBreakDuration INTEGER NOT NULL,
        sessionsUntilLongBreak INTEGER NOT NULL,
        currentSession INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 0,
        startTime TEXT,
        endTime TEXT
      )`,

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        scheduledFor TEXT NOT NULL,
        isRead INTEGER DEFAULT 0,
        actionData TEXT
      )`,
    ];

    for (const query of createTablesQueries) {
      await this.database.executeSql(query);
    }
  }

  private async insertDefaultData(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    // Insert default subjects
    const defaultSubjects: Subject[] = [
      {
        id: 'physics',
        name: 'Physics',
        color: '#FF5722',
        progress: 0,
        totalTopics: 20,
        completedTopics: 0,
        examType: 'jeeMains',
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        color: '#4CAF50',
        progress: 0,
        totalTopics: 18,
        completedTopics: 0,
        examType: 'jeeMains',
      },
      {
        id: 'math',
        name: 'Mathematics',
        color: '#2196F3',
        progress: 0,
        totalTopics: 22,
        completedTopics: 0,
        examType: 'jeeMains',
      },
    ];

    for (const subject of defaultSubjects) {
      await this.insertSubject(subject);
    }

    // Insert default progress
    const defaultProgress: Progress = {
      overall: 0,
      subjects: {
        physics: 0,
        chemistry: 0,
        math: 0,
      },
      examType: 'jeeMains',
    };

    await this.insertProgress(defaultProgress);

    // Insert default streak
    const defaultStreak: Streak = {
      current: 0,
      longest: 0,
      lastStudyDate: new Date().toISOString(),
    };

    await this.insertStreak(defaultStreak);
  }

  // Subject operations
  async insertSubject(subject: Subject): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    const query = `
      INSERT OR REPLACE INTO subjects (id, name, color, progress, totalTopics, completedTopics, examType)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.database.executeSql(query, [
      subject.id,
      subject.name,
      subject.color,
      subject.progress,
      subject.totalTopics,
      subject.completedTopics,
      subject.examType,
    ]);
  }

  async getSubjects(): Promise<Subject[]> {
    if (!this.database) throw new Error('Database not initialized');
    
    const [results] = await this.database.executeSql('SELECT * FROM subjects');
    const subjects: Subject[] = [];
    
    for (let i = 0; i < results.rows.length; i++) {
      subjects.push(results.rows.item(i));
    }
    
    return subjects;
  }

  async updateSubjectProgress(subjectId: string, progress: number): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    const query = 'UPDATE subjects SET progress = ? WHERE id = ?';
    await this.database.executeSql(query, [progress, subjectId]);
  }

  // Study session operations
  async insertStudySession(session: StudySession): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO study_sessions (id, subjectId, duration, date, notes, topics, examType)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.database.executeSql(query, [
      session.id,
      session.subject.id,
      session.duration,
      session.date,
      session.notes,
      JSON.stringify(session.topics),
      session.examType,
    ]);
  }

  async getStudySessions(date?: string): Promise<StudySession[]> {
    if (!this.database) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM study_sessions';
    let params: any[] = [];
    
    if (date) {
      query += ' WHERE date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY date DESC';
    
    const [results] = await this.database.executeSql(query, params);
    const sessions: StudySession[] = [];
    
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      // Note: This is a simplified version. In a real app, you'd join with subjects table
      sessions.push({
        ...row,
        topics: JSON.parse(row.topics || '[]'),
        subject: { id: row.subjectId, name: '', color: '', progress: 0, totalTopics: 0, completedTopics: 0, examType: 'jeeMains' },
      });
    }
    
    return sessions;
  }

  // Todo operations
  async insertTodoItem(todo: TodoItem): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO todo_items (id, title, description, priority, deadline, completed, subjectId, examType, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.database.executeSql(query, [
      todo.id,
      todo.title,
      todo.description,
      todo.priority,
      todo.deadline,
      todo.completed ? 1 : 0,
      todo.subject?.id,
      todo.examType,
      todo.createdAt,
    ]);
  }

  async getTodoItems(): Promise<TodoItem[]> {
    if (!this.database) throw new Error('Database not initialized');
    
    const [results] = await this.database.executeSql('SELECT * FROM todo_items ORDER BY createdAt DESC');
    const todos: TodoItem[] = [];
    
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      todos.push({
        ...row,
        completed: Boolean(row.completed),
      });
    }
    
    return todos;
  }

  async updateTodoItem(todo: TodoItem): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    const query = `
      UPDATE todo_items 
      SET title = ?, description = ?, priority = ?, deadline = ?, completed = ?, subjectId = ?, examType = ?
      WHERE id = ?
    `;
    
    await this.database.executeSql(query, [
      todo.title,
      todo.description,
      todo.priority,
      todo.deadline,
      todo.completed ? 1 : 0,
      todo.subject?.id,
      todo.examType,
      todo.id,
    ]);
  }

  // Progress operations
  async insertProgress(progress: Progress): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    const query = `
      INSERT OR REPLACE INTO progress (id, overall, subjects, examType)
      VALUES (?, ?, ?, ?)
    `;
    
    await this.database.executeSql(query, [
      'default',
      progress.overall,
      JSON.stringify(progress.subjects),
      progress.examType,
    ]);
  }

  async getProgress(): Promise<Progress | null> {
    if (!this.database) throw new Error('Database not initialized');
    
    const [results] = await this.database.executeSql('SELECT * FROM progress WHERE id = ?', ['default']);
    
    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return {
        ...row,
        subjects: JSON.parse(row.subjects),
      };
    }
    
    return null;
  }

  // Streak operations
  async insertStreak(streak: Streak): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');
    
    const query = `
      INSERT OR REPLACE INTO streak (id, current, longest, lastStudyDate)
      VALUES (?, ?, ?, ?)
    `;
    
    await this.database.executeSql(query, [
      'default',
      streak.current,
      streak.longest,
      streak.lastStudyDate,
    ]);
  }

  async getStreak(): Promise<Streak | null> {
    if (!this.database) throw new Error('Database not initialized');
    
    const [results] = await this.database.executeSql('SELECT * FROM streak WHERE id = ?', ['default']);
    
    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    
    return null;
  }

  // Close database
  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }
}

export const databaseService = new DatabaseService();
