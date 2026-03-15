import { useState, useRef, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useDemo } from '@/context/DemoContext';
import { useNavigate } from 'react-router-dom';
import type { EventSeverity } from '@/data/seed';

const severityIcon: Record<EventSeverity, React.ReactNode> = {
  critical: <AlertTriangle size={12} className="text-destructive" />,
  high: <AlertCircle size={12} className="text-status-risk" />,
  medium: <Info size={12} className="text-status-active" />,
  info: <CheckCircle size={12} className="text-status-healthy" />,
  low: <Info size={12} className="text-muted-foreground" />,
};

export function NotificationBell() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(state.events.length);
  const ref = useRef<HTMLDivElement>(null);

  const unread = Math.max(0, state.events.length - seenCount);
  const recent = state.events.slice(0, 12);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) setSeenCount(state.events.length);
  };

  const handleClick = (entityType: string) => {
    setOpen(false);
    const routes: Record<string, string> = {
      order: '/orders', document: '/documents', repair: '/repairs',
      approval: '/approvals', task: '/tasks', product: '/stock',
    };
    navigate(routes[entityType] || '/events');
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="relative h-7 w-7 rounded-md bg-secondary border border-border flex items-center justify-center hover:border-muted-foreground/40 transition-colors">
        <Bell size={14} className="text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-80 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-xs font-medium text-foreground">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">No events yet</div>
            ) : (
              recent.map(evt => (
                <button
                  key={evt.eventId}
                  onClick={() => handleClick(evt.entityType)}
                  className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-accent/50 transition-colors border-b border-border/30 last:border-b-0"
                >
                  <div className="mt-0.5 shrink-0">{severityIcon[evt.severity]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{evt.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{evt.description}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{timeAgo(evt.timestamp)} · {evt.department}</div>
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/events'); }}
            className="w-full px-3 py-2 text-center text-[10px] text-status-active hover:bg-accent/30 border-t border-border transition-colors"
          >
            View all events →
          </button>
        </div>
      )}
    </div>
  );
}
