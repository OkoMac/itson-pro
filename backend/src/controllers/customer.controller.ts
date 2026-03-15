import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Get all customers with pagination and filtering
export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', search, status, priority } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { customerId: { contains: search as string, mode: 'insensitive' } },
        { contactName: { contains: search as string, mode: 'insensitive' } },
        { contactEmail: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }

    // Get total count for pagination
    const total = await prisma.customer.count({ where });

    // Get customers with related data
    const customers = await prisma.customer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            orders: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    // Calculate total value from orders
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await prisma.order.findMany({
          where: { customerId: customer.id },
          select: { value: true },
        });
        
        const totalOrderValue = orders.reduce((sum, order) => sum + order.value, 0);
        
        return {
          ...customer,
          totalOrderValue,
        };
      })
    );

    res.json({
      data: customersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single customer by ID
export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        orders: {
          include: {
            lines: {
              include: {
                product: {
                  select: {
                    sku: true,
                    productName: true,
                    category: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        repairs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            invoices: true,
            repairs: true,
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate customer statistics
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      select: { value: true, status: true },
    });
    
    const totalOrderValue = orders.reduce((sum, order) => sum + order.value, 0);
    const activeOrders = orders.filter(order => 
      ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(order.status)
    ).length;
    
    const invoices = await prisma.invoice.findMany({
      where: { customerId: customer.id },
      select: { total: true, status: true },
    });
    
    const totalInvoiceValue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const outstandingInvoices = invoices.filter(invoice => 
      ['SENT', 'OVERDUE', 'DISPUTED'].includes(invoice.status)
    ).length;

    const customerWithStats = {
      ...customer,
      statistics: {
        totalOrderValue,
        activeOrders,
        totalInvoiceValue,
        outstandingInvoices,
        totalOrders: orders.length,
        totalInvoices: invoices.length,
      },
    };

    res.json(customerWithStats);
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new customer
export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerId,
      name,
      segment,
      accountManager,
      location,
      priority,
      contactName,
      contactEmail,
      contactPhone,
      status,
      notes,
    } = req.body;

    // Validate required fields
    if (!customerId || !name || !segment || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if customer ID already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (existingCustomer) {
      return res.status(409).json({ error: 'Customer ID already exists' });
    }

    const customer = await prisma.customer.create({
      data: {
        customerId,
        name,
        segment,
        accountManager: accountManager || req.user?.email || 'Unassigned',
        location,
        priority: priority || 'MEDIUM',
        contactName,
        contactEmail,
        contactPhone,
        status: status || 'ACTIVE',
        notes,
        userId: req.user?.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log system event
    await prisma.systemEvent.create({
      data: {
        eventType: 'CUSTOMER_CREATED',
        entityType: 'CUSTOMER',
        entityId: customer.id,
        userId: req.user?.id,
        description: `Customer ${customerId} - ${name} created`,
        metadata: {
          customerId,
          name,
          segment,
          priority: customer.priority,
        },
      },
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update customer
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Don't allow updating customerId
    if (updates.customerId && updates.customerId !== existingCustomer.customerId) {
      return res.status(400).json({ error: 'Cannot change customer ID' });
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updates,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log system event
    await prisma.systemEvent.create({
      data: {
        eventType: 'CUSTOMER_UPDATED',
        entityType: 'CUSTOMER',
        entityId: customer.id,
        userId: req.user?.id,
        description: `Customer ${customer.customerId} updated`,
        metadata: updates,
      },
    });

    res.json({
      message: 'Customer updated successfully',
      customer,
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete customer (soft delete by setting status to ARCHIVED)
export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has active orders or invoices
    const activeOrders = await prisma.order.count({
      where: {
        customerId: customer.id,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      },
    });

    const outstandingInvoices = await prisma.invoice.count({
      where: {
        customerId: customer.id,
        status: { in: ['SENT', 'OVERDUE', 'DISPUTED'] },
      },
    });

    if (activeOrders > 0 || outstandingInvoices > 0) {
      return res.status(400).json({
        error: 'Cannot archive customer with active orders or outstanding invoices',
        details: {
          activeOrders,
          outstandingInvoices,
        },
      });
    }

    // Soft delete by archiving
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    // Log system event
    await prisma.systemEvent.create({
      data: {
        eventType: 'CUSTOMER_ARCHIVED',
        entityType: 'CUSTOMER',
        entityId: customer.id,
        userId: req.user?.id,
        description: `Customer ${customer.customerId} archived`,
      },
    });

    res.json({
      message: 'Customer archived successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer statistics
export const getCustomerStatistics = async (req: AuthRequest, res: Response) => {
  try {
    // Get counts by status
    const statusCounts = await prisma.customer.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get counts by priority
    const priorityCounts = await prisma.customer.groupBy({
      by: ['priority'],
      _count: true,
    });

    // Get counts by segment
    const segmentCounts = await prisma.customer.groupBy({
      by: ['segment'],
      _count: true,
    });

    // Get recent customers
    const recentCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        customerId: true,
        name: true,
        segment: true,
        status: true,
        createdAt: true,
      },
    });

    // Get top customers by order value
    const topCustomers = await prisma.customer.findMany({
      include: {
        orders: {
          select: { value: true },
        },
      },
    });

    const customersWithValue = topCustomers.map(customer => ({
      ...customer,
      totalOrderValue: customer.orders.reduce((sum, order) => sum + order.value, 0),
    }));

    const sortedCustomers = customersWithValue
      .sort((a, b) => b.totalOrderValue - a.totalOrderValue)
      .slice(0, 5)
      .map(customer => ({
        id: customer.id,
        customerId: customer.customerId,
        name: customer.name,
        segment: customer.segment,
        totalOrderValue: customer.totalOrderValue,
      }));

    res.json({
      statusCounts,
      priorityCounts,
      segmentCounts,
      recentCustomers,
      topCustomers: sortedCustomers,
      totalCustomers: await prisma.customer.count(),
      activeCustomers: await prisma.customer.count({ where: { status: 'ACTIVE' } }),
    });
  } catch (error) {
    console.error('Get customer statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};