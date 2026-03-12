import { useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import {
  seedCostCenters, seedMonthlyFinancials, seedFinancialSummary,
  type CostCenter, type CostCenterStatus,
} from '@/data/seed';
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard,
  ArrowUpRight, ArrowDownRight, BarChart3, Kanban,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Cell, PieChart, Pie,
} from 'recharts';

type View = 'kanban' | 'charts';

const statusColumns: CostCenterStatus[] = ['on-track', 'over-budget', 'under-review', 'closed'];
const statusLabels: Record<CostCenterStatus, string> = {
  'on-track': 'On Track',
  'over-budget': 'Over Budget',
  'under-review': 'Under Review',
  'closed': 'Closed',
};
const statusColors: Record<CostCenterStatus, string> = {
  'on-track': 'text-status-healthy',
  'over-budget': 'text-status-critical',
  'under-review': 'text-status-risk',
  'closed': 'text-muted-foreground',
};

const fmt = (n: number) => `R${(n / 1000).toFixed(0)}k`;
const fmtFull = (n: number) => `R${n.toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface-raised border border-border rounded-lg p-3 text-xs shadow-lg">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {fmtFull(p.value)}
        </p>
      ))}
    </div>
  );
};

const FinancialsPage = () => {
  const [view, setView] = useState<View>('kanban');
  const summary = seedFinancialSummary;
  const monthly = seedMonthlyFinancials;
  const costCenters = seedCostCenters;

  const kpis = [
    { label: 'Total Revenue', value: fmtFull(summary.totalRevenue), icon: DollarSign, trend: '+8.2%', up: true },
    { label: 'Gross Margin', value: `${summary.grossMargin}%`, icon: TrendingUp, trend: '+1.4%', up: true },
    { label: 'Net Margin', value: `${summary.netMargin}%`, icon: TrendingDown, trend: '-0.3%', up: false },
    { label: 'Cash Position', value: fmtFull(summary.cashPosition), icon: CreditCard, trend: '+12%', up: true },
    { label: 'Receivables', value: fmtFull(summary.accountsReceivable), icon: ArrowUpRight, trend: '', up: true },
    { label: 'Payables', value: fmtFull(summary.accountsPayable), icon: ArrowDownRight, trend: '', up: false },
  ];

  const departmentSpend = Object.entries(
    costCenters.reduce<Record<string, number>>((acc, cc) => {
      acc[cc.department] = (acc[cc.department] || 0) + cc.spent;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const pieColors = [
    'hsl(217, 91%, 60%)', 'hsl(142, 72%, 46%)', 'hsl(36, 96%, 55%)',
    'hsl(263, 70%, 58%)', 'hsl(0, 72%, 51%)',
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Financial Command</h1>
          <p className="text-[11px] text-muted-foreground">Cost centres, revenue, and margin intelligence — 6-month rolling view</p>
        </div>
        <div className="flex items-center gap-1 surface-raised border border-border rounded-lg p-0.5">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              view === 'kanban' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Kanban size={14} /> Cost Centres
          </button>
          <button
            onClick={() => setView('charts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
              view === 'charts' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 size={14} /> Charts & P&L
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="surface-raised border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon size={16} className="text-muted-foreground" />
              {kpi.trend && (
                <span className={`text-[10px] font-mono ${kpi.up ? 'text-status-healthy' : 'text-status-critical'}`}>
                  {kpi.trend}
                </span>
              )}
            </div>
            <div className="text-xl font-semibold font-mono text-foreground">{kpi.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {view === 'kanban' ? (
        <CostCenterKanban costCenters={costCenters} />
      ) : (
        <ChartsView monthly={monthly} costCenters={costCenters} departmentSpend={departmentSpend} pieColors={pieColors} />
      )}
    </div>
  );
};

function CostCenterKanban({ costCenters }: { costCenters: CostCenter[] }) {
  const [selected, setSelected] = useState<CostCenter | null>(null);

  return (
    <div className="flex gap-4 h-[calc(100vh-16rem)]">
      <div className={`flex-1 overflow-auto ${selected ? 'max-w-[60%]' : ''}`}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {statusColumns.map(status => {
            const items = costCenters.filter(cc => cc.status === status);
            return (
              <div key={status} className="min-w-[260px] w-[260px] shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map(cc => {
                    const utilPct = Math.round(((cc.spent + cc.committed) / cc.budget) * 100);
                    const isOver = utilPct > 100;
                    return (
                      <button
                        key={cc.id}
                        onClick={() => setSelected(cc)}
                        className={`w-full text-left surface-raised border rounded-lg p-4 transition-colors hover:border-muted-foreground/40 ${
                          selected?.id === cc.id ? 'border-status-active/50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{cc.name}</span>
                          <span className={`font-mono text-[10px] ${isOver ? 'text-status-critical' : 'text-status-healthy'}`}>
                            {utilPct}%
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-2">{cc.department} • {cc.owner}</div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                          <div className="h-full flex">
                            <div
                              className={`${isOver ? 'bg-status-critical' : 'bg-status-active'} transition-all`}
                              style={{ width: `${Math.min((cc.spent / cc.budget) * 100, 100)}%` }}
                            />
                            <div
                              className="bg-status-risk/50 transition-all"
                              style={{ width: `${Math.min((cc.committed / cc.budget) * 100, 100 - Math.min((cc.spent / cc.budget) * 100, 100))}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>Budget: {fmt(cc.budget)}</span>
                          <span>Spent: {fmt(cc.spent)}</span>
                          <span>Committed: {fmt(cc.committed)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="w-[40%] shrink-0 overflow-auto">
          <CostCenterDetail cc={selected} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  );
}

function CostCenterDetail({ cc, onClose }: { cc: CostCenter; onClose: () => void }) {
  const utilPct = Math.round(((cc.spent + cc.committed) / cc.budget) * 100);
  const remaining = cc.budget - cc.spent - cc.committed;

  const breakdownData = [
    { name: 'Spent', value: cc.spent },
    { name: 'Committed', value: cc.committed },
    { name: 'Remaining', value: Math.max(remaining, 0) },
  ];

  return (
    <div className="surface-raised border border-border rounded-lg h-full flex flex-col animate-slide-in-right">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-foreground">{cc.name}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
        </div>
        <div className="text-xs text-muted-foreground">{cc.description}</div>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          <span>{cc.department}</span>
          <span>{cc.owner}</span>
          <span className={`font-mono font-medium ${utilPct > 100 ? 'text-status-critical' : 'text-status-healthy'}`}>
            {utilPct}% utilised
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Budget breakdown */}
        <div>
          <h3 className="text-xs font-medium text-foreground mb-3">Budget Allocation</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Budget', value: cc.budget, color: 'text-foreground' },
              { label: 'Spent', value: cc.spent, color: 'text-status-active' },
              { label: 'Committed', value: cc.committed, color: 'text-status-risk' },
            ].map(item => (
              <div key={item.label} className="surface-overlay rounded-md p-3 text-center">
                <div className={`text-lg font-mono font-semibold ${item.color}`}>{fmt(item.value)}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual breakdown */}
        <div>
          <h3 className="text-xs font-medium text-foreground mb-3">Spend Breakdown</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="hsl(217, 91%, 60%)" />
                  <Cell fill="hsl(36, 96%, 55%)" />
                  <Cell fill="hsl(220, 14%, 15%)" />
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="surface-raised border border-border rounded p-2 text-xs shadow-lg">
                        <span className="text-foreground">{payload[0].name}: {fmtFull(payload[0].value as number)}</span>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Remaining */}
        <div className="surface-overlay rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Remaining Budget</span>
            <span className={`text-lg font-mono font-semibold ${remaining < 0 ? 'text-status-critical' : 'text-status-healthy'}`}>
              {remaining < 0 ? '-' : ''}{fmtFull(Math.abs(remaining))}
            </span>
          </div>
          {remaining < 0 && (
            <p className="text-[10px] text-status-critical mt-1">⚠ Over budget by {fmtFull(Math.abs(remaining))}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartsView({ monthly, costCenters, departmentSpend, pieColors }: {
  monthly: typeof seedMonthlyFinancials;
  costCenters: CostCenter[];
  departmentSpend: { name: string; value: number }[];
  pieColors: string[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Revenue & Profit Trend */}
      <div className="surface-raised border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Revenue & Profit Trend</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stackId="1" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.15} />
              <Area type="monotone" dataKey="grossProfit" name="Gross Profit" stackId="2" stroke="hsl(142, 72%, 46%)" fill="hsl(142, 72%, 46%)" fillOpacity={0.15} />
              <Area type="monotone" dataKey="netProfit" name="Net Profit" stackId="3" stroke="hsl(263, 70%, 58%)" fill="hsl(263, 70%, 58%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COGS vs Opex */}
      <div className="surface-raised border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">COGS vs Operating Expenses</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cogs" name="COGS" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="opex" name="OPEX" fill="hsl(36, 96%, 55%)" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Volume & AOV */}
      <div className="surface-raised border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Order Volume & Avg Value</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Line yAxisId="left" type="monotone" dataKey="orderCount" name="Orders" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgOrderValue" name="Avg Value" stroke="hsl(142, 72%, 46%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Spend */}
      <div className="surface-raised border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Spend by Department</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentSpend} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Spend" radius={[0, 4, 4, 0]} opacity={0.85}>
                {departmentSpend.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Center Summary Table */}
      <div className="lg:col-span-2 surface-raised border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Cost Centre Overview</h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Cost Centre</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Department</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Budget</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Spent</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Committed</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Remaining</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Utilisation</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {costCenters.map(cc => {
              const util = Math.round(((cc.spent + cc.committed) / cc.budget) * 100);
              const rem = cc.budget - cc.spent - cc.committed;
              return (
                <tr key={cc.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3 text-foreground font-medium">{cc.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cc.department}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{fmtFull(cc.budget)}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">{fmtFull(cc.spent)}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmtFull(cc.committed)}</td>
                  <td className={`px-4 py-3 text-right font-mono ${rem < 0 ? 'text-status-critical' : 'text-status-healthy'}`}>
                    {rem < 0 ? '-' : ''}{fmtFull(Math.abs(rem))}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${util > 100 ? 'text-status-critical' : 'text-foreground'}`}>
                    {util}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[cc.status]} ${
                      cc.status === 'on-track' ? 'bg-status-healthy/10' :
                      cc.status === 'over-budget' ? 'bg-status-critical/10' :
                      cc.status === 'under-review' ? 'bg-status-risk/10' :
                      'bg-accent'
                    }`}>
                      {statusLabels[cc.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FinancialsPage;
