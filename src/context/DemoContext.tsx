import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import {
  type Role, type Order, type AppEvent, type Document, type Repair,
  type Approval, type Task, type StickyNote, type Product, type OrderStage,
  seedOrders, seedDocuments, seedRepairs, seedApprovals, seedTasks,
  seedStickyNotes, seedEvents, products as seedProducts,
  customers, seedUsers,
} from '@/data/seed';

interface DemoState {
  role: Role;
  orders: Order[];
  events: AppEvent[];
  documents: Document[];
  repairs: Repair[];
  approvals: Approval[];
  tasks: Task[];
  stickyNotes: StickyNote[];
  products: Product[];
  selectedOrderId: string | null;
}

type DemoAction =
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SELECT_ORDER'; orderId: string | null }
  | { type: 'MOVE_ORDER_STAGE'; orderId: string; stage: OrderStage }
  | { type: 'ADD_EVENT'; event: AppEvent }
  | { type: 'ADD_EVENTS'; events: AppEvent[] }
  | { type: 'APPROVE_ITEM'; approvalId: string }
  | { type: 'REJECT_ITEM'; approvalId: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'ADD_STICKY_NOTE'; note: StickyNote }
  | { type: 'ADD_DOCUMENT'; document: Document }
  | { type: 'UPDATE_ORDER'; order: Order }
  | { type: 'UPDATE_PRODUCT'; sku: string; updates: Partial<Product> }
  | { type: 'RESET' };

