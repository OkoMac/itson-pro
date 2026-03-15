import { useState, useMemo } from 'react';
import { seedCostCenters, seedMonthlyFinancials, seedFinancialSummary, seedDataCenters, seedInvoices, type CostCenter, type CostCenterStatus, type Invoice, type InvoiceStatus } from '@/data/seed';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, BarChart3, Kanban, Grid3X3, Map, Server, Receipt, ChevronRight, Globe, Filter, Download } from 'lucide-react';

function exportCsv(filename: string, rows: string[][], headers: string[]) {
  const lines = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell, PieChart, Pie, Legend } from 'recharts';
import { FinancialFreeviewGrid } from '@/components/financials/FinancialFreeviewGrid';
import { EnterpriseLandscapeChart } from '@/components/financials/EnterpriseLandscapeChart';
import { cn } from '@/lib/utils';

type View = 'kanban' | 'charts' | 'grid' | 'landscape' | 'datacenters' | 'invoices';

const statusColumns: CostCenterStatus[] = ['on-track', 'over-budget', 'under-review', 'closed'];
const statusLabels: Record<CostCenterStatus, string> = {
  'on-track': 'On Track', 'over-budget': 'Over Budget', 'under-review': 'Under Review', 'closed': 'Closed',
};
const statusColors: Record<CostCenterStatus, string> = {
  'on-track': 'text-status-healthy', 'over-budget': 'text-status-critical', 'under-review': 'text-status-risk', 'closed': 'text-muted-foreground',
};

