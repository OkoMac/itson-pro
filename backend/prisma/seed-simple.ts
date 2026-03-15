import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.approval.deleteMany(),
    prisma.repair.deleteMany(),
    prisma.orderLine.deleteMany(),
    prisma.order.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.stockTransaction.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@itsonpro.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create test customer
  console.log('👥 Creating test customer...');
  const customer = await prisma.customer.create({
    data: {
      customerId: 'CUST-001',
      name: 'Test Customer',
      segment: 'RETAIL',
      accountManager: 'John Doe',
      location: 'Test City',
      priority: 'MEDIUM',
      contactName: 'Test Contact',
      contactEmail: 'customer@example.com',
      contactPhone: '+1234567890',
      status: 'ACTIVE',
    },
  });

  // Create test product
  console.log('📦 Creating test product...');
  const product = await prisma.product.create({
    data: {
      sku: 'PROD-001',
      productName: 'Test Product',
      description: 'A test product for demonstration',
      category: 'TEST',
      unitPrice: 100.00,
      costPrice: 50.00,
      stockOnHand: 100,
      reorderLevel: 10,
      leadTimeDays: 7,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Admin user: ${admin.email} (password: admin123)`);
  console.log(`📊 Test customer: ${customer.name}`);
  console.log(`📊 Test product: ${product.productName}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });