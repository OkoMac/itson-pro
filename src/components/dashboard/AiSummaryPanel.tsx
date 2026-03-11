import { useDemo } from '@/context/DemoContext';
import { Brain } from 'lucide-react';
import { useState } from 'react';

export function AiSummaryPanel() {
  const { state } = useDemo();
  const [query, setQuery] = useState('');

  const atRisk = state.orders.filter(o => o.riskStatus !== 'none' && o.status === 'active');
  const stockEvents = state.events.filter(e => e.type === 'StockThresholdBreached' && e.status === 'new');
  const pendingApprovals = state.approvals.filter(a => a.status === 'pending');

  const summary = [
    `${atRisk.length} orders are at risk today.`,
    stockEvents.length > 0 ? `${stockEvents.length} blocked by stock shortages.` : null,
    pendingApprovals.length > 0 ? `${pendingApprovals.length} approvals are waiting for action.` : null,
    state.repairs.some(r => r.marginPct < 18) ? 'One repair quote is below margin threshold.' : null,
    'Branding is the slowest workflow stage this week.',
  ].filter(Boolean);

  return (
    <div className="surface-raised border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} className="text-status-ai" />
        <h2 className="text-sm font-semibold text-foreground">Operational Intelligence</h2>
      </div>
      <div className="space-y-1 mb-3">
        {summary.map((line, i) => (
          <p key={i} className="text-[11px] text-muted-foreground">• {line}</p>
        ))}
      </div>
      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Run operational query..."
          className="w-full h-8 rounded-md bg-secondary border border-border px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-status-ai/50"
        />
      </div>
    </div>
  );
}
