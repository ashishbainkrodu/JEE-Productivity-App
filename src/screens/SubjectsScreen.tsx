import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../theme';
import { databaseService } from '../services/DatabaseService';
import { Subject, ExamType } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Topic {
  id: string;
  name: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  notes: string;
}

const SubjectsScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newTopic, setNewTopic] = useState<Partial<Topic>>({
    name: '',
    difficulty: 'medium',
    notes: '',
  });
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    color: currentTheme.colors.primary,
    examType: 'jeeMains',
  });

  // Mock topics data - in a real app, this would come from the database
  const mockTopics: { [key: string]: Topic[] } = {
    physics: [
      { id: '1', name: 'Mechanics', completed: true, difficulty: 'medium', notes: 'Covered in class' },
      { id: '2', name: 'Thermodynamics', completed: false, difficulty: 'hard', notes: 'Need to review' },
      { id: '3', name: 'Electromagnetism', completed: false, difficulty: 'hard', notes: '' },
      { id: '4', name: 'Optics', completed: false, difficulty: 'medium', notes: '' },
      { id: '5', name: 'Modern Physics', completed: false, difficulty: 'easy', notes: '' },
    ],
    chemistry: [
      { id: '1', name: 'Physical Chemistry', completed: true, difficulty: 'medium', notes: 'Good understanding' },
      { id: '2', name: 'Organic Chemistry', completed: false, difficulty: 'hard', notes: 'Need practice' },
      { id: '3', name: 'Inorganic Chemistry', completed: false, difficulty: 'medium', notes: '' },
    ],
    math: [
      { id: '1', name: 'Algebra', completed: true, difficulty: 'medium', notes: 'Strong foundation' },
      { id: '2', name: 'Calculus', completed: false, difficulty: 'hard', notes: 'Need more practice' },
      { id: '3', name: 'Geometry', completed: false, difficulty: 'medium', notes: '' },
      { id: '4', name: 'Trigonometry', completed: false, difficulty: 'easy', notes: '' },
    ],
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      await databaseService.initDatabase();
      const subjectsData = await databaseService.getSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
      Alert.alert('Error', 'Failed to load subjects');
    }
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || currentTheme.colors.primary;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return currentTheme.colors.success;
      case 'medium':
        return currentTheme.colors.warning;
      case 'hard':
        return currentTheme.colors.error;
      default:
        return currentTheme.colors.text;
    }
  };

  const toggleTopicCompletion = (topicId: string) => {
    if (!selectedSubject) return;

    const updatedTopics = mockTopics[selectedSubject.id].map(topic =>
      topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
    );

    // In a real app, you'd update the database
    mockTopics[selectedSubject.id] = updatedTopics;

    // Update subject progress
    const completedCount = updatedTopics.filter(topic => topic.completed).length;
    const progress = (completedCount / updatedTopics.length) * 100;

    const updatedSubject = { ...selectedSubject, progress, completedTopics: completedCount };
    setSelectedSubject(updatedSubject);

    // Update subjects list
    setSubjects(prev => prev.map(subject =>
      subject.id === selectedSubject.id ? updatedSubject : subject
    ));

    // In a real app, you'd save to database
    databaseService.updateSubjectProgress(selectedSubject.id, progress);
  };

  const addTopic = () => {
    if (!newTopic.name || !selectedSubject) {
      Alert.alert('Error', 'Please fill in the topic name');
      return;
    }

    const topic: Topic = {
      id: `topic-${Date.now()}`,
      name: newTopic.name!,
      difficulty: newTopic.difficulty!,
      notes: newTopic.notes || '',
      completed: false,
    };

    // In a real app, you'd save this to the database
    if (!mockTopics[selectedSubject.id]) {
      mockTopics[selectedSubject.id] = [];
    }
    mockTopics[selectedSubject.id].push(topic);

    setShowTopicModal(false);
    setNewTopic({
      name: '',
      difficulty: 'medium',
      notes: '',
    });

    Alert.alert('Success', 'Topic added successfully!');
  };

  const addSubject = () => {
    if (!newSubject.name || !newSubject.color) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const subject: Subject = {
      id: newSubject.name.toLowerCase().replace(/\s+/g, '-'),
      name: newSubject.name!,
      color: newSubject.color!,
      progress: 0,
      totalTopics: 0,
      completedTopics: 0,
      examType: newSubject.examType!,
    };

    // In a real app, you'd save this to the database
    setSubjects(prev => [...prev, subject]);
    setShowSubjectModal(false);
    setNewSubject({
      name: '',
      color: currentTheme.colors.primary,
      examType: 'jeeMains',
    });

    Alert.alert('Success', 'Subject added successfully!');
  };

  const renderSubjectCard = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={[
        styles.subjectCard,
        { backgroundColor: currentTheme.colors.surface, borderLeftColor: item.color },
      ]}
      onPress={() => setSelectedSubject(item)}
    >
      <View style={styles.subjectHeader}>
        <View style={styles.subjectInfo}>
          <View style={[styles.subjectColor, { backgroundColor: item.color }]} />
          <Text style={[styles.subjectName, { color: currentTheme.colors.text }]}>
            {item.name}
          </Text>
        </View>
        <Text style={[styles.subjectProgress, { color: currentTheme.colors.textSecondary }]}>
          {item.progress}%
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${item.progress}%`, backgroundColor: item.color },
          ]}
        />
      </View>

      <View style={styles.subjectStats}>
        <Text style={[styles.statText, { color: currentTheme.colors.textSecondary }]}>
          📚 {item.completedTopics}/{item.totalTopics} Topics
        </Text>
        <Text style={[styles.statText, { color: currentTheme.colors.textSecondary }]}>
          🎯 {item.examType}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTopicItem = ({ item }: { item: Topic }) => (
    <View style={[styles.topicItem, { backgroundColor: currentTheme.colors.card }]}>
      <View style={styles.topicHeader}>
        <TouchableOpacity
          style={[
            styles.completionCheckbox,
            {
              backgroundColor: item.completed ? currentTheme.colors.success : 'transparent',
              borderColor: currentTheme.colors.border,
            },
          ]}
          onPress={() => toggleTopicCompletion(item.id)}
        >
          {item.completed && <Icon name="check" size={16} color="white" />}
        </TouchableOpacity>

        <View style={styles.topicInfo}>
          <Text
            style={[
              styles.topicName,
              {
                color: currentTheme.colors.text,
                textDecorationLine: item.completed ? 'line-through' : 'none',
              },
            ]}
          >
            {item.name}
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>

      {item.notes && (
        <Text style={[styles.topicNotes, { color: currentTheme.colors.textSecondary }]}>
          📝 {item.notes}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          📚 Subjects & Topics
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={() => setShowSubjectModal(true)}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {!selectedSubject ? (
        // Subjects List
        <FlatList
          data={subjects}
          renderItem={renderSubjectCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.subjectsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // Topics List for Selected Subject
        <View style={styles.topicsContainer}>
          <View style={[styles.topicsHeader, { backgroundColor: currentTheme.colors.surface }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedSubject(null)}
            >
              <Icon name="arrow-back" size={24} color={currentTheme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.topicsTitle, { color: currentTheme.colors.text }]}>
              {selectedSubject.name} Topics
            </Text>
            <TouchableOpacity
              style={[styles.addTopicButton, { backgroundColor: currentTheme.colors.primary }]}
              onPress={() => setShowTopicModal(true)}
            >
              <Icon name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={mockTopics[selectedSubject.id] || []}
            renderItem={renderTopicItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.topicsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Add Subject Modal */}
      <Modal
        visible={showSubjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
                Add New Subject
              </Text>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Icon name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.colors.card,
                    color: currentTheme.colors.text,
                    borderColor: currentTheme.colors.border,
                  },
                ]}
                placeholder="Subject Name"
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={newSubject.name}
                onChangeText={(text) => setNewSubject(prev => ({ ...prev, name: text }))}
              />

              <View style={styles.colorPicker}>
                <Text style={[styles.colorPickerLabel, { color: currentTheme.colors.text }]}>
                  Choose Color:
                </Text>
                <View style={styles.colorOptions}>
                  {[
                    currentTheme.colors.physics,
                    currentTheme.colors.chemistry,
                    currentTheme.colors.math,
                    currentTheme.colors.primary,
                    currentTheme.colors.secondary,
                  ].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newSubject.color === color && styles.selectedColor,
                      ]}
                      onPress={() => setNewSubject(prev => ({ ...prev, color }))}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.examTypeSelector}>
                <Text style={[styles.examTypeLabel, { color: currentTheme.colors.text }]}>
                  Exam Type:
                </Text>
                <View style={styles.examTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.examTypeButton,
                      {
                        backgroundColor:
                          newSubject.examType === 'jeeMains' ? currentTheme.colors.jeeMains : currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                      },
                    ]}
                    onPress={() => setNewSubject(prev => ({ ...prev, examType: 'jeeMains' }))}
                  >
                    <Text
                      style={[
                        styles.examTypeButtonText,
                        {
                          color:
                            newSubject.examType === 'jeeMains' ? 'white' : currentTheme.colors.text,
                        },
                      ]}
                    >
                      JEE Mains
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.examTypeButton,
                      {
                        backgroundColor:
                          newSubject.examType === 'jeeAdvanced' ? currentTheme.colors.jeeAdvanced : currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                      },
                    ]}
                    onPress={() => setNewSubject(prev => ({ ...prev, examType: 'jeeAdvanced' }))}
                  >
                    <Text
                      style={[
                        styles.examTypeButtonText,
                        {
                          color:
                            newSubject.examType === 'jeeAdvanced' ? 'white' : currentTheme.colors.text,
                        },
                      ]}
                    >
                      JEE Advanced
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentTheme.colors.border }]}
                onPress={() => setShowSubjectModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: currentTheme.colors.primary }]}
                onPress={addSubject}
              >
                <Text style={[styles.saveButtonText, { color: currentTheme.colors.onPrimary }]}>
                  Add Subject
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        visible={showTopicModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTopicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.colors.text }]}>
                Add New Topic
              </Text>
              <TouchableOpacity onPress={() => setShowTopicModal(false)}>
                <Icon name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.colors.card,
                    color: currentTheme.colors.text,
                    borderColor: currentTheme.colors.border,
                  },
                ]}
                placeholder="Topic Name"
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={newTopic.name}
                onChangeText={(text) => setNewTopic(prev => ({ ...prev, name: text }))}
              />

              <Text style={[styles.difficultyLabel, { color: currentTheme.colors.text }]}>
                Difficulty:
              </Text>
              <View style={styles.difficultyButtons}>
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      {
                        backgroundColor:
                          newTopic.difficulty === difficulty ? getDifficultyColor(difficulty) : currentTheme.colors.card,
                        borderColor: currentTheme.colors.border,
                      },
                    ]}
                    onPress={() => setNewTopic(prev => ({ ...prev, difficulty }))}
                  >
                    <Text
                      style={[
                        styles.difficultyButtonText,
                        {
                          color:
                            newTopic.difficulty === difficulty ? 'white' : currentTheme.colors.text,
                        },
                      ]}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: currentTheme.colors.card,
                    color: currentTheme.colors.text,
                    borderColor: currentTheme.colors.border,
                  },
                ]}
                placeholder="Notes (optional)"
                placeholderTextColor={currentTheme.colors.textSecondary}
                value={newTopic.notes}
                onChangeText={(text) => setNewTopic(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentTheme.colors.border }]}
                onPress={() => setShowTopicModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: currentTheme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: currentTheme.colors.primary }]}
                onPress={addTopic}
              >
                <Text style={[styles.saveButtonText, { color: currentTheme.colors.onPrimary }]}>
                  Add Topic
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
  },
  subjectsList: {
    padding: 16,
  },
  subjectCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '600',
  },
  subjectProgress: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 14,
  },
  topicsContainer: {
    flex: 1,
  },
  topicsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  topicsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  addTopicButton: {
    padding: 8,
    borderRadius: 16,
  },
  topicsList: {
    padding: 16,
  },
  topicItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  topicNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
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
  colorPicker: {
    marginBottom: 16,
  },
  colorPickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
    borderWidth: 3,
  },
  examTypeSelector: {
    marginBottom: 16,
  },
  examTypeLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  examTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  examTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  examTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  difficultyLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  difficultyButtonText: {
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

export default SubjectsScreen;
