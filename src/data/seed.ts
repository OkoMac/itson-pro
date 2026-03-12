// ============================================
// Itson-Pro CLG Demo — Seed Data
// ============================================

export type Role = 'gm' | 'finance' | 'sales' | 'operations' | 'technical';

export interface Customer {
  customerId: string;
  name: string;
  segment: string;
  accountManager: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  contactName: string;
}

export interface Product {
  sku: string;
  category: string;
  productName: string;
  unitPrice: number;
  stockOnHand: number;
  reorderLevel: number;
  leadTimeDays: number;
}

export type OrderStage = 'Order Received' | 'Procurement' | 'In Production' | 'Waiting for Stock' | 'Filling' | 'Branding' | 'Dispatch Ready' | 'Dispatched';

export interface OrderLine {
  orderLineId: string;
  orderId: string;
  sku: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  poNumber: string;
  status: 'active' | 'completed' | 'cancelled';
  currentStage: OrderStage;
  owner: string;
  dueDate: string;
  value: number;
  riskStatus: 'none' | 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  lines: OrderLine[];
}

export type DocumentType = 'Purchase Order' | 'Branding Instruction' | 'Repair Assessment' | 'Supplier Quote' | 'Finance Attachment';

export interface Document {
  documentId: string;
  documentType: DocumentType;
  fileName: string;
  source: string;
  confidence: number;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  linkedEntityType: string;
  linkedEntityId: string;
  receivedAt: string;
  extractedFields: Record<string, string>;
}

export interface Repair {
  repairId: string;
  customerId: string;
  unitModel: string;
  fault: string;
  partsCost: number;
  labourHours: number;
  labourCost: number;
  quoteValue: number;
  marginPct: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  status: 'assessment' | 'quoted' | 'approved' | 'in-progress' | 'completed';
}

export interface Approval {
  approvalId: string;
  approvalType: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  waitingForRole: Role;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  amount: number;
  createdAt: string;
}

export interface Task {
  taskId: string;
  linkedEntityType: string;
  linkedEntityId: string;
  title: string;
  owner: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: 'open' | 'in-progress' | 'completed';
  department: string;
}

export interface StickyNote {
  noteId: string;
  linkedEntityType: string;
  linkedEntityId: string;
  text: string;
  author: string;
  createdAt: string;
}

export type EventSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type EventType =
  | 'DocumentReceived' | 'OCRProcessed' | 'OCRReviewed'
  | 'OrderCreated' | 'OrderStageChanged'
  | 'StockThresholdBreached' | 'TaskCreated' | 'TaskCompleted'
  | 'StickyNoteAdded' | 'ApprovalRequested' | 'ApprovalApproved' | 'ApprovalRejected'
  | 'RepairAssessmentUploaded' | 'QuoteGenerated'
  | 'DispatchScheduled' | 'DispatchCompleted' | 'AIQueryRun';

export interface AppEvent {
  eventId: string;
  timestamp: string;
  type: EventType;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  department: string;
  owner: string;
  severity: EventSeverity;
  status: 'new' | 'acknowledged' | 'resolved';
  tags: string[];
}

export interface User {
  userId: string;
  name: string;
  role: Role;
  department: string;
  email: string;
}

// ===== FINANCIAL DATA =====

export type CostCenterStatus = 'on-track' | 'over-budget' | 'under-review' | 'closed';

export interface CostCenter {
  id: string;
  name: string;
  department: string;
  budget: number;
  spent: number;
  committed: number;
  status: CostCenterStatus;
  owner: string;
  description: string;
}

export interface MonthlyFinancial {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCogs: number;
  grossMargin: number;
  totalOpex: number;
  netMargin: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashPosition: number;
}

// ===== SEED DATA =====

