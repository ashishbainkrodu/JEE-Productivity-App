import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../theme';
import { databaseService } from '../services/DatabaseService';
import { Subject, Progress, Streak, TimeAnalytics } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics>({
    daily: {},
    weekly: {},
    monthly: {},
    bySubject: {
      physics: 0,
      chemistry: 0,
      math: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await databaseService.initDatabase();
      const [subjectsData, progressData, streakData] = await Promise.all([
        databaseService.getSubjects(),
        databaseService.getProgress(),
        databaseService.getStreak(),
      ]);

      setSubjects(subjectsData);
      setProgress(progressData);
      setStreak(streakData);

      // Generate mock time analytics data
      generateMockTimeAnalytics();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateMockTimeAnalytics = () => {
    const mockData: TimeAnalytics = {
      daily: {},
      weekly: {},
      monthly: {},
      bySubject: {
        physics: 0,
        chemistry: 0,
        math: 0,
      },
    };

    // Generate daily data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      mockData.daily[date] = Math.floor(Math.random() * 180) + 60; // 60-240 minutes
    }

    // Generate weekly data for the last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const week = moment().subtract(i, 'weeks').format('YYYY-[W]WW');
      mockData.weekly[week] = Math.floor(Math.random() * 1200) + 400; // 400-1600 minutes
    }

    // Generate monthly data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months').format('YYYY-MM');
      mockData.monthly[month] = Math.floor(Math.random() * 4800) + 1600; // 1600-6400 minutes
    }

    // Generate subject-specific data
    mockData.bySubject.physics = Math.floor(Math.random() * 2000) + 800;
    mockData.bySubject.chemistry = Math.floor(Math.random() * 1800) + 700;
    mockData.bySubject.math = Math.floor(Math.random() * 2200) + 900;

    setTimeAnalytics(mockData);
  };

  const getPeriodData = () => {
    switch (selectedPeriod) {
      case 'week':
        return Object.entries(timeAnalytics.daily).slice(-7);
      case 'month':
        return Object.entries(timeAnalytics.weekly).slice(-4);
      case 'year':
        return Object.entries(timeAnalytics.monthly).slice(-6);
      default:
        return [];
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTotalStudyTime = () => {
    const periodData = getPeriodData();
    return periodData.reduce((total, [_, minutes]) => total + minutes, 0);
  };

  const getAverageStudyTime = () => {
    const periodData = getPeriodData();
    if (periodData.length === 0) return 0;
    return Math.round(getTotalStudyTime() / periodData.length);
  };

  const getMaxStudyTime = () => {
    const periodData = getPeriodData();
    if (periodData.length === 0) return 0;
    return Math.max(...periodData.map(([_, minutes]) => minutes));
  };

  const renderBarChart = () => {
    const periodData = getPeriodData();
    const maxValue = Math.max(...periodData.map(([_, minutes]) => minutes), 1);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {periodData.map(([label, value], index) => (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (value / maxValue) * 150,
                    backgroundColor: currentTheme.colors.primary,
                  },
                ]}
              />
              <Text style={[styles.barLabel, { color: currentTheme.colors.textSecondary }]}>
                {selectedPeriod === 'week' ? moment(label).format('DD') : 
                 selectedPeriod === 'month' ? `W${moment(label).week()}` : 
                 moment(label).format('MMM')}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSubjectChart = () => {
    const subjectData = Object.entries(timeAnalytics.bySubject);
    const maxValue = Math.max(...subjectData.map(([_, minutes]) => minutes), 1);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {subjectData.map(([subject, minutes], index) => {
            const subjectColor = subjects.find(s => s.id === subject)?.color || currentTheme.colors.primary;
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (minutes / maxValue) * 150,
                      backgroundColor: subjectColor,
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: currentTheme.colors.textSecondary }]}>
                  {subject.charAt(0).toUpperCase()}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          📊 Analytics & Insights
        </Text>
        <Text style={[styles.headerSubtitle, { color: currentTheme.colors.textSecondary }]}>
          Track your study progress and performance
        </Text>
      </View>

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          📅 Time Period
        </Text>
        <View style={styles.periodButtons}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                {
                  backgroundColor:
                    selectedPeriod === period ? currentTheme.colors.primary : currentTheme.colors.card,
                  borderColor: currentTheme.colors.border,
                },
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  {
                    color:
                      selectedPeriod === period ? currentTheme.colors.onPrimary : currentTheme.colors.text,
                  },
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Study Time Overview */}
      <View style={[styles.overviewContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          ⏰ Study Time Overview
        </Text>
        <View style={styles.overviewCards}>
          <View style={[styles.overviewCard, { backgroundColor: currentTheme.colors.card }]}>
            <Icon name="schedule" size={24} color={currentTheme.colors.primary} />
            <Text style={[styles.overviewValue, { color: currentTheme.colors.text }]}>
              {formatTime(getTotalStudyTime())}
            </Text>
            <Text style={[styles.overviewLabel, { color: currentTheme.colors.textSecondary }]}>
              Total Time
            </Text>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: currentTheme.colors.card }]}>
            <Icon name="trending-up" size={24} color={currentTheme.colors.success} />
            <Text style={[styles.overviewValue, { color: currentTheme.colors.text }]}>
              {formatTime(getAverageStudyTime())}
            </Text>
            <Text style={[styles.overviewLabel, { color: currentTheme.colors.textSecondary }]}>
              Average/Day
            </Text>
          </View>

          <View style={[styles.overviewCard, { backgroundColor: currentTheme.colors.card }]}>
            <Icon name="star" size={24} color={currentTheme.colors.warning} />
            <Text style={[styles.overviewValue, { color: currentTheme.colors.text }]}>
              {formatTime(getMaxStudyTime())}
            </Text>
            <Text style={[styles.overviewLabel, { color: currentTheme.colors.textSecondary }]}>
              Best Day
            </Text>
          </View>
        </View>
      </View>

      {/* Study Time Chart */}
      <View style={[styles.chartSection, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          📈 Study Time Trend
        </Text>
        {renderBarChart()}
        <Text style={[styles.chartNote, { color: currentTheme.colors.textSecondary }]}>
          Study time in minutes for the selected period
        </Text>
      </View>

      {/* Subject Performance */}
      <View style={[styles.subjectsContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          📚 Subject Performance
        </Text>
        {subjects.map((subject) => (
          <View key={subject.id} style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <View style={[styles.subjectColor, { backgroundColor: subject.color }]} />
              <Text style={[styles.subjectName, { color: currentTheme.colors.text }]}>
                {subject.name}
              </Text>
            </View>
            <View style={styles.subjectStats}>
              <Text style={[styles.subjectProgress, { color: currentTheme.colors.textSecondary }]}>
                {subject.progress}%
              </Text>
              <Text style={[styles.subjectTime, { color: currentTheme.colors.textSecondary }]}>
                {formatTime(timeAnalytics.bySubject[subject.id as keyof typeof timeAnalytics.bySubject] || 0)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Subject Time Chart */}
      <View style={[styles.chartSection, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          🎯 Subject Study Time
        </Text>
        {renderSubjectChart()}
        <Text style={[styles.chartNote, { color: currentTheme.colors.textSecondary }]}>
          Total study time per subject
        </Text>
      </View>

      {/* Streak Information */}
      <View style={[styles.streakContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
          🔥 Study Streak
        </Text>
        <View style={styles.streakInfo}>
          <View style={styles.streakCard}>
            <Icon name="local-fire-department" size={32} color={currentTheme.colors.warning} />
            <Text style={[styles.streakNumber, { color: currentTheme.colors.text }]}>
              {streak?.current || 0}
            </Text>
            <Text style={[styles.streakLabel, { color: currentTheme.colors.textSecondary }]}>
              Current Streak
            </Text>
          </View>

          <View style={styles.streakCard}>
            <Icon name="emoji-events" size={32} color={currentTheme.colors.primary} />
            <Text style={[styles.streakNumber, { color: currentTheme.colors.text }]}>
              {streak?.longest || 0}
            </Text>
            <Text style={[styles.streakLabel, { color: currentTheme.colors.textSecondary }]}>
              Longest Streak
            </Text>
          </View>

          <View style={styles.streakCard}>
            <Icon name="calendar-today" size={32} color={currentTheme.colors.success} />
            <Text style={[styles.streakNumber, { color: currentTheme.colors.text }]}>
              {streak?.lastStudyDate ? moment(streak.lastStudyDate).format('DD') : '0'}
            </Text>
            <Text style={[styles.streakLabel, { color: currentTheme.colors.textSecondary }]}>
              Last Study
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Summary */}
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
        
        <View style={styles.progressDetails}>
          {subjects.map((subject) => (
            <View key={subject.id} style={styles.progressItem}>
              <View style={styles.progressItemHeader}>
                <View style={[styles.progressItemColor, { backgroundColor: subject.color }]} />
                <Text style={[styles.progressItemName, { color: currentTheme.colors.text }]}>
                  {subject.name}
                </Text>
                <Text style={[styles.progressItemValue, { color: currentTheme.colors.textSecondary }]}>
                  {subject.progress}%
                </Text>
              </View>
              <View style={styles.progressItemBar}>
                <View
                  style={[
                    styles.progressItemFill,
                    {
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  periodSelector: {
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
  periodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  overviewContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartContainer: {
    height: 200,
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
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
  subjectStats: {
    alignItems: 'flex-end',
  },
  subjectProgress: {
    fontSize: 16,
    fontWeight: '600',
  },
  subjectTime: {
    fontSize: 14,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    textAlign: 'center',
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
    marginBottom: 32,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  progressDetails: {
    gap: 12,
  },
  progressItem: {
    marginBottom: 8,
  },
  progressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressItemColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  progressItemName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  progressItemValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressItemBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressItemFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default AnalyticsScreen;
