import { ApiResponse, DashboardStats, Project, Task, User } from '../types';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'https://pulseflow-backend-mr0f.onrender.com/api');

export class ApiError extends Error {
  status: number;
  errors?: Array<{ field: string; message: string }>;
  code?: string;

  constructor(message: string, status: number, errors?: Array<{ field: string; message: string }>, code?: string) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:expired', { detail: data.message || 'Session expired' }));
      }

      throw new ApiError(
        data.message || `Request failed with status ${res.status}`,
        res.status,
        data.errors,
        data.code
      );
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network connection failed. Please check your internet.', 0);
  }
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<ApiResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { fullName: string; email: string; password: string }) =>
      request<ApiResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      request<ApiResponse>('/auth/logout', {
        method: 'POST',
      }),
    me: () => request<{ success: boolean; user: User }>('/auth/me'),
  },

  projects: {
    getAll: (params?: { search?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; data: Project[]; count: number }>(`/projects${qs}`);
    },
    getById: (id: string) =>
      request<{ success: boolean; data: Project & { tasks: Task[] } }>(`/projects/${id}`),
    create: (data: { name: string; description?: string; status?: string; startDate?: string; endDate?: string }) =>
      request<{ success: boolean; data: Project }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Project>) =>
      request<{ success: boolean; data: Project }>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<ApiResponse>(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  tasks: {
    getAll: (params?: { projectId?: string; search?: string; status?: string; priority?: string }) => {
      const query = new URLSearchParams();
      if (params?.projectId && params.projectId !== 'ALL') query.append('projectId', params.projectId);
      if (params?.search) query.append('search', params.search);
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      if (params?.priority && params.priority !== 'ALL') query.append('priority', params.priority);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; data: Task[]; count: number }>(`/tasks${qs}`);
    },
    getById: (id: string) =>
      request<{ success: boolean; data: Task }>(`/tasks/${id}`),
    create: (data: {
      name: string;
      description?: string;
      priority?: string;
      status?: string;
      dueDate?: string;
      projectId: string;
    }) =>
      request<{ success: boolean; data: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Task>) =>
      request<{ success: boolean; data: Task }>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<ApiResponse>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  dashboard: {
    getStats: () =>
      request<{ success: boolean; data: DashboardStats }>('/dashboard'),
  },
};

