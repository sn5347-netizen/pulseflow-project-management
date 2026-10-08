import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { mobileApi } from '../services/api';

export const TasksScreen: React.FC<{ initialProjectId?: string }> = ({ initialProjectId }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskStatus, setTaskStatus] = useState('PENDING');
  const [taskProjectId, setTaskProjectId] = useState(initialProjectId || '');

  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        mobileApi.tasks.getAll({
          projectId: initialProjectId,
          search,
          status: statusFilter,
          priority: priorityFilter,
        }),
        mobileApi.projects.getAll(),
      ]);
      setTasks(tRes.data);
      setProjects(pRes.data);
      if (!taskProjectId && pRes.data.length > 0) {
        setTaskProjectId(pRes.data[0].id);
      }
    } catch (err: any) {
      console.warn('Tasks sync error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, priorityFilter, initialProjectId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleToggleComplete = async (task: any) => {
    try {
      const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await mobileApi.tasks.update(task.id, { status: next });
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCreateTask = async () => {
    if (!taskName.trim() || !taskProjectId) {
      Alert.alert('Validation Error', 'Task name and project are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await mobileApi.tasks.create({
        name: taskName.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        projectId: taskProjectId,
      });
      setIsCreateModalOpen(false);
      setTaskName('');
      setTaskDesc('');
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !taskName.trim()) return;

    setIsSubmitting(true);
    try {
      await mobileApi.tasks.update(editingTask.id, {
        name: taskName.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        projectId: taskProjectId,
      });
      setEditingTask(null);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = (task: any) => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await mobileApi.tasks.delete(task.id);
            fetchData();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const openEdit = (task: any) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskProjectId(task.projectId);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search tasks..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <View style={styles.chipsContainer}>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, statusFilter === s && styles.chipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
                {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Prog' : s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chipsContainer}>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chipSmall, priorityFilter === p && styles.chipActive]}
              onPress={() => setPriorityFilter(p)}
            >
              <Text
                style={[
                  styles.chipText,
                  priorityFilter === p && styles.chipTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && tasks.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
              colors={['#6366f1']}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  item.status === 'COMPLETED' && styles.checkboxCompleted,
                ]}
                onPress={() => handleToggleComplete(item)}
              >
                {item.status === 'COMPLETED' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskName,
                    item.status === 'COMPLETED' && styles.taskCompleted,
                  ]}
                >
                  {item.name}
                </Text>

                {item.description ? (
                  <Text style={styles.taskDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  <View style={[styles.badge, styles[`priority_${item.priority}`]]}>
                    <Text style={styles.badgeText}>{item.priority}</Text>
                  </View>
                  <View style={[styles.badge, styles[`status_${item.status}`]]}>
                    <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.projectName}>
                    📁 {item.project?.name || 'Project'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsColumn}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTask(item)} style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setTaskName('');
          setTaskDesc('');
          setTaskPriority('MEDIUM');
          setTaskStatus('PENDING');
          setIsCreateModalOpen(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create / Edit Task Modal */}
      <Modal
        visible={isCreateModalOpen || !!editingTask}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>

            <Text style={styles.modalLabel}>Project</Text>
            <View style={styles.projectPillsRow}>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.projectPill,
                    taskProjectId === p.id && styles.projectPillActive,
                  ]}
                  onPress={() => setTaskProjectId(p.id)}
                >
                  <Text
                    style={[
                      styles.projectPillText,
                      taskProjectId === p.id && styles.projectPillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Task Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Test Keystore auth"
              placeholderTextColor="#64748b"
              value={taskName}
              onChangeText={setTaskName}
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="Notes or requirements..."
              placeholderTextColor="#64748b"
              value={taskDesc}
              onChangeText={setTaskDesc}
              multiline
            />

            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.selectRow}>
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.selectOption,
                    taskPriority === p && styles.selectOptionActive,
                  ]}
                  onPress={() => setTaskPriority(p)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      taskPriority === p && styles.selectOptionTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.selectRow}>
              {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.selectOption,
                    taskStatus === s && styles.selectOptionActive,
                  ]}
                  onPress={() => setTaskStatus(s)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      taskStatus === s && styles.selectOptionTextActive,
                    ]}
                  >
                    {s === 'PENDING' ? 'Pending' : s === 'IN_PROGRESS' ? 'Active' : 'Done'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsCreateModalOpen(false);
                  setEditingTask(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingTask ? handleEditTask : handleCreateTask}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingTask ? 'Save' : 'Create'}
                  </Text>
                )}
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
    backgroundColor: '#020617',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  filterRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  taskCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  taskDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f8fafc',
  },
  priority_HIGH: { backgroundColor: '#ef4444' },
  priority_MEDIUM: { backgroundColor: '#f59e0b' },
  priority_LOW: { backgroundColor: '#64748b' },
  status_PENDING: { backgroundColor: '#334155' },
  status_IN_PROGRESS: { backgroundColor: '#4f46e5' },
  status_COMPLETED: { backgroundColor: '#10b981' },
  projectName: {
    color: '#94a3b8',
    fontSize: 11,
  },
  actionsColumn: {
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 4,
  },
  actionBtnText: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 34,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  projectPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    maxWidth: 140,
  },
  projectPillActive: {
    backgroundColor: '#6366f1',
  },
  projectPillText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  projectPillTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    marginBottom: 10,
    fontSize: 13,
  },
  selectRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  selectOption: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    alignItems: 'center',
  },
  selectOptionActive: {
    backgroundColor: '#4f46e5',
  },
  selectOptionText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  selectOptionTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

