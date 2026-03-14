import { useDemo } from '@/context/DemoContext';
import { Search, RotateCcw, Wifi, X, Package, Users, FileText, Wrench, ShoppingCart, CheckSquare, Calendar, ClipboardList } from 'lucide-react';
import type { Role } from '@/data/seed';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const roleLabels: Record<Role, string> = {
  gm: 'GM',
  finance: 'Finance',
  sales: 'Sales',
  operations: 'Operations',
  technical: 'Technical',
};

type ResultType = 'order' | 'customer' | 'repair' | 'document' | 'product' | 'approval' | 'task' | 'event';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  badge?: string;
  badgeVariant?: 'critical' | 'warning' | 'info' | 'default';
  href: string;
}

const typeIcons: Record<ResultType, React.ReactNode> = {
  order: <ShoppingCart size={12} />,
  customer: <Users size={12} />,
  repair: <Wrench size={12} />,
  document: <FileText size={12} />,
  product: <Package size={12} />,
  approval: <CheckSquare size={12} />,
  task: <ClipboardList size={12} />,
  event: <Calendar size={12} />,
};

const typeLabels: Record<ResultType, string> = {
  order: 'Order',
  customer: 'Customer',
  repair: 'Repair',
  document: 'Document',
  product: 'Product',
  approval: 'Approval',
  task: 'Task',
  event: 'Event',
};

function useGlobalSearch(query: string, state: ReturnType<typeof useDemo>['state'], customers: ReturnType<typeof useDemo>['customers']) {
  return useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Orders
    for (const o of state.orders) {
      if (
        o.orderId.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.currentStage.toLowerCase().includes(q)
      ) {
        results.push({
          id: o.orderId,
          type: 'order',
          title: o.orderId,
          subtitle: `${o.customer} · ${o.currentStage}`,
          badge: o.riskStatus === 'critical' ? 'Critical' : o.riskStatus === 'high' ? 'High Risk' : undefined,
          badgeVariant: o.riskStatus === 'critical' ? 'critical' : o.riskStatus === 'high' ? 'warning' : undefined,
          href: '/orders',
        });
        if (results.length >= 12) return results;
      }
    }

    // Customers
    for (const c of customers) {
      if (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.segment && c.segment.toLowerCase().includes(q))
      ) {
        results.push({
          id: c.code,
          type: 'customer',
          title: c.name,
          subtitle: `${c.code} · ${c.segment ?? ''}`,
          href: '/customers',
        });
        if (results.length >= 12) return results;
      }
    }

    // Repairs
    for (const r of state.repairs) {
      const custName = customers.find(c => c.customerId === r.customerId)?.name ?? r.customerId;
      if (
        r.repairId.toLowerCase().includes(q) ||
        custName.toLowerCase().includes(q) ||
        r.fault.toLowerCase().includes(q) ||
        r.unitModel.toLowerCase().includes(q)
      ) {
        results.push({
          id: r.repairId,
          type: 'repair',
          title: r.repairId,
          subtitle: `${custName} · ${r.unitModel}`,
          badge: r.approvalStatus === 'pending' && r.marginPct > 0 && r.marginPct < 18 ? 'Low Margin' : undefined,
          badgeVariant: 'warning',
          href: '/repairs',
        });
        if (results.length >= 12) return results;
      }
    }

    // Documents
    for (const d of state.documents) {
      if (
        d.documentId.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.documentType.toLowerCase().includes(q) ||
        d.linkedEntityId.toLowerCase().includes(q)
      ) {
        results.push({
          id: d.documentId,
          type: 'document',
          title: d.fileName,
          subtitle: `${d.documentId} · ${d.documentType}`,
          href: '/documents',
        });
        if (results.length >= 12) return results;
      }
    }

    // Products
    for (const p of state.products) {
      if (
        p.sku.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ) {
        const isLow = p.stockOnHand <= p.reorderLevel;
        results.push({
          id: p.sku,
          type: 'product',
          title: p.productName,
          subtitle: `${p.sku} · Stock: ${p.stockOnHand}`,
          badge: isLow ? 'Low Stock' : undefined,
          badgeVariant: isLow ? 'warning' : undefined,
          href: '/stock',
        });
        if (results.length >= 12) return results;
      }
    }

    // Approvals
    for (const a of state.approvals) {
      if (
        a.approvalId.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.requestedBy.toLowerCase().includes(q)
      ) {
        results.push({
          id: a.approvalId,
          type: 'approval',
          title: a.title,
          subtitle: `${a.approvalId} · ${a.status}`,
          badge: a.status === 'pending' ? 'Pending' : undefined,
          badgeVariant: 'info',
          href: '/approvals',
        });
        if (results.length >= 12) return results;
      }
    }

    // Tasks
    for (const t of state.tasks) {
      if (
        t.taskId.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q)
      ) {
        results.push({
          id: t.taskId,
          type: 'task',
          title: t.title,
          subtitle: `${t.taskId} · ${t.owner}`,
          badge: t.priority === 'urgent' ? 'Urgent' : t.priority === 'high' ? 'High' : undefined,
          badgeVariant: t.priority === 'urgent' ? 'critical' : t.priority === 'high' ? 'warning' : undefined,
          href: '/tasks',
        });
        if (results.length >= 12) return results;
      }
    }

    // Events
    for (const e of state.events) {
      if (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q)
      ) {
        results.push({
          id: e.eventId,
          type: 'event',
          title: e.title,
          subtitle: e.description.slice(0, 60),
          href: '/events',
        });
        if (results.length >= 12) return results;
      }
    }

    return results;
  }, [query, state, customers]);
}

