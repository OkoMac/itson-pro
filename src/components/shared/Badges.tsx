import { cn } from '@/lib/utils';
import type { EventSeverity } from '@/data/seed';

export function SeverityBadge({ severity }: { severity: EventSeverity }) {
  const styles: Record<EventSeverity, string> = {
    critical: 'bg-status-critical/10 text-status-critical',
    high: 'bg-status-risk/10 text-status-risk',
    medium: 'bg-status-risk/10 text-status-risk',
    low: 'bg-status-active/10 text-status-active',
    info: 'bg-accent text-muted-foreground',
  };
  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', styles[severity])}>
      {severity}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-status-critical/10 text-status-critical',
    high: 'bg-status-risk/10 text-status-risk',
    medium: 'bg-status-risk/10 text-status-risk',
    low: 'bg-status-active/10 text-status-active',
    none: 'bg-accent text-muted-foreground',
  };
  if (risk === 'none') return null;
  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded uppercase', styles[risk] || styles.none)}>
      {risk}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
      {stage}
    </span>
  );
}

export function DepartmentChip({ dept }: { dept: string }) {
  return (
    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
      {dept}
    </span>
  );
}
