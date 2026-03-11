import { useDemo } from '@/context/DemoContext';
import { CheckCircle } from 'lucide-react';

export function ApprovalsPanel() {
  const { state, dispatch } = useDemo();
  const pending = state.approvals.filter(a => a.status === 'pending');

  return (
    <div className="surface-raised border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle size={16} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Approvals Waiting</h2>
        <span className="font-mono text-xs text-status-risk">{pending.length}</span>
      </div>
      <div className="space-y-2">
        {pending.map(a => (
          <div key={a.approvalId} className="surface-overlay border border-border rounded-md p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">{a.approvalType}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{a.entityId}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">{a.reason}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  dispatch({ type: 'APPROVE_ITEM', approvalId: a.approvalId });
                  dispatch({ type: 'ADD_EVENT', event: {
                    eventId: `EVT-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: 'ApprovalApproved',
                    entityType: 'approval',
                    entityId: a.approvalId,
                    title: `${a.approvalType} Approved`,
                    description: a.reason,
                    department: 'Finance',
                    owner: state.role,
                    severity: 'info',
                    status: 'new',
                    tags: ['approval'],
                  }});
                }}
                className="text-[10px] font-medium px-2 py-1 rounded bg-status-healthy/10 text-status-healthy hover:bg-status-healthy/20 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => dispatch({ type: 'REJECT_ITEM', approvalId: a.approvalId })}
                className="text-[10px] font-medium px-2 py-1 rounded bg-status-critical/10 text-status-critical hover:bg-status-critical/20 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <p className="text-[11px] text-muted-foreground">0 approvals pending</p>
        )}
      </div>
    </div>
  );
}
