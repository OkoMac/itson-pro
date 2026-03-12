import { useDemo } from '@/context/DemoContext';
import { CheckCircle, XCircle, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const ApprovalsPage = () => {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = filter === 'all' ? state.approvals : state.approvals.filter(a => a.status === filter);
  const pendingCount = state.approvals.filter(a => a.status === 'pending').length;
  const totalValue = state.approvals.filter(a => a.status === 'pending').reduce((s, a) => s + a.amount, 0);

  const handleApprove = (approvalId: string) => {
    const a = state.approvals.find(x => x.approvalId === approvalId);
    dispatch({ type: 'APPROVE_ITEM', approvalId });
    if (a) {
      dispatch({ type: 'ADD_EVENT', event: {
        eventId: `EVT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'ApprovalApproved',
        entityType: 'approval',
        entityId: approvalId,
        title: `${a.approvalType} Approved`,
        description: a.reason,
        department: 'Finance',
        owner: state.role,
        severity: 'info',
        status: 'new',
        tags: ['approval'],
      }});
    }
  };

  const handleReject = (approvalId: string) => {
    const a = state.approvals.find(x => x.approvalId === approvalId);
    dispatch({ type: 'REJECT_ITEM', approvalId });
    if (a) {
      dispatch({ type: 'ADD_EVENT', event: {
        eventId: `EVT-${Date.now()}-r`,
        timestamp: new Date().toISOString(),
        type: 'ApprovalRejected',
        entityType: 'approval',
        entityId: approvalId,
        title: `${a.approvalType} Rejected`,
        description: a.reason,
        department: 'Finance',
        owner: state.role,
        severity: 'medium',
        status: 'new',
        tags: ['approval', 'rejected'],
      }});
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Approvals Inbox</h1>
          <p className="text-[11px] text-muted-foreground">
            {pendingCount} pending • R{totalValue.toLocaleString()} total value
          </p>
        </div>
        <div className="flex items-center gap-1 surface-raised border border-border rounded-lg p-0.5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors capitalize ${
                filter === s ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-status-risk" />
            <span className="text-[11px] text-muted-foreground">Pending</span>
          </div>
          <span className="text-2xl font-mono font-semibold text-foreground">{pendingCount}</span>
        </div>
        <div className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-status-healthy" />
            <span className="text-[11px] text-muted-foreground">Approved</span>
          </div>
          <span className="text-2xl font-mono font-semibold text-foreground">
            {state.approvals.filter(a => a.status === 'approved').length}
          </span>
        </div>
        <div className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={14} className="text-status-critical" />
            <span className="text-[11px] text-muted-foreground">Rejected</span>
          </div>
          <span className="text-2xl font-mono font-semibold text-foreground">
            {state.approvals.filter(a => a.status === 'rejected').length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a.approvalId} className="surface-raised border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {a.status === 'pending' ? <AlertTriangle size={16} className="text-status-risk" /> :
                 a.status === 'approved' ? <CheckCircle size={16} className="text-status-healthy" /> :
                 <XCircle size={16} className="text-status-critical" />}
                <span className="text-sm font-medium text-foreground">{a.approvalType}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  a.status === 'pending' ? 'bg-status-risk/10 text-status-risk' :
                  a.status === 'approved' ? 'bg-status-healthy/10 text-status-healthy' :
                  'bg-status-critical/10 text-status-critical'
                }`}>{a.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{a.entityId}</span>
                <ArrowUpRight size={12} className="text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{a.reason}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
              <span>Requested by {a.requestedBy}</span>
              <span>Waiting for {a.waitingForRole.toUpperCase()}</span>
              <span className="font-mono font-medium text-foreground">R{a.amount.toLocaleString()}</span>
              <span>{new Date(a.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
            </div>
            {a.status === 'pending' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(a.approvalId)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-status-healthy/10 text-status-healthy hover:bg-status-healthy/20 flex items-center gap-1"
                >
                  <CheckCircle size={10} /> Approve
                </button>
                <button
                  onClick={() => handleReject(a.approvalId)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-status-critical/10 text-status-critical hover:bg-status-critical/20 flex items-center gap-1"
                >
                  <XCircle size={10} /> Reject
                </button>
                <button className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-accent text-muted-foreground hover:text-foreground">
                  Request Clarification
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="surface-raised border border-border rounded-lg p-8 text-center">
            <CheckCircle size={24} className="text-status-healthy mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">No approvals match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
