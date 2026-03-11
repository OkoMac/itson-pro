import { useDemo } from '@/context/DemoContext';
import { CheckCircle } from 'lucide-react';

const ApprovalsPage = () => {
  const { state, dispatch } = useDemo();

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-4">Approvals Inbox</h1>
      <div className="space-y-3">
        {state.approvals.map(a => (
          <div key={a.approvalId} className="surface-raised border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{a.approvalType}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  a.status === 'pending' ? 'bg-status-risk/10 text-status-risk' :
                  a.status === 'approved' ? 'bg-status-healthy/10 text-status-healthy' :
                  'bg-status-critical/10 text-status-critical'
                }`}>{a.status}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{a.entityId}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{a.reason}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
              <span>Requested by {a.requestedBy}</span>
              <span>Waiting for {a.waitingForRole.toUpperCase()}</span>
              <span className="font-mono">R{a.amount.toLocaleString()}</span>
            </div>
            {a.status === 'pending' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: 'APPROVE_ITEM', approvalId: a.approvalId })}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-status-healthy/10 text-status-healthy hover:bg-status-healthy/20"
                >
                  Approve
                </button>
                <button
                  onClick={() => dispatch({ type: 'REJECT_ITEM', approvalId: a.approvalId })}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-status-critical/10 text-status-critical hover:bg-status-critical/20"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalsPage;
