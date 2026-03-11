import { useDemo } from '@/context/DemoContext';
import { SeverityBadge, DepartmentChip } from '@/components/shared/Badges';
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
  RepairAssessmentUploaded: Wrench,
  QuoteGenerated: Wrench,
  DispatchScheduled: Truck,
  DispatchCompleted: Truck,
  StickyNoteAdded: StickyNote,
  AIQueryRun: Brain,
};

export function EventTimelinePanel({ limit = 12 }: { limit?: number }) {
  const { state } = useDemo();
  const events = state.events.slice(0, limit);

  return (
    <div className="surface-raised border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Live Event Timeline</h2>
      </div>
      <div className="space-y-1">
        {events.map(event => {
          const Icon = eventIcons[event.type] || Activity;
          const time = new Date(event.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={event.eventId} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
              <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0 pt-0.5">{time}</span>
              <Icon size={14} className="text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-foreground truncate">{event.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{event.entityId}</span>
                  <DepartmentChip dept={event.department} />
                  <SeverityBadge severity={event.severity} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