const fmt = (n: number) => `R${(n / 1000).toFixed(0)}k`;
const fmtFull = (n: number) => `R${n.toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface-raised border border-border rounded-lg p-3 text-xs shadow-lg">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">{p.name}: {fmtFull(p.value)}</p>
      ))}
    </div>
  );
};

const FinancialsPage = () => {
  const [view, setView] = useState<View>('kanban');
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const summary = seedFinancialSummary;
  const monthly = seedMonthlyFinancials;
  const costCenters = seedCostCenters;

  const kpis = [
    { id: 'revenue', label: 'Total Revenue', value: fmtFull(summary.totalRevenue), icon: DollarSign, trend: '+8.2%', up: true },
    { id: 'grossMargin', label: 'Gross Margin', value: `${summary.grossMargin}%`, icon: TrendingUp, trend: '+1.4%', up: true },
    { id: 'netMargin', label: 'Net Margin', value: `${summary.netMargin}%`, icon: TrendingDown, trend: '-0.3%', up: false },
    { id: 'cash', label: 'Cash Position', value: fmtFull(summary.cashPosition), icon: CreditCard, trend: '+12%', up: true },
    { id: 'receivables', label: 'Receivables', value: fmtFull(summary.accountsReceivable), icon: ArrowUpRight, trend: '', up: true },
    { id: 'payables', label: 'Payables', value: fmtFull(summary.accountsPayable), icon: ArrowDownRight, trend: '', up: false },
  ];

  const departmentSpend = Object.entries(
    costCenters.reduce<Record<string, number>>((acc, cc) => {
      acc[cc.department] = (acc[cc.department] || 0) + cc.spent;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const pieColors = ['hsl(217, 91%, 60%)', 'hsl(142, 72%, 46%)', 'hsl(36, 96%, 55%)', 'hsl(263, 70%, 58%)', 'hsl(0, 72%, 51%)'];

  const viewTabs: { id: View; label: string; icon: typeof Kanban }[] = [
    { id: 'kanban', label: 'Cost Centres', icon: Kanban },
    { id: 'charts', label: 'Charts & P&L', icon: BarChart3 },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'datacenters', label: 'Data Centres', icon: Server },
    { id: 'grid', label: 'Allocation Grid', icon: Grid3X3 },
    { id: 'landscape', label: 'System Landscape', icon: Map },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Financial Command</h1>
          <p className="text-[11px] text-muted-foreground">Cost centres, revenue, margin intelligence, and enterprise coverage</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const rows = seedCostCenters.map(cc => [cc.id, cc.name, cc.department, String(cc.budget), String(cc.spent), String(cc.committed), cc.status, cc.owner]);
              exportCsv('cost-centres-export.csv', rows, ['ID', 'Name', 'Department', 'Budget', 'Spent', 'Committed', 'Status', 'Owner']);
            }}
            className="h-7 px-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Download size={12} /> Export
          </button>
          <div className="flex items-center gap-1 surface-raised border border-border rounded-lg p-0.5">
            {viewTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  view === t.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <button
            key={kpi.id}
            onClick={() => setActiveKpi(activeKpi === kpi.id ? null : kpi.id)}
            className={cn(
              'text-left surface-raised border rounded-lg p-4 transition-all hover:border-muted-foreground/40',
              activeKpi === kpi.id ? 'border-status-active/50 ring-1 ring-status-active/20' : 'border-border'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon size={16} className="text-muted-foreground" />
              {kpi.trend && (
                <span className={`text-[10px] font-mono ${kpi.up ? 'text-status-healthy' : 'text-status-critical'}`}>{kpi.trend}</span>
              )}
            </div>
            <div className="text-xl font-semibold font-mono text-foreground">{kpi.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
            <div className="text-[9px] text-status-active mt-1">Click to drill down →</div>
          </button>
        ))}
      </div>

      {/* KPI Drill-Down Panel */}
      {activeKpi && (
        <KpiDrillDown
          kpiId={activeKpi}
          monthly={monthly}
          summary={summary}
          costCenters={costCenters}
          onClose={() => setActiveKpi(null)}
        />
      )}

      {view === 'kanban' && <CostCenterKanban costCenters={costCenters} />}
      {view === 'charts' && <ChartsView monthly={monthly} costCenters={costCenters} departmentSpend={departmentSpend} pieColors={pieColors} />}
      {view === 'invoices' && <InvoiceKanban />}
      {view === 'datacenters' && <DataCentersView />}
      {view === 'grid' && <FinancialFreeviewGrid />}
      {view === 'landscape' && <EnterpriseLandscapeChart />}
    </div>
  );
};

// ── KPI Drill-Down Panel ────────────────────────────────────────────────

function KpiDrillDown({ kpiId, monthly, summary, costCenters, onClose }: {
  kpiId: string;
  monthly: typeof seedMonthlyFinancials;
  summary: typeof seedFinancialSummary;
  costCenters: CostCenter[];
  onClose: () => void;
}) {
  const panels: Record<string, () => React.ReactNode> = {
    revenue: () => {
      const byMonth = monthly.map(m => ({ month: m.month, revenue: m.revenue, orders: m.orderCount, aov: m.avgOrderValue }));
      const topCustomerRevenue = [
        { name: 'Pick n Pay', value: 1420000 },
        { name: 'Standard Bank HQ', value: 1180000 },
        { name: 'Dis-Chem', value: 1050000 },
        { name: 'OR Tambo Airport', value: 980000 },
        { name: 'Mediclinic Sandton', value: 860000 },
        { name: 'Woolworths Regional', value: 720000 },
        { name: 'Sandton Office Park', value: 680000 },
        { name: 'Others', value: 965000 },
      ];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total Revenue (6mo)" value={fmtFull(summary.totalRevenue)} />
            <Stat label="Avg Monthly" value={fmtFull(Math.round(summary.totalRevenue / 6))} />
            <Stat label="Total Orders" value={String(monthly.reduce((s, m) => s + m.orderCount, 0))} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">Monthly Revenue Breakdown</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">Revenue by Customer</h4>
              <div className="space-y-2">
                {topCustomerRevenue.map(c => {
                  const pct = Math.round((c.value / summary.totalRevenue) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-foreground">{c.name}</span>
                        <span className="font-mono text-muted-foreground">{fmtFull(c.value)} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-status-active rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="surface-overlay border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Month</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Revenue</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Orders</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Avg Order Value</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">MoM Change</th>
              </tr></thead>
              <tbody>
                {byMonth.map((m, i) => {
                  const prev = i > 0 ? byMonth[i - 1].revenue : m.revenue;
                  const change = ((m.revenue - prev) / prev * 100).toFixed(1);
                  return (
                    <tr key={m.month} className="border-b border-border last:border-0 hover:bg-accent/20">
                      <td className="px-3 py-2 text-foreground">{m.month}</td>
                      <td className="px-3 py-2 text-right font-mono text-foreground">{fmtFull(m.revenue)}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">{m.orders}</td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">{fmtFull(m.aov)}</td>
                      <td className={`px-3 py-2 text-right font-mono ${Number(change) >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
                        {i > 0 ? `${Number(change) >= 0 ? '+' : ''}${change}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
    grossMargin: () => {
      const data = monthly.map(m => ({
        month: m.month,
        revenue: m.revenue,
        cogs: m.cogs,
        grossProfit: m.grossProfit,
        margin: ((m.grossProfit / m.revenue) * 100).toFixed(1),
      }));
      const cogsBreakdown = [
        { name: 'Raw Materials', value: Math.round(summary.totalCogs * 0.42) },
        { name: 'Component Parts', value: Math.round(summary.totalCogs * 0.28) },
        { name: 'Direct Labour', value: Math.round(summary.totalCogs * 0.18) },
        { name: 'Packaging', value: Math.round(summary.totalCogs * 0.08) },
        { name: 'Freight Inbound', value: Math.round(summary.totalCogs * 0.04) },
      ];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Gross Margin" value={`${summary.grossMargin}%`} highlight />
            <Stat label="Total COGS" value={fmtFull(summary.totalCogs)} />
            <Stat label="Gross Profit" value={fmtFull(summary.totalRevenue - summary.totalCogs)} />
            <Stat label="COGS / Revenue" value={`${((summary.totalCogs / summary.totalRevenue) * 100).toFixed(1)}%`} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">Margin Trend</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} domain={[30, 50]} unit="%" />
                    <Tooltip content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="surface-raised border border-border rounded-lg p-2 text-xs shadow-lg">
                          <p className="text-foreground font-medium">{label}</p>
                          <p className="text-status-healthy font-mono">Margin: {payload[0].value}%</p>
                        </div>
                      );
                    }} />
                    <Line type="monotone" dataKey="margin" stroke="hsl(142, 72%, 46%)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">COGS Composition</h4>
              <div className="space-y-2">
                {cogsBreakdown.map(c => {
                  const pct = Math.round((c.value / summary.totalCogs) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-foreground">{c.name}</span>
                        <span className="font-mono text-muted-foreground">{fmtFull(c.value)} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-status-risk rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="surface-overlay border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Month</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Revenue</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">COGS</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Gross Profit</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Margin %</th>
              </tr></thead>
              <tbody>
                {data.map(m => (
                  <tr key={m.month} className="border-b border-border last:border-0 hover:bg-accent/20">
                    <td className="px-3 py-2 text-foreground">{m.month}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{fmtFull(m.revenue)}</td>
                    <td className="px-3 py-2 text-right font-mono text-status-critical">{fmtFull(m.cogs)}</td>
                    <td className="px-3 py-2 text-right font-mono text-status-healthy">{fmtFull(m.grossProfit)}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{m.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
    netMargin: () => {
      const data = monthly.map(m => ({
        month: m.month,
        grossProfit: m.grossProfit,
        opex: m.opex,
        netProfit: m.netProfit,
        netMargin: ((m.netProfit / m.revenue) * 100).toFixed(1),
      }));
      const opexBreakdown = [
        { name: 'Salaries & Wages', value: Math.round(summary.totalOpex * 0.45) },
        { name: 'Rent & Utilities', value: Math.round(summary.totalOpex * 0.18) },
        { name: 'Marketing & Sales', value: Math.round(summary.totalOpex * 0.12) },
        { name: 'Insurance & Legal', value: Math.round(summary.totalOpex * 0.09) },
        { name: 'IT & Software', value: Math.round(summary.totalOpex * 0.08) },
        { name: 'Travel & Admin', value: Math.round(summary.totalOpex * 0.05) },
        { name: 'Depreciation', value: Math.round(summary.totalOpex * 0.03) },
      ];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Net Margin" value={`${summary.netMargin}%`} highlight />
            <Stat label="Total OPEX" value={fmtFull(summary.totalOpex)} />
            <Stat label="Net Profit" value={fmtFull(summary.totalRevenue - summary.totalCogs - summary.totalOpex)} />
            <Stat label="OPEX / Revenue" value={`${((summary.totalOpex / summary.totalRevenue) * 100).toFixed(1)}%`} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">Profitability Waterfall</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
                    <YAxis tickFormatter={fmt} tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="grossProfit" name="Gross Profit" fill="hsl(142, 72%, 46%)" opacity={0.4} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="opex" name="OPEX" fill="hsl(36, 96%, 55%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netProfit" name="Net Profit" fill="hsl(263, 70%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">OPEX Breakdown</h4>
              <div className="space-y-2">
                {opexBreakdown.map(c => {
                  const pct = Math.round((c.value / summary.totalOpex) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-foreground">{c.name}</span>
                        <span className="font-mono text-muted-foreground">{fmtFull(c.value)} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-status-risk rounded-full" style={{ width: `${pct * 2}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    },
    cash: () => {
      const cashFlow = monthly.map((m, i) => ({
        month: m.month,
        inflow: Math.round(m.revenue * 0.92),
        outflow: Math.round((m.cogs + m.opex) * 0.95),
        net: Math.round(m.revenue * 0.92 - (m.cogs + m.opex) * 0.95),
        balance: summary.cashPosition + monthly.slice(0, i + 1).reduce((s, x) => s + Math.round(x.revenue * 0.92 - (x.cogs + x.opex) * 0.95), 0),
      }));
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Cash Position" value={fmtFull(summary.cashPosition)} highlight />
            <Stat label="Receivables" value={fmtFull(summary.accountsReceivable)} />
            <Stat label="Payables" value={fmtFull(summary.accountsPayable)} />
            <Stat label="Net Working Capital" value={fmtFull(summary.cashPosition + summary.accountsReceivable - summary.accountsPayable)} />
          </div>
          <div className="surface-overlay border border-border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-foreground mb-3">Cash Flow Projection</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
                  <YAxis tickFormatter={fmt} tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="inflow" name="Cash In" stroke="hsl(142, 72%, 46%)" fill="hsl(142, 72%, 46%)" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="outflow" name="Cash Out" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.1} />
                  <Line type="monotone" dataKey="balance" name="Balance" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="surface-overlay border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Month</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Cash Inflow</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Cash Outflow</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Net Cash</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Running Balance</th>
              </tr></thead>
              <tbody>
                {cashFlow.map(m => (
                  <tr key={m.month} className="border-b border-border last:border-0 hover:bg-accent/20">
                    <td className="px-3 py-2 text-foreground">{m.month}</td>
                    <td className="px-3 py-2 text-right font-mono text-status-healthy">{fmtFull(m.inflow)}</td>
                    <td className="px-3 py-2 text-right font-mono text-status-critical">{fmtFull(m.outflow)}</td>
                    <td className={`px-3 py-2 text-right font-mono ${m.net >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>{m.net >= 0 ? '+' : ''}{fmtFull(m.net)}</td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">{fmtFull(m.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
    receivables: () => {
      const agingBuckets = [
        { bucket: 'Current (0-30d)', value: Math.round(summary.accountsReceivable * 0.42), color: 'bg-status-healthy' },
        { bucket: '31-60 days', value: Math.round(summary.accountsReceivable * 0.28), color: 'bg-status-active' },
        { bucket: '61-90 days', value: Math.round(summary.accountsReceivable * 0.18), color: 'bg-status-risk' },
        { bucket: '90+ days', value: Math.round(summary.accountsReceivable * 0.12), color: 'bg-status-critical' },
      ];
      const customerAR = [
        { name: 'Pick n Pay', amount: 185000, days: 22 },
        { name: 'Standard Bank HQ', amount: 156000, days: 45 },
        { name: 'Dis-Chem', amount: 142000, days: 18 },
        { name: 'Netcare Morningside', amount: 118000, days: 67 },
        { name: 'OR Tambo Airport', amount: 98000, days: 35 },
        { name: 'Woolworths Regional', amount: 78000, days: 52 },
        { name: 'Others', amount: 65000, days: 41 },
      ];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total Receivables" value={fmtFull(summary.accountsReceivable)} highlight />
            <Stat label="Avg Days Outstanding" value="38 days" />
            <Stat label="90+ Days Overdue" value={fmtFull(agingBuckets[3].value)} warning />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">Aging Analysis</h4>
              <div className="space-y-3">
                {agingBuckets.map(b => (
                  <div key={b.bucket}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-foreground">{b.bucket}</span>
                      <span className="font-mono text-muted-foreground">{fmtFull(b.value)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${b.color} rounded-full`} style={{ width: `${(b.value / summary.accountsReceivable) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface-overlay border border-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-foreground mb-3">By Customer</h4>
              <div className="space-y-2">
                {customerAR.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground">{c.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono ${c.days > 60 ? 'text-status-critical' : c.days > 30 ? 'text-status-risk' : 'text-muted-foreground'}`}>{c.days}d</span>
                      <span className="font-mono text-foreground w-[80px] text-right">{fmtFull(c.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    },
    payables: () => {
      const supplierAP = [
        { name: 'DryCo International', amount: 128000, dueIn: 12 },
        { name: 'HygiTech SA', amount: 95000, dueIn: 8 },
        { name: 'CleanFlow Parts', amount: 72000, dueIn: 22 },
        { name: 'BrandWrap Packaging', amount: 58000, dueIn: 15 },
        { name: 'FastFreight Logistics', amount: 45000, dueIn: 5 },
        { name: 'Utility Providers', amount: 32000, dueIn: 18 },
        { name: 'Other Suppliers', amount: 26000, dueIn: 30 },
      ];
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total Payables" value={fmtFull(summary.accountsPayable)} highlight />
            <Stat label="Due Within 7 Days" value={fmtFull(supplierAP.filter(s => s.dueIn <= 7).reduce((s, x) => s + x.amount, 0))} warning />
            <Stat label="Supplier Count" value={`${supplierAP.length} active`} />
          </div>
          <div className="surface-overlay border border-border rounded-lg p-4">
            <h4 className="text-xs font-semibold text-foreground mb-3">Payables by Supplier</h4>
            <div className="space-y-2">
              {supplierAP.map(s => (
                <div key={s.name} className="flex items-center justify-between text-[11px] py-1 border-b border-border last:border-0">
                  <span className="text-foreground">{s.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.dueIn <= 7 ? 'bg-status-critical/10 text-status-critical' : s.dueIn <= 14 ? 'bg-status-risk/10 text-status-risk' : 'bg-accent text-muted-foreground'}`}>
                      Due in {s.dueIn}d
                    </span>
                    <span className="font-mono text-foreground w-[80px] text-right">{fmtFull(s.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    },
  };

  const titles: Record<string, string> = {
    revenue: 'Revenue Deep Dive',
    grossMargin: 'Gross Margin Analysis',
    netMargin: 'Net Margin & OPEX Breakdown',
    cash: 'Cash Flow & Working Capital',
    receivables: 'Accounts Receivable Aging',
    payables: 'Accounts Payable Overview',
  };

  return (
    <div className="surface-raised border border-status-active/30 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{titles[kpiId] ?? kpiId}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs px-2 py-1 rounded hover:bg-accent">✕ Close</button>
      </div>
      <div className="p-4">
        {panels[kpiId]?.()}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, warning }: { label: string; value: string; highlight?: boolean; warning?: boolean }) {
  return (
    <div className="surface-overlay border border-border rounded-lg p-3">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className={cn('text-lg font-mono font-bold', highlight ? 'text-status-active' : warning ? 'text-status-critical' : 'text-foreground')}>{value}</div>
    </div>
  );
}

// ── Cost Center Kanban ──────────────────────────────────────────────

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
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${statusColors[status]}`}>{statusLabels[status]}</span>
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
                          <span className={`font-mono text-[10px] ${isOver ? 'text-status-critical' : 'text-status-healthy'}`}>{utilPct}%</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-2">{cc.department} • {cc.owner}</div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                          <div className="h-full flex">
                            <div className={`${isOver ? 'bg-status-critical' : 'bg-status-active'} transition-all`} style={{ width: `${Math.min((cc.spent / cc.budget) * 100, 100)}%` }} />
                            <div className="bg-status-risk/50 transition-all" style={{ width: `${Math.min((cc.committed / cc.budget) * 100, 100 - Math.min((cc.spent / cc.budget) * 100, 100))}%` }} />
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

// ── Cost Center Detail ──────────────────────────────────────────────

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
          <span className={`font-mono font-medium ${utilPct > 100 ? 'text-status-critical' : 'text-status-healthy'}`}>{utilPct}% utilised</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
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

        <div>
          <h3 className="text-xs font-medium text-foreground mb-3">Spend Breakdown</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  <Cell fill="hsl(217, 91%, 60%)" />
                  <Cell fill="hsl(36, 96%, 55%)" />
                  <Cell fill="hsl(220, 14%, 15%)" />
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="surface-raised border border-border rounded p-2 text-xs shadow-lg">
                      <span className="text-foreground">{payload[0].name}: {fmtFull(payload[0].value as number)}</span>
                    </div>
                  );
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-overlay rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Remaining Budget</span>
            <span className={`text-lg font-mono font-semibold ${remaining < 0 ? 'text-status-critical' : 'text-status-healthy'}`}>
              {remaining < 0 ? '-' : ''}{fmtFull(Math.abs(remaining))}
            </span>
          </div>
          {remaining < 0 && <p className="text-[10px] text-status-critical mt-1">⚠ Over budget by {fmtFull(Math.abs(remaining))}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Charts View ──────────────────────────────────────────────

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
        <div className="overflow-x-auto">
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
                    <td className={`px-4 py-3 text-right font-mono ${rem < 0 ? 'text-status-critical' : 'text-status-healthy'}`}>{rem < 0 ? '-' : ''}{fmtFull(Math.abs(rem))}</td>
                    <td className={`px-4 py-3 text-right font-mono ${util > 100 ? 'text-status-critical' : 'text-foreground'}`}>{util}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[cc.status]} ${
                        cc.status === 'on-track' ? 'bg-status-healthy/10' :
                        cc.status === 'over-budget' ? 'bg-status-critical/10' :
                        cc.status === 'under-review' ? 'bg-status-risk/10' : 'bg-accent'
                      }`}>{statusLabels[cc.status]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Invoice Kanban ──────────────────────────────────────────────────────────

const INVOICE_STATUS_ORDER: InvoiceStatus[] = ['draft', 'pending', 'approved', 'sent', 'paid', 'overdue', 'disputed'];

const INVOICE_STATUS_CFG: Record<InvoiceStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft:    { label: 'Draft',    color: 'text-muted-foreground', bg: 'bg-accent',             dot: 'bg-muted-foreground' },
  pending:  { label: 'Pending',  color: 'text-status-risk',      bg: 'bg-status-risk/10',      dot: 'bg-status-risk' },
  approved: { label: 'Approved', color: 'text-status-active',    bg: 'bg-status-active/10',    dot: 'bg-status-active' },
  sent:     { label: 'Sent',     color: 'text-blue-400',         bg: 'bg-blue-400/10',         dot: 'bg-blue-400' },
  paid:     { label: 'Paid',     color: 'text-status-healthy',   bg: 'bg-status-healthy/10',   dot: 'bg-status-healthy' },
  overdue:  { label: 'Overdue',  color: 'text-status-critical',  bg: 'bg-status-critical/10',  dot: 'bg-status-critical' },
  disputed: { label: 'Disputed', color: 'text-orange-400',       bg: 'bg-orange-400/10',       dot: 'bg-orange-400' },
};

const fmtFull2 = (n: number) => `R${n.toLocaleString()}`;

function InvoiceKanban() {
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = typeFilter === 'all' ? invoices : invoices.filter(i => i.invoiceType === typeFilter);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(INVOICE_STATUS_ORDER.map(s => [s, [] as Invoice[]])) as Record<InvoiceStatus, Invoice[]>;
    filtered.forEach(inv => map[inv.status].push(inv));
    return map;
  }, [filtered]);

  const move = (invoiceId: string, newStatus: InvoiceStatus) =>
    setInvoices(prev => prev.map(i => i.invoiceId === invoiceId ? { ...i, status: newStatus } : i));

  const stats = useMemo(() => ({
    outstanding: invoices.filter(i => ['pending', 'sent', 'approved'].includes(i.status)).reduce((s, i) => s + i.total, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
  }), [invoices]);

  return (
    <div className="space-y-3">
      {/* Mini KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Outstanding', value: fmtFull2(stats.outstanding), color: 'text-status-risk' },
          { label: 'Overdue', value: fmtFull2(stats.overdue), color: 'text-status-critical' },
          { label: 'Collected', value: fmtFull2(stats.paid), color: 'text-status-healthy' },
        ].map(s => (
          <div key={s.label} className="surface-raised border border-border rounded-lg p-3">
            <div className="text-[10px] text-muted-foreground mb-1">{s.label}</div>
            <div className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2">
        <Filter size={12} className="text-muted-foreground" />
        {(['all', 'sales', 'repair', 'maintenance', 'hosting'] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn('text-[11px] px-2 py-0.5 rounded-md capitalize transition-colors border',
              typeFilter === t ? 'bg-status-active/20 text-status-active border-status-active/30' : 'text-muted-foreground border-transparent hover:bg-accent'
            )}>
            {t}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} invoices · {fmtFull2(filtered.reduce((s, i) => s + i.total, 0))}</span>
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {INVOICE_STATUS_ORDER.map(status => {
            const cfg = INVOICE_STATUS_CFG[status];
            const items = byStatus[status];
            const colTotal = items.reduce((s, i) => s + i.total, 0);
            const nextStatus = INVOICE_STATUS_ORDER[INVOICE_STATUS_ORDER.indexOf(status) + 1] as InvoiceStatus | undefined;
            const prevStatus = INVOICE_STATUS_ORDER[INVOICE_STATUS_ORDER.indexOf(status) - 1] as InvoiceStatus | undefined;
            return (
              <div key={status} className="w-[220px] shrink-0 flex flex-col gap-2">
                <div className={cn('rounded-md px-2.5 py-1.5 flex items-center justify-between', cfg.bg)}>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    <span className={cn('text-[11px] font-semibold', cfg.color)}>{cfg.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{items.length}</span>
                </div>
                {items.length > 0 && <div className="text-[10px] text-muted-foreground font-mono pl-1">{fmtFull2(colTotal)}</div>}
                <div className="flex flex-col gap-2">
                  {items.length === 0 && (
                    <div className="text-[11px] text-muted-foreground/40 text-center py-4 border border-dashed border-border rounded-md">Empty</div>
                  )}
                  {items.map(inv => (
                    <div key={inv.invoiceId} className="surface-raised border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-muted-foreground">{inv.invoiceId}</span>
                        <span className={cn('text-[9px] px-1 py-0.5 rounded capitalize', cfg.bg, cfg.color)}>{inv.invoiceType}</span>
                      </div>
                      <div className="text-xs font-medium text-foreground truncate mb-1">{inv.description}</div>
                      <div className="text-sm font-mono font-bold text-foreground mb-1">{fmtFull2(inv.total)}</div>
                      <div className="text-[10px] text-muted-foreground mb-2">Due {new Date(inv.dueDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</div>
                      <div className="flex gap-1 flex-wrap">
                        {prevStatus && !['paid', 'draft'].includes(status) && (
                          <button onClick={() => move(inv.invoiceId, prevStatus)} className="text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-accent transition-colors">← Back</button>
                        )}
                        {nextStatus && !['paid', 'overdue'].includes(status) && (
                          <button onClick={() => move(inv.invoiceId, nextStatus)} className={cn('text-[9px] px-1.5 py-0.5 rounded border transition-colors border-status-active/40 text-status-active hover:bg-status-active/10')}>
                            {nextStatus === 'paid' ? 'Mark Paid ✓' : `→ ${INVOICE_STATUS_CFG[nextStatus].label}`}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Data Centres View ────────────────────────────────────────────────────────

const DC_CHART_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

function DataCentersView() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const dcCosts = useMemo(() => seedDataCenters.map(dc => {
    const powerCostMonthly = Math.round(dc.avgPowerKw * dc.powerCostPerKwh * 24 * 30);
    const total = dc.monthlyRackCost + powerCostMonthly + dc.bandwidthCostMonthly + dc.supportContractMonthly + dc.labourCostMonthly;
    return { ...dc, powerCostMonthly, total };
  }), []);

  const activeCost = dcCosts.filter(d => d.status === 'active').reduce((s, d) => s + d.total, 0);

  const pieData = dcCosts.map(dc => ({ name: dc.dcId.replace('DC-', ''), value: dc.total }));

  const barData = dcCosts.map(dc => ({
    name: dc.dcId,
    Rack: dc.monthlyRackCost,
    Power: dc.powerCostMonthly,
    Bandwidth: dc.bandwidthCostMonthly,
    Support: dc.supportContractMonthly,
    Labour: dc.labourCostMonthly,
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* DC List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">Data Centre Cost Breakdown</h3>
          <span className="text-xs text-muted-foreground">Active total: <span className="font-mono text-foreground">{fmtFull2(activeCost)}</span>/mo</span>
        </div>
        {dcCosts.map(dc => (
          <div key={dc.dcId} className="surface-raised border border-border rounded-lg overflow-hidden">
            <button className="w-full flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors" onClick={() => setExpanded(e => e === dc.dcId ? null : dc.dcId)}>
              <div className={cn('w-2 h-2 rounded-full shrink-0', dc.status === 'active' ? 'bg-status-healthy' : dc.status === 'maintenance' ? 'bg-status-risk' : 'bg-muted-foreground')} />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{dc.name}</span>
                  <span className="text-[10px] text-muted-foreground">{dc.tier}</span>
                  <span className={cn('text-[9px] px-1 py-0.5 rounded capitalize', dc.status === 'active' ? 'bg-status-healthy/10 text-status-healthy' : 'bg-status-risk/10 text-status-risk')}>{dc.status}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{dc.location} · {dc.region}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-bold text-foreground">{fmtFull2(dc.total)}</div>
                <div className="text-[10px] text-muted-foreground">/month</div>
              </div>
              <ChevronRight size={14} className={cn('text-muted-foreground transition-transform', expanded === dc.dcId && 'rotate-90')} />
            </button>
            {expanded === dc.dcId && (
              <div className="border-t border-border px-3 pb-3 pt-2 grid grid-cols-3 gap-2">
                {[
                  { label: 'Rack Cost', value: fmtFull2(dc.monthlyRackCost) },
                  { label: 'Power', value: fmtFull2(dc.powerCostMonthly) },
                  { label: 'Bandwidth', value: fmtFull2(dc.bandwidthCostMonthly) },
                  { label: 'Support', value: fmtFull2(dc.supportContractMonthly) },
                  { label: 'Labour', value: fmtFull2(dc.labourCostMonthly) },
                  { label: 'Headcount', value: `${dc.headcount} FTE` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                    <div className="text-xs font-mono text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-4">
        <div className="surface-raised border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Cost Distribution by DC</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={DC_CHART_COLORS[i % DC_CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmtFull2(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-[11px]">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: DC_CHART_COLORS[i % DC_CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-mono text-foreground ml-auto">{fmtFull2(dcCosts[i].total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-raised border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Cost Components by DC</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} angle={-25} textAnchor="end" />
              <YAxis tickFormatter={v => `R${(v/1000).toFixed(0)}k`} tick={{ fontSize: 9, fill: 'hsl(215, 10%, 48%)' }} />
              <Tooltip formatter={(v: number) => fmtFull2(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Rack" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Power" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Bandwidth" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="Support" stackId="a" fill="#10b981" />
              <Bar dataKey="Labour" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default FinancialsPage;
