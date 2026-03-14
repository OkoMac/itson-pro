import { useDemo } from '@/context/DemoContext';
import { CheckCircle, XCircle, AlertTriangle, Clock, ArrowUpRight, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const ApprovalsPage = () => {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const types = [...new Set(state.approvals.map(a => a.approvalType))];
  const filtered = state.approvals
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => typeFilter === 'all' || a.approvalType === typeFilter);
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
      toast.success(`✅ ${a.approvalType} Approved`, { description: `${a.entityId} — R${a.amount.toLocaleString()}` });
    }
  };

  const handleReject = (approvalId: string, reason: string) => {
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
        description: reason ? `Reason: ${reason}` : a.reason,
        department: 'Finance',
        owner: state.role,
        severity: 'medium',
        status: 'new',
        tags: ['approval', 'rejected'],
      }});
      toast.error(`❌ ${a.approvalType} Rejected`, { description: reason || a.entityId });
    }
    setRejectingId(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (rejectingId) handleReject(rejectingId, rejectReason);
  };

  const handleEscalate = (a: typeof state.approvals[0]) => {
    dispatch({ type: 'ADD_EVENT', event: {
      eventId: `EVT-${Date.now()}-esc`,
      timestamp: new Date().toISOString(),
      type: 'ApprovalRequested',
      entityType: 'approval',
      entityId: a.approvalId,
      title: `${a.approvalType} Escalated to GM`,
      description: `${a.reason} — escalated for GM review`,
      department: 'Executive',
      owner: 'Grant Morrison',
      severity: 'high',
      status: 'new',
      tags: ['approval', 'escalated'],
    }});
    toast.warning('⬆ Escalated to GM', { description: `${a.approvalType} for ${a.entityId}` });
  };

  const handleNavigateToEntity = (a: typeof state.approvals[0]) => {
    if (a.entityType === 'repair') navigate('/repairs');
    else if (a.entityType === 'order') {
      dispatch({ type: 'SELECT_ORDER', orderId: a.entityId });
      navigate('/orders');
    }
    else if (a.entityType === 'document') navigate('/documents');
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
        <div className="flex items-center gap-2">
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex items-center gap-1 surface-raised border border-border rounded-lg p-0.5">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors capitalize ${
                  filter === s ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}>{s}</button>
            ))}
          </div>
          {(filter !== 'all' || typeFilter !== 'all') && (
            <button onClick={() => { setFilter('all'); setTypeFilter('all'); }} className="text-[10px] text-status-active hover:underline">Clear</button>
          )}
        </div>
      </div>

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
              <button onClick={() => handleNavigateToEntity(a)} className="flex items-center gap-1 text-[10px] text-status-active hover:underline">
                <span className="font-mono">{a.entityId}</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{a.reason}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
              <span>Requested by {a.requestedBy}</span>
              <span>Waiting for {a.waitingForRole.toUpperCase()}</span>
              {a.amount > 0 && <span className="font-mono font-medium text-foreground">R{a.amount.toLocaleString()}</span>}
              <span>{new Date(a.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
            </div>
            {a.status === 'pending' && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleApprove(a.approvalId)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-status-healthy/10 text-status-healthy hover:bg-status-healthy/20 flex items-center gap-1">
                  <CheckCircle size={10} /> Approve
                </button>
                <button onClick={() => { setRejectingId(a.approvalId); setRejectReason(''); }}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-status-critical/10 text-status-critical hover:bg-status-critical/20 flex items-center gap-1">
                  <XCircle size={10} /> Reject
                </button>
                <button onClick={() => handleEscalate(a)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-accent text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <MessageSquare size={10} /> Escalate
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

      {/* Rejection reason modal */}
      {rejectingId && (() => {
        const a = state.approvals.find(x => x.approvalId === rejectingId);
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="surface-raised border border-border rounded-xl p-5 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-status-critical" />
                  <span className="text-sm font-semibold text-foreground">Reject Approval</span>
                </div>
                <button onClick={() => setRejectingId(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              {a && (
                <div className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs font-medium text-foreground">{a.approvalType}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{a.entityId} — R{a.amount.toLocaleString()}</p>
                </div>
              )}
              <label className="block text-[11px] text-muted-foreground mb-1.5">Rejection reason <span className="text-status-critical">*</span></label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && rejectReason.trim()) confirmReject(); }}
                placeholder="Provide a reason for rejection..."
                rows={3}
                autoFocus
                className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-status-critical/50 resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 mb-4">⌘↵ to submit</p>
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setRejectingId(null)}
                  className="px-4 py-1.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-1.5 rounded-md bg-status-critical/10 text-status-critical hover:bg-status-critical/20 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                  <XCircle size={12} /> Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ApprovalsPage;
