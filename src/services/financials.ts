import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export const financialsService = {
  async getSummary() {
    if (isDemoMode) return null;
    return api.get('/api/financials/summary');
  },

  async getMonthly() {
    if (isDemoMode) return { months: [] };
    return api.get('/api/financials/monthly');
  },

  async getCostCenters(filters?: { status?: string; department?: string }) {
    if (isDemoMode) return { costCenters: [], total: 0 };
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.department) params.set('department', filters.department);
    return api.get<{ costCenters: any[]; total: number }>(`/api/financials/cost-centers?${params}`);
  },

  async updateCostCenter(id: string, data: { budget?: number; spent?: number; committed?: number; status?: string }) {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.put(`/api/financials/cost-centers/${id}`, data);
  },

  async getDataCenters() {
    if (isDemoMode) return { dataCenters: [] };
    return api.get('/api/financials/data-centers');
  },
};
