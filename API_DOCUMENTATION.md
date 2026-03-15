# Itson-Pro API Documentation

## 📋 Overview

Itson-Pro provides a comprehensive REST API for managing business operations including customers, orders, products, invoices, and more. All endpoints require JWT authentication unless otherwise noted.

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@itsonpro.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "admin@itsonpro.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json
Authorization: Bearer {refreshToken}

{
  "refreshToken": "jwt-refresh-token"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

## 👥 Customers API

### List Customers
```http
GET /api/customers
Authorization: Bearer {accessToken}
Query Parameters:
  page=1 (optional)
  limit=20 (optional)
  search=term (optional)
  status=ACTIVE|INACTIVE (optional)
  priority=LOW|MEDIUM|HIGH (optional)
```

**Response:**
```json
{
  "data": [
    {
      "id": "cust-id",
      "customerId": "CUST-001",
      "name": "Test Customer",
      "segment": "RETAIL",
      "accountManager": "John Doe",
      "location": "Test City",
      "priority": "MEDIUM",
      "contactName": "Test Contact",
      "contactEmail": "customer@example.com",
      "contactPhone": "+1234567890",
      "status": "ACTIVE",
      "notes": null,
      "createdAt": "2026-03-15T03:58:49.417Z",
      "updatedAt": "2026-03-15T03:58:49.417Z",
      "_count": {
        "orders": 0,
        "invoices": 0
      },
      "totalOrderValue": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Get Customer
```http
GET /api/customers/{id}
Authorization: Bearer {accessToken}
```

### Create Customer
```http
POST /api/customers
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": "CUST-002",
  "name": "New Customer",
  "segment": "WHOLESALE",
  "accountManager": "Jane Smith",
  "location": "New City",
  "priority": "HIGH",
  "contactName": "Contact Person",
  "contactEmail": "contact@example.com",
  "contactPhone": "+0987654321",
  "status": "ACTIVE",
  "notes": "Important customer"
}
```

### Update Customer
```http
PUT /api/customers/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Customer Name",
  "priority": "HIGH"
}
```

### Delete Customer (Archive)
```http
DELETE /api/customers/{id}
Authorization: Bearer {accessToken}
```

## 📦 Products API

### List Products
```http
GET /api/products
Authorization: Bearer {accessToken}
Query Parameters:
  page=1 (optional)
  limit=20 (optional)
  search=term (optional)
  category=category (optional)
  status=ACTIVE|INACTIVE (optional)
