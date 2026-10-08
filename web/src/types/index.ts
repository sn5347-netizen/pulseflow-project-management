export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  _count?: {
    projects: number;
    tasks: number;
  };
}

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks?: number;
  pendingTasks?: number;
  progressPercent: number;
}

export interface Task {
  id: string;
  name: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  userId: string;
  project?: {
    id: string;
    name: string;
    status: ProjectStatus;
  };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  projectsInProgress: number;
  projectsCompleted: number;
  projectsNotStarted: number;
  taskCompletionRate: number;
  projectCompletionRate: number;
  recentProjects: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    createdAt: string;
  }>;
  upcomingTasks: Task[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
  errors?: Array<{ field: string; message: string }>;
}

