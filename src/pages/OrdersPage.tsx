import { useDemo } from '@/context/DemoContext';
import { RiskBadge } from '@/components/shared/Badges';
import { OrderDetailInspector } from '@/components/orders/OrderDetailInspector';
import type { OrderStage } from '@/data/seed';

const stages: OrderStage[] = [
  'Order Received', 'Procurement', 'In Production', 'Waiting for Stock',
  'Filling', 'Branding', 'Dispatch Ready', 'Dispatched',
];

const OrdersPage = () => {
  const { state, dispatch, customers } = useDemo();
  const activeOrders = state.orders.filter(o => o.status === 'active');
  const getCustomer = (id: string) => customers.find(c => c.customerId === id)?.name || id;
  const selectedOrder = state.selectedOrderId ? state.orders.find(o => o.orderId === state.selectedOrderId) : null;

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      <div className={`flex-1 overflow-auto ${selectedOrder ? 'max-w-[60%]' : ''}`}>
        <h1 className="text-lg font-semibold text-foreground mb-4">Orders Workspace</h1>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageOrders = activeOrders.filter(o => o.currentStage === stage);
            return (
              <div key={stage} className="min-w-[200px] w-[200px] shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground">{stage}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{stageOrders.length}</span>
                </div>
                <div className="space-y-2">
                  {stageOrders.map(order => {
                    const daysUntilDue = Math.ceil((new Date(order.dueDate).getTime() - Date.now()) / 86400000);
                    const tasksCount = state.tasks.filter(t => t.linkedEntityId === order.orderId).length;
                    const docsCount = state.documents.filter(d => d.linkedEntityId === order.orderId).length;
                    return (
                      <button
                        key={order.orderId}
                        onClick={() => dispatch({ type: 'SELECT_ORDER', orderId: order.orderId })}
                        className={`w-full text-left surface-raised border rounded-lg p-3 transition-colors hover:border-muted-foreground/40 ${
                          state.selectedOrderId === order.orderId ? 'border-status-active/50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-medium text-foreground">{order.orderId}</span>
                          <RiskBadge risk={order.riskStatus} />
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-1">{getCustomer(order.customerId)}</div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className={daysUntilDue <= 2 ? 'text-status-risk' : ''}>
                            {daysUntilDue > 0 ? `${daysUntilDue}d left` : 'Overdue'}
                          </span>
                          <span>R{order.value.toLocaleString()}</span>
                          {docsCount > 0 && <span>{docsCount} docs</span>}
                          {tasksCount > 0 && <span>{tasksCount} tasks</span>}
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

      {selectedOrder && (
        <div className="w-[40%] shrink-0 overflow-auto">
          <OrderDetailInspector
            order={selectedOrder}
            onClose={() => dispatch({ type: 'SELECT_ORDER', orderId: null })}
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