const badgeClasses: Record<string, string> = {
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  default: 'bg-secondary text-muted-foreground border-border',
};

export function TopBar() {
  const { state, dispatch, launchScenario, customers } = useDemo();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  const results = useGlobalSearch(query, state, customers);

  useEffect(() => {
    setCursor(-1);
  }, [query]);

  useEffect(() => {
    setOpen(results.length > 0 && query.length >= 2);
  }, [results, query]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.href);
    setQuery('');
    setOpen(false);
    setCursor(-1);
    inputRef.current?.blur();
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      handleSelect(results[cursor]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  }, [open, cursor, results, handleSelect]);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="h-12 surface-raised border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground tracking-tight">CLG</span>
        <span className="text-xs text-muted-foreground">Operational Command Centre</span>
        <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
          Itson-Pro
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Global Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            placeholder="Search orders, customers, stock…"
            className="h-7 w-56 rounded-md bg-secondary border border-border pl-7 pr-6 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={11} />
            </button>
          )}

          {/* Results dropdown */}
          {open && results.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full mt-1 right-0 w-80 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden"
            >
              {results.map((result, i) => (
                <button
                  key={result.id + result.type}
                  onMouseDown={() => handleSelect(result)}
                  onMouseEnter={() => setCursor(i)}
                  className={`w-full flex items-start gap-2 px-3 py-2 text-left transition-colors ${
                    i === cursor ? 'bg-accent' : 'hover:bg-accent/50'
                  } ${i < results.length - 1 ? 'border-b border-border/50' : ''}`}
                >
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <span className="text-muted-foreground">{typeIcons[result.type]}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider w-14 truncate">
                      {typeLabels[result.type]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground truncate">{result.title}</span>
                      {result.badge && (
                        <span className={`text-[9px] px-1 py-0.5 rounded border ${badgeClasses[result.badgeVariant ?? 'default']} shrink-0`}>
                          {result.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                </button>
              ))}
              <div className="px-3 py-1.5 border-t border-border bg-muted/30">
                <span className="text-[10px] text-muted-foreground">
                  {results.length} result{results.length !== 1 ? 's' : ''} · ↑↓ navigate · ↵ go · Esc close
                </span>
              </div>
            </div>
          )}
        </div>

        <select
          value={state.role}
          onChange={e => dispatch({ type: 'SET_ROLE', role: e.target.value as Role })}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground focus:outline-none"
        >
          {Object.entries(roleLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <button
          onClick={() => launchScenario('reset')}
          className="h-7 px-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RotateCcw size={12} /> Reset
        </button>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Wifi size={10} className="text-status-healthy" />
          Omni: Simulated
        </div>

        <span className="font-mono text-[10px] text-muted-foreground">{dateStr} {timeStr}</span>
      </div>
    </header>
  );
}
