import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export interface Task {
  id?: string;
  taskId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: string;
  completedAt?: string;
  createdAt?: string;
}

export const tasksService = {
  async list(filters?: { status?: string; priority?: string; assignedTo?: string; search?: string; page?: number }) {
    if (isDemoMode) return { tasks: [], total: 0 };
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.assignedTo) params.set('assignedTo', filters.assignedTo);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    return api.get<{ tasks: Task[]; total: number }>(`/api/tasks?${params}`);
  },

  async get(id: string): Promise<Task> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.get<{ task: Task }>(`/api/tasks/${id}`).then(r => r.task);
  },

  async create(data: Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'assignedTo'>): Promise<Task> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.post<{ task: Task }>('/api/tasks', data).then(r => r.task);
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.put<{ task: Task }>(`/api/tasks/${id}`, data).then(r => r.task);
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.delete(`/api/tasks/${id}`);
  },

  async statistics() {
    if (isDemoMode) return null;
    return api.get('/api/tasks/statistics');
  },
};
