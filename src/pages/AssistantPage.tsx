import { useDemo } from '@/context/DemoContext';
import { useState } from 'react';
import { Brain, ArrowRight } from 'lucide-react';

const suggestedPrompts = [
  'Why are orders delayed today?',
  'Which jobs are waiting for finance approval?',
  'What stock shortages are affecting dispatch?',
  'Show all activity on customer Pick n Pay.',
  'Which repair jobs are below margin threshold?',
  'Which documents need review today?',
];

const AssistantPage = () => {
  const { state, dispatch } = useDemo();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<{ answer: string; records: string[] } | null>(null);

  const runQuery = (q: string) => {
    const lower = q.toLowerCase();
    let answer = '';
    let records: string[] = [];

    if (lower.includes('delay') || lower.includes('risk')) {
      const atRisk = state.orders.filter(o => o.riskStatus !== 'none');
      answer = `${atRisk.length} orders are currently at risk or delayed. Primary causes: stock shortages on SD-110 and FS-250, and 1 pending branding instruction.`;
      records = atRisk.map(o => o.orderId);
    } else if (lower.includes('approval') || lower.includes('finance')) {
      const pending = state.approvals.filter(a => a.status === 'pending');
      answer = `${pending.length} approvals are pending: ${pending.map(a => a.approvalType).join(', ')}.`;
      records = pending.map(a => a.entityId);
    } else if (lower.includes('stock') || lower.includes('dispatch')) {
      const lowStock = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
      answer = `${lowStock.length} products are below reorder level: ${lowStock.map(p => p.sku).join(', ')}. These are affecting orders CLG-2145 and CLG-2147.`;
      records = lowStock.map(p => p.sku);
    } else if (lower.includes('pick n pay') || lower.includes('customer')) {
      const pnpOrders = state.orders.filter(o => o.customerId === 'CUST-001');
      answer = `Pick n Pay has ${pnpOrders.length} active orders. Flagship order CLG-2145 is at risk due to SD-110 stock shortage.`;
      records = pnpOrders.map(o => o.orderId);
    } else if (lower.includes('margin') || lower.includes('repair')) {
      const lowMargin = state.repairs.filter(r => r.marginPct < 18);
      answer = `${lowMargin.length} repair job(s) below 18% margin threshold. REP-001 (HD-200 motor failure) at 13% margin — pending approval.`;
      records = lowMargin.map(r => r.repairId);
    } else if (lower.includes('document') || lower.includes('review')) {
      const pending = state.documents.filter(d => d.status === 'pending');
      answer = `${pending.length} documents need review: ${pending.map(d => d.fileName).join(', ')}.`;
      records = pending.map(d => d.documentId);
    } else {
      answer = `Query processed. ${state.orders.filter(o => o.status === 'active').length} active orders, ${state.events.length} events tracked, ${state.approvals.filter(a => a.status === 'pending').length} approvals pending.`;
      records = [];
    }

    setResponse({ answer, records });
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

  return (
    <div className="max-w-2xl">
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
        <button
          onClick={() => query.trim() && runQuery(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {suggestedPrompts.map(p => (
          <button
            key={p}
            onClick={() => runQuery(p)}
            className="text-[11px] px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {response && (
        <div className="surface-raised border border-border rounded-lg p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-status-ai" />
            <span className="text-xs font-medium text-foreground">Response</span>
          </div>
          <p className="text-sm text-foreground mb-3">{response.answer}</p>
          {response.records.length > 0 && (
            <div>
              <span className="text-[10px] text-muted-foreground">Linked records:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {response.records.map(r => (
                  <span key={r} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantPage;
