import { Platform } from 'react-native';
import { storage } from './storage';

// In Android emulator, 10.0.2.2 maps to the host machine's localhost
// In Web / iOS, localhost works. User can also override to their Wi-Fi LAN IP (e.g. 192.168.1.50)
const DEFAULT_HOST = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  web: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
}) || 'http://localhost:5000/api';

let currentBaseUrl = DEFAULT_HOST;
let authExpiredCallback: ((msg: string) => void) | null = null;
let networkStatusCallback: ((isOnline: boolean) => void) | null = null;

export const setApiBaseUrl = (url: string) => {
  currentBaseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
};

export const getApiBaseUrl = () => currentBaseUrl;

export const setOnAuthExpired = (cb: (msg: string) => void) => {
  authExpiredCallback = cb;
};

export const setOnNetworkStatusChange = (cb: (isOnline: boolean) => void) => {
  networkStatusCallback = cb;
};

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await storage.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${currentBaseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (networkStatusCallback) {
      networkStatusCallback(true);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or unauthorized
        await storage.removeToken();
        await storage.removeUser();
        const msg = data.message || 'Your login session has expired. Please sign in again.';
        if (authExpiredCallback) {
          authExpiredCallback(msg);
        }
      }

      throw new Error(data.message || `Request failed (${res.status})`);
    }

    return data as T;
  } catch (error: any) {
    // Check if network error
    if (error.message?.includes('Network') || error.message?.includes('Failed to fetch') || error.message?.includes('timed out')) {
      if (networkStatusCallback) {
        networkStatusCallback(false);
      }
      throw new Error('No network connection. Please check your internet or server address.');
    }
    throw error;
  }
}

export const mobileApi = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { fullName: string; email: string; password: string }) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      apiRequest('/auth/logout', {
        method: 'POST',
      }),
    me: () => apiRequest('/auth/me'),
  },

  dashboard: {
    getStats: () => apiRequest('/dashboard'),
  },

  projects: {
    getAll: (params?: { search?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.status && params.status !== 'ALL') q.append('status', params.status);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiRequest(`/projects${qs}`);
    },
    getById: (id: string) => apiRequest(`/projects/${id}`),
    create: (data: { name: string; description?: string; status?: string; startDate?: string; endDate?: string }) =>
      apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  tasks: {
    getAll: (params?: { projectId?: string; search?: string; status?: string; priority?: string }) => {
      const q = new URLSearchParams();
      if (params?.projectId && params.projectId !== 'ALL') q.append('projectId', params.projectId);
      if (params?.search) q.append('search', params.search);
      if (params?.status && params.status !== 'ALL') q.append('status', params.status);
      if (params?.priority && params.priority !== 'ALL') q.append('priority', params.priority);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiRequest(`/tasks${qs}`);
    },
    getById: (id: string) => apiRequest(`/tasks/${id}`),
    create: (data: any) =>
      apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  },
};

