import { useDemo } from '@/context/DemoContext';
import { useState } from 'react';
import { Brain, ArrowRight, Package, AlertTriangle, FileText, Wrench, Box, CheckCircle, Users, ClipboardList, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const suggestedPrompts = [
  'Why are orders delayed today?',
  'Which jobs are waiting for finance approval?',
  'What stock shortages are affecting dispatch?',
  'Show all activity on customer Pick n Pay',
  'Which repair jobs are below margin threshold?',
  'Which documents need review today?',
  'What is the current dispatch pipeline?',
  'Show overdue tasks',
  'List all customers',
  'What is the financial summary?',
  'Show recent events',
  'Which customers have critical orders?',
];

const AssistantPage = () => {
  const { state, dispatch, customers } = useDemo();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ query: string; answer: string; records: { id: string; type: string }[] }[]>([]);

  const runQuery = (q: string) => {
    const lower = q.toLowerCase();
    let answer = '';
    let records: { id: string; type: string }[] = [];

    // ── Delay / risk / slowing ──────────────────────────────────────────────
    if (lower.includes('delay') || lower.includes('risk') || (lower.includes('slow') && !lower.includes('stock'))) {
      const atRisk = state.orders.filter(o => o.riskStatus !== 'none' && o.status === 'active');
      const stockIssues = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
      const pendingApprovals = state.approvals.filter(a => a.status === 'pending');
      const brandingCount = state.orders.filter(o => o.currentStage === 'Branding').length;
      answer = `${atRisk.length} orders are currently at risk.\n\nBreakdown:\n• ${stockIssues.length} stock shortages (${stockIssues.map(p => p.sku).join(', ') || 'none'})\n• ${pendingApprovals.length} pending approvals blocking workflow\n• Branding stage has ${brandingCount} orders (typically the longest stage)\n\nRecommendation: Prioritise ${stockIssues[0]?.sku ?? 'procurement'} and approve pending dispatch releases.`;
      records = atRisk.map(o => ({ id: o.orderId, type: 'order' }));

    // ── Approvals / finance waiting ─────────────────────────────────────────
    } else if (lower.includes('approval') || lower.includes('finance') || lower.includes('waiting for')) {
      const pending = state.approvals.filter(a => a.status === 'pending');
      answer = `${pending.length} approval${pending.length !== 1 ? 's' : ''} pending:\n\n${pending.map(a => `• ${a.approvalType} — ${a.entityId} (R${a.amount.toLocaleString()}) — waiting for ${a.waitingForRole.toUpperCase()}`).join('\n') || '  None'}\n\nTotal value at risk: R${pending.reduce((s, a) => s + a.amount, 0).toLocaleString()}`;
      records = pending.map(a => ({ id: a.entityId, type: a.entityType }));

    // ── Stock / shortage / dispatch blockage ────────────────────────────────
    } else if ((lower.includes('stock') || lower.includes('dispatch') || lower.includes('shortage')) && !lower.includes('customer')) {
      const lowStock = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
      const blockedOrders = state.orders.filter(o => o.status === 'active' && o.currentStage === 'Waiting for Stock');
      answer = `${lowStock.length} product${lowStock.length !== 1 ? 's' : ''} below reorder level:\n\n${lowStock.map(p => `• ${p.sku} ${p.productName}: ${p.stockOnHand} on hand (reorder at ${p.reorderLevel}, ${p.leadTimeDays}d lead time)`).join('\n') || '  All products adequately stocked'}\n\n${blockedOrders.length} order${blockedOrders.length !== 1 ? 's' : ''} blocked by stock: ${blockedOrders.map(o => o.orderId).join(', ') || 'none'}`;
      records = [...lowStock.map(p => ({ id: p.sku, type: 'product' })), ...blockedOrders.map(o => ({ id: o.orderId, type: 'order' }))];

    // ── All customers list ──────────────────────────────────────────────────
    } else if (lower.includes('list all customer') || lower.includes('all customer') || (lower.includes('customer') && lower.includes('list'))) {
      answer = `${customers.length} active customers:\n\n${customers.map(c => `• ${c.name} (${c.customerId}) — ${c.segment ?? 'N/A'} — AM: ${c.accountManager} — ${c.location}`).join('\n')}`;
      records = customers.map(c => ({ id: c.customerId, type: 'customer' }));

    // ── Customers with critical / at-risk orders ────────────────────────────
    } else if (lower.includes('customer') && (lower.includes('critical') || lower.includes('at risk') || lower.includes('risk'))) {
      const criticalOrders = state.orders.filter(o => o.riskStatus === 'critical' || o.riskStatus === 'high');
      const custIds = [...new Set(criticalOrders.map(o => o.customerId))];
      const custDetails = custIds.map(id => {
        const c = customers.find(x => x.customerId === id);
        const ords = criticalOrders.filter(o => o.customerId === id);
        return `• ${c?.name ?? id}: ${ords.length} critical/high-risk order${ords.length !== 1 ? 's' : ''} (${ords.map(o => o.orderId).join(', ')})`;
      });
      answer = `${custIds.length} customer${custIds.length !== 1 ? 's' : ''} with high/critical orders:\n\n${custDetails.join('\n') || '  No customers with critical orders currently'}`;
      records = criticalOrders.map(o => ({ id: o.orderId, type: 'order' }));

    // ── Specific customer by name ───────────────────────────────────────────
    } else if (lower.includes('customer') || customers.some(c => lower.includes(c.name.toLowerCase()))) {
      const matchedCust = customers.find(c => lower.includes(c.name.toLowerCase()))
        ?? customers.find(c => lower.includes(c.customerId.toLowerCase()));
      if (matchedCust) {
        const custOrders = state.orders.filter(o => o.customerId === matchedCust.customerId);
        const atRisk = custOrders.filter(o => o.riskStatus !== 'none');
        const totalValue = custOrders.reduce((s, o) => s + o.value, 0);
        const custRepairs = state.repairs.filter(r => r.customerId === matchedCust.customerId);
        const custOrderIds = new Set(custOrders.map(o => o.orderId));
        const custDocs = state.documents.filter(d => custOrderIds.has(d.linkedEntityId) || custRepairs.some(r => r.repairId === d.linkedEntityId));
        answer = `${matchedCust.name} (${matchedCust.customerId}):\n• Segment: ${matchedCust.segment ?? 'N/A'} — ${matchedCust.location}\n• Account Manager: ${matchedCust.accountManager}\n• ${custOrders.length} orders totalling R${totalValue.toLocaleString()}\n  — ${custOrders.filter(o => o.status === 'active').length} active, ${atRisk.length} at risk\n• ${custRepairs.length} repair job${custRepairs.length !== 1 ? 's' : ''}\n• ${custDocs.length} document${custDocs.length !== 1 ? 's' : ''}`;
        records = custOrders.map(o => ({ id: o.orderId, type: 'order' }));
      } else {
        // General customer summary
        const highPriority = customers.filter(c => c.priority === 'high');
        answer = `${customers.length} customers total:\n• ${highPriority.length} high-priority accounts\n• Top accounts: ${highPriority.slice(0, 5).map(c => c.name).join(', ')}\n\nAsk about a specific customer by name for detailed info.`;
        records = [];
      }

    // ── Margin / repair threshold ───────────────────────────────────────────
    } else if (lower.includes('margin') || lower.includes('repair') || lower.includes('threshold')) {
      const lowMargin = state.repairs.filter(r => r.marginPct > 0 && r.marginPct < 18);
      const allRepairs = state.repairs.filter(r => r.status !== 'completed');
      answer = `${lowMargin.length} repair job${lowMargin.length !== 1 ? 's' : ''} below 18% margin threshold:\n\n${lowMargin.map(r => {
        const custName = customers.find(c => c.customerId === r.customerId)?.name ?? r.customerId;
        return `• ${r.repairId} — ${r.unitModel} (${custName}) — ${r.marginPct}% margin (R${r.quoteValue.toLocaleString()} quote) — ${r.approvalStatus}`;
      }).join('\n') || '  All repairs above threshold'}\n\n${allRepairs.length} repairs currently active.`;
      records = lowMargin.map(r => ({ id: r.repairId, type: 'repair' }));

    // ── Documents / OCR / review ────────────────────────────────────────────
    } else if (lower.includes('document') || lower.includes('review') || lower.includes('ocr')) {
      const pending = state.documents.filter(d => d.status === 'pending');
      const lowConf = state.documents.filter(d => d.confidence < 85);
      answer = `${pending.length} document${pending.length !== 1 ? 's' : ''} need review:\n\n${pending.map(d => `• ${d.fileName} — ${d.documentType} — ${d.confidence}% confidence — linked to ${d.linkedEntityId}`).join('\n') || '  All documents reviewed'}\n\n${lowConf.length} document${lowConf.length !== 1 ? 's' : ''} with low OCR confidence (<85%) should be manually verified.`; // eslint-disable-line
      records = pending.map(d => ({ id: d.documentId, type: 'document' }));

    // ── Dispatch pipeline ───────────────────────────────────────────────────
    } else if (lower.includes('dispatch') || lower.includes('pipeline')) {
      const dispatchReady = state.orders.filter(o => o.currentStage === 'Dispatch Ready' && o.status === 'active');
      const dispatched = state.orders.filter(o => o.currentStage === 'Dispatched' && o.status === 'active');
      const filling = state.orders.filter(o => o.currentStage === 'Filling' && o.status === 'active');
      answer = `Dispatch pipeline:\n• ${filling.length} orders in Filling\n• ${dispatchReady.length} orders Dispatch Ready\n• ${dispatched.length} orders Dispatched\n\nDispatch-ready: ${dispatchReady.map(o => `${o.orderId} (${state.orders.find(x => x.orderId === o.orderId) ? 'R' + o.value.toLocaleString() : ''})`).join(', ') || 'none'}`;
      records = dispatchReady.map(o => ({ id: o.orderId, type: 'order' }));

    // ── Overdue tasks ───────────────────────────────────────────────────────
    } else if (lower.includes('overdue') || lower.includes('task')) {
      const overdue = state.tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date());
      const urgent = state.tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
      const open = state.tasks.filter(t => t.status === 'open');
      answer = `Task summary:\n• ${open.length} open tasks total\n• ${overdue.length} overdue\n• ${urgent.length} urgent\n\n${overdue.length > 0 ? 'Overdue:\n' + overdue.map(t => `• ${t.title} — ${t.owner} — due ${t.dueDate}`).join('\n') : ''}${urgent.length > 0 ? '\n\nUrgent:\n' + urgent.filter(u => !overdue.find(o => o.taskId === u.taskId)).map(t => `• ${t.title} — ${t.owner}`).join('\n') : ''}`;
      records = [...overdue, ...urgent].map(t => ({ id: t.linkedEntityId, type: t.linkedEntityType }));

    // ── Financial summary / revenue ─────────────────────────────────────────
    } else if (lower.includes('financial') || lower.includes('revenue') || lower.includes('invoice') || lower.includes('money') || lower.includes('value')) {
      const active = state.orders.filter(o => o.status === 'active');
      const completed = state.orders.filter(o => o.status === 'completed');
      const pendingApprovals = state.approvals.filter(a => a.status === 'pending');
      const activeValue = active.reduce((s, o) => s + o.value, 0);
      const completedValue = completed.reduce((s, o) => s + o.value, 0);
      const repairValue = state.repairs.reduce((s, r) => s + r.quoteValue, 0);
      answer = `Financial overview:\n• Active orders: R${activeValue.toLocaleString()} across ${active.length} orders\n• Completed orders: R${completedValue.toLocaleString()} across ${completed.length} orders\n• Repair pipeline: R${repairValue.toLocaleString()} across ${state.repairs.length} jobs\n• Pending approvals: R${pendingApprovals.reduce((s, a) => s + a.amount, 0).toLocaleString()} (${pendingApprovals.length} items)\n• Total active pipeline: R${(activeValue + repairValue).toLocaleString()}`;
      records = [];

    // ── Recent events / activity ────────────────────────────────────────────
    } else if (lower.includes('event') || lower.includes('recent') || lower.includes('activity') || lower.includes('log')) {
      const recent = state.events.slice(0, 10);
      const critical = state.events.filter(e => e.severity === 'critical').slice(0, 5);
      answer = `Recent activity (last ${recent.length} events):\n\n${recent.map(e => `• [${new Date(e.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}] ${e.title} — ${e.department}`).join('\n')}\n\n${critical.length > 0 ? `Critical events: ${critical.map(e => e.title).join(', ')}` : 'No critical events'}`;
      records = recent.map(e => ({ id: e.entityId, type: e.entityType }));

    // ── Inventory / products overview ───────────────────────────────────────
    } else if (lower.includes('inventor') || lower.includes('product') || lower.includes('sku') || lower.includes('warehouse')) {
      const lowStock = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
      const outOfStock = state.products.filter(p => p.stockOnHand === 0);
      const totalValue = state.products.reduce((s, p) => s + p.stockOnHand * p.unitPrice, 0);
      answer = `Inventory overview:\n• ${state.products.length} products tracked\n• ${lowStock.length} below reorder level\n• ${outOfStock.length} out of stock\n• Total inventory value: R${totalValue.toLocaleString()}\n\nLow stock items: ${lowStock.map(p => `${p.sku} (${p.stockOnHand})`).join(', ') || 'none'}`;
      records = lowStock.map(p => ({ id: p.sku, type: 'product' }));

    // ── Default system summary ──────────────────────────────────────────────
    } else {
      const active = state.orders.filter(o => o.status === 'active');
      const atRisk = active.filter(o => o.riskStatus !== 'none');
      answer = `System status summary:\n\n• ${active.length} active orders (R${active.reduce((s, o) => s + o.value, 0).toLocaleString()} total value)\n  — ${atRisk.length} at risk\n• ${state.events.length} events tracked\n• ${state.approvals.filter(a => a.status === 'pending').length} approvals pending\n• ${state.documents.filter(d => d.status === 'pending').length} documents awaiting review\n• ${state.tasks.filter(t => t.status !== 'completed').length} open tasks\n• ${state.repairs.filter(r => r.status !== 'completed').length} active repairs\n• ${customers.length} customers on record\n\nTry asking about a specific customer, orders, stock, repairs, or financials.`;
      records = [];
    }

    setHistory(prev => [{ query: q, answer, records }, ...prev]);
    setQuery('');

    dispatch({ type: 'ADD_EVENT', event: {
      eventId: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'AIQueryRun',
      entityType: 'query',
      entityId: 'AI',
      title: 'AI Query Executed',
      description: q,
      department: 'Executive',
      owner: state.role,
      severity: 'info',
      status: 'new',
      tags: ['ai', 'query'],
    }});
  };

  const handleRecordClick = (record: { id: string; type: string }) => {
    if (record.type === 'order') { dispatch({ type: 'SELECT_ORDER', orderId: record.id }); navigate('/orders'); }
    else if (record.type === 'repair') navigate('/repairs');
    else if (record.type === 'document') navigate('/documents');
    else if (record.type === 'product') navigate('/stock');
    else if (record.type === 'approval') navigate('/approvals');
    else if (record.type === 'customer') navigate('/customers');
    else if (record.type === 'task') navigate('/tasks');
    else if (record.type === 'event') navigate('/events');
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'repair': return Wrench;
      case 'document': return FileText;
      case 'product': return Box;
      case 'approval': return CheckCircle;
      case 'customer': return Users;
      case 'task': return ClipboardList;
      case 'event': return Calendar;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={20} className="text-status-ai" />
        <h1 className="text-lg font-semibold text-foreground">Operational Intelligence</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-6">Query the operational dataset. Responses are grounded in current system state.</p>

      <div className="relative mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && query.trim() && runQuery(query)}
          placeholder="Run operational query..."
          className="w-full h-10 rounded-lg bg-card border border-border px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-status-ai/50"
        />
        <button onClick={() => query.trim() && runQuery(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {suggestedPrompts.map(p => (
          <button key={p} onClick={() => runQuery(p)}
            className="text-[11px] px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors">
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {history.map((h, i) => (
          <div key={i} className="surface-raised border border-border rounded-lg p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-status-ai" />
              <span className="text-xs font-medium text-muted-foreground">{h.query}</span>
            </div>
            <div className="text-sm text-foreground whitespace-pre-line mb-3">{h.answer}</div>
            {h.records.length > 0 && (
              <div>
                <span className="text-[10px] text-muted-foreground">Linked records:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {h.records.map((r, j) => {
                    const Icon = getRecordIcon(r.type);
                    return (
                      <button key={j} onClick={() => handleRecordClick(r)}
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-status-active hover:bg-accent flex items-center gap-1">
                        <Icon size={10} /> {r.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        {history.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Brain size={28} className="mx-auto mb-3 opacity-20" />
            <p className="text-xs">Ask a question or select a suggested prompt above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantPage;