export const customers: Customer[] = [
  { customerId: 'CUST-001', name: 'Pick n Pay', segment: 'Retail', accountManager: 'Sarah Chen', location: 'Johannesburg', priority: 'high', contactName: 'James Mokwena' },
  { customerId: 'CUST-002', name: 'Dis-Chem', segment: 'Pharmacy', accountManager: 'Sarah Chen', location: 'Pretoria', priority: 'high', contactName: 'Lisa van der Berg' },
  { customerId: 'CUST-003', name: 'Netcare Morningside', segment: 'Healthcare', accountManager: 'David Nkosi', location: 'Johannesburg', priority: 'high', contactName: 'Dr. Patel' },
  { customerId: 'CUST-004', name: 'Woolworths Regional', segment: 'Retail', accountManager: 'David Nkosi', location: 'Cape Town', priority: 'medium', contactName: 'Karen Steyn' },
  { customerId: 'CUST-005', name: 'Sandton Office Park', segment: 'Corporate', accountManager: 'Michael Botha', location: 'Sandton', priority: 'medium', contactName: 'Tom Richards' },
  { customerId: 'CUST-006', name: 'Rosebank Mall Facilities', segment: 'Property', accountManager: 'Michael Botha', location: 'Rosebank', priority: 'low', contactName: 'Anele Dlamini' },
];

export const products: Product[] = [
  { sku: 'HD-200', category: 'Hand Dryers', productName: 'HD-200 Hand Dryer', unitPrice: 2450, stockOnHand: 45, reorderLevel: 20, leadTimeDays: 14 },
  { sku: 'SD-110', category: 'Soap Dispensers', productName: 'SD-110 Soap Dispenser', unitPrice: 385, stockOnHand: 8, reorderLevel: 30, leadTimeDays: 7 },
  { sku: 'PTD-450', category: 'Paper Towel Dispensers', productName: 'PTD-450 Paper Towel Dispenser', unitPrice: 520, stockOnHand: 62, reorderLevel: 25, leadTimeDays: 10 },
  { sku: 'JTR-800', category: 'Consumables', productName: 'JTR-800 Jumbo Toilet Roll Refill', unitPrice: 45, stockOnHand: 340, reorderLevel: 200, leadTimeDays: 5 },
  { sku: 'FS-250', category: 'Consumables', productName: 'FS-250 Foam Soap Cartridge', unitPrice: 68, stockOnHand: 12, reorderLevel: 50, leadTimeDays: 7 },
  { sku: 'SAN-500', category: 'Consumables', productName: 'SAN-500 Sanitiser Refill', unitPrice: 42, stockOnHand: 180, reorderLevel: 100, leadTimeDays: 5 },
  { sku: 'RP-100', category: 'Replacement Parts', productName: 'RP-100 Dryer Motor Assembly', unitPrice: 890, stockOnHand: 15, reorderLevel: 10, leadTimeDays: 21 },
];

