import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { invoicesService, type Invoice } from '@/services/invoices';
import { seedInvoices } from '@/data/seed';

export function useInvoices(filters?: { status?: string; customerId?: string; invoiceType?: string; page?: number }) {
  const { isDemoMode } = useAuth();

  const query = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => invoicesService.list(filters),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let invoices = seedInvoices;
    if (filters?.status) invoices = invoices.filter(i => i.status === filters.status);
    if (filters?.customerId) invoices = invoices.filter(i => i.customerId === filters.customerId);
    return { data: { invoices, total: invoices.length, outstanding: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0) }, isLoading: false, error: null };
  }

  return query;
}

export function useCreateInvoice() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { customerId: string; orderId?: string; invoiceType?: string; amount: number; taxRate?: number; description: string; dueDate: string }) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return invoicesService.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useUpdateInvoice() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; description?: string; dueDate?: string } }) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return invoicesService.update(id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useDeleteInvoice() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return invoicesService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}
