import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { stockService } from '@/services/stock';

export function useStockMovements(filters?: { sku?: string; transactionType?: string; page?: number; limit?: number }) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['stock', 'movements', filters],
    queryFn: () => stockService.listMovements(filters),
    enabled: !isDemoMode,
    placeholderData: isDemoMode ? { movements: [], total: 0 } : undefined,
  });
}

export function useLowStock() {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['stock', 'low-stock'],
    queryFn: () => stockService.getLowStock(),
    enabled: !isDemoMode,
    placeholderData: isDemoMode
      ? { products: state.products.filter(p => p.stockOnHand <= p.reorderLevel) }
      : undefined,
  });
}

export function useStockSummary() {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['stock', 'summary'],
    queryFn: () => stockService.getSummary(),
    enabled: !isDemoMode,
    placeholderData: isDemoMode ? {
      totalProducts: state.products.length,
      lowStockCount: state.products.filter(p => p.stockOnHand <= p.reorderLevel).length,
      totalValue: state.products.reduce((sum, p) => sum + p.stockOnHand * p.costPrice, 0),
    } : undefined,
  });
}

export function useAdjustStock() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { productId: string; quantity: number; transactionType: string; referenceId?: string; notes?: string }) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return stockService.adjust(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
