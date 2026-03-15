import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDemo } from '@/context/DemoContext';
import { useAuth } from '@/context/AuthContext';
import { approvalsService, type Approval } from '@/services/approvals';

export function useApprovals(filters?: { status?: string; entityType?: string; page?: number }) {
  const { state } = useDemo();
  const { isDemoMode } = useAuth();

  const query = useQuery({
    queryKey: ['approvals', filters],
    queryFn: () => approvalsService.list(filters),
    enabled: !isDemoMode,
  });

  if (isDemoMode) {
    let approvals = state.approvals;
    if (filters?.status) approvals = approvals.filter(a => a.status === filters.status);
    if (filters?.entityType) approvals = approvals.filter(a => a.approvalType === filters.entityType);
    return { data: { approvals, total: approvals.length }, isLoading: false, error: null };
  }

  return query;
}

export function useProcessApproval() {
  const { dispatch } = useDemo();
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, comments }: { id: string; action: 'approve' | 'reject'; comments?: string }) => {
      if (isDemoMode) {
        dispatch({ type: action === 'approve' ? 'APPROVE_ITEM' : 'REJECT_ITEM', approvalId: id });
        return Promise.resolve({ approvalId: id, status: action === 'approve' ? 'approved' : 'rejected' } as any);
      }
      return approvalsService.process(id, action, comments);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });
}

export function useCreateApproval() {
  const { isDemoMode } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Pick<Approval, 'entityType' | 'entityId' | 'requestedBy' | 'comments'>) => {
      if (isDemoMode) throw new Error('Use DemoContext in demo mode');
      return approvalsService.create(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals'] }),
  });
}
