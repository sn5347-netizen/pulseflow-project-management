import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen: React.FC<{ onNavigateToTasks: () => void }> = ({ onNavigateToTasks }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const res = await mobileApi.dashboard.getStats();
      setStats(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const next = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await mobileApi.tasks.update(taskId, { status: next });
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    }
  };

  if (loading && !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Syncing workspace...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#6366f1"
          colors={['#6366f1']}
        />
      }
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.fullName || 'Teammate'} 👋</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={fetchStats} style={styles.retryButton}>
            <Text style={styles.retryText}>Pull to refresh or tap here</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* KPI Cards Grid */}
      <View style={styles.grid}>
        <View style={[styles.kpiCard, { borderColor: '#4338ca' }]}>
          <Text style={styles.kpiLabel}>Total Projects</Text>
          <Text style={[styles.kpiValue, { color: '#818cf8' }]}>{stats?.totalProjects ?? 0}</Text>
          <Text style={styles.kpiSub}>{stats?.projectsCompleted ?? 0} Completed</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#0284c7' }]}>
          <Text style={styles.kpiLabel}>In Progress</Text>
          <Text style={[styles.kpiValue, { color: '#38bdf8' }]}>{stats?.projectsInProgress ?? 0}</Text>
          <Text style={styles.kpiSub}>Active Sprints</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#7c3aed' }]}>
          <Text style={styles.kpiLabel}>Total Tasks</Text>
          <Text style={[styles.kpiValue, { color: '#c084fc' }]}>{stats?.totalTasks ?? 0}</Text>
          <Text style={styles.kpiSub}>{stats?.taskCompletionRate ?? 0}% Finished</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: '#d97706' }]}>
          <Text style={styles.kpiLabel}>Pending Tasks</Text>
          <Text style={[styles.kpiValue, { color: '#fbbf24' }]}>{stats?.pendingTasks ?? 0}</Text>
          <Text style={styles.kpiSub}>{stats?.inProgressTasks ?? 0} Doing</Text>
        </View>
      </View>

      {/* Big Completed Tasks Card */}
      <View style={[styles.wideCard, { borderColor: '#059669' }]}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.kpiLabel}>Completed Tasks</Text>
            <Text style={[styles.kpiValue, { color: '#34d399' }]}>{stats?.completedTasks ?? 0}</Text>
          </View>
          <View style={styles.badgeSuccess}>
            <Text style={styles.badgeSuccessText}>{stats?.taskCompletionRate ?? 0}% Rate</Text>
          </View>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${stats?.taskCompletionRate ?? 0}%` }]}
          />
        </View>
      </View>

      {/* Urgent Tasks Section */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Active & Urgent Tasks</Text>
          <TouchableOpacity onPress={onNavigateToTasks}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {(!stats?.upcomingTasks || stats.upcomingTasks.length === 0) ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No pending tasks due. Great job!</Text>
          </View>
        ) : (
          stats.upcomingTasks.map((task: any) => (
            <View key={task.id} style={styles.taskCard}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  task.status === 'COMPLETED' && styles.checkboxCompleted,
                ]}
                onPress={() => handleToggleTask(task.id, task.status)}
              >
                {task.status === 'COMPLETED' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskName,
                    task.status === 'COMPLETED' && styles.taskCompleted,
                  ]}
                >
                  {task.name}
                </Text>
                <View style={styles.taskMetaRow}>
                  <Text style={[styles.priorityBadge, styles[`priority_${task.priority}`]]}>
                    {task.priority}
                  </Text>
                  <Text style={styles.projectNameText}>
                    📁 {task.project?.name || 'Project'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 14,
  },
  userName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: 'rgba(185, 28, 28, 0.2)',
    borderWidth: 1,
    borderColor: '#b91c1c',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
  },
  retryButton: {
    marginTop: 6,
  },
  retryText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  wideCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 6,
  },
  kpiSub: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSuccessText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
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
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priority_HIGH: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
  },
  priority_MEDIUM: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
  },
  priority_LOW: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    color: '#94a3b8',
  },
  projectNameText: {
    color: '#94a3b8',
    fontSize: 11,
  },
});

