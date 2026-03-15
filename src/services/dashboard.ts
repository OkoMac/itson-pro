import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export const dashboardService = {
  async getSummary() {
    if (isDemoMode) return null;
    return api.get('/api/dashboard');
  },

  async getEvents(filters?: { entityType?: string; eventType?: string; page?: number; limit?: number }) {
    if (isDemoMode) return { events: [], total: 0 };
    const params = new URLSearchParams();
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.eventType) params.set('eventType', filters.eventType);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    return api.get<{ events: any[]; total: number }>(`/api/dashboard/events?${params}`);
  },
};