export const seedOrders: Order[] = [
  {
    orderId: 'CLG-2145', customerId: 'CUST-001', poNumber: 'PNP-PO-88412', status: 'active',
    currentStage: 'Procurement', owner: 'Sarah Chen', dueDate: '2026-03-18', value: 11470,
    riskStatus: 'high', createdAt: '2026-03-10T09:14:00Z',
    lines: [
      { orderLineId: 'OL-001', orderId: 'CLG-2145', sku: 'SD-110', qty: 20, unitPrice: 385, lineTotal: 7700 },
      { orderLineId: 'OL-002', orderId: 'CLG-2145', sku: 'JTR-800', qty: 40, unitPrice: 45, lineTotal: 1800 },
      { orderLineId: 'OL-003', orderId: 'CLG-2145', sku: 'FS-250', qty: 15, unitPrice: 68, lineTotal: 1020 },
    ],
  },
  {
    orderId: 'CLG-2146', customerId: 'CUST-002', poNumber: 'DC-PO-11203', status: 'active',
    currentStage: 'In Production', owner: 'David Nkosi', dueDate: '2026-03-20', value: 18400,
    riskStatus: 'none', createdAt: '2026-03-08T11:30:00Z',
    lines: [
      { orderLineId: 'OL-004', orderId: 'CLG-2146', sku: 'HD-200', qty: 6, unitPrice: 2450, lineTotal: 14700 },
      { orderLineId: 'OL-005', orderId: 'CLG-2146', sku: 'PTD-450', qty: 5, unitPrice: 520, lineTotal: 2600 },
    ],
  },
  {
    orderId: 'CLG-2147', customerId: 'CUST-003', poNumber: 'NC-PO-5590', status: 'active',
    currentStage: 'Waiting for Stock', owner: 'Sarah Chen', dueDate: '2026-03-15', value: 6720,
    riskStatus: 'critical', createdAt: '2026-03-06T14:20:00Z',
    lines: [
      { orderLineId: 'OL-006', orderId: 'CLG-2147', sku: 'SAN-500', qty: 80, unitPrice: 42, lineTotal: 3360 },
      { orderLineId: 'OL-007', orderId: 'CLG-2147', sku: 'FS-250', qty: 30, unitPrice: 68, lineTotal: 2040 },
    ],
  },
  {
    orderId: 'CLG-2148', customerId: 'CUST-004', poNumber: 'WW-PO-7701', status: 'active',
    currentStage: 'Filling', owner: 'Michael Botha', dueDate: '2026-03-16', value: 4250,
    riskStatus: 'medium', createdAt: '2026-03-05T10:00:00Z',
    lines: [
      { orderLineId: 'OL-008', orderId: 'CLG-2148', sku: 'JTR-800', qty: 50, unitPrice: 45, lineTotal: 2250 },
      { orderLineId: 'OL-009', orderId: 'CLG-2148', sku: 'SAN-500', qty: 40, unitPrice: 42, lineTotal: 1680 },
    ],
  },
  {
    orderId: 'CLG-2149', customerId: 'CUST-005', poNumber: 'SOP-PO-3320', status: 'active',
    currentStage: 'Branding', owner: 'David Nkosi', dueDate: '2026-03-17', value: 15600,
    riskStatus: 'low', createdAt: '2026-03-04T08:45:00Z',
    lines: [
      { orderLineId: 'OL-010', orderId: 'CLG-2149', sku: 'HD-200', qty: 4, unitPrice: 2450, lineTotal: 9800 },
      { orderLineId: 'OL-011', orderId: 'CLG-2149', sku: 'SD-110', qty: 10, unitPrice: 385, lineTotal: 3850 },
    ],
  },
  {
    orderId: 'CLG-2150', customerId: 'CUST-006', poNumber: 'RMF-PO-1102', status: 'active',
    currentStage: 'Dispatch Ready', owner: 'Michael Botha', dueDate: '2026-03-12', value: 3150,
    riskStatus: 'none', createdAt: '2026-03-03T09:15:00Z',
    lines: [
      { orderLineId: 'OL-012', orderId: 'CLG-2150', sku: 'PTD-450', qty: 4, unitPrice: 520, lineTotal: 2080 },
      { orderLineId: 'OL-013', orderId: 'CLG-2150', sku: 'JTR-800', qty: 20, unitPrice: 45, lineTotal: 900 },
    ],
  },
  {
    orderId: 'CLG-2151', customerId: 'CUST-001', poNumber: 'PNP-PO-88500', status: 'active',
    currentStage: 'Order Received', owner: 'Sarah Chen', dueDate: '2026-03-22', value: 8900,
    riskStatus: 'none', createdAt: '2026-03-11T07:30:00Z',
    lines: [
      { orderLineId: 'OL-014', orderId: 'CLG-2151', sku: 'HD-200', qty: 2, unitPrice: 2450, lineTotal: 4900 },
      { orderLineId: 'OL-015', orderId: 'CLG-2151', sku: 'SAN-500', qty: 60, unitPrice: 42, lineTotal: 2520 },
    ],
  },
];

