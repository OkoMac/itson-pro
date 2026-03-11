import { useDemo } from '@/context/DemoContext';
import type { OrderStage } from '@/data/seed';

const stages: OrderStage[] = [
  'Order Received', 'Procurement', 'In Production', 'Waiting for Stock',
  'Filling', 'Branding', 'Dispatch Ready', 'Dispatched',
];

export function WorkflowPressurePanel() {
  const { state } = useDemo();
  const activeOrders = state.orders.filter(o => o.status === 'active');

  const stageCounts = stages.map(stage => {
    const count = activeOrders.filter(o => o.currentStage === stage).length;
    const hasRisk = activeOrders.some(o => o.currentStage === stage && o.riskStatus !== 'none');
    return { stage, count, hasRisk };
  });

  const maxCount = Math.max(...stageCounts.map(s => s.count), 1);

  return (
    <div className="surface-raised border border-border rounded-lg p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">Workflow Pressure</h2>
      <div className="space-y-2">
        {stageCounts.map(({ stage, count, hasRisk }) => (
          <div key={stage} className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-32 shrink-0 truncate">{stage}</span>
            <div className="flex-1 h-5 bg-secondary rounded-sm overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all ${hasRisk ? 'bg-status-risk/40' : 'bg-status-active/30'}`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-foreground w-6 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
