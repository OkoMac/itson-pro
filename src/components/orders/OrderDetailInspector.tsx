import { useDemo } from '@/context/DemoContext';
import { RiskBadge, SeverityBadge } from '@/components/shared/Badges';
import type { Order } from '@/data/seed';
import { X, FileText, ListTodo, StickyNote, Activity, Package, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

type Tab = 'summary' | 'documents' | 'tasks' | 'notes' | 'events' | 'stock';

export function OrderDetailInspector({ order, onClose }: { order: Order; onClose: () => void }) {
  const { state, customers } = useDemo();
  const [tab, setTab] = useState<Tab>('summary');
  const customer = customers.find(c => c.customerId === order.customerId);
  const orderDocs = state.documents.filter(d => d.linkedEntityId === order.orderId);
  const orderTasks = state.tasks.filter(t => t.linkedEntityId === order.orderId);
  const orderNotes = state.stickyNotes.filter(n => n.linkedEntityId === order.orderId);
  const orderEvents = state.events.filter(e => e.entityId === order.orderId);
  const orderApprovals = state.approvals.filter(a => a.entityId === order.orderId);

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'summary', label: 'Summary', icon: Package },
    { id: 'documents', label: 'Docs', icon: FileText, count: orderDocs.length },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, count: orderTasks.length },
    { id: 'notes', label: 'Notes', icon: StickyNote, count: orderNotes.length },
    { id: 'events', label: 'Events', icon: Activity, count: orderEvents.length },
    { id: 'stock', label: 'Stock', icon: AlertTriangle },
  ];

  const products = state.products;

  return (
    <div className="surface-raised border border-border rounded-lg h-full flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-mono font-semibold text-foreground">{order.orderId}</span>
            <RiskBadge risk={order.riskStatus} />
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
        <div className="text-xs text-muted-foreground">{customer?.name}</div>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
          <span>{order.currentStage}</span>
          <span>{order.owner}</span>
          <span>Due {new Date(order.dueDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
          <span className="font-mono">R{order.value.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1 px-3 py-2 text-[11px] border-b-2 transition-colors ${
              tab === t.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon size={12} />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="font-mono text-[9px] bg-accent rounded px-1">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'summary' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-foreground mb-2">Order Lines</h3>
              <div className="space-y-1.5">
                {order.lines.map(line => {
                  const prod = products.find(p => p.sku === line.sku);
                  const stockShort = prod && prod.stockOnHand < line.qty;
                  return (
                    <div key={line.orderLineId} className="flex items-center justify-between surface-overlay rounded-md p-2 text-xs">
                      <div>
                        <span className="font-mono text-foreground">{line.sku}</span>
                        <span className="text-muted-foreground ml-2">{prod?.productName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{line.qty} × R{line.unitPrice}</span>
                        <span className="font-mono text-foreground">R{line.lineTotal.toLocaleString()}</span>
                        {stockShort && <span className="text-[10px] text-status-critical">LOW STOCK</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {orderApprovals.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-foreground mb-2">Pending Approvals</h3>
                {orderApprovals.map(a => (
                  <div key={a.approvalId} className="surface-overlay rounded-md p-2 text-xs">
                    <span className="text-foreground">{a.approvalType}</span>
                    <span className={`ml-2 text-[10px] ${a.status === 'pending' ? 'text-status-risk' : 'text-status-healthy'}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'documents' && (
          <div className="space-y-2">
            {orderDocs.map(doc => (
              <div key={doc.documentId} className="surface-overlay rounded-md p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-foreground font-medium">{doc.fileName}</span>
                  <span className={`text-[10px] ${doc.status === 'approved' ? 'text-status-healthy' : 'text-status-risk'}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="text-muted-foreground">{doc.documentType} • {doc.confidence}% confidence</div>
              </div>
            ))}
            {orderDocs.length === 0 && <p className="text-[11px] text-muted-foreground">No documents linked</p>}
          </div>
        )}

        {tab === 'tasks' && (
          <div className="space-y-2">
            {orderTasks.map(task => (
              <div key={task.taskId} className="surface-overlay rounded-md p-3 text-xs">
                <div className="text-foreground font-medium">{task.title}</div>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <span>{task.owner}</span>
                  <span className={task.priority === 'urgent' ? 'text-status-critical' : ''}>{task.priority}</span>
                  <span>{task.status}</span>
                </div>
              </div>
            ))}
            {orderTasks.length === 0 && <p className="text-[11px] text-muted-foreground">No tasks</p>}
          </div>
        )}

        {tab === 'notes' && (
          <div className="space-y-2">
            {orderNotes.map(note => (
              <div key={note.noteId} className="surface-overlay rounded-md p-3 text-xs border-l-2 border-status-risk/30">
                <p className="text-foreground">{note.text}</p>
                <div className="text-muted-foreground mt-1">
                  {note.author} • {new Date(note.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {orderNotes.length === 0 && <p className="text-[11px] text-muted-foreground">No notes</p>}
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-1">
            {orderEvents.map(evt => (
              <div key={evt.eventId} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div>
                  <div className="text-xs text-foreground">{evt.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <SeverityBadge severity={evt.severity} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'stock' && (
          <div className="space-y-2">
            {order.lines.map(line => {
              const prod = products.find(p => p.sku === line.sku);
              if (!prod) return null;
              const short = prod.stockOnHand < line.qty;
              return (
                <div key={line.sku} className="surface-overlay rounded-md p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-foreground">{prod.sku}</span>
                    {short && <span className="text-[10px] text-status-critical font-medium">SHORTAGE</span>}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Required: {line.qty} • On hand: {prod.stockOnHand} • Reorder level: {prod.reorderLevel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