export const seedDocuments: Document[] = [
  {
    documentId: 'DOC-001', documentType: 'Purchase Order', fileName: 'PNP-PO-88412.pdf',
    source: 'email', confidence: 94, status: 'approved',
    linkedEntityType: 'order', linkedEntityId: 'CLG-2145', receivedAt: '2026-03-10T09:12:00Z',
    extractedFields: { customer: 'Pick n Pay', poNumber: 'PNP-PO-88412', dueDate: '2026-03-18', total: 'R11,470' },
  },
  {
    documentId: 'DOC-002', documentType: 'Branding Instruction', fileName: 'PNP-Branding-Q1-2026.pdf',
    source: 'email', confidence: 87, status: 'pending',
    linkedEntityType: 'order', linkedEntityId: 'CLG-2145', receivedAt: '2026-03-11T10:37:00Z',
    extractedFields: { customer: 'Pick n Pay', campaign: 'Q1 Hygiene Refresh', logoVariant: 'Blue', colourNotes: 'PMS 2945C' },
  },
  {
    documentId: 'DOC-003', documentType: 'Repair Assessment', fileName: 'REP-DCH-HD200-001.pdf',
    source: 'technician-upload', confidence: 91, status: 'reviewed',
    linkedEntityType: 'repair', linkedEntityId: 'REP-001', receivedAt: '2026-03-09T14:20:00Z',
    extractedFields: { unit: 'HD-200', fault: 'Motor failure', technicianNote: 'Complete motor replacement required', estimatedCost: 'R1,890' },
  },
  {
    documentId: 'DOC-004', documentType: 'Supplier Quote', fileName: 'SupplierQuote-SD110-March.pdf',
    source: 'email', confidence: 96, status: 'pending',
    linkedEntityType: 'product', linkedEntityId: 'SD-110', receivedAt: '2026-03-10T16:00:00Z',
    extractedFields: { supplier: 'HygiTech SA', sku: 'SD-110', cost: 'R245', leadTime: '7 days', quoteExpiry: '2026-03-25' },
  },
  {
    documentId: 'DOC-005', documentType: 'Purchase Order', fileName: 'NC-PO-5590.pdf',
    source: 'email', confidence: 92, status: 'approved',
    linkedEntityType: 'order', linkedEntityId: 'CLG-2147', receivedAt: '2026-03-06T14:10:00Z',
    extractedFields: { customer: 'Netcare Morningside', poNumber: 'NC-PO-5590', dueDate: '2026-03-15', total: 'R6,720' },
  },
];

export const seedRepairs: Repair[] = [
  { repairId: 'REP-001', customerId: 'CUST-002', unitModel: 'HD-200 Hand Dryer', fault: 'Motor failure — unit non-operational', partsCost: 890, labourHours: 2.5, labourCost: 750, quoteValue: 1890, marginPct: 13, approvalStatus: 'pending', status: 'quoted' },
  { repairId: 'REP-002', customerId: 'CUST-005', unitModel: 'SD-110 Soap Dispenser', fault: 'Pump mechanism jammed', partsCost: 120, labourHours: 1, labourCost: 300, quoteValue: 520, marginPct: 24, approvalStatus: 'approved', status: 'in-progress' },
  { repairId: 'REP-003', customerId: 'CUST-003', unitModel: 'PTD-450 Paper Towel Dispenser', fault: 'Spring mechanism broken — assessment pending', partsCost: 0, labourHours: 0, labourCost: 0, quoteValue: 0, marginPct: 0, approvalStatus: 'pending', status: 'assessment' },
];

export const seedApprovals: Approval[] = [
  { approvalId: 'APR-001', approvalType: 'Margin Exception', entityType: 'repair', entityId: 'REP-001', requestedBy: 'David Nkosi', waitingForRole: 'finance', status: 'pending', reason: 'Repair margin at 13% — below 18% threshold', amount: 1890, createdAt: '2026-03-10T15:00:00Z' },
  { approvalId: 'APR-002', approvalType: 'Stock Substitution', entityType: 'order', entityId: 'CLG-2147', requestedBy: 'Sarah Chen', waitingForRole: 'operations', status: 'pending', reason: 'FS-250 stock insufficient — substitute with FS-250B?', amount: 2040, createdAt: '2026-03-10T11:30:00Z' },
  { approvalId: 'APR-003', approvalType: 'Dispatch Release', entityType: 'order', entityId: 'CLG-2150', requestedBy: 'Michael Botha', waitingForRole: 'gm', status: 'pending', reason: 'Order ready for dispatch — awaiting GM sign-off', amount: 3150, createdAt: '2026-03-11T08:00:00Z' },
];

