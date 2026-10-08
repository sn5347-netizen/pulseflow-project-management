import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Kanban,
  List as ListIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { Project, Task, TaskPriority, TaskStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<(Project & { tasks: Task[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state: 'list' or 'board'
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');

  // Filter & Search states
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('ALL');

  // Modals
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('PENDING');
  const [taskDueDate, setTaskDueDate] = useState('');

  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.projects.getById(id);
      setProject(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const openAddTaskModal = (defaultStatus?: TaskStatus) => {
    setTaskName('');
    setTaskDesc('');
    setTaskPriority('MEDIUM');
    setTaskStatus(defaultStatus || 'PENDING');
    setTaskDueDate('');
    setIsAddTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskName(task.name);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !taskName.trim()) return;

    try {
      setIsSubmitting(true);
      await api.tasks.create({
        projectId: id,
        name: taskName.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || undefined,
      });
      setIsAddTaskModalOpen(false);
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !taskName.trim()) return;

    try {
      setIsSubmitting(true);
      await api.tasks.update(editingTask.id, {
        name: taskName.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || undefined,
      });
      setEditingTask(null);
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTaskSubmit = async () => {
    if (!deletingTask) return;

    try {
      setIsSubmitting(true);
      await api.tasks.delete(deletingTask.id);
      setDeletingTask(null);
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskCompleted = async (task: Task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.tasks.update(task.id, { status: nextStatus });
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update task.');
    }
  };

  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.tasks.update(taskId, { status: newStatus });
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  // Filter tasks in memory based on search & filters
  const filteredTasks = (project?.tasks || []).filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(taskSearch.toLowerCase()));
    const matchesStatus = taskStatusFilter === 'ALL' || task.status === taskStatusFilter;
    const matchesPriority = taskPriorityFilter === 'ALL' || task.priority === taskPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading && !project) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-200">Failed to load project</h3>
        <p className="text-sm text-slate-400 mt-1 mb-4">{error || 'Project not found.'}</p>
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
      </div>
    );
  }

  const kanbanColumns: Array<{ id: TaskStatus; label: string; color: string }> = [
    { id: 'PENDING', label: 'Pending', color: 'border-amber-500/40 text-amber-400' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-indigo-500/40 text-indigo-400' },
    { id: 'COMPLETED', label: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all projects</span>
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openAddTaskModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Completion Progress</span>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white shrink-0">
                {project.progressPercent}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Task Breakdown</span>
            <span className="text-sm font-semibold text-slate-200">
              {project.completedTasks} completed / {project.totalTasks} total
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">Timeline</span>
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No start'}
                {' ➔ '}
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No end'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Filters & View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* List / Kanban View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl self-end lg:self-auto border border-slate-700/80">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'board'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE: KANBAN BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {kanbanColumns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[450px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openAddTaskModal(col.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                      No tasks in this lane
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-xl p-4 transition-all shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => handleToggleTaskCompleted(task)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                              task.status === 'COMPLETED'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-500 hover:border-brand-500 text-transparent'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                          <span
                            className={`text-sm font-medium flex-1 ${
                              task.status === 'COMPLETED'
                                ? 'line-through text-slate-500'
                                : 'text-slate-100'
                            }`}
                          >
                            {task.name}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                          <PriorityBadge priority={task.priority} size="sm" />
                          {task.dueDate && (
                            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Quick Lane Move & Action Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[11px]">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleQuickStatusChange(task.id, e.target.value as TaskStatus)
                            }
                            className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5"
                          >
                            <option value="PENDING">Move to Pending</option>
                            <option value="IN_PROGRESS">Move to In Progress</option>
                            <option value="COMPLETED">Move to Completed</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditTaskModal(task)}
                              className="p-1 rounded text-slate-400 hover:text-slate-200"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTask(task)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No tasks match your criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTaskCompleted(task)}
                      className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-500 hover:border-brand-500 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <h4
                        className={`text-sm font-semibold ${
                          task.status === 'COMPLETED'
                            ? 'line-through text-slate-500'
                            : 'text-slate-100'
                        }`}
                      >
                        {task.name}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                    <StatusBadge status={task.status} size="sm" />
                    <PriorityBadge priority={task.priority} size="sm" />
                    {task.dueDate && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                      <button
                        onClick={() => openEditTaskModal(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTask(task)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add New Task"
      >
        <form onSubmit={handleAddTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Implement refresh tokens"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Details, acceptance criteria..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        <form onSubmit={handleEditTaskSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Task Confirmation Modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <span className="font-semibold text-white">"{deletingTask?.name}"</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDeletingTask(null)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteTaskSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
