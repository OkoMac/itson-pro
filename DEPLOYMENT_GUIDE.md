# Itson-Pro Deployment Guide

## 🚀 Project Overview

Itson-Pro is a comprehensive operational intelligence platform with:
- **Backend**: TypeScript/Express.js REST API with JWT authentication
- **Frontend**: React PWA with Vite, TypeScript, and shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management and caching
- **Containerization**: Docker Compose for full-stack deployment

## ✅ Current Status (March 15, 2026)

**BUILD COMPLETED SUCCESSFULLY**

### Verified Components:
1. **✅ Backend API** - Fully functional on port 3001
2. **✅ Database** - PostgreSQL running on port 5432
3. **✅ Cache** - Redis running on port 6379  
4. **✅ Frontend** - React PWA running on port 8081
5. **✅ Authentication** - JWT-based auth with role-based access control
6. **✅ All Controllers** - Customers, Orders, Products, Invoices, etc.

## 📋 Quick Start

### Option 1: Development Mode (Recommended)

```bash
# 1. Start database services
cd /Users/mac/Documents/Builds/Itson-Pro/itson-pro-github
docker-compose -f docker-compose.full.yml up -d postgres redis

# 2. Start backend
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev

# 3. Start frontend (in new terminal)
cd ..
npm install --legacy-peer-deps
npm run dev
```

### Option 2: Docker Compose (Full Stack)

```bash
cd /Users/mac/Documents/Builds/Itson-Pro/itson-pro-github
docker-compose -f docker-compose.full.yml up -d
```

**Note**: Docker build has an issue with nginx.conf file path. Development mode is recommended.

## 🔧 Environment Configuration

### Backend (.env in `/backend/`)
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/itson_pro?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
PORT=3001
CORS_ORIGIN="http://localhost:8080"
```

### Frontend (.env in project root)
```env
VITE_DEMO_MODE=false
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Itson-Pro
VITE_APP_VERSION=1.0.0
```

## 👤 Default Credentials

**Admin User:**
- Email: `admin@itsonpro.com`
- Password: `admin123`
- Role: `ADMIN`

**Test Data:**
- Customer: `Test Customer` (CUST-001)
- Product: `Test Product` (PROD-001)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Customers
- `GET /api/customers` - List customers (paginated)
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Archive customer

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Archive product

### Additional Modules
- Invoices, Stock, Tasks, Approvals, Repairs, Dashboard, Financials

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache and session store |
| Backend API | 3001 | Express.js REST API |
| Frontend PWA | 8080 | React application |
| Adminer | 8081 | Database GUI |
| Redis Commander | 8082 | Redis GUI |

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm run dev              # Start development server
npm run build           # Build for production
npm run db:generate     # Generate Prisma client
npm run db:push         # Sync database schema
npm run db:seed         # Seed database with test data
npm test               # Run tests
```

### Frontend
```bash
npm run dev            # Start development server (port 8080/8081)
npm run build          # Build for production
npm run preview        # Preview production build
```

## 🔒 Security Features

1. **JWT Authentication** - Token-based auth with refresh tokens
2. **Role-Based Access Control** - ADMIN, MANAGER, USER roles
3. **Input Validation** - Express-validator for all endpoints
4. **Rate Limiting** - 100 requests per 15 minutes per IP
5. **Security Headers** - Helmet.js for HTTP headers
6. **CORS Protection** - Configured origins only
7. **SQL Injection Prevention** - Prisma ORM with parameterized queries

## 📁 Project Structure

```
itson-pro-github/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, logging
│   │   └── models/         # TypeScript interfaces
│   ├── prisma/             # Database schema
│   └── tests/              # API tests
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── types/             # TypeScript types
│   └── context/           # React context providers
├── docker-compose.full.yml # Full stack deployment
└── Dockerfile             # Frontend containerization
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs itson-pro-db

# Test connection
psql -h localhost -p 5432 -U postgres -d itson_pro
```

### Backend Won't Start
```bash
# Check dependencies
cd backend && npm install

# Generate Prisma client
npm run db:generate

# Check environment variables
cat .env
```

### Frontend Can't Connect to Backend
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check CORS configuration in backend `.env`
3. Verify `VITE_API_URL` in frontend `.env`

### Docker Build Issues
The current Docker build has an issue with nginx.conf file path. Use development mode or fix the Dockerfile context.

## 📈 Next Steps for Production

1. **Environment Variables** - Use proper secrets management
2. **SSL/TLS** - Configure HTTPS for all services
3. **Monitoring** - Add logging and metrics
4. **Backup Strategy** - Database backups and disaster recovery
5. **Scaling** - Load balancing and horizontal scaling
6. **CI/CD** - Automated testing and deployment

## 📞 Support

For issues or questions:
1. Check the logs: `docker logs [container-name]`
2. Verify all services are running: `docker ps`
3. Test API endpoints: `curl http://localhost:3001/health`
4. Check database: `docker exec -it itson-pro-db psql -U postgres -d itson_pro`

---

**Build Completed**: March 15, 2026, 6:00 AM  
**Status**: ✅ Ready for development and testing  
**Next Phase**: Production deployment preparation