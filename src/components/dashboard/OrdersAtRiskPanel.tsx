import { useDemo } from '@/context/DemoContext';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '@/components/shared/Badges';
import { AlertTriangle } from 'lucide-react';

export function OrdersAtRiskPanel() {
  const { state, dispatch, customers } = useDemo();
  const navigate = useNavigate();
  const atRisk = state.orders.filter(o => o.riskStatus !== 'none' && o.status === 'active');

  const getCustomer = (id: string) => customers.find(c => c.customerId === id)?.name || id;

  const reasons = {
    stock: state.events.filter(e => e.type === 'StockThresholdBreached' && e.status === 'new').length,
    approvals: state.approvals.filter(a => a.status === 'pending').length,
    docs: state.documents.filter(d => d.status === 'pending').length,
  };

  return (
    <div className="surface-raised border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-status-critical" />
        <h2 className="text-sm font-semibold text-foreground">Orders at Risk</h2>
        <span className="font-mono text-xs text-status-critical">{atRisk.length}</span>
      </div>

      <div className="flex gap-3 mb-4 text-[11px]">
        <span className="text-muted-foreground">{reasons.stock} stock shortages</span>
        <span className="text-muted-foreground">{reasons.approvals} approvals pending</span>
        <span className="text-muted-foreground">{reasons.docs} docs pending</span>
      </div>

      <div className="space-y-2">
        {atRisk.map(order => (
          <button
            key={order.orderId}
            onClick={() => {
              dispatch({ type: 'SELECT_ORDER', orderId: order.orderId });
              navigate('/orders');
            }}
            className="w-full text-left surface-overlay border border-border rounded-md p-3 hover:border-muted-foreground/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-medium text-foreground">{order.orderId}</span>
                <span className="text-xs text-muted-foreground">{getCustomer(order.customerId)}</span>
              </div>
              <RiskBadge risk={order.riskStatus} />
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
              <span>{order.currentStage}</span>
              <span>Due {new Date(order.dueDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
              <span>R{order.value.toLocaleString()}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