export const seedTasks: Task[] = [
  { taskId: 'TSK-001', linkedEntityType: 'order', linkedEntityId: 'CLG-2145', title: 'Source SD-110 stock from alternate supplier', owner: 'Sarah Chen', priority: 'urgent', dueDate: '2026-03-13', status: 'open', department: 'Procurement' },
  { taskId: 'TSK-002', linkedEntityType: 'order', linkedEntityId: 'CLG-2145', title: 'Confirm branding spec with Pick n Pay', owner: 'David Nkosi', priority: 'high', dueDate: '2026-03-14', status: 'open', department: 'Sales' },
  { taskId: 'TSK-003', linkedEntityType: 'repair', linkedEntityId: 'REP-001', title: 'Order replacement motor for HD-200', owner: 'Michael Botha', priority: 'medium', dueDate: '2026-03-15', status: 'in-progress', department: 'Technical' },
  { taskId: 'TSK-004', linkedEntityType: 'order', linkedEntityId: 'CLG-2147', title: 'Resolve FS-250 stock shortage', owner: 'Sarah Chen', priority: 'urgent', dueDate: '2026-03-12', status: 'open', department: 'Procurement' },
  { taskId: 'TSK-005', linkedEntityType: 'order', linkedEntityId: 'CLG-2150', title: 'Prepare dispatch documentation', owner: 'Michael Botha', priority: 'medium', dueDate: '2026-03-12', status: 'in-progress', department: 'Operations' },
];

export const seedStickyNotes: StickyNote[] = [
  { noteId: 'SN-001', linkedEntityType: 'order', linkedEntityId: 'CLG-2145', text: 'Use blue logo variant — confirmed by Pick n Pay marketing team', author: 'David Nkosi', createdAt: '2026-03-11T10:45:00Z' },
  { noteId: 'SN-002', linkedEntityType: 'order', linkedEntityId: 'CLG-2145', text: 'Customer insists on Friday dispatch — escalate if stock not resolved by Wednesday', author: 'Sarah Chen', createdAt: '2026-03-11T11:00:00Z' },
  { noteId: 'SN-003', linkedEntityType: 'repair', linkedEntityId: 'REP-001', text: 'Check if motor can be sourced locally — import lead time too long', author: 'Michael Botha', createdAt: '2026-03-10T16:30:00Z' },
  { noteId: 'SN-004', linkedEntityType: 'order', linkedEntityId: 'CLG-2148', text: 'Woolworths requires specific packaging format — confirm before filling', author: 'Michael Botha', createdAt: '2026-03-09T09:00:00Z' },
];

