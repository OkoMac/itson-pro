import { useDemo } from '@/context/DemoContext';
import { Box, AlertTriangle } from 'lucide-react';

const StockPage = () => {
  const { state } = useDemo();
  const lowStock = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
  const activeOrders = state.orders.filter(o => o.status === 'active');

  const getBlockedOrders = (sku: string) => {
    return activeOrders.filter(o => o.lines.some(l => {
      const prod = state.products.find(p => p.sku === l.sku);
      return l.sku === sku && prod && prod.stockOnHand < l.qty;
    }));
  };

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-4">Stock & Consumables</h1>

      {lowStock.length > 0 && (
        <div className="surface-raised border border-status-critical/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-status-critical" />
            <span className="text-sm font-medium text-foreground">Low Stock Alerts</span>
            <span className="font-mono text-xs text-status-critical">{lowStock.length}</span>
          </div>
          <div className="space-y-2">
            {lowStock.map(p => {
              const blocked = getBlockedOrders(p.sku);
              return (
                <div key={p.sku} className="surface-overlay rounded-md p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-medium text-foreground">{p.sku} — {p.productName}</span>
                    <span className="text-status-critical font-mono">{p.stockOnHand} / {p.reorderLevel}</span>
                  </div>
                  {blocked.length > 0 && (
                    <div className="text-muted-foreground">
                      Blocking: {blocked.map(o => o.orderId).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="surface-raised border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">SKU</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Product</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Category</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">On Hand</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Reorder</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Lead Time</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.products.map(p => {
              const low = p.stockOnHand <= p.reorderLevel;
              return (
                <tr key={p.sku} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-foreground">{p.sku}</td>
                  <td className="px-4 py-3 text-foreground">{p.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className={`px-4 py-3 text-right font-mono ${low ? 'text-status-critical' : 'text-foreground'}`}>{p.stockOnHand}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{p.reorderLevel}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{p.leadTimeDays}d</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      low ? 'bg-status-critical/10 text-status-critical' : 'bg-status-healthy/10 text-status-healthy'
                    }`}>{low ? 'Low' : 'OK'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockPage;
