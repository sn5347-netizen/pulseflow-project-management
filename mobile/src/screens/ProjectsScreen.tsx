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

export const ProjectsScreen: React.FC<{
  onSelectProject: (project: any) => void;
}> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Project Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await mobileApi.projects.getAll({
        search,
        status: statusFilter,
      });
      setProjects(res.data);
    } catch (err: any) {
      console.warn('Projects fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const handleCreateProject = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Project name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await mobileApi.projects.create({
        name: name.trim(),
        description: desc.trim() || undefined,
        status,
      });
      setIsModalOpen(false);
      setName('');
      setDesc('');
      fetchProjects();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterTabs = ['ALL', 'IN_PROGRESS', 'NOT_STARTED', 'COMPLETED'];

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search projects by name..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipScroll}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.chip, statusFilter === tab && styles.chipActive]}
            onPress={() => setStatusFilter(tab)}
          >
            <Text style={[styles.chipText, statusFilter === tab && styles.chipTextActive]}>
              {tab.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && projects.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={projects}
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
              <Text style={styles.emptyText}>No projects found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.projectCard}
              onPress={() => onSelectProject(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.projectName}>{item.name}</Text>
                <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
                  <Text style={[styles.statusText, styles[`statusText_${item.status}`]]}>
                    {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              {item.description ? (
                <Text style={styles.projectDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {/* Progress info */}
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.progressPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercent}>{item.progressPercent}%</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.taskCountText}>
                  📋 {item.completedTasks}/{item.totalTasks} tasks completed
                </Text>
                <Text style={styles.viewTasksText}>View Tasks →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalOpen(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Project Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>

            <Text style={styles.modalLabel}>Project Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Mobile App v1.0"
              placeholderTextColor="#64748b"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="Scope and goals..."
              placeholderTextColor="#64748b"
              value={desc}
              onChangeText={setDesc}
              multiline
            />

            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusSelectRow}>
              {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    status === s && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === s && styles.statusOptionTextActive,
                    ]}
                  >
                    {s === 'NOT_STARTED' ? 'Not Started' : s === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateProject}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Create</Text>
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
  chipScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
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
    fontSize: 11,
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
  projectCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  projectName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  status_NOT_STARTED: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  statusText_NOT_STARTED: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  status_IN_PROGRESS: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  statusText_IN_PROGRESS: {
    color: '#818cf8',
    fontSize: 10,
    fontWeight: '700',
  },
  status_COMPLETED: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusText_COMPLETED: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  projectDesc: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressPercent: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  taskCountText: {
    color: '#64748b',
    fontSize: 11,
  },
  viewTasksText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
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
    marginBottom: 16,
  },
  modalLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    marginBottom: 12,
    fontSize: 13,
  },
  statusSelectRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#4f46e5',
  },
  statusOptionText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  statusOptionTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
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

