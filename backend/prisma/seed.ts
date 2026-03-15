import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.systemEvent.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();
  await prisma.costCenter.deleteMany();
  await prisma.dataCenter.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.task.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.financialSummary.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@itsonpro.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
      },
      {
        email: 'manager@itsonpro.com',
        passwordHash: hashedPassword,
        firstName: 'Operations',
        lastName: 'Manager',
        role: 'MANAGER',
      },
      {
        email: 'sales@itsonpro.com',
        passwordHash: hashedPassword,
        firstName: 'Sales',
        lastName: 'Representative',
        role: 'USER',
      },
      {
        email: 'finance@itsonpro.com',
        passwordHash: hashedPassword,
        firstName: 'Finance',
        lastName: 'Officer',
        role: 'USER',
      },
      {
        email: 'tech@itsonpro.com',
        passwordHash: hashedPassword,
        firstName: 'Technical',
        lastName: 'Support',
        role: 'USER',
      },
    ],
  });

  console.log(`👥 Created ${users.count} users`);

  // Create customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        customerId: 'CUST-001',
        name: 'Acme Corporation',
        segment: 'Enterprise',
        accountManager: 'John Smith',
        location: 'Johannesburg',
        priority: 'HIGH',
        contactName: 'Jane Doe',
        contactEmail: 'jane@acme.com',
        contactPhone: '+27 11 123 4567',
        status: 'ACTIVE',
        notes: 'Key enterprise client with multiple locations',
      },
      {
        customerId: 'CUST-002',
        name: 'Beta Solutions',
        segment: 'SMB',
        accountManager: 'Sarah Johnson',
        location: 'Cape Town',
        priority: 'MEDIUM',
        contactName: 'Bob Wilson',
        contactEmail: 'bob@betasolutions.co.za',
        contactPhone: '+27 21 987 6543',
        status: 'ACTIVE',
        notes: 'Growing SMB with monthly orders',
      },
      {
        customerId: 'CUST-003',
        name: 'Gamma Tech',
        segment: 'Startup',
        accountManager: 'Mike Brown',
        location: 'Durban',
        priority: 'LOW',
        contactName: 'Alice Green',
        contactEmail: 'alice@gammatech.com',
        contactPhone: '+27 31 456 7890',
        status: 'PROSPECT',
        notes: 'New startup, potential for growth',
      },
      {
        customerId: 'CUST-004',
        name: 'Delta Manufacturing',
        segment: 'Enterprise',
        accountManager: 'John Smith',
        location: 'Pretoria',
        priority: 'HIGH',
        contactName: 'Charlie Black',
        contactEmail: 'charlie@deltamfg.co.za',
        contactPhone: '+27 12 345 6789',
        status: 'ACTIVE',
        notes: 'Manufacturing plant with regular maintenance needs',
      },
      {
        customerId: 'CUST-005',
        name: 'Epsilon Retail',
        segment: 'Retail',
        accountManager: 'Sarah Johnson',
        location: 'Port Elizabeth',
        priority: 'MEDIUM',
        contactName: 'David White',
        contactEmail: 'david@epsilonretail.com',
        contactPhone: '+27 41 234 5678',
        status: 'ACTIVE',
        notes: 'Retail chain with seasonal orders',
      },
    ],
  });

  console.log(`🏢 Created ${customers.count} customers`);

  // Create products
  const products = await prisma.product.createMany({
    data: [
      {
        sku: 'PROD-001',
        category: 'Networking',
        productName: 'Enterprise Router',
        description: 'High-performance enterprise router with dual WAN',
        unitPrice: 12500.00,
        costPrice: 8500.00,
        stockOnHand: 25,
        reorderLevel: 10,
        leadTimeDays: 14,
        status: 'ACTIVE',
      },
      {
        sku: 'PROD-002',
        category: 'Networking',
        productName: '48-Port Switch',
        description: 'Managed gigabit switch with PoE+',
        unitPrice: 8500.00,
        costPrice: 5500.00,
        stockOnHand: 42,
        reorderLevel: 15,
        leadTimeDays: 7,
        status: 'ACTIVE',
      },
      {
        sku: 'PROD-003',
        category: 'Security',
        productName: 'Firewall Appliance',
        description: 'Next-generation firewall with threat protection',
        unitPrice: 18500.00,
        costPrice: 12500.00,
        stockOnHand: 18,
        reorderLevel: 5,
        leadTimeDays: 21,
        status: 'ACTIVE',
      },
      {
        sku: 'PROD-004',
        category: 'Storage',
        productName: 'NAS Server',
        description: 'Network attached storage with 8 bays',
        unitPrice: 22500.00,
        costPrice: 16500.00,
        stockOnHand: 12,
        reorderLevel: 3,
        leadTimeDays: 28,
        status: 'ACTIVE',
      },
      {
        sku: 'PROD-005',
        category: 'Accessories',
        productName: 'CAT6 Cable (100m)',
        description: '100-meter CAT6 Ethernet cable',
        unitPrice: 850.00,
        costPrice: 450.00,
        stockOnHand: 150,
        reorderLevel: 50,
        leadTimeDays: 3,
        status: 'ACTIVE',
      },
      {
        sku: 'PROD-006',
        category: 'Software',
        productName: 'Network Monitoring License',
        description: 'Annual license for network monitoring software',
        unitPrice: 12500.00,
        costPrice: 0.00,
        stockOnHand: 999,
        reorderLevel: 0,
        leadTimeDays: 1,
        status: 'ACTIVE',
      },
    ],
  });

  console.log(`📦 Created ${products.count} products`);

  // Create cost centers
  const costCenters = await prisma.costCenter.createMany({
    data: [
      {
        costCenterId: 'CC-001',
        name: 'Sales & Marketing',
        department: 'Sales',
        description: 'Sales team expenses and marketing campaigns',
        budget: 500000.00,
        spent: 325000.00,
        committed: 75000.00,
        status: 'ON_TRACK',
        owner: 'Sarah Johnson',
        fiscalYear: 2026,
      },
      {
        costCenterId: 'CC-002',
        name: 'R&D Innovation',
        department: 'Engineering',
        description: 'Research and development projects',
        budget: 750000.00,
        spent: 625000.00,
        committed: 150000.00,
        status: 'OVER_BUDGET',
        owner: 'Mike Brown',
        fiscalYear: 2026,
      },
      {
        costCenterId: 'CC-003',
        name: 'Operations',
        department: 'Operations',
        description: 'Day-to-day operational expenses',
        budget: 300000.00,
        spent: 185000.00,
        committed: 45000.00,
        status: 'ON_TRACK',
        owner: 'John Smith',
        fiscalYear: 2026,
      },
      {
        costCenterId: 'CC-004',
        name: 'IT Infrastructure',
        department: 'IT',
        description: 'Server, network, and software costs',
        budget: 450000.00,
        spent: 395000.00,
        committed: 85000.00,
        status: 'UNDER_REVIEW',
        owner: 'Tech Support',
        fiscalYear: 2026,
      },
      {
        costCenterId: 'CC-005',
        name: 'Customer Support',
        department: 'Support',
        description: 'Support team salaries and tools',
        budget: 250000.00,
        spent: 175000.00,
        committed: 35000.00,
        status: 'ON_TRACK',
        owner: 'Alice Green',
        fiscalYear: 2026,
      },
    ],
  });

  console.log(`💰 Created ${costCenters.count} cost centers`);

  // Create data centers
  const dataCenters = await prisma.dataCenter.createMany({
    data: [
      {
        dcId: 'DC-JHB-01',
        name: 'Johannesburg Primary',
        location: 'Johannesburg, South Africa',
        region: 'Africa South',
        tier: 'Tier III',
        status: 'ACTIVE',
        monthlyRackCost: 125000.00,
        avgPowerKw: 85.5,
        powerCostPerKwh: 2.15,
        bandwidthCostMonthly: 45000.00,
        supportContractMonthly: 25000.00,
        labourCostMonthly: 85000.00,
        headcount: 8,
        notes: 'Primary data center with redundant power and cooling',
      },
      {
        dcId: 'DC-CPT-01',
        name: 'Cape Town DR',
        location: 'Cape Town, South Africa',
        region: 'Africa South',
        tier: 'Tier II',
        status: 'ACTIVE',
        monthlyRackCost: 95000.00,
        avgPowerKw: 42.3,
        powerCostPerKwh: 2.35,
        bandwidthCostMonthly: 35000.00,
        supportContractMonthly: 18000.00,
        labourCostMonthly: 65000.00,
        headcount: 5,
        notes: 'Disaster recovery site with warm standby',
      },
      {
        dcId: 'DC-JHB-02',
        name: 'Johannesburg West',
        location: 'Johannesburg, South Africa',
        region: 'Africa South',
        tier: 'Tier II',
        status: 'MAINTENANCE',
        monthlyRackCost: 85000.00,
        avgPowerKw: 38.7,
        powerCostPerKwh: 2.15,
        bandwidthCostMonthly: 28000.00,
        supportContractMonthly: 15000.00,
        labourCostMonthly: 55000.00,
        headcount: 4,
        notes: 'Undergoing scheduled maintenance until end of month',
      },
    ],
  });

  console.log(`🏢 Created ${dataCenters.count} data centers`);

  // Create orders with order lines
  const order1 = await prisma.order.create({
    data: {
      orderId: 'ORD-2026-001',
      customerId: 'CUST-001',
      poNumber: 'PO-ACME-2026-001',
      status: 'IN_PROGRESS',
      currentStage: 'IN_PRODUCTION',
      owner: 'John Smith',
      dueDate: new Date('2026-04-15'),
      value: 62500.00,
      riskStatus: 'LOW',
      notes: 'Urgent order for new office setup',
      lines: {
        create: [
          {
            orderLineId: 'OL-001',
            sku: 'PROD-001',
            qty: 2,
            unitPrice: 12500.00,
            lineTotal: 25000.00,
            status: 'ALLOCATED',
          },
          {
            orderLineId: 'OL-002',
            sku: 'PROD-002',
            qty: 3,
            unitPrice: 8500.00,
            lineTotal: 25500.00,
            status: 'PENDING',
          },
          {
            orderLineId: 'OL-003',
            sku: 'PROD-005',
            qty: 10,
            unitPrice: 850.00,
            lineTotal: 8500.00,
            status: 'PICKED',
          },
          {
            orderLineId: 'OL-004',
            sku: 'PROD-006',
            qty: 1,
            unitPrice: 12500.00,
            lineTotal: 12500.00,
            status: 'PENDING',
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderId: 'ORD-2026-002',
      customerId: 'CUST-002',
      poNumber: 'PO-BETA-2026-015',
      status: 'CONFIRMED',
      currentStage: 'PROCUREMENT',
      owner: 'Sarah Johnson',
      dueDate: new Date('2026-05-10'),
      value: 18500.00,
      riskStatus: 'MEDIUM',
      notes: 'Waiting for firewall stock',
      lines: {
        create: [
          {
            orderLineId: 'OL-005',
            sku: 'PROD-003',
            qty: 1,
            unitPrice: 18500.00,
            lineTotal: 18500.00,
            status: 'PENDING',
          },
        ],
      },
    },
  });

  console.log(`📦 Created 2 orders with order lines`);

  // Create invoices
  const invoices = await prisma.invoice.createMany({
    data: [
      {
        invoiceId: 'INV-2026-001',
        orderId: 'ORD-2026-001',
        customerId: 'CUST-001',
        invoiceType: 'SALES',
        description: 'Enterprise network equipment',
        total: 62500.00,
        taxAmount: 9375.00,
        dueDate: new Date('2026-04-30'),
        status: 'SENT',
        notes: '50% deposit paid',
      },
      {
        invoiceId: 'INV-2026-002',
        customerId: 'CUST-004',
        invoiceType: 'MAINTENANCE',
        description: 'Monthly maintenance contract - March 2026',
        total: 12500.00,
        taxAmount: 1875.00,
        dueDate: new Date('2026-03-31'),
        status: 'PAID',
        paidAt: new Date('2026-03-15'),
        notes: 'Auto-renewal contract',
      },
      {
        invoiceId: 'INV-2026-003',
        customerId: 'CUST-005',
        invoiceType: 'HOSTING',
        description: 'Data center hosting - Q1 2026',
        total: 45000.00,
        taxAmount: 6750.00,
        dueDate: new Date('2026-03-20'),
        status: 'OVERDUE',
        notes: 'Follow up required',
      },
      {
        invoiceId: 'INV-2026-004',
        orderId: 'ORD-2026-002',
        customerId: 'CUST-002',
        invoiceType: 'SALES',
        description: 'Firewall appliance',
        total: 18500.00,
        taxAmount: 2775.00,
        dueDate: new Date('2026-05-25'),
        status: 'DRAFT',
        notes: 'To be issued upon delivery',
      },
    ],
  });

  console.log(`🧾 Created ${invoices.count} invoices`);

  // Create tasks
  const tasks = await prisma.task.createMany({
    data: [
      {
        taskId: 'TASK-001',
        title: 'Follow up on overdue invoice INV-2026-003',
        description: 'Contact Epsilon Retail regarding overdue payment',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date('2026-03-16'),
        assignedTo: 'finance@itsonpro.com',
      },
      {
        taskId: 'TASK-002',
        title: 'Prepare proposal for Gamma Tech',
        description: 'Create network infrastructure proposal for new startup client',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date('2026-03-20'),
        assignedTo: 'sales@itsonpro.com',
      },
      {
        taskId: 'TASK-003',
        title: 'Schedule maintenance for DC-JHB-02',
        description: 'Coordinate maintenance window with clients',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: new Date('2026-03-25'),
        assignedTo: 'tech@itsonpro.com',
      },
      {
        taskId: 'TASK-004',
        title: 'Review Q1 financial reports',
        description: 'Analyze Q1 performance and prepare board presentation',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date('2026-04-05'),
        assignedTo: 'finance@itsonpro.com',
      },
      {
        taskId: 'TASK-005',
        title: 'Update product catalog',
        description: 'Add new product lines and update pricing',
        status: 'COMPLETED',
        priority: 'LOW',
        dueDate: new Date('2024-03-20'),