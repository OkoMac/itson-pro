import { useDemo } from '@/context/DemoContext';
import { SeverityBadge, DepartmentChip } from '@/components/shared/Badges';
import { useState } from 'react';
import type { EventSeverity, EventType } from '@/data/seed';

const EventsPage = () => {
  const { state } = useDemo();
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const departments = [...new Set(state.events.map(e => e.department))];

  const filtered = state.events.filter(e => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (deptFilter !== 'all' && e.department !== deptFilter) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-4">Global Event Tracker</h1>

      <div className="flex items-center gap-2 mb-4">
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value as EventSeverity | 'all')}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground"
        >
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="text-[11px] text-muted-foreground ml-2">{filtered.length} events</span>
      </div>

      <div className="space-y-1">
        {filtered.map(event => {
          const time = new Date(event.timestamp);
          const dateStr = time.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
          const timeStr = time.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={event.eventId} className="surface-raised border border-border rounded-md p-3 flex items-start gap-3">
              <div className="font-mono text-[10px] text-muted-foreground w-20 shrink-0 pt-0.5">
                <div>{dateStr}</div>
                <div>{timeStr}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{event.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{event.description}</div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">{event.entityId}</span>
                  <DepartmentChip dept={event.department} />
                  <SeverityBadge severity={event.severity} />
                  {event.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsPage;
