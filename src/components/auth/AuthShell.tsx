import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Wraps all /auth/* routes. Redirects to home if already signed in.
export function AuthShell() {
  const { user, loading, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-border border-t-status-active rounded-full animate-spin" />
      </div>
    );
  }

  if (!isDemoMode && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding / feature highlights */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 border-r border-border surface-raised">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-status-active/10 border border-status-active/20 flex items-center justify-center">
              <span className="text-sm font-bold text-status-active">IP</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Itson-Pro</span>
          </div>

          <h2 className="text-2xl font-semibold text-foreground leading-tight mb-4">
            Operational Command Centre for growing businesses
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Manage orders, customers, repairs, finances, and your team — all in one intelligent platform.
          </p>

          <div className="space-y-3">
            {[
              { icon: '📦', label: 'Order lifecycle tracking from PO to delivery' },
              { icon: '🔧', label: 'Repair job management with quote approvals' },
              { icon: '💰', label: 'Financial command with cost centre intelligence' },
              { icon: '🤖', label: 'AI assistant for instant operational insights' },
              { icon: '📋', label: 'Document OCR with automated data extraction' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3 text-sm">
                <span className="text-base shrink-0">{f.icon}</span>
                <span className="text-muted-foreground">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-8 border-t border-border">
          <div className="flex -space-x-2">
            {['JK', 'SM', 'TL', 'AP'].map(initials => (
              <div
                key={initials}
                className="w-7 h-7 rounded-full bg-status-active/10 border-2 border-background flex items-center justify-center text-[9px] font-semibold text-status-active"
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Trusted by operations teams across South Africa
          </p>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  );
}
