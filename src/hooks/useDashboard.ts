import { useQuery } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { dashboardService } from '@/services/dashboard';

export function useDashboardSummary() {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardService.getSummary(),
    enabled: !isDemoMode,
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: isDemoMode ? {
      activeOrders: state.orders.filter(o => o.status === 'active').length,
      pendingApprovals: state.approvals.filter(a => a.status === 'pending').length,
      openTasks: state.tasks.filter(t => t.status !== 'done').length,
      openRepairs: state.repairs.filter(r => r.status !== 'closed').length,
    } : undefined,
  });
}

export function useDashboardEvents(filters?: { entityType?: string; eventType?: string; page?: number; limit?: number }) {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  const query = useQuery({
    queryKey: ['dashboard', 'events', filters],
    queryFn: () => dashboardService.getEvents(filters),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let events = state.events;
    if (filters?.entityType) events = events.filter(e => e.entityType === filters.entityType);
    return { data: { events, total: events.length }, isLoading: false, error: null };
  }

  return query;
}
