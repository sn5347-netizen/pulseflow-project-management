import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  ArrowRight,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Create Project Modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('NOT_STARTED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.dashboard.getStats();
      setStats(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setIsSubmitting(true);
      await api.projects.create({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
        status: newProjectStatus,
      });
      setIsProjectModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.tasks.update(taskId, { status: nextStatus });
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-200">Error loading dashboard</h3>
        <p className="text-sm text-slate-400 mt-1 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-medium text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      subtitle: `${stats?.projectsCompleted ?? 0} finished`,
    },
    {
      title: 'Projects In Progress',
      value: stats?.projectsInProgress ?? 0,
      icon: Activity,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
      subtitle: `${stats?.projectsNotStarted ?? 0} not started`,
    },
    {
      title: 'Total Tasks',
      value: stats?.totalTasks ?? 0,
      icon: RefreshCw,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      subtitle: `${stats?.taskCompletionRate ?? 0}% completed`,
    },
    {
      title: 'Pending Tasks',
      value: stats?.pendingTasks ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      subtitle: `${stats?.inProgressTasks ?? 0} in progress`,
    },
    {
      title: 'Completed Tasks',
      value: stats?.completedTasks ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      subtitle: 'Great progress!',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Executive Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time project velocity and task metrics across all initiatives
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-white tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Velocity Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-200">
            Overall Task Velocity
          </span>
          <span className="text-sm font-bold text-brand-400">
            {stats?.taskCompletionRate ?? 0}% Finished
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${stats?.taskCompletionRate ?? 0}%` }}
          />
        </div>
      </div>

      {/* Split Grid: Recent Projects & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-indigo-400" />
              Recent Projects
            </h2>
            <Link
              to="/projects"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {(!stats?.recentProjects || stats.recentProjects.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No projects yet. Click 'New Project' to create one!
              </p>
            ) : (
              stats.recentProjects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="block p-4 rounded-xl border border-slate-800/60 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-100 hover:text-brand-300 transition-colors">
                      {p.name}
                    </span>
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${p.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-medium shrink-0">
                      {p.completedTasks}/{p.totalTasks} tasks ({p.progressPercent}%)
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Priority / Upcoming Tasks */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Active & Urgent Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {(!stats?.upcomingTasks || stats.upcomingTasks.length === 0) ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No active pending tasks. All clear!
              </p>
            ) : (
              stats.upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-800/30 flex items-start gap-3 hover:border-slate-700 transition-all"
                >
                  <button
                    onClick={() => handleToggleTaskStatus(t.id, t.status)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-brand-500 text-transparent'
                    }`}
                    title="Click to toggle completion"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        t.status === 'COMPLETED'
                          ? 'line-through text-slate-500'
                          : 'text-slate-200'
                      }`}
                    >
                      {t.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <PriorityBadge priority={t.priority} size="sm" />
                      <span className="text-xs text-slate-400">
                        📁 {t.project?.name || 'Project'}
                      </span>
                      {t.dueDate && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Create Project Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Q4 Growth Sprint"
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Goals, deliverables and scope..."
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Initial Status
            </label>
            <select
              value={newProjectStatus}
              onChange={(e) => setNewProjectStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

