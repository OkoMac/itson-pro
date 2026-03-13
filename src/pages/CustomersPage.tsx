import { useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import { Users, Package, FileText, AlertTriangle, Wrench, DollarSign, Activity, ArrowLeft } from 'lucide-react';
import { RiskBadge } from '@/components/shared/Badges';

const CustomersPage = () => {
  const { state, customers } = useDemo();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? customers.find(c => c.customerId === selectedId) : null;

  const getCustomerStats = (id: string) => {
    const orders = state.orders.filter(o => o.customerId === id);
    const docs = state.documents.filter(d => orders.some(o => o.orderId === d.linkedEntityId));
    const repairs = state.repairs.filter(r => r.customerId === id);
    const events = state.events.filter(e => orders.some(o => o.orderId === e.entityId) || repairs.some(r => r.repairId === e.entityId));
    const totalValue = orders.reduce((s, o) => s + o.value, 0);
    const atRisk = orders.filter(o => o.riskStatus !== 'none').length;
    return { orders, docs, repairs, events, totalValue, atRisk };
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* Customer List */}
      <div className={`${selected ? 'w-[35%]' : 'w-full'} overflow-auto`}>
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-status-active" />
          <h1 className="text-lg font-semibold text-foreground">Customer 360</h1>
        </div>

        <div className="space-y-2">
          {customers.map(c => {
            const stats = getCustomerStats(c.customerId);
            return (
              <button
                key={c.customerId}
                onClick={() => setSelectedId(c.customerId)}
                className={`w-full text-left surface-raised border rounded-lg p-4 transition-colors hover:border-muted-foreground/40 ${
                  selectedId === c.customerId ? 'border-status-active/50' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    c.priority === 'high' ? 'text-status-critical bg-status-critical/10' :
                    c.priority === 'medium' ? 'text-status-risk bg-status-risk/10' :
                    'text-muted-foreground bg-accent'
                  }`}>
                    {c.priority}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mb-2">
                  {c.segment} • {c.location} • {c.accountManager}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Package size={10} /> {stats.orders.length} orders</span>
                  <span className="font-mono">R{stats.totalValue.toLocaleString()}</span>
                  {stats.atRisk > 0 && (
                    <span className="flex items-center gap-1 text-status-risk">
                      <AlertTriangle size={10} /> {stats.atRisk} at risk
                    </span>
                  )}
                  {stats.repairs.length > 0 && (
                    <span className="flex items-center gap-1"><Wrench size={10} /> {stats.repairs.length}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Detail */}
      {selected && (
        <div className="flex-1 overflow-auto animate-slide-in-right">
          <Customer360Detail
            customer={selected}
            stats={getCustomerStats(selected.customerId)}
            onClose={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  );
};

function Customer360Detail({ customer, stats, onClose }: {
  customer: (typeof import('@/data/seed').customers)[number];
  stats: { orders: any[]; docs: any[]; repairs: any[]; events: any[]; totalValue: number; atRisk: number };
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'overview' | 'orders' | 'docs' | 'repairs' | 'events'>('overview');
  const { state } = useDemo();

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'orders' as const, label: `Orders (${stats.orders.length})` },
    { id: 'docs' as const, label: `Documents (${stats.docs.length})` },
    { id: 'repairs' as const, label: `Repairs (${stats.repairs.length})` },
    { id: 'events' as const, label: `Events (${stats.events.length})` },
  ];

  return (
    <div className="surface-raised border border-border rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-base font-semibold text-foreground">{customer.name}</h2>
              <p className="text-[11px] text-muted-foreground">
                {customer.segment} • {customer.location} • Contact: {customer.contactName}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            customer.priority === 'high' ? 'text-status-critical bg-status-critical/10' :
            customer.priority === 'medium' ? 'text-status-risk bg-status-risk/10' :
            'text-muted-foreground bg-accent'
          }`}>
            {customer.priority} priority
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-3">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                tab === t.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'overview' && (
          <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Revenue', value: `R${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-status-active' },
                { label: 'Active Orders', value: stats.orders.filter(o => o.status === 'active').length, icon: Package, color: 'text-foreground' },
                { label: 'Orders at Risk', value: stats.atRisk, icon: AlertTriangle, color: stats.atRisk > 0 ? 'text-status-critical' : 'text-status-healthy' },
                { label: 'Open Repairs', value: stats.repairs.filter(r => r.status !== 'completed').length, icon: Wrench, color: 'text-foreground' },
              ].map(kpi => (
                <div key={kpi.label} className="surface-overlay border border-border rounded-lg p-3">
                  <kpi.icon size={14} className="text-muted-foreground mb-2" />
                  <div className={`text-lg font-mono font-semibold ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Account Info */}
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h3 className="text-xs font-medium text-foreground mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Account Manager:</span> <span className="text-foreground ml-1">{customer.accountManager}</span></div>
                <div><span className="text-muted-foreground">Contact:</span> <span className="text-foreground ml-1">{customer.contactName}</span></div>
                <div><span className="text-muted-foreground">Segment:</span> <span className="text-foreground ml-1">{customer.segment}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="text-foreground ml-1">{customer.location}</span></div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h3 className="text-xs font-medium text-foreground mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {stats.events.slice(0, 8).map(evt => (
                  <div key={evt.eventId} className="flex items-start gap-2 text-xs">
                    <Activity size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <span className="text-foreground">{evt.title}</span>
                      <span className="text-muted-foreground ml-2">{new Date(evt.timestamp).toLocaleDateString('en-ZA')}</span>
                    </div>
                  </div>
                ))}
                {stats.events.length === 0 && <p className="text-xs text-muted-foreground">No recent activity</p>}
              </div>
            </div>

            {/* Sticky Notes */}
            {(() => {
              const notes = state.stickyNotes.filter(n =>
                stats.orders.some(o => o.orderId === n.linkedEntityId) ||
                stats.repairs.some(r => r.repairId === n.linkedEntityId)
              );
              if (notes.length === 0) return null;
              return (
                <div className="surface-overlay border border-border rounded-lg p-4">
                  <h3 className="text-xs font-medium text-foreground mb-3">Notes</h3>
                  <div className="space-y-2">
                    {notes.map(n => (
                      <div key={n.noteId} className="bg-status-risk/5 border border-status-risk/20 rounded p-2 text-xs">
                        <p className="text-foreground">{n.text}</p>
                        <p className="text-muted-foreground mt-1 text-[10px]">— {n.author}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-2">
            {stats.orders.map(order => (
              <div key={order.orderId} className="surface-overlay border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-medium text-foreground">{order.orderId}</span>
                  <RiskBadge risk={order.riskStatus} />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{order.currentStage}</span>
                  <span className="font-mono">R{order.value.toLocaleString()}</span>
                  <span>Due: {new Date(order.dueDate).toLocaleDateString('en-ZA')}</span>
                  <span>{order.owner}</span>
                </div>
              </div>
            ))}
            {stats.orders.length === 0 && <p className="text-xs text-muted-foreground">No orders</p>}
          </div>
        )}

        {tab === 'docs' && (
          <div className="space-y-2">
            {stats.docs.map(doc => (
              <div key={doc.documentId} className="surface-overlay border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{doc.fileName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    doc.status === 'approved' ? 'text-status-healthy bg-status-healthy/10' :
                    doc.status === 'pending' ? 'text-status-risk bg-status-risk/10' :
                    'text-muted-foreground bg-accent'
                  }`}>{doc.status}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {doc.documentType} • {doc.confidence}% confidence • {doc.linkedEntityId}
                </div>
              </div>
            ))}
            {stats.docs.length === 0 && <p className="text-xs text-muted-foreground">No documents</p>}
          </div>
        )}

        {tab === 'repairs' && (
          <div className="space-y-2">
            {stats.repairs.map(r => (
              <div key={r.repairId} className="surface-overlay border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-medium text-foreground">{r.repairId}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    r.approvalStatus === 'approved' ? 'text-status-healthy bg-status-healthy/10' :
                    r.approvalStatus === 'pending' ? 'text-status-risk bg-status-risk/10' :
                    'text-status-critical bg-status-critical/10'
                  }`}>{r.approvalStatus}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {r.unitModel} • {r.fault} • R{r.quoteValue.toLocaleString()} ({r.marginPct}% margin)
                </div>
              </div>
            ))}
            {stats.repairs.length === 0 && <p className="text-xs text-muted-foreground">No repairs</p>}
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-2">
            {stats.events.slice(0, 20).map(evt => (
              <div key={evt.eventId} className="flex items-start gap-3 text-xs surface-overlay border border-border rounded-lg p-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  evt.severity === 'critical' ? 'bg-status-critical' :
                  evt.severity === 'high' ? 'bg-status-risk' :
                  'bg-status-active'
                }`} />
                <div className="flex-1">
                  <div className="text-foreground font-medium">{evt.title}</div>
                  <div className="text-muted-foreground mt-0.5">{evt.description}</div>
                  <div className="text-muted-foreground mt-1 text-[10px]">
                    {new Date(evt.timestamp).toLocaleString('en-ZA')} • {evt.department}
                  </div>
                </div>
              </div>
            ))}
            {stats.events.length === 0 && <p className="text-xs text-muted-foreground">No events</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomersPage;
