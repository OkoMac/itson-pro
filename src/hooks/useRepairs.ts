import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { repairsService, type Repair } from '@/services/repairs';

export function useRepairs(filters?: { status?: string; customerId?: string; search?: string; page?: number }) {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  const query = useQuery({
    queryKey: ['repairs', filters],
    queryFn: () => repairsService.list(filters),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let repairs = state.repairs;
    if (filters?.status) repairs = repairs.filter(r => r.status === filters.status);
    if (filters?.customerId) repairs = repairs.filter(r => r.customerId === filters.customerId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      repairs = repairs.filter(r =>
        r.repairId.toLowerCase().includes(q) ||
        r.unitModel.toLowerCase().includes(q)
      );
    }
    return { data: { repairs, total: repairs.length }, isLoading: false, error: null };
  }

  return query;
}

export function useCreateRepair() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Pick<Repair, 'customerId' | 'deviceType' | 'issue' | 'estimatedCost' | 'estimatedCompletion'>) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return repairsService.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['repairs'] }),
  });
}

export function useUpdateRepair() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Repair> }) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return repairsService.update(id, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['repairs'] }),
  });
}

export function useDeleteRepair() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return repairsService.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['repairs'] }),
  });
}
