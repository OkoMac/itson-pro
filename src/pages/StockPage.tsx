import { useState } from 'react';
import { useDemo } from '@/context/DemoContext';
import { Box, AlertTriangle, TrendingDown, Package, RefreshCw, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

function exportCsv(filename: string, rows: string[][], headers: string[]) {
  const lines = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const StockPage = () => {
  const { state, dispatch } = useDemo();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const lowStock = state.products.filter(p => p.stockOnHand <= p.reorderLevel);
  const activeOrders = state.orders.filter(o => o.status === 'active');
  const categories = [...new Set(state.products.map(p => p.category))];

  const filtered = categoryFilter === 'all' ? state.products : state.products.filter(p => p.category === categoryFilter);

  const getBlockedOrders = (sku: string) => {
    return activeOrders.filter(o => o.lines.some(l => {
      const prod = state.products.find(p => p.sku === l.sku);
      return l.sku === sku && prod && prod.stockOnHand < l.qty;
    }));
  };

  const stockChartData = filtered.map(p => ({
    name: p.sku,
    onHand: p.stockOnHand,
    reorder: p.reorderLevel,
    low: p.stockOnHand <= p.reorderLevel,
  }));

  const topMoving = filtered
    .map(p => {
      const totalRequired = activeOrders.reduce((sum, o) => {
        return sum + o.lines.filter(l => l.sku === p.sku).reduce((s, l) => s + l.qty, 0);
      }, 0);
      return { ...p, required: totalRequired };
    })
    .sort((a, b) => b.required - a.required);

  const blockedOrderCount = lowStock.reduce((sum, p) => sum + getBlockedOrders(p.sku).length, 0);

  const handleReorder = (sku: string) => {
    const product = state.products.find(p => p.sku === sku);
    if (!product) return;
    dispatch({ type: 'ADD_TASK', task: {
      taskId: `TSK-${Date.now()}`,
      linkedEntityType: 'product',
      linkedEntityId: sku,
      title: `Reorder ${product.productName} — current stock: ${product.stockOnHand}`,
      owner: 'Sarah Chen',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * product.leadTimeDays).toISOString().split('T')[0],
      status: 'open',
      department: 'Procurement',
    }});
    dispatch({ type: 'ADD_EVENT', event: {
      eventId: `EVT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'TaskCreated',
      entityType: 'product',
      entityId: sku,
      title: `Reorder Task: ${sku}`,
      description: `Procurement task created for ${product.productName}`,
      department: 'Procurement',
      owner: 'Sarah Chen',
      severity: 'medium',
      status: 'new',
      tags: ['reorder', 'procurement'],
    }});
    toast.success('📦 Reorder Task Created', { description: `${product.productName} — ${product.leadTimeDays}d lead time` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Stock & Consumables</h1>
          <p className="text-[11px] text-muted-foreground">{state.products.length} products tracked</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => {
              exportCsv('stock-export.csv',
                filtered.map(p => [p.sku, p.productName, p.category, String(p.stockOnHand), String(p.reorderLevel), String(p.unitPrice), String(p.leadTimeDays), p.stockOnHand <= p.reorderLevel ? 'Low' : 'OK']),
                ['SKU', 'Product Name', 'Category', 'Stock On Hand', 'Reorder Level', 'Unit Price', 'Lead Time (Days)', 'Status']
              );
              toast.success('CSV Exported', { description: `${filtered.length} products` });
            }}
            className="h-7 px-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-status-critical" />
            <span className="text-[11px] text-muted-foreground">Low Stock Items</span>
          </div>
          <span className="text-2xl font-mono font-semibold text-status-critical">{lowStock.length}</span>
        </div>
        <div className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-status-risk" />
            <span className="text-[11px] text-muted-foreground">Blocked Orders</span>
          </div>
          <span className="text-2xl font-mono font-semibold text-status-risk">{blockedOrderCount}</span>
        </div>
        <div className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Box size={14} className="text-status-active" />
            <span className="text-[11px] text-muted-foreground">Total SKUs</span>
          </div>
          <span className="text-2xl font-mono font-semibold text-foreground">{state.products.length}</span>
        </div>
        <div className="surface-raised border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Reorder Flags</span>
          </div>
          <span className="text-2xl font-mono font-semibold text-foreground">{lowStock.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface-raised border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Stock vs Reorder Level</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 12%, 20%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 10%, 48%)' }} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="surface-raised border border-border rounded p-2 text-xs shadow-lg">
                      <p className="text-foreground font-medium">{d.name}</p>
                      <p className="font-mono">On Hand: {d.onHand}</p>
                      <p className="font-mono">Reorder: {d.reorder}</p>
                    </div>
                  );
                }} />
                <Bar dataKey="onHand" name="On Hand" radius={[4, 4, 0, 0]}>
                  {stockChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.low ? 'hsl(0, 72%, 51%)' : 'hsl(217, 91%, 60%)'} opacity={0.8} />
                  ))}
                </Bar>
                <Bar dataKey="reorder" name="Reorder Level" fill="hsl(220, 14%, 15%)" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-raised border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Active Demand (Open Orders)</h3>
          <div className="space-y-2">
            {topMoving.map(p => {
              const blocked = getBlockedOrders(p.sku);
              const pctUsed = p.required > 0 ? Math.min((p.required / p.stockOnHand) * 100, 150) : 0;
              return (
                <div key={p.sku} className="surface-overlay rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground">{p.sku}</span>
                      <span className="text-[11px] text-muted-foreground">{p.productName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground">Demand: {p.required}</span>
                      <span className="text-muted-foreground">Stock: {p.stockOnHand}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pctUsed > 100 ? 'bg-status-critical' : pctUsed > 70 ? 'bg-status-risk' : 'bg-status-active'}`}
                      style={{ width: `${Math.min(pctUsed, 100)}%` }} />
                  </div>
                  {blocked.length > 0 && (
                    <p className="text-[10px] text-status-critical mt-1">⚠ Blocking: {blocked.map(o => o.orderId).join(', ')}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="surface-raised border border-status-critical/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-status-critical" />
            <span className="text-sm font-medium text-foreground">Low Stock Alerts</span>
          </div>
          <div className="space-y-2">
            {lowStock.map(p => {
              const blocked = getBlockedOrders(p.sku);
              return (
                <div key={p.sku} className="surface-overlay rounded-md p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-medium text-foreground">{p.sku}</span>
                    <span className="text-muted-foreground ml-2">{p.productName}</span>
                    {blocked.length > 0 && (
                      <span className="text-status-critical ml-2">→ Blocking {blocked.map(o => o.orderId).join(', ')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-status-critical font-mono">{p.stockOnHand} / {p.reorderLevel}</span>
                    <span className="text-muted-foreground">{p.leadTimeDays}d lead</span>
                    <button onClick={() => handleReorder(p.sku)}
                      className="text-[10px] font-medium px-2 py-1 rounded-md bg-status-active/10 text-status-active hover:bg-status-active/20 flex items-center gap-1">
                      <RefreshCw size={10} /> Reorder
                    </button>
                  </div>
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
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Unit Price</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">On Hand</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Reorder</th>
              <th className="text-right px-4 py-2 text-muted-foreground font-medium">Lead Time</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-4 py-2 text-muted-foreground font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const low = p.stockOnHand <= p.reorderLevel;
              return (
                <tr key={p.sku} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3 font-mono text-foreground">{p.sku}</td>
                  <td className="px-4 py-3 text-foreground">{p.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">R{p.unitPrice.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-mono ${low ? 'text-status-critical' : 'text-foreground'}`}>{p.stockOnHand}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{p.reorderLevel}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{p.leadTimeDays}d</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      low ? 'bg-status-critical/10 text-status-critical' : 'bg-status-healthy/10 text-status-healthy'
                    }`}>{low ? 'Low' : 'OK'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {low && (
                      <button onClick={() => handleReorder(p.sku)}
                        className="text-[10px] text-status-active hover:underline">Reorder</button>
                    )}
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
