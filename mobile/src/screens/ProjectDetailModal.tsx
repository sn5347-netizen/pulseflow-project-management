import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { mobileApi } from '../services/api';

export const ProjectDetailModal: React.FC<{
  project: any | null;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjectTasks = async () => {
    if (!project) return;
    try {
      setLoading(true);
      const res = await mobileApi.tasks.getAll({ projectId: project.id });
      setTasks(res.data);
    } catch (e: any) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project) {
      fetchProjectTasks();
    }
  }, [project]);

  if (!project) return null;

  const handleToggleComplete = async (task: any) => {
    try {
      const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await mobileApi.tasks.update(task.id, { status: next });
      fetchProjectTasks();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <Modal visible={!!project} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {project.name}
          </Text>
        </View>

        <View style={styles.detailsBox}>
          <Text style={styles.projectName}>{project.name}</Text>
          {project.description ? (
            <Text style={styles.projectDesc}>{project.description}</Text>
          ) : null}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Status: {project.status.replace('_', ' ')}
            </Text>
            <Text style={styles.progressLabel}>
              Tasks: {project.completedTasks}/{project.totalTasks} ({project.progressPercent}%)
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Tasks in this Project</Text>

        {loading ? (
          <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No tasks yet in this project.</Text>
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
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskName,
                      item.status === 'COMPLETED' && styles.taskCompleted,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.taskMeta}>
                    Priority: {item.priority} • Status: {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginRight: 12,
  },
  backButtonText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  detailsBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  projectName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  projectDesc: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  progressLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  empty: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  taskCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  taskName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  taskMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
});

