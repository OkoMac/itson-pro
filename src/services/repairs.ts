import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export interface Repair {
  id?: string;
  repairId?: string;
  customerId: string;
  deviceType: string;
  serialNumber?: string;
  issue: string;
  status: string;
  estimatedCost?: number;
  actualCost?: number;
  estimatedCompletion?: string;
  completedAt?: string;
  notes?: string;
  createdAt?: string;
}

export const repairsService = {
  async list(filters?: { status?: string; customerId?: string; search?: string; page?: number }) {
    if (isDemoMode) return { repairs: [], total: 0 };
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.customerId) params.set('customerId', filters.customerId);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    return api.get<{ repairs: Repair[]; total: number }>(`/api/repairs?${params}`);
  },

  async get(id: string): Promise<Repair> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.get<{ repair: Repair }>(`/api/repairs/${id}`).then(r => r.repair);
  },

  async create(data: Pick<Repair, 'customerId' | 'deviceType' | 'issue' | 'estimatedCost' | 'estimatedCompletion'>): Promise<Repair> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.post<{ repair: Repair }>('/api/repairs', data).then(r => r.repair);
  },

  async update(id: string, data: Partial<Repair>): Promise<Repair> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.put<{ repair: Repair }>(`/api/repairs/${id}`, data).then(r => r.repair);
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.delete(`/api/repairs/${id}`);
  },

  async statistics() {
    if (isDemoMode) return null;
    return api.get('/api/repairs/statistics');
  },
};
