import { useState, useRef, useCallback } from 'react';
import { useDemo } from '@/context/DemoContext';
import { RiskBadge } from '@/components/shared/Badges';
import { OrderDetailInspector } from '@/components/orders/OrderDetailInspector';
import type { OrderStage, Order } from '@/data/seed';
import { GripVertical } from 'lucide-react';

const stages: OrderStage[] = [
  'Order Received', 'Procurement', 'In Production', 'Waiting for Stock',
  'Filling', 'Branding', 'Dispatch Ready', 'Dispatched',
];

const OrdersPage = () => {
  const { state, dispatch, customers } = useDemo();
  const activeOrders = state.orders.filter(o => o.status === 'active');
  const getCustomer = (id: string) => customers.find(c => c.customerId === id)?.name || id;
  const selectedOrder = state.selectedOrderId ? state.orders.find(o => o.orderId === state.selectedOrderId) : null;

  // Drag-and-drop state
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OrderStage | null>(null);
  const dragRef = useRef<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, orderId: string) => {
    dragRef.current = orderId;
    setDraggedOrder(orderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', orderId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: OrderStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, stage: OrderStage) => {
    e.preventDefault();
    const orderId = dragRef.current;
    if (orderId) {
      const order = state.orders.find(o => o.orderId === orderId);
      if (order && order.currentStage !== stage) {
        dispatch({ type: 'MOVE_ORDER_STAGE', orderId, stage });
        dispatch({
          type: 'ADD_EVENT',
          event: {
            eventId: `EVT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'OrderStageChanged',
            entityType: 'order',
            entityId: orderId,
            title: `Order ${orderId} moved to ${stage}`,
            description: `Stage changed from ${order.currentStage} to ${stage}`,
            department: 'Operations',
            owner: order.owner,
            severity: 'info',
            status: 'new',
            tags: ['order', 'stage-change'],
          },
        });
      }
    }
    setDraggedOrder(null);
    setDragOverStage(null);
    dragRef.current = null;
  }, [state.orders, dispatch]);

  const handleDragEnd = useCallback(() => {
    setDraggedOrder(null);
    setDragOverStage(null);
    dragRef.current = null;
  }, []);

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      <div className={`flex-1 overflow-auto ${selectedOrder ? 'max-w-[60%]' : ''}`}>
        <h1 className="text-lg font-semibold text-foreground mb-4">Orders Workspace</h1>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageOrders = activeOrders.filter(o => o.currentStage === stage);
            const isDropTarget = dragOverStage === stage;
            return (
              <div
                key={stage}
                className="min-w-[200px] w-[200px] shrink-0"
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground">{stage}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{stageOrders.length}</span>
                </div>
                <div
                  className={`space-y-2 min-h-[60px] rounded-lg transition-colors p-1 ${
                    isDropTarget ? 'bg-status-active/10 ring-1 ring-status-active/30' : ''
                  }`}
                >
                  {stageOrders.map(order => {
                    const daysUntilDue = Math.ceil((new Date(order.dueDate).getTime() - Date.now()) / 86400000);
                    const tasksCount = state.tasks.filter(t => t.linkedEntityId === order.orderId).length;
                    const docsCount = state.documents.filter(d => d.linkedEntityId === order.orderId).length;
                    const isDragging = draggedOrder === order.orderId;

                    return (
                      <div
                        key={order.orderId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.orderId)}
                        onDragEnd={handleDragEnd}
                        onClick={() => dispatch({ type: 'SELECT_ORDER', orderId: order.orderId })}
                        className={`w-full text-left surface-raised border rounded-lg p-3 transition-all cursor-grab active:cursor-grabbing ${
                          isDragging ? 'opacity-40 scale-95' : ''
                        } hover:border-muted-foreground/40 ${
                          state.selectedOrderId === order.orderId ? 'border-status-active/50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <GripVertical size={12} className="text-muted-foreground/50" />
                            <span className="text-xs font-mono font-medium text-foreground">{order.orderId}</span>
                          </div>
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
                      </div>
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
