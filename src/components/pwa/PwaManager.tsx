import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { WifiOff, Download, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Offline indicator ────────────────────────────────────────────────────────
function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  if (online) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-status-critical/90 text-white text-xs px-3 py-2 rounded-full shadow-lg backdrop-blur-sm">
      <WifiOff size={13} />
      <span>You're offline — using cached data</span>
    </div>
  );
}

// ─── Install prompt ───────────────────────────────────────────────────────────
function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa-install-dismissed') === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const install = async () => {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    else dismiss();
  };

  const dismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 surface-raised border border-border rounded-lg p-3 shadow-lg max-w-[280px] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-status-active flex items-center justify-center text-white font-bold text-xs">IP</div>
          <div>
            <div className="text-xs font-semibold text-foreground">Install Itson Pro</div>
            <div className="text-[10px] text-muted-foreground">Add to home screen</div>
          </div>
        </div>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground mt-0.5">
          <X size={13} />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Install the app for faster access, offline support, and a native experience.
      </p>
      <div className="flex gap-2">
        <button
          onClick={install}
          className="flex-1 flex items-center justify-center gap-1.5 bg-status-active text-white text-xs py-1.5 rounded-md hover:bg-status-active/90 transition-colors"
        >
          <Download size={12} /> Install
        </button>
        <button
          onClick={dismiss}
          className="flex-1 text-xs text-muted-foreground py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

// ─── Update available toast ────────────────────────────────────────────────────
function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000); // check for updates hourly
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 right-4 z-50 surface-raised border border-status-active/40 rounded-lg p-3 shadow-lg max-w-[280px] animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw size={13} className="text-status-active" />
        <span className="text-xs font-semibold text-foreground">Update available</span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">A new version of Itson Pro is ready.</p>
      <div className="flex gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="flex-1 bg-status-active text-white text-xs py-1.5 rounded-md hover:bg-status-active/90 transition-colors"
        >
          Update now
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="flex-1 text-xs text-muted-foreground py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PwaManager() {
  return (
    <>
      <OfflineBanner />
      <InstallPrompt />
      <UpdateToast />
    </>
  );
}
