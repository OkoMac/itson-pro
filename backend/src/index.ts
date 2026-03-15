import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import invoiceRoutes from './routes/invoice.routes';
import stockRoutes from './routes/stock.routes';
import taskRoutes from './routes/task.routes';
import approvalRoutes from './routes/approval.routes';
import repairRoutes from './routes/repair.routes';
import dashboardRoutes from './routes/dashboard.routes';
import financialRoutes from './routes/financial.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { authenticate } from './middleware/auth.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true,
  },
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extended metrics endpoint
const startTime = Date.now();
app.get('/metrics', (req, res) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor((Date.now() - startTime) / 1000),
      human: formatUptime(Date.now() - startTime),
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
    },
    memory: {
      rss: formatBytes(mem.rss),
      heapUsed: formatBytes(mem.heapUsed),
      heapTotal: formatBytes(mem.heapTotal),
      external: formatBytes(mem.external),
    },
    websocket: {
      connectedClients: io.engine.clientsCount,
    },
  });
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/customers', authenticate, customerRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/products', authenticate, productRoutes);
app.use('/api/invoices', authenticate, invoiceRoutes);
app.use('/api/stock', authenticate, stockRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/api/approvals', authenticate, approvalRoutes);
app.use('/api/repairs', authenticate, repairRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/financials', authenticate, financialRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (room: string) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
});

export { io };