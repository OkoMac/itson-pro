import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { financialsService } from '@/services/financials';
import { seedInvoices, seedDataCenters } from '@/data/seed';

export function useFinancialsSummary() {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['financials', 'summary'],
    queryFn: () => financialsService.getSummary(),
    enabled: !isDemoMode,
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemoMode ? {
      totalRevenue: seedInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
      outstanding: seedInvoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0),
      overdueCount: seedInvoices.filter(i => i.status === 'overdue').length,
    } : undefined,
  });
}

export function useMonthlyFinancials() {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['financials', 'monthly'],
    queryFn: () => financialsService.getMonthly(),
    enabled: !isDemoMode,
    staleTime: 1000 * 60 * 10,
    placeholderData: isDemoMode ? { months: [] } : undefined,
  });
}

export function useCostCenters(filters?: { status?: string; department?: string }) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['financials', 'cost-centers', filters],
    queryFn: () => financialsService.getCostCenters(filters),
    enabled: !isDemoMode,
    placeholderData: isDemoMode ? { costCenters: [], total: 0 } : undefined,
  });
}

export function useUpdateCostCenter() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { budget?: number; spent?: number; committed?: number; status?: string } }) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return financialsService.updateCostCenter(id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financials', 'cost-centers'] }),
  });
}

export function useDataCenters() {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['financials', 'data-centers'],
    queryFn: () => financialsService.getDataCenters(),
    enabled: !isDemoMode,
    placeholderData: isDemoMode ? { dataCenters: seedDataCenters } : undefined,
  });
}
