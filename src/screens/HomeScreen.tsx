import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../theme';
import { databaseService } from '../services/DatabaseService';
import { notificationService } from '../services/NotificationService';
import {
  Subject,
  Progress,
  Streak,
  TodoItem,
  StudySession,
  ExamCountdown,
} from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const HomeScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [todayTodos, setTodayTodos] = useState<TodoItem[]>([]);
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([]);
  const [examCountdown, setExamCountdown] = useState<ExamCountdown>({
    jeeMains: { nextDate: '2024-01-15', daysLeft: 45, topicsRemaining: 12 },
    jeeAdvanced: { nextDate: '2024-06-15', daysLeft: 196, topicsRemaining: 35 },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await databaseService.initDatabase();
      const [subjectsData, progressData, streakData, todosData, sessionsData] = await Promise.all([
        databaseService.getSubjects(),
        databaseService.getProgress(),
        databaseService.getStreak(),
        databaseService.getTodoItems(),
        databaseService.getStudySessions(moment().format('YYYY-MM-DD')),
      ]);

      setSubjects(subjectsData);
      setProgress(progressData);
      setStreak(streakData);
      setTodayTodos(todosData.filter(todo => !todo.completed).slice(0, 5));
      setTodaySessions(sessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return currentTheme.colors.error;
      case 'high':
        return currentTheme.colors.warning;
      case 'medium':
        return currentTheme.colors.info;
      case 'low':
        return currentTheme.colors.success;
      default:
        return currentTheme.colors.text;
    }
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || currentTheme.colors.primary;
  };

  const startStudySession = () => {
    // Navigate to study session screen
    Alert.alert('Start Study Session', 'Navigate to study session screen');
  };

  const addTodo = () => {
    // Navigate to add todo screen
    Alert.alert('Add Todo', 'Navigate to add todo screen');
  };

  const viewCalendar = () => {
    // Navigate to calendar screen
    Alert.alert('View Calendar', 'Navigate to calendar screen');
  };

  const startPomodoro = () => {
    // Navigate to pomodoro timer screen
    Alert.alert('Start Pomodoro', 'Navigate to pomodoro timer screen');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.greeting, { color: currentTheme.colors.text }]}>
          Good {moment().hour() < 12 ? 'Morning' : moment().hour() < 17 ? 'Afternoon' : 'Evening'}! 👋
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.colors.textSecondary }]}>
          Ready to ace your JEE preparation?
        </Text>
      </View>

      {/* Exam Countdown */}
      <View style={[styles.countdownContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          🎯 Exam Countdown
        </Text>
        <View style={styles.countdownRow}>
          <View style={[styles.countdownCard, { backgroundColor: currentTheme.colors.jeeMains }]}>
            <Text style={styles.countdownTitle}>JEE Mains</Text>
            <Text style={styles.countdownDays}>{examCountdown.jeeMains.daysLeft}</Text>
            <Text style={styles.countdownLabel}>Days Left</Text>
          </View>
          <View style={[styles.countdownCard, { backgroundColor: currentTheme.colors.jeeAdvanced }]}>
            <Text style={styles.countdownTitle}>JEE Advanced</Text>
            <Text style={styles.countdownDays}>{examCountdown.jeeAdvanced.daysLeft}</Text>
            <Text style={styles.countdownLabel}>Days Left</Text>
          </View>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={[styles.progressContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          📊 Overall Progress
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress?.overall || 0}%`,
                backgroundColor: currentTheme.colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: currentTheme.colors.textSecondary }]}>
          {progress?.overall || 0}% Complete
        </Text>
      </View>

      {/* Subject Progress */}
      <View style={[styles.subjectsContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          📚 Subject Progress
        </Text>
        {subjects.map((subject) => (
          <View key={subject.id} style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <View
                style={[styles.subjectColor, { backgroundColor: subject.color }]}
              />
              <Text style={[styles.subjectName, { color: currentTheme.colors.text }]}>
                {subject.name}
              </Text>
            </View>
            <View style={styles.subjectProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: currentTheme.colors.textSecondary }]}>
                {subject.progress}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Streak */}
      <View style={[styles.streakContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          🔥 Study Streak
        </Text>
        <View style={styles.streakInfo}>
          <View style={styles.streakCard}>
            <Text style={[styles.streakNumber, { color: currentTheme.colors.primary }]}>
              {streak?.current || 0}
            </Text>
            <Text style={[styles.streakLabel, { color: currentTheme.colors.textSecondary }]}>
              Current
            </Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={[styles.streakNumber, { color: currentTheme.colors.secondary }]}>
              {streak?.longest || 0}
            </Text>
            <Text style={[styles.streakLabel, { color: currentTheme.colors.textSecondary }]}>
              Longest
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.actionsContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          ⚡ Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={startStudySession}
          >
            <Icon name="play-arrow" size={24} color="white" />
            <Text style={styles.actionButtonText}>Start Study</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentTheme.colors.secondary }]}
            onPress={addTodo}
          >
            <Icon name="add-task" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Todo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentTheme.colors.info }]}
            onPress={viewCalendar}
          >
            <Icon name="calendar-today" size={24} color="white" />
            <Text style={styles.actionButtonText}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentTheme.colors.warning }]}
            onPress={startPomodoro}
          >
            <Icon name="timer" size={24} color="white" />
            <Text style={styles.actionButtonText}>Pomodoro</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Tasks */}
      <View style={[styles.tasksContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          📋 Today's Tasks
        </Text>
        {todayTodos.length > 0 ? (
          todayTodos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <View style={styles.todoInfo}>
                <Text style={[styles.todoTitle, { color: currentTheme.colors.text }]}>
                  {todo.title}
                </Text>
                {todo.description && (
                  <Text style={[styles.todoDescription, { color: currentTheme.colors.textSecondary }]}>
                    {todo.description}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(todo.priority) },
                ]}
              />
            </View>
          ))
        ) : (
          <Text style={[styles.noTasksText, { color: currentTheme.colors.textSecondary }]}>
            No tasks for today. Great job! 🎉
          </Text>
        )}
      </View>

      {/* Today's Study Sessions */}
      <View style={[styles.sessionsContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          📚 Today's Study Sessions
        </Text>
        {todaySessions.length > 0 ? (
          todaySessions.map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionSubject, { color: getSubjectColor(session.subject.id) }]}>
                  {session.subject.name}
                </Text>
                <Text style={[styles.sessionDuration, { color: currentTheme.colors.textSecondary }]}>
                  {session.duration} min
                </Text>
              </View>
              {session.notes && (
                <Text style={[styles.sessionNotes, { color: currentTheme.colors.textSecondary }]}>
                  {session.notes}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={[styles.noSessionsText, { color: currentTheme.colors.textSecondary }]}>
            No study sessions today. Time to start studying! 📖
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  countdownContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countdownCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  countdownTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  countdownDays: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  countdownLabel: {
    color: 'white',
    fontSize: 12,
  },
  progressContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  subjectsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
  },
  subjectProgress: {
    flex: 1,
    marginLeft: 16,
  },
  streakContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakCard: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
  },
  actionsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tasksContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  todoInfo: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  todoDescription: {
    fontSize: 14,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  noTasksText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  sessionsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 32,
  },
  sessionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: 14,
  },
  sessionNotes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  noSessionsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default HomeScreen;
