import { seedCostCenters, seedMonthlyFinancials, type CostCenter } from '@/data/seed';

/**
 * A "Freeview Grid" — color-coded matrix showing cost centres vs months,
 * inspired by spectrum/channel allocation charts. Each cell shows spend
 * relative to monthly budget allocation with RAG color coding.
 */

const months = seedMonthlyFinancials.map(m => m.month);

// Simulate monthly spend distribution per cost centre
function getMonthlySpend(cc: CostCenter, monthIdx: number): number {
  // Distribute total spent across 6 months with slight variation
  const weights = [0.14, 0.16, 0.12, 0.18, 0.22, 0.18];
  return Math.round(cc.spent * weights[monthIdx]);
}

function getMonthlyBudget(cc: CostCenter): number {
  return Math.round(cc.budget / 6);
}

type CellStatus = 'under' | 'on-track' | 'warning' | 'over';

function getCellStatus(spend: number, budget: number): CellStatus {
  const ratio = spend / budget;
  if (ratio <= 0.7) return 'under';
  if (ratio <= 1.0) return 'on-track';
  if (ratio <= 1.15) return 'warning';
  return 'over';
}

const cellColors: Record<CellStatus, string> = {
  'under': 'bg-status-active/20 text-status-active',
  'on-track': 'bg-status-healthy/20 text-status-healthy',
  'warning': 'bg-status-risk/20 text-status-risk',
  'over': 'bg-status-critical/20 text-status-critical',
};

const cellBorders: Record<CellStatus, string> = {
  'under': 'border-status-active/30',
  'on-track': 'border-status-healthy/30',
  'warning': 'border-status-risk/30',
  'over': 'border-status-critical/30',
};

const fmt = (n: number) => `R${(n / 1000).toFixed(0)}k`;

export function FinancialFreeviewGrid() {
  const costCenters = seedCostCenters;

  return (
    <div className="surface-raised border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Financial Allocation Grid</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Cost centre spend vs budget by month — RAG color-coded</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium sticky left-0 surface-raised z-10 min-w-[180px]">
                Cost Centre
              </th>
              <th className="text-left px-2 py-2.5 text-muted-foreground font-medium min-w-[70px]">Dept</th>
              <th className="text-left px-2 py-2.5 text-muted-foreground font-medium min-w-[70px]">Owner</th>
              {months.map(m => (
                <th key={m} className="text-center px-2 py-2.5 text-muted-foreground font-medium min-w-[90px]">{m}</th>
              ))}
              <th className="text-center px-3 py-2.5 text-muted-foreground font-medium min-w-[80px]">Total Budget</th>
              <th className="text-center px-3 py-2.5 text-muted-foreground font-medium min-w-[80px]">Total Spent</th>
              <th className="text-center px-3 py-2.5 text-muted-foreground font-medium min-w-[60px]">Util %</th>
            </tr>
          </thead>
          <tbody>
            {costCenters.map(cc => {
              const monthlyBudget = getMonthlyBudget(cc);
              const utilPct = Math.round(((cc.spent + cc.committed) / cc.budget) * 100);

              return (
                <tr key={cc.id} className="border-b border-border last:border-0 hover:bg-accent/20">
                  <td className="px-3 py-2 text-foreground font-medium sticky left-0 surface-raised z-10">
                    {cc.name}
                  </td>
                  <td className="px-2 py-2 text-muted-foreground">{cc.department}</td>
                  <td className="px-2 py-2 text-muted-foreground">{cc.owner.split(' ')[0]}</td>
                  {months.map((m, idx) => {
                    const spend = getMonthlySpend(cc, idx);
                    const status = getCellStatus(spend, monthlyBudget);
                    return (
                      <td key={m} className="px-1 py-1.5">
                        <div className={`rounded px-2 py-1.5 text-center font-mono text-[10px] border ${cellColors[status]} ${cellBorders[status]}`}>
                          {fmt(spend)}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-mono text-foreground">{fmt(cc.budget)}</td>
                  <td className="px-3 py-2 text-center font-mono text-foreground">{fmt(cc.spent)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`font-mono font-medium ${
                      utilPct > 100 ? 'text-status-critical' : utilPct > 85 ? 'text-status-risk' : 'text-status-healthy'
                    }`}>
                      {utilPct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="font-medium">Key:</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-status-active/20 border border-status-active/30" />
          <span>Under 70%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-status-healthy/20 border border-status-healthy/30" />
          <span>On Track (70–100%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-status-risk/20 border border-status-risk/30" />
          <span>Warning (100–115%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-status-critical/20 border border-status-critical/30" />
          <span>Over Budget (&gt;115%)</span>
        </div>
      </div>
    </div>
  );
}
