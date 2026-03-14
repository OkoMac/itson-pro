import { useDemo } from '@/context/DemoContext';
import { useState } from 'react';
import { Brain, ArrowRight, Package, AlertTriangle, FileText, Wrench, Box, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const suggestedPrompts = [
  'Why are orders delayed today?',
  'Which jobs are waiting for finance approval?',
  'What stock shortages are affecting dispatch?',
  'Show all activity on customer Pick n Pay.',
  'Which repair jobs are below margin threshold?',
  'Which documents need review today?',
  'What is the current dispatch pipeline?',
  'Show overdue tasks',
];

const AssistantPage = () => {
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ query: string; answer: string; records: { id: string; type: string }[] }[]>([]);

  const runQuery = (q: string) => {
    const lower = q.toLowerCase();
    let answer = '';
    let records: { id: string; type: string }[] = [];

    if (lower.includes('delay') || lower.includes('risk') || lower.includes('slowing')) {
      const atRisk = state.orders.filter(o => o.riskStatus !== 'none' && o.status === 'active');
      const stockIssues = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
      const pendingApprovals = state.approvals.filter(a => a.status === 'pending');
      answer = `${atRisk.length} orders are currently at risk.\n\nBreakdown:\n• ${stockIssues.length} stock shortages (${stockIssues.map(p => p.sku).join(', ')})\n• ${pendingApprovals.length} pending approvals blocking workflow\n• Branding is the slowest stage this week with ${state.orders.filter(o => o.currentStage === 'Branding').length} orders\n\nRecommendation: Prioritise SD-110 procurement and approve pending dispatch releases.`;
      records = atRisk.map(o => ({ id: o.orderId, type: 'order' }));
    } else if (lower.includes('approval') || lower.includes('finance') || lower.includes('waiting')) {
      const pending = state.approvals.filter(a => a.status === 'pending');
      answer = `${pending.length} approvals are pending:\n\n${pending.map(a => `• ${a.approvalType} — ${a.entityId} (R${a.amount.toLocaleString()}) — waiting for ${a.waitingForRole.toUpperCase()}`).join('\n')}\n\nTotal value at risk: R${pending.reduce((s, a) => s + a.amount, 0).toLocaleString()}`;
      records = pending.map(a => ({ id: a.entityId, type: a.entityType }));
    } else if (lower.includes('stock') || lower.includes('dispatch') || lower.includes('shortage')) {
      const lowStock = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
      const blockedOrders = state.orders.filter(o => o.status === 'active' && o.currentStage === 'Waiting for Stock');
      answer = `${lowStock.length} products below reorder level:\n\n${lowStock.map(p => `• ${p.sku} ${p.productName}: ${p.stockOnHand} on hand (reorder at ${p.reorderLevel}, ${p.leadTimeDays}d lead time)`).join('\n')}\n\n${blockedOrders.length} orders blocked by stock: ${blockedOrders.map(o => o.orderId).join(', ')}`;
      records = [...lowStock.map(p => ({ id: p.sku, type: 'product' })), ...blockedOrders.map(o => ({ id: o.orderId, type: 'order' }))];
    } else if (lower.includes('pick n pay') || lower.includes('customer')) {
      const custId = lower.includes('pick n pay') ? 'CUST-001' : lower.includes('dis-chem') ? 'CUST-002' : 'CUST-001';
      const cust = state.orders.filter(o => o.customerId === custId);
      const custName = custId === 'CUST-001' ? 'Pick n Pay' : 'Dis-Chem';
      const atRisk = cust.filter(o => o.riskStatus !== 'none');
      const totalValue = cust.reduce((s, o) => s + o.value, 0);
      answer = `${custName} has ${cust.length} orders totalling R${totalValue.toLocaleString()}.\n\n• ${cust.filter(o => o.status === 'active').length} active orders\n• ${atRisk.length} at risk\n• Flagship order CLG-2145 is ${state.orders.find(o => o.orderId === 'CLG-2145')?.riskStatus || 'unknown'} risk — currently in ${state.orders.find(o => o.orderId === 'CLG-2145')?.currentStage}`;
      records = cust.map(o => ({ id: o.orderId, type: 'order' }));
    } else if (lower.includes('margin') || lower.includes('repair') || lower.includes('threshold')) {
      const lowMargin = state.repairs.filter(r => r.marginPct > 0 && r.marginPct < 18);
      answer = `${lowMargin.length} repair job(s) below 18% margin threshold:\n\n${lowMargin.map(r => `• ${r.repairId} — ${r.unitModel} — ${r.marginPct}% margin (R${r.quoteValue.toLocaleString()} quote) — ${r.approvalStatus}`).join('\n')}\n\nAll require finance approval before proceeding.`;
      records = lowMargin.map(r => ({ id: r.repairId, type: 'repair' }));
    } else if (lower.includes('document') || lower.includes('review') || lower.includes('ocr')) {
      const pending = state.documents.filter(d => d.status === 'pending');
      answer = `${pending.length} documents need review:\n\n${pending.map(d => `• ${d.fileName} — ${d.documentType} — ${d.confidence}% confidence — linked to ${d.linkedEntityId}`).join('\n')}\n\nLow confidence documents should be manually verified before processing.`;
      records = pending.map(d => ({ id: d.documentId, type: 'document' }));
    } else if (lower.includes('overdue') || lower.includes('task')) {
      const overdue = state.tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date());
      const urgent = state.tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
      answer = `${overdue.length} overdue tasks, ${urgent.length} urgent:\n\n${[...overdue, ...urgent.filter(u => !overdue.includes(u))].map(t => `• ${t.title} — ${t.owner} — ${t.department} — ${t.status}`).join('\n')}`;
      records = overdue.map(t => ({ id: t.linkedEntityId, type: t.linkedEntityType }));
    } else {
      const active = state.orders.filter(o => o.status === 'active');
      answer = `System status summary:\n\n• ${active.length} active orders (R${active.reduce((s, o) => s + o.value, 0).toLocaleString()} total value)\n• ${state.events.length} events tracked\n• ${state.approvals.filter(a => a.status === 'pending').length} approvals pending\n• ${state.documents.filter(d => d.status === 'pending').length} documents awaiting review\n• ${state.tasks.filter(t => t.status !== 'completed').length} open tasks\n• ${state.repairs.filter(r => r.status !== 'completed').length} active repairs`;
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
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'order': return Package;
      case 'repair': return Wrench;
      case 'document': return FileText;
      case 'product': return Box;
      case 'approval': return CheckCircle;
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
      </div>
    </div>
  );
};

export default AssistantPage;
