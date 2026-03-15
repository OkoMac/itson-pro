import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export interface Invoice {
  id?: string;
  invoiceId?: string;
  customerId: string;
  orderId?: string;
  invoiceType: string;
  description: string;
  total: number;
  taxAmount: number;
  dueDate: string;
  status: string;
  paidAt?: string;
  notes?: string;
  createdAt?: string;
}

export const invoicesService = {
  async list(filters?: { status?: string; customerId?: string; invoiceType?: string; page?: number }) {
    if (isDemoMode) return { invoices: [], total: 0, outstanding: 0 };
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.customerId) params.set('customerId', filters.customerId);
    if (filters?.invoiceType) params.set('invoiceType', filters.invoiceType);
    if (filters?.page) params.set('page', String(filters.page));
    return api.get<{ invoices: Invoice[]; total: number; outstanding: number }>(`/api/invoices?${params}`);
  },

  async get(id: string): Promise<Invoice> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.get<{ invoice: Invoice }>(`/api/invoices/${id}`).then(r => r.invoice);
  },

  async create(data: { customerId: string; orderId?: string; invoiceType?: string; amount: number; taxRate?: number; description: string; dueDate: string }): Promise<Invoice> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.post<{ invoice: Invoice }>('/api/invoices', data).then(r => r.invoice);
  },

  async update(id: string, data: { status?: string; description?: string; dueDate?: string }): Promise<Invoice> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.put<{ invoice: Invoice }>(`/api/invoices/${id}`, data).then(r => r.invoice);
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.delete(`/api/invoices/${id}`);
  },

  async statistics() {
    if (isDemoMode) return null;
    return api.get('/api/invoices/statistics');
  },
};
