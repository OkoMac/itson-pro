import { isDemoMode } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { api } from './api';
import type { Order } from '@/data/seed';

export interface OrderFilters {
  status?: string;
  riskStatus?: string;
  owner?: string;
  customerId?: string;
  search?: string;
}

export interface CreateOrderDto {
  customerId: string;
  poNumber: string;
  owner: string;
  currentStage: string;
  dueDate: string;
  value: number;
}

export interface UpdateOrderDto extends Partial<CreateOrderDto> {
  status?: 'active' | 'closed' | 'cancelled';
  riskStatus?: Order['riskStatus'];
}

// ─── Supabase implementation ──────────────────────────────────────────────────

async function supabaseListOrders(orgId: string, filters?: OrderFilters): Promise<Order[]> {
  if (!supabase) return [];
  let q = supabase.from('orders').select('*').eq('organisation_id', orgId);
  if (filters?.status) q = q.eq('status', filters.status);
  if (filters?.riskStatus) q = q.eq('risk_status', filters.riskStatus);
  if (filters?.owner) q = q.eq('owner', filters.owner);
  if (filters?.customerId) q = q.eq('customer_id', filters.customerId);
  if (filters?.search) q = q.or(`order_ref.ilike.%${filters.search}%,po_number.ilike.%${filters.search}%`);
  const { data, error } = await q.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapDbOrder);
}

async function supabaseCreateOrder(orgId: string, dto: CreateOrderDto): Promise<Order> {
  if (!supabase) throw new Error('Supabase not configured');
  const orderRef = `CLG-${Math.floor(1000 + Math.random() * 9000)}`;
  const { data, error } = await supabase.from('orders').insert({
    organisation_id: orgId,
    order_ref: orderRef,
    customer_id: dto.customerId,
    po_number: dto.poNumber,
    owner: dto.owner,
    current_stage: dto.currentStage,
    due_date: dto.dueDate,
    value: dto.value,
    status: 'active',
    risk_status: 'none',
  }).select().single();
  if (error) throw new Error(error.message);
  return mapDbOrder(data);
}

async function supabaseUpdateOrder(id: string, dto: UpdateOrderDto): Promise<Order> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('orders').update({
    customer_id: dto.customerId,
    po_number: dto.poNumber,
    owner: dto.owner,
    current_stage: dto.currentStage,
    due_date: dto.dueDate,
    value: dto.value,
    status: dto.status,
    risk_status: dto.riskStatus,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapDbOrder(data);
}

async function supabaseDeleteOrder(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

function mapDbOrder(row: any): Order {
  return {
    orderId: row.order_ref,
    customerId: row.customer_id,
    poNumber: row.po_number,
    status: row.status,
    currentStage: row.current_stage,
    owner: row.owner,
    dueDate: row.due_date,
    value: row.value,
    riskStatus: row.risk_status,
    createdAt: row.created_at,
    lines: [],
  };
}

// ─── REST API fallback ────────────────────────────────────────────────────────

async function restListOrders(filters?: OrderFilters): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  return api.get<Order[]>(`/api/orders?${params}`);
}

// ─── Public service interface ─────────────────────────────────────────────────

export const ordersService = {
  async list(orgId: string, filters?: OrderFilters): Promise<Order[]> {
    if (isDemoMode) return []; // caller uses DemoContext in demo mode
    if (supabase) return supabaseListOrders(orgId, filters);
    return restListOrders(filters);
  },

  async create(orgId: string, dto: CreateOrderDto): Promise<Order> {
    if (isDemoMode) throw new Error('Use DemoContext dispatch in demo mode');
    if (supabase) return supabaseCreateOrder(orgId, dto);
    return api.post<Order>('/api/orders', { ...dto, organisationId: orgId });
  },

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    if (isDemoMode) throw new Error('Use DemoContext dispatch in demo mode');
    if (supabase) return supabaseUpdateOrder(id, dto);
    return api.patch<Order>(`/api/orders/${id}`, dto);
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode) throw new Error('Use DemoContext dispatch in demo mode');
    if (supabase) return supabaseDeleteOrder(id);
    return api.delete(`/api/orders/${id}`);
  },
};
