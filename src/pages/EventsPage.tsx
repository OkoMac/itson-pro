import { useDemo } from '@/context/DemoContext';
import { SeverityBadge, DepartmentChip } from '@/components/shared/Badges';
import { useState } from 'react';
import type { EventSeverity } from '@/data/seed';
import {
  FileText, Package, AlertTriangle, ListTodo, CheckCircle,
  Wrench, Truck, Brain, StickyNote, Activity
} from 'lucide-react';
import type { EventType } from '@/data/seed';
import { useNavigate } from 'react-router-dom';

const eventIcons: Partial<Record<EventType, React.ElementType>> = {
  DocumentReceived: FileText,
  OCRProcessed: FileText,
  OCRReviewed: FileText,
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
  const { state, dispatch } = useDemo();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('');

  const departments = [...new Set(state.events.map(e => e.department))];
  const types = [...new Set(state.events.map(e => e.type))];
  const owners = [...new Set(state.events.map(e => e.owner))];

  const filtered = state.events.filter(e => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (deptFilter !== 'all' && e.department !== deptFilter) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (ownerFilter !== 'all' && e.owner !== ownerFilter) return false;
    if (entityFilter && !e.entityId.toLowerCase().includes(entityFilter.toLowerCase()) && !e.title.toLowerCase().includes(entityFilter.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, e) => {
    const date = new Date(e.timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {});

  const hasFilters = severityFilter !== 'all' || deptFilter !== 'all' || typeFilter !== 'all' || ownerFilter !== 'all' || entityFilter;

  const handleEventClick = (e: typeof state.events[0]) => {
    if (e.entityType === 'order') {
      dispatch({ type: 'SELECT_ORDER', orderId: e.entityId });
      navigate('/orders');
    } else if (e.entityType === 'document') navigate('/documents');
    else if (e.entityType === 'repair') navigate('/repairs');
    else if (e.entityType === 'approval') navigate('/approvals');
    else if (e.entityType === 'product') navigate('/stock');
    else if (e.entityType === 'task') navigate('/tasks');
  };

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
        <input
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          placeholder="Search events..."
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground placeholder:text-muted-foreground w-40"
        />
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as EventSeverity | 'all')}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
          className="h-7 rounded-md bg-secondary border border-border px-2 text-xs text-foreground">
          <option value="all">All Owners</option>
          {owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setSeverityFilter('all'); setDeptFilter('all'); setTypeFilter('all'); setOwnerFilter('all'); setEntityFilter(''); }}
            className="text-[10px] text-status-active hover:underline">Clear filters</button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, events]) => (
          <div key={date}>
            <div className="sticky top-0 z-10 surface-base py-1 mb-2">
              <span className="text-[11px] font-medium text-muted-foreground">{date}</span>
            </div>
            <div className="relative pl-6 space-y-0.5">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
              {events.map(event => {
                const Icon = eventIcons[event.type] || Activity;
                const time = new Date(event.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={event.eventId} className="relative flex items-start gap-3 py-2 cursor-pointer hover:bg-accent/10 rounded-md -ml-1 pl-1"
                    onClick={() => handleEventClick(event)}>
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
                        <span className="font-mono text-[10px] text-status-active">{event.entityId}</span>
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
        {Object.keys(grouped).length === 0 && (
          <div className="surface-raised border border-border rounded-lg p-8 text-center">
            <Activity size={24} className="text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">No events match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
