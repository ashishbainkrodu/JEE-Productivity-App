import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../theme';
import { databaseService } from '../services/DatabaseService';
import { notificationService } from '../services/NotificationService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

interface SettingItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: 'toggle' | 'button' | 'select';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

const SettingsScreen: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [streakNotifications, setStreakNotifications] = useState(true);
  const [examCountdown, setExamCountdown] = useState(true);
  const [pomodoroReminders, setPomodoroReminders] = useState(true);
  const [showExamDatesModal, setShowExamDatesModal] = useState(false);
  const [examDates, setExamDates] = useState({
    jeeMains: '2024-01-15',
    jeeAdvanced: '2024-06-15',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, you'd load these from AsyncStorage or database
      // For now, using default values
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleNotificationToggle = (setting: string, value: boolean) => {
    switch (setting) {
      case 'notifications':
        setNotificationsEnabled(value);
        if (value) {
          notificationService.scheduleDailyMotivation();
        } else {
          notificationService.cancelAllNotifications();
        }
        break;
      case 'dailyReminders':
        setDailyReminders(value);
        break;
      case 'streakNotifications':
        setStreakNotifications(value);
        break;
      case 'examCountdown':
        setExamCountdown(value);
        break;
      case 'pomodoroReminders':
        setPomodoroReminders(value);
        break;
    }
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'This will export your study data, progress, and settings to a file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // In a real app, you'd implement data export functionality
            Alert.alert('Success', 'Data exported successfully!');
          },
        },
      ]
    );
  };

  const importData = () => {
    Alert.alert(
      'Import Data',
      'This will import study data from a file. This will overwrite your current data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd implement data import functionality
            Alert.alert('Success', 'Data imported successfully!');
          },
        },
      ]
    );
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your study data, progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd implement data clearing functionality
            Alert.alert('Success', 'All data cleared successfully!');
          },
        },
      ]
    );
  };

  const saveExamDates = () => {
    // In a real app, you'd save these to AsyncStorage or database
    setShowExamDatesModal(false);
    Alert.alert('Success', 'Exam dates updated successfully!');
  };

  const getSettingsItems = (): SettingItem[] => [
    {
      id: 'theme',
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark themes',
      icon: 'brightness-6',
      type: 'toggle',
      value: isDarkMode,
      onToggle: toggleTheme,
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Enable or disable all notifications',
      icon: 'notifications',
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: (value) => handleNotificationToggle('notifications', value),
    },
    {
      id: 'dailyReminders',
      title: 'Daily Study Reminders',
      subtitle: 'Get reminded to study every day',
      icon: 'schedule',
      type: 'toggle',
      value: dailyReminders,
      onToggle: (value) => handleNotificationToggle('dailyReminders', value),
    },
    {
      id: 'streakNotifications',
      title: 'Streak Updates',
      subtitle: 'Get notified about your study streaks',
      icon: 'local-fire-department',
      type: 'toggle',
      value: streakNotifications,
      onToggle: (value) => handleNotificationToggle('streakNotifications', value),
    },
    {
      id: 'examCountdown',
      title: 'Exam Countdown',
      subtitle: 'Get reminders about upcoming exams',
      icon: 'event',
      type: 'toggle',
      value: examCountdown,
      onToggle: (value) => handleNotificationToggle('examCountdown', value),
    },
    {
      id: 'pomodoroReminders',
      title: 'Pomodoro Breaks',
      subtitle: 'Get reminded to take breaks during study sessions',
      icon: 'timer',
      type: 'toggle',
      value: pomodoroReminders,
      onToggle: (value) => handleNotificationToggle('pomodoroReminders', value),
    },
    {
      id: 'examDates',
      title: 'Exam Dates',
      subtitle: 'Set your JEE Mains and Advanced exam dates',
      icon: 'calendar-today',
      type: 'button',
      onPress: () => setShowExamDatesModal(true),
    },
    {
      id: 'export',
      title: 'Export Data',
      subtitle: 'Backup your study data and progress',
      icon: 'file-download',
      type: 'button',
      onPress: exportData,
    },
    {
      id: 'import',
      title: 'Import Data',
      subtitle: 'Restore your study data from backup',
      icon: 'file-upload',
      type: 'button',
      onPress: importData,
    },
    {
      id: 'clear',
      title: 'Clear All Data',
      subtitle: 'Delete all your data and start fresh',
      icon: 'delete-forever',
      type: 'button',
      onPress: clearData,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <View
      key={item.id}
      style={[styles.settingItem, { backgroundColor: currentTheme.colors.surface }]}
    >
      <View style={styles.settingInfo}>
        <Icon name={item.icon as any} size={24} color={currentTheme.colors.primary} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: currentTheme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.settingSubtitle, { color: currentTheme.colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        </View>
      </View>

      {item.type === 'toggle' && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: currentTheme.colors.border, true: currentTheme.colors.primary }}
          thumbColor={currentTheme.colors.surface}
        />
      )}

      {item.type === 'button' && (
        <TouchableOpacity onPress={item.onPress}>
          <Icon name="chevron-right" size={24} color={currentTheme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          ⚙️ Settings
        </Text>
        <Text style={[styles.headerSubtitle, { color: currentTheme.colors.textSecondary }]}>
          Customize your app experience
        </Text>
      </View>

      {/* Settings List */}
      <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            APPEARANCE
          </Text>
          {getSettingsItems()
            .filter(item => item.id === 'theme')
            .map(renderSettingItem)}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            NOTIFICATIONS
          </Text>
          {getSettingsItems()
            .filter(item => ['notifications', 'dailyReminders', 'streakNotifications', 'examCountdown', 'pomodoroReminders'].includes(item.id))
            .map(renderSettingItem)}
        </View>

        {/* Study Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            STUDY SETTINGS
          </Text>
          {getSettingsItems()
            .filter(item => item.id === 'examDates')
            .map(renderSettingItem)}
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            DATA MANAGEMENT
          </Text>
          {getSettingsItems()
            .filter(item => ['export', 'import', 'clear'].includes(item.id))
            .map(renderSettingItem)}
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            APP INFO
          </Text>
          <View style={[styles.settingItem, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.settingInfo}>
              <Icon name="info" size={24} color={currentTheme.colors.info} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: currentTheme.colors.text }]}>
                  Version
                </Text>
                <Text style={[styles.settingSubtitle, { color: currentTheme.colors.textSecondary }]}>
                  JEE Productivity App v1.0.0
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.settingItem, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.settingInfo}>
              <Icon name="code" size={24} color={currentTheme.colors.secondary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: currentTheme.colors.text }]}>
                  Developer
                </Text>
                <Text style={[styles.settingSubtitle, { color: currentTheme.colors.textSecondary }]}>
                  Built for JEE Aspirants
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Exam Dates Modal */}
      <Modal
        visible={showExamDatesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExamDatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
                Set Exam Dates
              </Text>
              <TouchableOpacity onPress={() => setShowExamDatesModal(false)}>
                <Icon name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.examDateInput}>
                <Text style={[styles.examDateLabel, { color: currentTheme.colors.text }]}>
                  JEE Mains Date:
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: currentTheme.colors.card,
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  value={examDates.jeeMains}
                  onChangeText={(text) => setExamDates(prev => ({ ...prev, jeeMains: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                />
              </View>

              <View style={styles.examDateInput}>
                <Text style={[styles.examDateLabel, { color: currentTheme.colors.text }]}>
                  JEE Advanced Date:
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: currentTheme.colors.card,
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  value={examDates.jeeAdvanced}
                  onChangeText={(text) => setExamDates(prev => ({ ...prev, jeeAdvanced: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                />
              </View>

              <Text style={[styles.modalNote, { color: currentTheme.colors.textSecondary }]}>
                Note: These dates will be used for countdown timers and exam reminders.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentTheme.colors.border }]}
                onPress={() => setShowExamDatesModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: currentTheme.colors.primary }]}
                onPress={saveExamDates}
              >
                <Text style={[styles.saveButtonText, { color: currentTheme.colors.onPrimary }]}>
                  Save Dates
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  settingsList: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 8,
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  examDateInput: {
    marginBottom: 16,
  },
  examDateLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalNote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
