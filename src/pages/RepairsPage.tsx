import { useDemo } from '@/context/DemoContext';
import { Wrench } from 'lucide-react';

const RepairsPage = () => {
  const { state, customers } = useDemo();
  const getCustomer = (id: string) => customers.find(c => c.customerId === id)?.name || id;

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-4">Repairs Module</h1>
      <div className="space-y-3">
        {state.repairs.map(r => (
          <div key={r.repairId} className="surface-raised border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-muted-foreground" />
                <span className="text-sm font-mono font-medium text-foreground">{r.repairId}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  r.status === 'assessment' ? 'bg-status-risk/10 text-status-risk' :
                  r.status === 'approved' || r.status === 'completed' ? 'bg-status-healthy/10 text-status-healthy' :
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepairsPage;
