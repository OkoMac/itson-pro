import { ArrowRight } from 'lucide-react';

const beforeItems = [
  'Emails & WhatsApp',
  'Paper notes & spreadsheets',
  'Manual follow-ups',
  'Lost branding instructions',
  'Hidden delays',
  'No operational visibility',
];

const afterItems = [
  'Unified event timeline',
  'Single order command view',
  'Automated risk alerts',
  'OCR document intelligence',
  'Supervised approval workflows',
  'Full management visibility',
];

export function BeforeAfterWidget() {
  return (
    <div className="surface-raised border border-border rounded-lg p-4">
      <h2 className="text-sm font-semibold text-foreground mb-3">Business Impact</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] font-medium text-status-critical uppercase tracking-wide">Before</span>
          <div className="mt-2 space-y-1.5">
            {beforeItems.map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-status-critical/60 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-status-healthy uppercase tracking-wide">After — Itson-Pro</span>
          <div className="mt-2 space-y-1.5">
            {afterItems.map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-foreground">
                <span className="w-1 h-1 rounded-full bg-status-healthy shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
