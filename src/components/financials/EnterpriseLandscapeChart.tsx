/**
 * Enterprise Landscape Chart — inspired by Sparx Prolaborate
 * Shows the operational system landscape organized by domain,
 * with color-coded system status blocks.
 */

interface SystemBlock {
  name: string;
  status: 'active' | 'planned' | 'review' | 'legacy';
}

interface SubDomain {
  name: string;
  systems: SystemBlock[];
}

interface Domain {
  name: string;
  subDomains: SubDomain[];
}

const statusColors: Record<SystemBlock['status'], string> = {
  active: 'bg-status-healthy/20 border-status-healthy/40 text-status-healthy',
  planned: 'bg-status-active/20 border-status-active/40 text-status-active',
  review: 'bg-status-risk/20 border-status-risk/40 text-status-risk',
  legacy: 'bg-status-critical/20 border-status-critical/40 text-status-critical',
};

const domains: Domain[] = [
  {
    name: 'Operations & Fulfilment',
    subDomains: [
      {
        name: 'Order Management',
        systems: [
          { name: 'Omni ERP', status: 'active' },
          { name: 'Itson-Pro OI', status: 'active' },
        ],
      },
      {
        name: 'Warehouse & Stock',
        systems: [
          { name: 'Inventory Module', status: 'active' },
          { name: 'Reorder Engine', status: 'planned' },
        ],
      },
      {
        name: 'Dispatch & Logistics',
        systems: [
          { name: 'Fleet Tracker', status: 'review' },
          { name: 'Route Optimizer', status: 'planned' },
        ],
      },
    ],
  },
  {
    name: 'Finance & Compliance',
    subDomains: [
      {
        name: 'Financial Systems',
        systems: [
          { name: 'Omni Finance', status: 'active' },
          { name: 'Cost Centre Mgmt', status: 'active' },
        ],
      },
      {
        name: 'Procurement',
        systems: [
          { name: 'Supplier Portal', status: 'planned' },
          { name: 'PO Automation', status: 'active' },
        ],
      },
      {
        name: 'Compliance',
        systems: [
          { name: 'Audit Trail', status: 'active' },
          { name: 'POPIA Module', status: 'review' },
        ],
      },
    ],
  },
  {
    name: 'Sales & Customer',
    subDomains: [
      {
        name: 'CRM',
        systems: [
          { name: 'Omni CRM', status: 'active' },
          { name: 'Customer 360', status: 'active' },
        ],
      },
      {
        name: 'Communication',
        systems: [
          { name: 'Email Gateway', status: 'active' },
          { name: 'WhatsApp Integration', status: 'planned' },
        ],
      },
    ],
  },
  {
    name: 'Technical & Service',
    subDomains: [
      {
        name: 'Repairs & Maintenance',
        systems: [
          { name: 'Repair Manager', status: 'active' },
          { name: 'Parts Catalogue', status: 'review' },
        ],
      },
      {
        name: 'Field Service',
        systems: [
          { name: 'Technician App', status: 'planned' },
          { name: 'Service Scheduler', status: 'legacy' },
        ],
      },
    ],
  },
  {
    name: 'Intelligence & AI',
    subDomains: [
      {
        name: 'Document Intelligence',
        systems: [
          { name: 'OCR Engine', status: 'active' },
          { name: 'Doc Classifier', status: 'active' },
        ],
      },
      {
        name: 'AI & Analytics',
        systems: [
          { name: 'Query Console', status: 'active' },
          { name: 'Predictive Engine', status: 'planned' },
          { name: 'RAG Pipeline', status: 'planned' },
        ],
      },
    ],
  },
];

export function EnterpriseLandscapeChart() {
  return (
    <div className="surface-raised border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Enterprise Application Landscape</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Domain-based system coverage — CLG Operational Stack</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {Object.entries(statusColors).map(([status, cls]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded border ${cls}`} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {domains.map(domain => (
            <div key={domain.name} className="border border-border rounded-lg overflow-hidden">
              {/* Domain Header */}
              <div className="px-3 py-2 bg-accent/50 border-b border-border">
                <h4 className="text-xs font-semibold text-foreground">{domain.name}</h4>
              </div>

              {/* Sub-domains */}
              <div className="p-3 space-y-3">
                {domain.subDomains.map(sub => (
                  <div key={sub.name}>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{sub.name}</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {sub.systems.map(sys => (
                        <div
                          key={sys.name}
                          className={`px-2.5 py-1.5 rounded-md border text-[11px] font-medium ${statusColors[sys.status]}`}
                        >
                          {sys.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
