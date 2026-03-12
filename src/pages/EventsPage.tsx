import { useDemo } from '@/context/DemoContext';
import { SeverityBadge, DepartmentChip } from '@/components/shared/Badges';
import { useState } from 'react';
import type { EventSeverity } from '@/data/seed';
import {
  FileText, Package, AlertTriangle, ListTodo, CheckCircle,
  Wrench, Truck, Brain, StickyNote, Activity
} from 'lucide-react';
import type { EventType } from '@/data/seed';

const eventIcons: Partial<Record<EventType, React.ElementType>> = {
  DocumentReceived: FileText,
  OCRProcessed: FileText,
  OrderCreated: Package,
  OrderStageChanged: Package,
  StockThresholdBreached: AlertTriangle,
  TaskCreated: ListTodo,
  TaskCompleted: ListTodo,
  ApprovalRequested: CheckCircle,
  ApprovalApproved: CheckCircle,
  ApprovalRejected: CheckCircle,
  RepairAssessmentUploaded: Wrench,
  QuoteGenerated: Wrench,
  DispatchScheduled: Truck,
  DispatchCompleted: Truck,
  StickyNoteAdded: StickyNote,
  AIQueryRun: Brain,
};

const EventsPage = () => {
  const { state } = useDemo();
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const departments = [...new Set(state.events.map(e => e.department))];
  const types = [...new Set(state.events.map(e => e.type))];

  const filtered = state.events.filter(e => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (deptFilter !== 'all' && e.department !== deptFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
    const date = new Date(e.timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Global Event Tracker</h1>
          <p className="text-[11px] text-muted-foreground">
            {state.events.length} total events • {filtered.length} shown
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
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
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground"
        >
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(severityFilter !== 'all' || deptFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => { setSeverityFilter('all'); setDeptFilter('all'); setTypeFilter('all'); }}
            className="text-[10px] text-status-active hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, events]) => (
          <div key={date}>
            <div className="sticky top-0 z-10 surface-base py-1 mb-2">
              <span className="text-[11px] font-medium text-muted-foreground">{date}</span>
            </div>
            <div className="relative pl-6 space-y-0.5">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
              {events.map(event => {
                const Icon = eventIcons[event.type] || Activity;
                const time = new Date(event.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={event.eventId} className="relative flex items-start gap-3 py-2">
                    {/* Timeline dot */}
                    <div className={`absolute left-[-17px] top-3 w-2 h-2 rounded-full border-2 ${
                      event.severity === 'critical' ? 'border-status-critical bg-status-critical' :
                      event.severity === 'high' ? 'border-status-risk bg-status-risk' :
                      'border-border bg-secondary'
                    }`} />
                    <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0 pt-0.5">{time}</span>
                    <Icon size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 surface-raised border border-border rounded-md p-3">
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
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