const initialState: DemoState = {
  role: 'gm',
  orders: seedOrders,
  events: seedEvents,
  documents: seedDocuments,
  repairs: seedRepairs,
  approvals: seedApprovals,
  tasks: seedTasks,
  stickyNotes: seedStickyNotes,
  products: seedProducts,
  selectedOrderId: null,
};

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'SELECT_ORDER':
      return { ...state, selectedOrderId: action.orderId };
    case 'MOVE_ORDER_STAGE': {
      const orders = state.orders.map(o =>
        o.orderId === action.orderId ? { ...o, currentStage: action.stage } : o
      );
      return { ...state, orders };
    }
    case 'ADD_EVENT':
      return { ...state, events: [action.event, ...state.events] };
    case 'ADD_EVENTS':
      return { ...state, events: [...action.events, ...state.events] };
    case 'APPROVE_ITEM': {
      const approvals = state.approvals.map(a =>
        a.approvalId === action.approvalId ? { ...a, status: 'approved' as const } : a
      );
      return { ...state, approvals };
    }
    case 'REJECT_ITEM': {
      const approvals = state.approvals.map(a =>
        a.approvalId === action.approvalId ? { ...a, status: 'rejected' as const } : a
      );
      return { ...state, approvals };
    }
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'ADD_STICKY_NOTE':
      return { ...state, stickyNotes: [action.note, ...state.stickyNotes] };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.document, ...state.documents] };
    case 'UPDATE_ORDER': {
      const orders = state.orders.map(o =>
        o.orderId === action.order.orderId ? action.order : o
      );
      return { ...state, orders };
    }
    case 'UPDATE_PRODUCT': {
      const prods = state.products.map(p =>
        p.sku === action.sku ? { ...p, ...action.updates } : p
      );
      return { ...state, products: prods };
    }
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface DemoContextType {
  state: DemoState;
  dispatch: React.Dispatch<DemoAction>;
  launchScenario: (scenario: string) => void;
  customers: typeof customers;
  users: typeof seedUsers;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);

  const makeEvent = useCallback((partial: Omit<AppEvent, 'eventId' | 'timestamp'>): AppEvent => ({
    ...partial,
    eventId: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  }), []);

  const launchScenario = useCallback((scenario: string) => {
    const now = new Date().toISOString();
    switch (scenario) {
      case 'po-arrival': {
        const evt1 = makeEvent({ type: 'DocumentReceived', entityType: 'document', entityId: 'DOC-001', title: 'Purchase Order Received', description: 'PO from Pick n Pay received via email', department: 'Sales', owner: 'Sarah Chen', severity: 'info', status: 'new', tags: ['document', 'PO'] });
        const evt2 = makeEvent({ type: 'OCRProcessed', entityType: 'document', entityId: 'DOC-001', title: 'OCR Extraction Complete', description: 'PNP-PO-88412.pdf processed — 94% confidence', department: 'Operations', owner: 'System', severity: 'info', status: 'new', tags: ['OCR'] });
        const evt3 = makeEvent({ type: 'OrderCreated', entityType: 'order', entityId: 'CLG-2145', title: 'Order CLG-2145 Created', description: 'Order created from PO for Pick n Pay', department: 'Sales', owner: 'Sarah Chen', severity: 'info', status: 'new', tags: ['order'] });
        dispatch({ type: 'ADD_EVENTS', events: [evt3, evt2, evt1] });
        dispatch({ type: 'SELECT_ORDER', orderId: 'CLG-2145' });
        break;
      }
      case 'stock-shortage': {
        const evt = makeEvent({ type: 'StockThresholdBreached', entityType: 'product', entityId: 'SD-110', title: 'Stock Shortage: SD-110', description: 'SD-110 stock critically low — 8 units, 20 required for CLG-2145', department: 'Operations', owner: 'System', severity: 'critical', status: 'new', tags: ['stock', 'critical'] });
        const taskEvt = makeEvent({ type: 'TaskCreated', entityType: 'task', entityId: 'TSK-NEW', title: 'Procurement Task Created', description: 'Source SD-110 from alternate supplier', department: 'Procurement', owner: 'Sarah Chen', severity: 'high', status: 'new', tags: ['task'] });
        dispatch({ type: 'ADD_EVENTS', events: [taskEvt, evt] });
        dispatch({ type: 'MOVE_ORDER_STAGE', orderId: 'CLG-2145', stage: 'Waiting for Stock' });
        const order = state.orders.find(o => o.orderId === 'CLG-2145');
        if (order) dispatch({ type: 'UPDATE_ORDER', order: { ...order, riskStatus: 'critical', currentStage: 'Waiting for Stock' } });
        break;
      }
      case 'branding-instruction': {
        const evt = makeEvent({ type: 'DocumentReceived', entityType: 'document', entityId: 'DOC-002', title: 'Branding Instruction Received', description: 'Q1 Hygiene Refresh branding from Pick n Pay', department: 'Sales', owner: 'David Nkosi', severity: 'info', status: 'new', tags: ['branding'] });
        const noteEvt = makeEvent({ type: 'StickyNoteAdded', entityType: 'order', entityId: 'CLG-2145', title: 'Note Added', description: 'Use blue logo variant — PMS 2945C', department: 'Sales', owner: 'David Nkosi', severity: 'info', status: 'new', tags: ['note'] });
        dispatch({ type: 'ADD_EVENTS', events: [noteEvt, evt] });
        break;
      }
      case 'repair-approval': {
        const evt1 = makeEvent({ type: 'RepairAssessmentUploaded', entityType: 'repair', entityId: 'REP-001', title: 'Repair Assessment Uploaded', description: 'HD-200 motor failure — Dis-Chem', department: 'Technical', owner: 'David Nkosi', severity: 'medium', status: 'new', tags: ['repair'] });
        const evt2 = makeEvent({ type: 'QuoteGenerated', entityType: 'repair', entityId: 'REP-001', title: 'Quote Generated: R1,890', description: 'Margin at 13% — below threshold', department: 'Finance', owner: 'System', severity: 'high', status: 'new', tags: ['quote', 'margin'] });
        const evt3 = makeEvent({ type: 'ApprovalRequested', entityType: 'approval', entityId: 'APR-001', title: 'Margin Exception Approval Requested', description: 'Repair margin below 18% threshold', department: 'Finance', owner: 'David Nkosi', severity: 'high', status: 'new', tags: ['approval'] });
        dispatch({ type: 'ADD_EVENTS', events: [evt3, evt2, evt1] });
        break;
      }
      case 'dispatch': {
        const evt1 = makeEvent({ type: 'DispatchScheduled', entityType: 'order', entityId: 'CLG-2150', title: 'Dispatch Scheduled', description: 'CLG-2150 scheduled for dispatch', department: 'Operations', owner: 'Michael Botha', severity: 'info', status: 'new', tags: ['dispatch'] });
        const evt2 = makeEvent({ type: 'DispatchCompleted', entityType: 'order', entityId: 'CLG-2150', title: 'Dispatch Completed', description: 'CLG-2150 dispatched to Rosebank Mall', department: 'Operations', owner: 'Michael Botha', severity: 'info', status: 'new', tags: ['dispatch', 'completed'] });
        dispatch({ type: 'ADD_EVENTS', events: [evt2, evt1] });
        dispatch({ type: 'MOVE_ORDER_STAGE', orderId: 'CLG-2150', stage: 'Dispatched' });
        break;
      }
      case 'reset':
        dispatch({ type: 'RESET' });
        break;
    }
  }, [makeEvent, state.orders, dispatch]);

  return (
    <DemoContext.Provider value={{ state, dispatch, launchScenario, customers, users: seedUsers }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be inside DemoProvider');
  return ctx;
}
