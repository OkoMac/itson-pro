import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export interface Approval {
  id?: string;
  approvalId?: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  approvedBy?: string;
  status: string;
  comments?: string;
  createdAt?: string;
}

export const approvalsService = {
  async list(filters?: { status?: string; entityType?: string; page?: number }) {
    if (isDemoMode) return { approvals: [], total: 0 };
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.page) params.set('page', String(filters.page));
    return api.get<{ approvals: Approval[]; total: number }>(`/api/approvals?${params}`);
  },

  async get(id: string): Promise<Approval> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.get<{ approval: Approval }>(`/api/approvals/${id}`).then(r => r.approval);
  },

  async create(data: Pick<Approval, 'entityType' | 'entityId' | 'requestedBy' | 'comments'>): Promise<Approval> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.post<{ approval: Approval }>('/api/approvals', data).then(r => r.approval);
  },

  async process(id: string, action: 'approve' | 'reject', comments?: string): Promise<Approval> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.post<{ approval: Approval }>(`/api/approvals/${id}/process`, { action, comments }).then(r => r.approval);
  },

  async statistics() {
    if (isDemoMode) return null;
    return api.get('/api/approvals/statistics');
  },
};
