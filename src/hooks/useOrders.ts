import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { ordersService, type OrderFilters, type CreateOrderDto, type UpdateOrderDto } from '@/services/orders';

export function useOrders(filters?: OrderFilters) {
  const { state, dispatch } = useDemo();
  const { user, isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersService.list(user?.profile?.organisationId ?? '', filters),
    enabled: !isDemoMode,
    placeholderData: isDemoMode ? state.orders : undefined,
    select: (data) => data,
  });
}

export function useOrdersData(filters?: OrderFilters) {
  const { state } = useDemo();
  const { user, isDemoMode } = useAuth();

  const query = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersService.list(user?.profile?.organisationId ?? '', filters),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let orders = state.orders;
    if (filters?.status) orders = orders.filter(o => o.status === filters.status);
    if (filters?.owner) orders = orders.filter(o => o.owner === filters.owner);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.poNumber.toLowerCase().includes(q)
      );
    }
    return { data: orders, isLoading: false, error: null };
  }

  return query;
}

export function useCreateOrder() {
  const { dispatch } = useDemo();
  const { user, isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateOrderDto) => {
      if (isDemoMode) {
        const order = {
          orderId: `CLG-${Math.floor(1000 + Math.random() * 9000)}`,
          ...dto,
          status: 'active' as const,
          riskStatus: 'none' as const,
          createdAt: new Date().toISOString(),
          lines: [],
        };
        dispatch({ type: 'ADD_ORDER', order });
        return Promise.resolve(order);
      }
      return ordersService.create(user?.profile?.organisationId ?? '', dto);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdateOrder() {
  const { dispatch } = useDemo();
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderDto }) => {
      if (isDemoMode) {
        dispatch({ type: 'UPDATE_ORDER', order: { orderId: id } as any });
        return Promise.resolve({ orderId: id, ...dto } as any);
      }
      return ordersService.update(id, dto);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
