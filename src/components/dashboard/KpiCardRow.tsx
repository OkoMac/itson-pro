import { useDemo } from '@/context/DemoContext';
import { Package, AlertTriangle, Truck, CheckCircle, TrendingDown, FileText } from 'lucide-react';

interface KpiData {
  label: string;
  value: number;
  icon: React.ElementType;
  accent?: string;
}

export function KpiCardRow() {
  const { state } = useDemo();

  const activeOrders = state.orders.filter(o => o.status === 'active');
  const atRisk = activeOrders.filter(o => o.riskStatus !== 'none');
  const dispatchDue = activeOrders.filter(o => o.currentStage === 'Dispatch Ready');
  const pendingApprovals = state.approvals.filter(a => a.status === 'pending');
  const marginRisk = state.repairs.filter(r => r.marginPct < 18 && r.approvalStatus === 'pending');
  const docsReview = state.documents.filter(d => d.status === 'pending');

  const kpis: KpiData[] = [
    { label: 'Orders in Progress', value: activeOrders.length, icon: Package },
    { label: 'Orders at Risk', value: atRisk.length, icon: AlertTriangle, accent: atRisk.length > 0 ? 'text-status-critical' : undefined },
    { label: 'Dispatch Ready', value: dispatchDue.length, icon: Truck },
    { label: 'Approvals Pending', value: pendingApprovals.length, icon: CheckCircle, accent: pendingApprovals.length > 0 ? 'text-status-risk' : undefined },
    { label: 'Margin-at-Risk', value: marginRisk.length, icon: TrendingDown, accent: marginRisk.length > 0 ? 'text-status-risk' : undefined },
    { label: 'Docs Awaiting Review', value: docsReview.length, icon: FileText },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map(kpi => (
        <div key={kpi.label} className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <kpi.icon size={16} className="text-muted-foreground" />
          </div>
          <div className={`text-2xl font-semibold font-mono ${kpi.accent || 'text-foreground'}`}>
            {kpi.value}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