export const seedEvents: AppEvent[] = [
  { eventId: 'EVT-001', timestamp: '2026-03-10T09:12:00Z', type: 'DocumentReceived', entityType: 'document', entityId: 'DOC-001', title: 'Purchase Order Received', description: 'PO from Pick n Pay received via email', department: 'Sales', owner: 'Sarah Chen', severity: 'info', status: 'resolved', tags: ['document', 'PO'] },
  { eventId: 'EVT-002', timestamp: '2026-03-10T09:13:00Z', type: 'OCRProcessed', entityType: 'document', entityId: 'DOC-001', title: 'OCR Extraction Complete', description: 'PNP-PO-88412.pdf processed — 94% confidence', department: 'Operations', owner: 'System', severity: 'info', status: 'resolved', tags: ['OCR', 'automated'] },
  { eventId: 'EVT-003', timestamp: '2026-03-10T09:14:00Z', type: 'OrderCreated', entityType: 'order', entityId: 'CLG-2145', title: 'Order CLG-2145 Created', description: 'Order created from PO PNP-PO-88412 for Pick n Pay', department: 'Sales', owner: 'Sarah Chen', severity: 'info', status: 'resolved', tags: ['order', 'new'] },
  { eventId: 'EVT-004', timestamp: '2026-03-10T09:40:00Z', type: 'StockThresholdBreached', entityType: 'product', entityId: 'SD-110', title: 'Stock Shortage: SD-110', description: 'SD-110 Soap Dispenser stock at 8 units — 20 required for CLG-2145', department: 'Operations', owner: 'System', severity: 'critical', status: 'new', tags: ['stock', 'shortage', 'critical'] },
  { eventId: 'EVT-005', timestamp: '2026-03-10T10:02:00Z', type: 'TaskCreated', entityType: 'task', entityId: 'TSK-001', title: 'Procurement Task Created', description: 'Source SD-110 stock from alternate supplier', department: 'Procurement', owner: 'Sarah Chen', severity: 'high', status: 'new', tags: ['task', 'procurement'] },
  { eventId: 'EVT-006', timestamp: '2026-03-10T11:30:00Z', type: 'ApprovalRequested', entityType: 'approval', entityId: 'APR-002', title: 'Stock Substitution Approval Requested', description: 'FS-250 substitute requested for CLG-2147', department: 'Operations', owner: 'Sarah Chen', severity: 'medium', status: 'new', tags: ['approval', 'stock'] },
  { eventId: 'EVT-007', timestamp: '2026-03-10T14:20:00Z', type: 'RepairAssessmentUploaded', entityType: 'repair', entityId: 'REP-001', title: 'Repair Assessment Uploaded', description: 'HD-200 motor failure assessment — Dis-Chem unit', department: 'Technical', owner: 'David Nkosi', severity: 'medium', status: 'resolved', tags: ['repair', 'assessment'] },
  { eventId: 'EVT-008', timestamp: '2026-03-10T15:00:00Z', type: 'ApprovalRequested', entityType: 'approval', entityId: 'APR-001', title: 'Margin Exception Approval', description: 'Repair REP-001 margin at 13% — below threshold', department: 'Finance', owner: 'David Nkosi', severity: 'high', status: 'new', tags: ['approval', 'margin'] },
  { eventId: 'EVT-009', timestamp: '2026-03-10T16:00:00Z', type: 'DocumentReceived', entityType: 'document', entityId: 'DOC-004', title: 'Supplier Quote Received', description: 'SD-110 quote from HygiTech SA', department: 'Procurement', owner: 'System', severity: 'info', status: 'new', tags: ['document', 'quote'] },
  { eventId: 'EVT-010', timestamp: '2026-03-11T07:30:00Z', type: 'OrderCreated', entityType: 'order', entityId: 'CLG-2151', title: 'Order CLG-2151 Created', description: 'New order from Pick n Pay — HD-200 + SAN-500', department: 'Sales', owner: 'Sarah Chen', severity: 'info', status: 'new', tags: ['order', 'new'] },
  { eventId: 'EVT-011', timestamp: '2026-03-11T08:00:00Z', type: 'ApprovalRequested', entityType: 'approval', entityId: 'APR-003', title: 'Dispatch Release Requested', description: 'CLG-2150 ready for dispatch — awaiting GM sign-off', department: 'Operations', owner: 'Michael Botha', severity: 'low', status: 'new', tags: ['approval', 'dispatch'] },
  { eventId: 'EVT-012', timestamp: '2026-03-11T10:37:00Z', type: 'DocumentReceived', entityType: 'document', entityId: 'DOC-002', title: 'Branding Instruction Received', description: 'Q1 Hygiene Refresh branding from Pick n Pay', department: 'Sales', owner: 'David Nkosi', severity: 'info', status: 'new', tags: ['document', 'branding'] },
  { eventId: 'EVT-013', timestamp: '2026-03-11T10:45:00Z', type: 'StickyNoteAdded', entityType: 'order', entityId: 'CLG-2145', title: 'Note Added to CLG-2145', description: 'Use blue logo variant — confirmed by Pick n Pay', department: 'Sales', owner: 'David Nkosi', severity: 'info', status: 'new', tags: ['note'] },
  { eventId: 'EVT-014', timestamp: '2026-03-11T11:00:00Z', type: 'StockThresholdBreached', entityType: 'product', entityId: 'FS-250', title: 'Stock Shortage: FS-250', description: 'FS-250 Foam Soap Cartridge at 12 units — multiple orders affected', department: 'Operations', owner: 'System', severity: 'high', status: 'new', tags: ['stock', 'shortage'] },
];

