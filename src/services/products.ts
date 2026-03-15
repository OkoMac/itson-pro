import { isDemoMode } from '@/lib/supabase';
import { api } from './api';

export interface Product {
  id?: string;
  sku: string;
  productName: string;
  category: string;
  description?: string;
  unitPrice: number;
  costPrice: number;
  stockOnHand: number;
  reorderLevel: number;
  leadTimeDays: number;
  status: string;
  isLowStock?: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export const productsService = {
  async list(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    if (isDemoMode) return { products: [], total: 0 };
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.lowStock) params.set('lowStock', 'true');
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    return api.get<{ products: Product[]; total: number }>(`/api/products?${params}`);
  },

  async get(id: string): Promise<Product> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.get<{ product: Product }>(`/api/products/${id}`).then(r => r.product);
  },

  async create(data: Omit<Product, 'id' | 'isLowStock'>): Promise<Product> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.post<{ product: Product }>('/api/products', data).then(r => r.product);
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.put<{ product: Product }>(`/api/products/${id}`, data).then(r => r.product);
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    return api.delete(`/api/products/${id}`);
  },

  async statistics() {
    if (isDemoMode) return null;
    return api.get('/api/products/statistics');
  },
};
