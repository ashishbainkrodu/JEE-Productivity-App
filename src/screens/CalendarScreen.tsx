import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../theme';
import { databaseService } from '../services/DatabaseService';
import { CalendarEvent, EventType, Subject, ExamType } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const CalendarScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    date: selectedDate,
    startTime: '',
    endTime: '',
    type: 'reminder',
    color: currentTheme.colors.primary,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await databaseService.initDatabase();
      const [eventsData, subjectsData] = await Promise.all([
        // In a real app, you'd have a getCalendarEvents method
        Promise.resolve([]),
        databaseService.getSubjects(),
      ]);

      setEvents(eventsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    events.forEach(event => {
      const date = event.date;
      if (!marked[date]) {
        marked[date] = {
          marked: true,
          dotColor: event.color,
          events: [],
        };
      }
      marked[date].events.push(event);
    });

    return marked;
  };

  const onDayPress = (day: DateData) => {
    const date = day.dateString;
    setSelectedDate(date);
    setNewEvent(prev => ({ ...prev, date }));
    
    const dayEvents = events.filter(event => event.date === date);
    setSelectedEvents(dayEvents);
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case 'class':
        return 'school';
      case 'test':
        return 'quiz';
      case 'deadline':
        return 'schedule';
      case 'study':
        return 'book';
      case 'exam':
        return 'assignment';
      case 'reminder':
        return 'notifications';
      default:
        return 'event';
    }
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'class':
        return currentTheme.colors.info;
      case 'test':
        return currentTheme.colors.warning;
      case 'deadline':
        return currentTheme.colors.error;
      case 'study':
        return currentTheme.colors.success;
      case 'exam':
        return currentTheme.colors.primary;
      case 'reminder':
        return currentTheme.colors.secondary;
      default:
        return currentTheme.colors.primary;
    }
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const event: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: newEvent.title!,
        description: newEvent.description || '',
        date: newEvent.date!,
        startTime: newEvent.startTime || '',
        endTime: newEvent.endTime || '',
        type: newEvent.type!,
        subject: newEvent.subject,
        examType: newEvent.examType,
        color: newEvent.color!,
      };

      // In a real app, you'd save this to the database
      setEvents(prev => [...prev, event]);
      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        date: selectedDate,
        startTime: '',
        endTime: '',
        type: 'reminder',
        color: currentTheme.colors.primary,
      });

      Alert.alert('Success', 'Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const deleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents(prev => prev.filter(event => event.id !== eventId));
            setSelectedEvents(prev => prev.filter(event => event.id !== eventId));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Calendar */}
      <Calendar
        onDayPress={onDayPress}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: currentTheme.colors.surface,
          calendarBackground: currentTheme.colors.surface,
          textSectionTitleColor: currentTheme.colors.text,
          selectedDayBackgroundColor: currentTheme.colors.primary,
          selectedDayTextColor: currentTheme.colors.onPrimary,
          todayTextColor: currentTheme.colors.primary,
          dayTextColor: currentTheme.colors.text,
          textDisabledColor: currentTheme.colors.textSecondary,
          dotColor: currentTheme.colors.primary,
          selectedDotColor: currentTheme.colors.onPrimary,
          arrowColor: currentTheme.colors.primary,
          monthTextColor: currentTheme.colors.text,
          indicatorColor: currentTheme.colors.primary,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
      />

      {/* Selected Date Events */}
      <View style={[styles.eventsContainer, { backgroundColor: currentTheme.colors.surface }]}>
        <View style={styles.eventsHeader}>
          <Text style={[styles.eventsTitle, { color: currentTheme.colors.text }]}>
            Events for {moment(selectedDate).format('MMMM D, YYYY')}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: currentTheme.colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.eventsList}>
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <View
                key={event.id}
                style={[
                  styles.eventItem,
                  { borderLeftColor: event.color, borderLeftWidth: 4 },
                ]}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Icon
                      name={getEventTypeIcon(event.type)}
                      size={20}
                      color={getEventTypeColor(event.type)}
                      style={styles.eventIcon}
                    />
                    <Text style={[styles.eventTitle, { color: currentTheme.colors.text }]}>
                      {event.title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteEvent(event.id)}>
                    <Icon name="delete" size={20} color={currentTheme.colors.error} />
                  </TouchableOpacity>
                </View>
                
                {event.description && (
                  <Text style={[styles.eventDescription, { color: currentTheme.colors.textSecondary }]}>
                    {event.description}
                  </Text>
                )}
                
                <View style={styles.eventDetails}>
                  {event.startTime && (
                    <Text style={[styles.eventTime, { color: currentTheme.colors.textSecondary }]}>
                      ⏰ {event.startTime}
                      {event.endTime && ` - ${event.endTime}`}
                    </Text>
                  )}
                  {event.subject && (
                    <Text style={[styles.eventSubject, { color: event.subject.color }]}>
                      📚 {event.subject.name}
                    </Text>
                  )}
                  {event.examType && (
                    <Text style={[styles.eventExamType, { color: currentTheme.colors.textSecondary }]}>
                      🎯 {event.examType}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noEventsText, { color: currentTheme.colors.textSecondary }]}>
              No events for this date. Tap + to add one!
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
                Add New Event
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.colors.card,
                    color: currentTheme.colors.text,
                    borderColor: currentTheme.colors.border,
                  },
                ]}
                placeholder="Event Title"
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.colors.card,
                    color: currentTheme.colors.text,
                    borderColor: currentTheme.colors.border,
                  },
                ]}
                placeholder="Description (optional)"
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <TextInput
                  style={[
                    styles.input,
                    styles.halfInput,
                    {
                      backgroundColor: currentTheme.colors.card,
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  placeholder="Start Time (HH:MM)"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                  value={newEvent.startTime}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, startTime: text }))}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.halfInput,
                    {
                      backgroundColor: currentTheme.colors.card,
                      color: currentTheme.colors.text,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  placeholder="End Time (HH:MM)"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                  value={newEvent.endTime}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, endTime: text }))}
                />
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        newEvent.type === 'class' ? currentTheme.colors.primary : currentTheme.colors.card,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, type: 'class' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          newEvent.type === 'class' ? currentTheme.colors.onPrimary : currentTheme.colors.text,
                      },
                    ]}
                  >
                    Class
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        newEvent.type === 'test' ? currentTheme.colors.primary : currentTheme.colors.card,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, type: 'test' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          newEvent.type === 'test' ? currentTheme.colors.onPrimary : currentTheme.colors.text,
                      },
                    ]}
                  >
                    Test
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        newEvent.type === 'deadline' ? currentTheme.colors.primary : currentTheme.colors.card,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, type: 'deadline' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          newEvent.type === 'deadline' ? currentTheme.colors.onPrimary : currentTheme.colors.text,
                      },
                    ]}
                  >
                    Deadline
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        newEvent.type === 'study' ? currentTheme.colors.primary : currentTheme.colors.card,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, type: 'study' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          newEvent.type === 'study' ? currentTheme.colors.onPrimary : currentTheme.colors.text,
                      },
                    ]}
                  >
                    Study
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        newEvent.type === 'exam' ? currentTheme.colors.primary : currentTheme.colors.card,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, type: 'exam' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          newEvent.type === 'exam' ? currentTheme.colors.onPrimary : currentTheme.colors.text,
                      },
                    ]}
                  >
                    Exam
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        newEvent.type === 'reminder' ? currentTheme.colors.primary : currentTheme.colors.card,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  onPress={() => setNewEvent(prev => ({ ...prev, type: 'reminder' }))}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          newEvent.type === 'reminder' ? currentTheme.colors.onPrimary : currentTheme.colors.text,
                      },
                    ]}
                  >
                    Reminder
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentTheme.colors.border }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: currentTheme.colors.primary }]}
                onPress={addEvent}
              >
                <Text style={[styles.saveButtonText, { color: currentTheme.colors.onPrimary }]}>
                  Save Event
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
  eventsContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  eventsList: {
    flex: 1,
    padding: 16,
  },
  eventItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIcon: {
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventTime: {
    fontSize: 12,
  },
  eventSubject: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventExamType: {
    fontSize: 12,
  },
  noEventsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 40,
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
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

export default CalendarScreen;
