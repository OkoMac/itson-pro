import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export interface StockMovement {
  id?: string;
  transactionId?: string;
  sku: string;
  transactionType: string;
  qty: number;
  unitCost?: number;
  referenceId?: string;
  notes?: string;
  createdAt?: string;
}

export const stockService = {
  async listMovements(filters?: { sku?: string; transactionType?: string; page?: number; limit?: number }) {
    if (isDemoMode) return { movements: [], total: 0 };
    const params = new URLSearchParams();
    if (filters?.sku) params.set('sku', filters.sku);
    if (filters?.transactionType) params.set('transactionType', filters.transactionType);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    return api.get<{ movements: StockMovement[]; total: number }>(`/api/stock?${params}`);
  },

  async adjust(data: { productId: string; quantity: number; transactionType: string; referenceId?: string; notes?: string }) {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.post('/api/stock/adjust', data);
  },

  async getLowStock() {
    if (isDemoMode) return { products: [] };
    return api.get('/api/stock/low-stock');
  },

  async getSummary() {
    if (isDemoMode) return null;
    return api.get('/api/stock/summary');
  },
};
