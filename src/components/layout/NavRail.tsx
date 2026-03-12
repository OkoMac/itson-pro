import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FileText, CheckCircle, Wrench,
  Box, ListTodo, Activity, Brain, Sliders, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Orders', path: '/orders' },
  { icon: DollarSign, label: 'Financials', path: '/financials' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: CheckCircle, label: 'Approvals', path: '/approvals' },
  { icon: Wrench, label: 'Repairs', path: '/repairs' },
  { icon: Box, label: 'Stock', path: '/stock' },
  { icon: ListTodo, label: 'Tasks', path: '/tasks' },
  { icon: Activity, label: 'Events', path: '/events' },
  { icon: Brain, label: 'AI', path: '/assistant' },
  { icon: Sliders, label: 'Scenarios', path: '/scenarios' },
];

export function NavRail() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="w-[72px] min-h-screen surface-raised border-r border-border flex flex-col items-center py-4 gap-0.5 shrink-0">
      <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-lg bg-status-active font-bold text-sm text-primary-foreground">
        IP
      </div>
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              'w-12 h-11 flex flex-col items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent',
              active && 'bg-accent text-foreground'
            )}
            title={label}
          >
            <Icon size={18} />
            <span className="text-[8px] mt-0.5 leading-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