```

**Response:**
```json
{
  "data": [
    {
      "id": "prod-id",
      "sku": "PROD-001",
      "productName": "Test Product",
      "description": "A test product for demonstration",
      "category": "TEST",
      "unitPrice": 100.00,
      "costPrice": 50.00,
      "stockOnHand": 100,
      "reorderLevel": 10,
      "leadTimeDays": 7,
      "status": "ACTIVE",
      "createdAt": "2026-03-15T03:58:49.417Z",
      "updatedAt": "2026-03-15T03:58:49.417Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Get Product
```http
GET /api/products/{id}
Authorization: Bearer {accessToken}
```

### Create Product
```http
POST /api/products
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "sku": "PROD-002",
  "productName": "New Product",
  "description": "Product description",
  "category": "ELECTRONICS",
  "unitPrice": 199.99,
  "costPrice": 120.00,
  "stockOnHand": 50,
  "reorderLevel": 10,
  "leadTimeDays": 14,
  "status": "ACTIVE"
}
```

### Update Product
```http
PUT /api/products/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "unitPrice": 209.99,
  "stockOnHand": 45
}
```

### Delete Product (Archive)
```http
DELETE /api/products/{id}
Authorization: Bearer {accessToken}
```

## 🛒 Orders API

### List Orders
```http
GET /api/orders
Authorization: Bearer {accessToken}
Query Parameters:
  page=1 (optional)
  limit=20 (optional)
  customerId=cust-id (optional)
  status=DRAFT|PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED (optional)
  dateFrom=YYYY-MM-DD (optional)
  dateTo=YYYY-MM-DD (optional)
```

### Create Order
```http
POST /api/orders
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": "cust-id",
  "orderDate": "2026-03-15",
  "dueDate": "2026-03-22",
  "status": "DRAFT",
  "priority": "MEDIUM",
  "notes": "Order notes",
  "lines": [
    {
      "productId": "prod-id",
      "quantity": 2,
      "unitPrice": 100.00,
      "discount": 0
    }
  ]
}
```

### Get Order
```http
GET /api/orders/{id}
Authorization: Bearer {accessToken}
```

### Update Order
```http
PUT /api/orders/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Updated notes"
}
```

### Cancel Order
```http
DELETE /api/orders/{id}
Authorization: Bearer {accessToken}
```

## 🧾 Invoices API

### List Invoices
```http
GET /api/invoices
Authorization: Bearer {accessToken}
Query Parameters:
  page=1 (optional)
  limit=20 (optional)
  customerId=cust-id (optional)
  status=DRAFT|ISSUED|PAID|OVERDUE|CANCELLED (optional)
```

### Create Invoice
```http
POST /api/invoices
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": "cust-id",
  "orderId": "order-id",
  "invoiceDate": "2026-03-15",
  "dueDate": "2026-03-30",
  "status": "DRAFT",
  "items": [
    {
      "productId": "prod-id",
      "description": "Product description",
      "quantity": 1,
      "unitPrice": 100.00,
      "taxRate": 15
    }
  ]
}
```

## 📊 Dashboard API

### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "totalCustomers": 15,
  "totalOrders": 42,
  "totalRevenue": 125000.50,
  "pendingOrders": 8,
  "overdueInvoices": 3,
  "lowStockProducts": 5,
  "recentOrders": [...],
  "topCustomers": [...],
  "monthlyRevenue": [...]
}
```

### Get Financial Summary
```http
GET /api/financials/summary
Authorization: Bearer {accessToken}
Query Parameters:
  startDate=YYYY-MM-DD (optional)
  endDate=YYYY-MM-DD (optional)
```

## 🗄️ Stock API

### List Stock Movements
```http
GET /api/stock/movements
Authorization: Bearer {accessToken}
Query Parameters:
  productId=prod-id (optional)
  type=IN|OUT|ADJUSTMENT (optional)
  dateFrom=YYYY-MM-DD (optional)
  dateTo=YYYY-MM-DD (optional)
```

### Create Stock Movement
```http
POST /api/stock/movements
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "productId": "prod-id",
  "quantity": 10,
  "type": "IN",
  "reason": "PURCHASE",
  "reference": "PO-12345",
  "notes": "Stock received from supplier"
}
```

## ✅ Tasks API

### List Tasks
```http
GET /api/tasks
Authorization: Bearer {accessToken}
Query Parameters:
  assignedTo=email (optional)
  status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED (optional)
  priority=LOW|MEDIUM|HIGH (optional)
  dueDateFrom=YYYY-MM-DD (optional)
  dueDateTo=YYYY-MM-DD (optional)
```

### Create Task
```http
POST /api/tasks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Follow up with customer",
  "description": "Call regarding overdue payment",
  "priority": "HIGH",
  "dueDate": "2026-03-18",
  "assignedTo": "user@example.com"
}
```

## 🔧 Repairs API

### List Repairs
```http
GET /api/repairs
Authorization: Bearer {accessToken}
Query Parameters:
  customerId=cust-id (optional)
  status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED (optional)
  priority=LOW|MEDIUM|HIGH (optional)
```

### Create Repair
```http
POST /api/repairs
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "customerId": "cust-id",
  "productId": "prod-id",
  "description": "Device not turning on",
  "priority": "MEDIUM",
  "estimatedCost": 150.00,
  "estimatedCompletion": "2026-03-20"
}
```

## ✅ Approvals API

### List Approvals
```http
GET /api/approvals
Authorization: Bearer {accessToken}
Query Parameters:
  status=PENDING|APPROVED|REJECTED (optional)
  type=ORDER|INVOICE|EXPENSE|OTHER (optional)
```

### Create Approval
```http
POST /api/approvals
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "ORDER",
  "referenceId": "order-id",
  "description": "Approval for large order",
  "amount": 5000.00,
  "approvers": ["manager1@example.com", "manager2@example.com"]
}
```

## ⚙️ System Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-15T03:59:30.478Z"
}
```

## 🔐 Authorization Rules

| Role | Permissions |
|------|-------------|
| ADMIN | Full access to all endpoints |
| MANAGER | Read/write access to customers, orders, products |
| USER | Read-only access, limited write permissions |

## 🚨 Error Responses

### Authentication Error (401)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### Validation Error (400)
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "error": "Not Found",
  "message": "Customer not found"
}
```

### Server Error (500)
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## 📝 Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response when exceeded**: HTTP 429 with message "Too many requests"

## 🔗 WebSocket Events

Connect to `ws://localhost:3001` for real-time updates:

### Events:
- `order:created` - New order created
- `order:updated` - Order status changed
- `invoice:issued` - New invoice issued
- `stock:low` - Product stock below reorder level
- `task:assigned` - New task assigned

### Subscribe to rooms:
```javascript
socket.emit('join', 'orders');
socket.emit('join', 'invoices');
```

---

**API Version**: 1.0.0  
**Base URL**: `http://localhost:3001/api`  
**Authentication**: Bearer Token (JWT)  
**Last Updated**: March 15, 2026