export const seedUsers: User[] = [
  { userId: 'USR-001', name: 'Grant Morrison', role: 'gm', department: 'Executive', email: 'grant@clg.co.za' },
  { userId: 'USR-002', name: 'Sarah Chen', role: 'sales', department: 'Sales', email: 'sarah@clg.co.za' },
  { userId: 'USR-003', name: 'David Nkosi', role: 'operations', department: 'Operations', email: 'david@clg.co.za' },
  { userId: 'USR-004', name: 'Michael Botha', role: 'technical', department: 'Technical', email: 'michael@clg.co.za' },
  { userId: 'USR-005', name: 'Priya Sharma', role: 'finance', department: 'Finance', email: 'priya@clg.co.za' },
];

// ===== FINANCIAL SEED DATA =====

export const seedCostCenters: CostCenter[] = [
  { id: 'CC-001', name: 'Production Floor', department: 'Operations', budget: 450000, spent: 312000, committed: 48000, status: 'on-track', owner: 'David Nkosi', description: 'Assembly, filling, and branding operations' },
  { id: 'CC-002', name: 'Procurement & Supply', department: 'Procurement', budget: 280000, spent: 245000, committed: 62000, status: 'over-budget', owner: 'Sarah Chen', description: 'Raw materials, components, and supplier costs' },
  { id: 'CC-003', name: 'Technical & Repairs', department: 'Technical', budget: 120000, spent: 78000, committed: 15000, status: 'on-track', owner: 'Michael Botha', description: 'Repair services, spare parts, and technical labour' },
  { id: 'CC-004', name: 'Sales & Marketing', department: 'Sales', budget: 180000, spent: 142000, committed: 28000, status: 'under-review', owner: 'Sarah Chen', description: 'Client acquisition, branding, and campaign costs' },
  { id: 'CC-005', name: 'Warehousing & Logistics', department: 'Operations', budget: 220000, spent: 198000, committed: 35000, status: 'over-budget', owner: 'Michael Botha', description: 'Storage, dispatch vehicles, and courier costs' },
  { id: 'CC-006', name: 'Administration & IT', department: 'Executive', budget: 150000, spent: 89000, committed: 12000, status: 'on-track', owner: 'Grant Morrison', description: 'Office, IT infrastructure, and general admin' },
  { id: 'CC-007', name: 'Finance & Compliance', department: 'Finance', budget: 95000, spent: 67000, committed: 8000, status: 'on-track', owner: 'Priya Sharma', description: 'Accounting, audit, and regulatory compliance' },
  { id: 'CC-008', name: 'R&D & Product Development', department: 'Technical', budget: 85000, spent: 52000, committed: 18000, status: 'under-review', owner: 'Michael Botha', description: 'New product testing and prototype development' },
];

export const seedMonthlyFinancials: MonthlyFinancial[] = [
  { month: 'Oct 2025', revenue: 1245000, cogs: 748000, grossProfit: 497000, opex: 312000, netProfit: 185000, orderCount: 98, avgOrderValue: 12704 },
  { month: 'Nov 2025', revenue: 1380000, cogs: 814000, grossProfit: 566000, opex: 328000, netProfit: 238000, orderCount: 112, avgOrderValue: 12321 },
  { month: 'Dec 2025', revenue: 1120000, cogs: 672000, grossProfit: 448000, opex: 298000, netProfit: 150000, orderCount: 85, avgOrderValue: 13176 },
  { month: 'Jan 2026', revenue: 1410000, cogs: 832000, grossProfit: 578000, opex: 345000, netProfit: 233000, orderCount: 118, avgOrderValue: 11949 },
  { month: 'Feb 2026', revenue: 1520000, cogs: 896000, grossProfit: 624000, opex: 358000, netProfit: 266000, orderCount: 124, avgOrderValue: 12258 },
  { month: 'Mar 2026', revenue: 1180000, cogs: 702000, grossProfit: 478000, opex: 320000, netProfit: 158000, orderCount: 94, avgOrderValue: 12553 },
];

export const seedFinancialSummary: FinancialSummary = {
  totalRevenue: 7855000,
  totalCogs: 4664000,
  grossMargin: 40.6,
  totalOpex: 1961000,
  netMargin: 15.7,
  accountsReceivable: 842000,
  accountsPayable: 456000,
  cashPosition: 1240000,
};
