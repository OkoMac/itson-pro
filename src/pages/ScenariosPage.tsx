import { useDemo } from '@/context/DemoContext';
import { Play, RotateCcw, Package, AlertTriangle, FileText, Wrench, Truck, Brain } from 'lucide-react';

const scenarios = [
  { id: 'po-arrival', label: 'Simulate PO Arrival', icon: Package, description: 'PO received → OCR → Order created → CLG-2145 highlighted' },
  { id: 'stock-shortage', label: 'Simulate Stock Shortage', icon: AlertTriangle, description: 'SD-110 stock low → Task created → Order at risk' },
  { id: 'branding-instruction', label: 'Simulate Branding Document', icon: FileText, description: 'Branding instruction → Note added → Communication cluster' },
  { id: 'repair-approval', label: 'Simulate Repair Approval', icon: Wrench, description: 'Assessment → Quote → Margin exception approval triggered' },
  { id: 'dispatch', label: 'Simulate Dispatch', icon: Truck, description: 'CLG-2150 dispatched → Events generated' },
  { id: 'reset', label: 'Reset Demo', icon: RotateCcw, description: 'Restore all data to seeded baseline state' },
];

const ScenariosPage = () => {
  const { launchScenario } = useDemo();

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground mb-2">Scenario Launcher</h1>
      <p className="text-xs text-muted-foreground mb-6">Drive the demo live. Each scenario generates events across the platform.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map(s => (
          <button
            key={s.id}
            onClick={() => launchScenario(s.id)}
            className="surface-raised border border-border rounded-lg p-4 text-left hover:border-muted-foreground/40 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={`text-muted-foreground group-hover:text-foreground ${s.id === 'reset' ? 'text-status-risk' : ''}`} />
              <span className="text-sm font-medium text-foreground">{s.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{s.description}</p>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-status-active opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={10} /> Launch
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenariosPage;
