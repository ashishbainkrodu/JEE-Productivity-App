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
import { simpleDataService } from '../services/SimpleDataService';
import {
  Subject,
  Progress,
  StudySession,
  ExamCountdown,
} from '../types';
import moment from 'moment';

// Use web-compatible icons only
const Icon = require('../components/WebIcon').default;

const HomeScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
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
      await simpleDataService.initData();
      const [subjectsData, progressData] = await Promise.all([
        simpleDataService.getSubjects(),
        simpleDataService.getProgress(),
      ]);

      setSubjects(subjectsData);
      setProgress(progressData);
      
      // Get today's sessions
      const today = moment().format('YYYY-MM-DD');
      const allSessions = await simpleDataService.getAllStudySessions();
      const todaySessionsData = allSessions
        .filter(session => moment(session.date).format('YYYY-MM-DD') === today)
        .map(session => ({
          id: session.id,
          subject: subjectsData.find(s => s.id === session.subject) || subjectsData[0],
          duration: session.duration,
          date: session.date,
          notes: session.notes || '',
          topics: [session.chapter],
          examType: 'jeeMains' as const
        }));
      
      setTodaySessions(todaySessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || currentTheme.colors.primary;
  };

  const startStudySession = () => {
    Alert.alert('Start Study Session', 'Navigate to study session screen');
  };

  const addTodo = () => {
    Alert.alert('Add Todo', 'Navigate to add todo screen');
  };

  const viewCalendar = () => {
    Alert.alert('View Calendar', 'Navigate to calendar screen');
  };

  const startPomodoro = () => {
    Alert.alert('Start Pomodoro', 'Navigate to pomodoro screen');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTotalTodayTime = () => {
    return todaySessions.reduce((total, session) => total + session.duration, 0);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          Welcome to JEE Prep! 🚀
        </Text>
        <Text style={[styles.headerSubtitle, { color: currentTheme.colors.textSecondary }]}>
          Track your progress and stay motivated
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: currentTheme.colors.surface }]}>
          <Icon name="timer" size={24} color={currentTheme.colors.primary} />
          <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>
            {formatDuration(getTotalTodayTime())}
          </Text>
          <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>
            Today's Study Time
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: currentTheme.colors.surface }]}>
          <Icon name="book" size={24} color={currentTheme.colors.primary} />
          <Text style={[styles.statValue, { color: currentTheme.colors.text }]}>
            {subjects.length}
          </Text>
          <Text style={[styles.statLabel, { color: currentTheme.colors.textSecondary }]}>
            Active Subjects
          </Text>
        </View>
      </View>

      {/* Subjects Progress */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          Subject Progress
        </Text>
        {subjects.map((subject) => (
          <View key={subject.id} style={[styles.subjectCard, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.subjectHeader}>
              <View style={[styles.subjectColor, { backgroundColor: subject.color }]} />
              <Text style={[styles.subjectName, { color: currentTheme.colors.text }]}>
                {subject.name}
              </Text>
              <Text style={[styles.subjectProgress, { color: currentTheme.colors.primary }]}>
                {subject.progress}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${subject.progress}%`, 
                    backgroundColor: subject.color 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.subjectDetails, { color: currentTheme.colors.textSecondary }]}>
              {subject.completedTopics} of {subject.totalTopics} chapters completed
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={startStudySession}
          >
            <Icon name="add" size={24} color="white" />
            <Text style={styles.actionButtonText}>Start Study Session</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: currentTheme.colors.secondary }]}
            onPress={viewCalendar}
          >
            <Icon name="calendar-today" size={24} color="white" />
            <Text style={styles.actionButtonText}>View Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Today's Study Sessions
          </Text>
          {todaySessions.map((session) => (
            <View key={session.id} style={[styles.sessionCard, { backgroundColor: currentTheme.colors.surface }]}>
              <View style={styles.sessionHeader}>
                <Text style={[styles.sessionSubject, { color: getSubjectColor(session.subject.id) }]}>
                  {session.subject.name}
                </Text>
                <Text style={[styles.sessionDuration, { color: currentTheme.colors.textSecondary }]}>
                  {formatDuration(session.duration)}
                </Text>
              </View>
              <Text style={[styles.sessionTopics, { color: currentTheme.colors.text }]}>
                {session.topics.join(', ')}
              </Text>
              {session.notes && (
                <Text style={[styles.sessionNotes, { color: currentTheme.colors.textSecondary }]}>
                  {session.notes}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Exam Countdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          Exam Countdown
        </Text>
        <View style={[styles.countdownCard, { backgroundColor: currentTheme.colors.surface }]}>
          <Text style={[styles.countdownTitle, { color: currentTheme.colors.text }]}>
            JEE Mains
          </Text>
          <Text style={[styles.countdownDays, { color: currentTheme.colors.primary }]}>
            {examCountdown.jeeMains.daysLeft} days left
          </Text>
          <Text style={[styles.countdownTopics, { color: currentTheme.colors.textSecondary }]}>
            {examCountdown.jeeMains.topicsRemaining} topics remaining
          </Text>
        </View>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subjectCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  subjectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  subjectProgress: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  subjectDetails: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: 14,
  },
  sessionTopics: {
    fontSize: 14,
    marginBottom: 4,
  },
  sessionNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  countdownCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  countdownDays: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  countdownTopics: {
    fontSize: 14,
  },
});

export default HomeScreen;
