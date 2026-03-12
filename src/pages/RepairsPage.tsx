import { useDemo } from '@/context/DemoContext';
import { Wrench, X, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';
import type { Repair } from '@/data/seed';
import { SeverityBadge } from '@/components/shared/Badges';

const RepairsPage = () => {
  const { state, dispatch, customers } = useDemo();
  const [selected, setSelected] = useState<Repair | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const getCustomer = (id: string) => customers.find(c => c.customerId === id)?.name || id;

  const filtered = statusFilter === 'all'
    ? state.repairs
    : state.repairs.filter(r => r.status === statusFilter);

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      <div className={`flex-1 overflow-auto ${selected ? 'max-w-[60%]' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">Repairs Module</h1>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground"
            >
              <option value="all">All Status</option>
              <option value="assessment">Assessment</option>
              <option value="quoted">Quoted</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <span className="text-[11px] text-muted-foreground">{filtered.length} repairs</span>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(r => (
            <button
              key={r.repairId}
              onClick={() => setSelected(r)}
              className={`w-full text-left surface-raised border rounded-lg p-4 transition-colors hover:border-muted-foreground/40 ${
                selected?.repairId === r.repairId ? 'border-status-active/50' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wrench size={16} className="text-muted-foreground" />
                  <span className="text-sm font-mono font-medium text-foreground">{r.repairId}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    r.status === 'assessment' ? 'bg-status-risk/10 text-status-risk' :
                    r.status === 'approved' || r.status === 'completed' ? 'bg-status-healthy/10 text-status-healthy' :
                    r.status === 'quoted' ? 'bg-status-active/10 text-status-active' :
                    'bg-accent text-muted-foreground'
                  }`}>{r.status}</span>
                </div>
                {r.marginPct > 0 && (
                  <span className={`font-mono text-xs ${r.marginPct < 18 ? 'text-status-critical' : 'text-status-healthy'}`}>
                    {r.marginPct}% margin
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mb-1">{getCustomer(r.customerId)} • {r.unitModel}</div>
              <div className="text-xs text-foreground mb-2">{r.fault}</div>
              {r.quoteValue > 0 && (
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>Parts: R{r.partsCost.toLocaleString()}</span>
                  <span>Labour: {r.labourHours}h (R{r.labourCost.toLocaleString()})</span>
                  <span className="font-mono font-medium text-foreground">Quote: R{r.quoteValue.toLocaleString()}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    r.approvalStatus === 'pending' ? 'bg-status-risk/10 text-status-risk' :
                    r.approvalStatus === 'approved' ? 'bg-status-healthy/10 text-status-healthy' :
                    'bg-status-critical/10 text-status-critical'
                  }`}>{r.approvalStatus}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="w-[40%] shrink-0 overflow-auto">
          <RepairDetailDrawer repair={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
};

function RepairDetailDrawer({ repair, onClose }: { repair: Repair; onClose: () => void }) {
  const { state, customers, dispatch } = useDemo();
  const customer = customers.find(c => c.customerId === repair.customerId);
  const relatedDocs = state.documents.filter(d => d.linkedEntityId === repair.repairId);
  const relatedTasks = state.tasks.filter(t => t.linkedEntityId === repair.repairId);
  const relatedNotes = state.stickyNotes.filter(n => n.linkedEntityId === repair.repairId);
  const relatedEvents = state.events.filter(e => e.entityId === repair.repairId);
  const relatedApproval = state.approvals.find(a => a.entityId === repair.repairId);

  const totalCost = repair.partsCost + repair.labourCost;
  const marginAmount = repair.quoteValue - totalCost;

  return (
    <div className="surface-raised border border-border rounded-lg h-full flex flex-col animate-slide-in-right">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-muted-foreground" />
            <span className="text-base font-mono font-semibold text-foreground">{repair.repairId}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              repair.status === 'assessment' ? 'bg-status-risk/10 text-status-risk' :
              repair.status === 'approved' || repair.status === 'completed' ? 'bg-status-healthy/10 text-status-healthy' :
              'bg-accent text-muted-foreground'
            }`}>{repair.status}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="text-xs text-muted-foreground">{customer?.name} • {repair.unitModel}</div>
        <p className="text-xs text-foreground mt-1">{repair.fault}</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* Cost Breakdown */}
        {repair.quoteValue > 0 && (
          <div>
            <h3 className="text-xs font-medium text-foreground mb-3">Cost & Margin Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="surface-overlay rounded-md p-3 text-center">
                <DollarSign size={14} className="text-muted-foreground mx-auto mb-1" />
                <div className="text-lg font-mono font-semibold text-foreground">R{repair.partsCost.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Parts Cost</div>
              </div>
              <div className="surface-overlay rounded-md p-3 text-center">
                <Clock size={14} className="text-muted-foreground mx-auto mb-1" />
                <div className="text-lg font-mono font-semibold text-foreground">R{repair.labourCost.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">{repair.labourHours}h Labour</div>
              </div>
              <div className="surface-overlay rounded-md p-3 text-center">
                <div className="text-lg font-mono font-semibold text-status-active">R{repair.quoteValue.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Quote Value</div>
              </div>
              <div className="surface-overlay rounded-md p-3 text-center">
                <div className={`text-lg font-mono font-semibold ${repair.marginPct < 18 ? 'text-status-critical' : 'text-status-healthy'}`}>
                  {repair.marginPct}%
                </div>
                <div className="text-[10px] text-muted-foreground">Gross Margin</div>
              </div>
            </div>

            {repair.marginPct < 18 && (
              <div className="mt-3 surface-overlay border border-status-critical/20 rounded-md p-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-status-critical shrink-0" />
                <span className="text-[11px] text-status-critical">
                  Margin below 18% threshold — requires finance approval
                </span>
              </div>
            )}

            {/* Margin bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Cost: R{totalCost.toLocaleString()}</span>
                <span>Margin: R{marginAmount.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
                <div className="bg-status-critical/60 h-full" style={{ width: `${(repair.partsCost / repair.quoteValue) * 100}%` }} />
                <div className="bg-status-risk/60 h-full" style={{ width: `${(repair.labourCost / repair.quoteValue) * 100}%` }} />
                <div className={`h-full ${repair.marginPct < 18 ? 'bg-status-critical/30' : 'bg-status-healthy/60'}`} style={{ width: `${repair.marginPct}%` }} />
              </div>
              <div className="flex items-center gap-3 mt-1 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-critical/60" />Parts</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-risk/60" />Labour</span>
                <span className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${repair.marginPct < 18 ? 'bg-status-critical/30' : 'bg-status-healthy/60'}`} />Margin</span>
              </div>
            </div>
          </div>
        )}

        {/* Approval Status */}
        {relatedApproval && (
          <div>
            <h3 className="text-xs font-medium text-foreground mb-2">Approval</h3>
            <div className="surface-overlay rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">{relatedApproval.approvalType}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  relatedApproval.status === 'pending' ? 'bg-status-risk/10 text-status-risk' :
                  relatedApproval.status === 'approved' ? 'bg-status-healthy/10 text-status-healthy' :
                  'bg-status-critical/10 text-status-critical'
                }`}>{relatedApproval.status}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{relatedApproval.reason}</p>
              {relatedApproval.status === 'pending' && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => dispatch({ type: 'APPROVE_ITEM', approvalId: relatedApproval.approvalId })}
                    className="text-[10px] font-medium px-3 py-1.5 rounded-md bg-status-healthy/10 text-status-healthy hover:bg-status-healthy/20 flex items-center gap-1"
                  >
                    <CheckCircle size={10} /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {relatedDocs.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-foreground mb-2">Documents</h3>
            <div className="space-y-1.5">
              {relatedDocs.map(doc => (
                <div key={doc.documentId} className="surface-overlay rounded-md p-3 text-xs flex items-center justify-between">
                  <span className="text-foreground">{doc.fileName}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{doc.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        {relatedTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-foreground mb-2">Tasks</h3>
            <div className="space-y-1.5">
              {relatedTasks.map(task => (
                <div key={task.taskId} className="surface-overlay rounded-md p-3 text-xs">
                  <span className="text-foreground">{task.title}</span>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{task.owner}</span>
                    <span className={task.priority === 'urgent' ? 'text-status-critical' : ''}>{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {relatedNotes.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-foreground mb-2">Notes</h3>
            <div className="space-y-1.5">
              {relatedNotes.map(note => (
                <div key={note.noteId} className="surface-overlay rounded-md p-3 text-xs border-l-2 border-status-risk/30">
                  <p className="text-foreground">{note.text}</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{note.author}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event History */}
        {relatedEvents.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-foreground mb-2">Event History</h3>
            <div className="space-y-1">
              {relatedEvents.map(evt => (
                <div key={evt.eventId} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                  <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <div className="text-xs text-foreground">{evt.title}</div>
                    <SeverityBadge severity={evt.severity} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepairsPage;
