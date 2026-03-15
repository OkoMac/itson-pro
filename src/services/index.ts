export { ordersService } from './orders';
export type { OrderFilters, CreateOrderDto, UpdateOrderDto } from './orders';

export { customersService } from './customers';
export type { Customer as CustomerDto, CreateCustomerDto } from './customers';

export { productsService } from './products';
export type { Product as ProductDto, ProductFilters } from './products';

export { stockService } from './stock';
export type { StockMovement } from './stock';

export { tasksService } from './tasks';
export type { Task as TaskDto } from './tasks';

export { approvalsService } from './approvals';
export type { Approval as ApprovalDto } from './approvals';

export { repairsService } from './repairs';
export type { Repair as RepairDto } from './repairs';

export { invoicesService } from './invoices';
export type { Invoice as InvoiceDto } from './invoices';

export { dashboardService } from './dashboard';
export { financialsService } from './financials';

export { api, ApiError, setAuthToken, getAuthToken } from './api';
