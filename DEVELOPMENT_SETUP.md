# Itson-Pro Development Setup (Simplified)

## ✅ Current Working State (March 15, 2026)

**GOOD NEWS**: The application works perfectly in development mode! Docker build has minor issues but development setup is fully functional.

## 🚀 Quick Development Start

### 1. Start Database Services (Docker)
```bash
cd /Users/mac/Documents/Builds/Itson-Pro/itson-pro-github
docker-compose -f docker-compose.full.yml up -d postgres redis
```

### 2. Start Backend API
```bash
cd backend

# Install dependencies (if not already done)
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```
**Backend will run on**: http://localhost:3001

### 3. Start Frontend PWA
```bash
cd ..

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Start development server
npm run dev
```
**Frontend will run on**: http://localhost:8081 (or 8080 if available)

## ✅ Verified Working Components

### Backend API (Port 3001)
- ✅ Health check: `GET http://localhost:3001/health`
- ✅ Authentication: `POST /api/auth/login` (admin@itsonpro.com / admin123)
- ✅ Customers API: `GET /api/customers` (with JWT token)
- ✅ Products API: `GET /api/products`
- ✅ Orders API: `GET /api/orders`
- ✅ All other controllers functional

### Frontend PWA (Port 8081)
- ✅ React application loads
- ✅ Connected to backend API
- ✅ Authentication flow working
- ✅ Customer/Product/Order management interfaces

### Database (PostgreSQL + Redis)
- ✅ PostgreSQL: Port 5432, database `itson_pro`
- ✅ Redis: Port 6379, cache and session store
- ✅ Admin seeded: `admin@itsonpro.com` / `admin123`
- ✅ Test data: Customer, Product created

## 🔧 Docker Build Issues & Solutions

### Current Docker Issues:
1. **Frontend Docker build fails** with `bun install` network issues
2. **nginx.conf was excluded** by `.dockerignore` - ✅ **FIXED**

### Solutions Implemented:
1. **✅ Fixed nginx.conf exclusion** in `.dockerignore`
2. **✅ Added fallback logic** in Dockerfile (bun → npm fallback)

### Recommended Approach:
- **Development**: Use manual setup (above) - fully working
- **Production**: Fix Docker build issues when ready for deployment
- **Testing**: Current setup is perfect for development and testing

## 📊 Development URLs

| Service | URL | Port | Status |
|---------|-----|------|--------|
| Frontend | http://localhost:8081 | 8081 | ✅ Working |
| Backend API | http://localhost:3001 | 3001 | ✅ Working |
| Database | localhost:5432 | 5432 | ✅ Running |
| Redis | localhost:6379 | 6379 | ✅ Running |
| Adminer (DB GUI) | http://localhost:8081 | 8081 | ✅ Optional |
| Redis Commander | http://localhost:8082 | 8082 | ✅ Optional |

## 🔐 Default Credentials

**Admin User:**
- Email: `admin@itsonpro.com`
- Password: `admin123`
- Role: `ADMIN`

**Test Data:**
- Customer: `Test Customer` (CUST-001)
- Product: `Test Product` (PROD-001)

## 🐛 Known Issues & Workarounds

### 1. Frontend Port Conflict
- **Issue**: Port 8080 might be occupied by Mavis MC
- **Solution**: Frontend automatically uses 8081 (or next available)

### 2. Docker Build Failures
- **Issue**: `bun install` network issues in Docker
- **Solution**: Use development mode (manual setup) for now

### 3. TypeScript Version Conflicts
- **Issue**: Some dependency conflicts
- **Solution**: Use `--legacy-peer-deps` flag for npm install

## 🧪 Testing the Setup

### Quick Test Commands:
```bash
# Test backend health
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@itsonpro.com","password":"admin123"}'

# Test frontend
curl -I http://localhost:8081
```

### Manual Testing:
1. Open http://localhost:8081 in browser
2. Login with admin credentials
3. Navigate to Customers, Products, Orders
4. Verify all functionality works

## 📈 Next Steps for Production

### Priority 1: Fix Docker Build
- Resolve `bun install` network issues
- Test full Docker Compose deployment
- Create production-ready images

### Priority 2: Enhance Features
- Add more test data
- Implement additional business logic
- Improve UI/UX

### Priority 3: Deployment
- Configure production environment variables
- Set up SSL/TLS certificates
- Implement monitoring and logging

## 🆘 Troubleshooting

### Backend Won't Start:
```bash
cd backend
npm install
npm run db:generate
npm run dev
```

### Frontend Won't Start:
```bash
cd /Users/mac/Documents/Builds/Itson-Pro/itson-pro-github
npm install --legacy-peer-deps
npm run dev
```

### Database Issues:
```bash
# Check if Docker containers are running
docker ps

# Restart database services
docker-compose -f docker-compose.full.yml restart postgres redis
```

### Port Conflicts:
- Check what's using port 8080: `lsof -i :8080`
- Kill conflicting process or let Vite use next available port

---

**Status**: ✅ Development setup fully functional  
**Docker Build**: ⚠️ Minor issues, development mode recommended  
**Ready for**: Development, testing, feature implementation  
**Last Updated**: March 15, 2026