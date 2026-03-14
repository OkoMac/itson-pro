import { useState, useRef, useCallback } from 'react';
import { useDemo } from '@/context/DemoContext';
import { RiskBadge } from '@/components/shared/Badges';
import { OrderDetailInspector } from '@/components/orders/OrderDetailInspector';
import type { OrderStage, Order } from '@/data/seed';
import { GripVertical, Plus, X, Download } from 'lucide-react';
import { toast } from 'sonner';

function exportCsv(filename: string, rows: string[][], headers: string[]) {
  const lines = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const stages: OrderStage[] = [
  'Order Received', 'Procurement', 'In Production', 'Waiting for Stock',
  'Filling', 'Branding', 'Dispatch Ready', 'Dispatched',
];

const OrdersPage = () => {
  const { state, dispatch, customers, users } = useDemo();
  const activeOrders = state.orders.filter(o => o.status === 'active');
  const getCustomer = (id: string) => customers.find(c => c.customerId === id)?.name || id;
  const selectedOrder = state.selectedOrderId ? state.orders.find(o => o.orderId === state.selectedOrderId) : null;

  // Drag-and-drop state
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OrderStage | null>(null);
  const dragRef = useRef<string | null>(null);

  // New order modal state
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customerId: customers[0]?.customerId ?? '',
    poNumber: '',
    owner: users[0]?.name ?? '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    value: '',
    stage: 'Order Received' as OrderStage,
  });

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

  const handleCreateOrder = () => {
    if (!newOrderForm.customerId || !newOrderForm.poNumber.trim() || !newOrderForm.value) return;
    const orderId = `CLG-${Math.floor(2200 + Math.random() * 800)}`;
    const order: Order = {
      orderId,
      customerId: newOrderForm.customerId,
      poNumber: newOrderForm.poNumber.trim(),
      status: 'active',
      currentStage: newOrderForm.stage,
      owner: newOrderForm.owner,
      dueDate: newOrderForm.dueDate,
      value: parseFloat(newOrderForm.value),
      riskStatus: 'none',
      createdAt: new Date().toISOString(),
      lines: [],
    };
    dispatch({ type: 'ADD_ORDER', order });
    dispatch({ type: 'ADD_EVENT', event: {
      eventId: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'OrderCreated',
      entityType: 'order',
      entityId: orderId,
      title: `Order ${orderId} Created`,
      description: `New order for ${customers.find(c => c.customerId === newOrderForm.customerId)?.name} — R${parseFloat(newOrderForm.value).toLocaleString()}`,
      department: 'Sales',
      owner: newOrderForm.owner,
      severity: 'info',
      status: 'new',
      tags: ['order', 'created'],
    }});
    toast.success(`Order ${orderId} Created`, { description: `PO: ${newOrderForm.poNumber}` });
    setShowNewOrder(false);
    setNewOrderForm({
      customerId: customers[0]?.customerId ?? '',
      poNumber: '',
      owner: users[0]?.name ?? '',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      value: '',
      stage: 'Order Received',
    });
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      <div className={`flex-1 overflow-auto ${selectedOrder ? 'max-w-[60%]' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">Orders Workspace</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                exportCsv('orders-export.csv',
                  activeOrders.map(o => [o.orderId, getCustomer(o.customerId), o.poNumber, o.currentStage, o.owner, o.dueDate, String(o.value), o.riskStatus, o.status]),
                  ['Order ID', 'Customer', 'PO Number', 'Stage', 'Owner', 'Due Date', 'Value', 'Risk', 'Status']
                );
                toast.success('CSV Exported', { description: `${activeOrders.length} orders` });
              }}
              className="h-7 px-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Download size={12} /> Export
            </button>
            <button onClick={() => setShowNewOrder(true)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-status-active/10 text-status-active border border-status-active/30 hover:bg-status-active/20 text-xs font-medium">
              <Plus size={12} /> New Order
            </button>
          </div>
        </div>
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

      {/* New Order Modal */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="surface-raised border border-border rounded-xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-status-active" />
                <span className="text-sm font-semibold text-foreground">New Order</span>
              </div>
              <button onClick={() => setShowNewOrder(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Customer</label>
                <select
                  value={newOrderForm.customerId}
                  onChange={e => setNewOrderForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full h-8 rounded-lg bg-secondary border border-border px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {customers.map(c => <option key={c.customerId} value={c.customerId}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">PO Number <span className="text-status-critical">*</span></label>
                <input
                  value={newOrderForm.poNumber}
                  onChange={e => setNewOrderForm(f => ({ ...f, poNumber: e.target.value }))}
                  placeholder="e.g. PNP-PO-99999"
                  className="w-full h-8 rounded-lg bg-secondary border border-border px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Owner</label>
                  <select
                    value={newOrderForm.owner}
                    onChange={e => setNewOrderForm(f => ({ ...f, owner: e.target.value }))}
                    className="w-full h-8 rounded-lg bg-secondary border border-border px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {users.map(u => <option key={u.userId} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Initial Stage</label>
                  <select
                    value={newOrderForm.stage}
                    onChange={e => setNewOrderForm(f => ({ ...f, stage: e.target.value as OrderStage }))}
                    className="w-full h-8 rounded-lg bg-secondary border border-border px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newOrderForm.dueDate}
                    onChange={e => setNewOrderForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full h-8 rounded-lg bg-secondary border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Value (R) <span className="text-status-critical">*</span></label>
                  <input
                    type="number"
                    value={newOrderForm.value}
                    onChange={e => setNewOrderForm(f => ({ ...f, value: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full h-8 rounded-lg bg-secondary border border-border px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end mt-4">
              <button onClick={() => setShowNewOrder(false)}
                className="px-4 py-1.5 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={!newOrderForm.poNumber.trim() || !newOrderForm.value}
                className="px-4 py-1.5 rounded-md bg-status-active/10 text-status-active hover:bg-status-active/20 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                <Plus size={12} /> Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
