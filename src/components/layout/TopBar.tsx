import { useDemo } from '@/context/DemoContext';
import { Search, RotateCcw, Wifi } from 'lucide-react';
import type { Role } from '@/data/seed';

const roleLabels: Record<Role, string> = {
  gm: 'GM',
  finance: 'Finance',
  sales: 'Sales',
  operations: 'Operations',
  technical: 'Technical',
};

export function TopBar() {
  const { state, dispatch, launchScenario } = useDemo();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

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
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-7 w-40 rounded-md bg-secondary border border-border pl-7 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
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
