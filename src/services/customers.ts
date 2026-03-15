import { isDemoMode } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { api } from './api';

export interface Customer {
  customerId: string;
  name: string;
  segment: string;
  accountManager: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  contactName: string;
}

export interface CreateCustomerDto {
  name: string;
  segment: string;
  accountManager: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  contactName: string;
}

async function supabaseListCustomers(orgId: string): Promise<Customer[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('organisation_id', orgId)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapDbCustomer);
}

async function supabaseCreateCustomer(orgId: string, dto: CreateCustomerDto): Promise<Customer> {
  if (!supabase) throw new Error('Supabase not configured');
  const custRef = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
  const { data, error } = await supabase.from('customers').insert({
    organisation_id: orgId,
    customer_ref: custRef,
    name: dto.name,
    segment: dto.segment,
    account_manager: dto.accountManager,
    location: dto.location,
    priority: dto.priority,
    contact_name: dto.contactName,
  }).select().single();
  if (error) throw new Error(error.message);
  return mapDbCustomer(data);
}

async function supabaseUpdateCustomer(id: string, dto: Partial<CreateCustomerDto>): Promise<Customer> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('customers').update({
    name: dto.name,
    segment: dto.segment,
    account_manager: dto.accountManager,
    location: dto.location,
    priority: dto.priority,
    contact_name: dto.contactName,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return mapDbCustomer(data);
}

function mapDbCustomer(row: any): Customer {
  return {
    customerId: row.customer_ref,
    name: row.name,
    segment: row.segment,
    accountManager: row.account_manager,
    location: row.location,
    priority: row.priority,
    contactName: row.contact_name,
  };
}

export const customersService = {
  async list(orgId: string): Promise<Customer[]> {
    if (isDemoMode) return [];
    if (supabase) return supabaseListCustomers(orgId);
    return api.get<Customer[]>('/api/customers');
  },

  async create(orgId: string, dto: CreateCustomerDto): Promise<Customer> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    if (supabase) return supabaseCreateCustomer(orgId, dto);
    return api.post<Customer>('/api/customers', { ...dto, organisationId: orgId });
  },

  async update(id: string, dto: Partial<CreateCustomerDto>): Promise<Customer> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    if (supabase) return supabaseUpdateCustomer(id, dto);
    return api.patch<Customer>(`/api/customers/${id}`, dto);
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode) throw new Error('Use DemoContext in demo mode');
    if (supabase) { const { error } = await supabase.from('customers').delete().eq('id', id); if (error) throw new Error(error.message); return; }
    return api.delete(`/api/customers/${id}`);
  },
};
