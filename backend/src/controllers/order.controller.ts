import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Get all orders with pagination and filtering
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      search, 
      status, 
      riskStatus,
      customerId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderId: { contains: search as string, mode: 'insensitive' } },
        { poNumber: { contains: search as string, mode: 'insensitive' } },
        { owner: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (riskStatus) {
      where.riskStatus = riskStatus;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Validate sort field
    const validSortFields = ['createdAt', 'dueDate', 'value', 'orderId'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';

    // Get total count for pagination
    const total = await prisma.order.count({ where });

    // Get orders with related data
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            customerId: true,
            name: true,
            priority: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        lines: {
          include: {
            product: {
              select: {
                sku: true,
                productName: true,
                category: true,
                unitPrice: true,
              },
            },
          },
        },
        invoices: {
          select: {
            id: true,
            invoiceId: true,
            total: true,
            status: true,
          },
        },
        _count: {
          select: {
            lines: true,
            invoices: true,
          },
        },
      },
      orderBy: { [sortField as string]: sortOrder as 'asc' | 'desc' },
      skip,
      take: limitNum,
    });

    // Calculate order statistics
    const ordersWithStats = orders.map(order => {
      const totalLines = order.lines.length;
      const totalItems = order.lines.reduce((sum, line) => sum + line.qty, 0);
      const totalInvoiced = order.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
      const remainingValue = order.value - totalInvoiced;
      
      // Calculate days until due
      const dueDate = new Date(order.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...order,
        statistics: {
          totalLines,
          totalItems,
          totalInvoiced,
          remainingValue,
          daysUntilDue,
          invoicedPercentage: order.value > 0 ? (totalInvoiced / order.value) * 100 : 0,
        },
      };
    });

    res.json({
      data: ordersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            customerId: true,
            name: true,
            segment: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            priority: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        lines: {
          include: {
            product: {
              select: {
                sku: true,
                productName: true,
                category: true,
                unitPrice: true,
                stockOnHand: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Calculate order statistics
    const totalItems = order.lines.reduce((sum, line) => sum + line.qty, 0);
    const totalInvoiced = order.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const remainingValue = order.value - totalInvoiced;
    
    // Calculate days until due
    const dueDate = new Date(order.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check stock availability
    const linesWithStock = await Promise.all(
      order.lines.map(async (line) => {
        const product = await prisma.product.findUnique({
          where: { sku: line.sku },
          select: { stockOnHand: true, reorderLevel: true },
        });
        
        return {
          ...line,
          stockInfo: {
            available: product?.stockOnHand || 0,
            reorderLevel: product?.reorderLevel || 0,
            sufficient: (product?.stockOnHand || 0) >= line.qty,
          },
        };
      })
    );

    const orderWithDetails = {
      ...order,
      lines: linesWithStock,
      statistics: {
        totalItems,
        totalInvoiced,
        remainingValue,
        daysUntilDue,
        invoicedPercentage: order.value > 0 ? (totalInvoiced / order.value) * 100 : 0,
        allItemsInStock: linesWithStock.every(line => line.stockInfo.sufficient),
      },
    };

    res.json(orderWithDetails);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      orderId,
      customerId,
      poNumber,
      status,
      currentStage,
      owner,
      dueDate,
      value,
      riskStatus,
      notes,
      lines,
    } = req.body;

    // Validate required fields
    if (!orderId || !customerId || !dueDate || !lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or empty order lines' });
    }

    // Check if order ID already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderId },
    });

    if (existingOrder) {
      return res.status(409).json({ error: 'Order ID already exists' });
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Validate and calculate order lines
    let calculatedValue = 0;
    const orderLinesData: Array<{ orderLineId: string; sku: string; qty: number; unitPrice: number; lineTotal: number }> = [];
    
    for (const line of lines) {
      const { sku, qty, unitPrice } = line;
      
      if (!sku || !qty || qty <= 0) {
        return res.status(400).json({ error: 'Invalid order line data' });
      }
      
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { sku },
      });
      
      if (!product) {
        return res.status(404).json({ error: `Product with SKU ${sku} not found` });
      }
      
      const linePrice = unitPrice || product.unitPrice;
      const lineTotal = linePrice * qty;
      calculatedValue += lineTotal;
      
      orderLinesData.push({
        orderLineId: `${orderId}-${sku}`,
        sku,
        qty,
        unitPrice: linePrice,
        lineTotal,
      });
    }

    // Use calculated value if not provided
    const finalValue = value || calculatedValue;

    // Create order with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderId,
          customerId,
          poNumber,
          status: status || 'PENDING',
          currentStage: currentStage || 'ORDER_RECEIVED',
          owner: owner || req.user?.email || 'Unassigned',
          dueDate: new Date(dueDate),
          value: finalValue,
          riskStatus: riskStatus || 'NONE',
          notes,
          userId: req.user?.id,
          lines: {
            create: orderLinesData,
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
            },
          },
          lines: true,
        },
      });

      // Update stock levels (allocate stock)
      for (const line of lines) {
        await tx.product.update({
          where: { sku: line.sku },
          data: {
            stockOnHand: {
              decrement: line.qty,
            },
          },
        });

        // Create stock transaction
        await tx.stockTransaction.create({
          data: {
            transactionId: `ST-${orderId}-${line.sku}`,
            sku: line.sku,
            transactionType: 'SALE',
            qty: line.qty,
            unitCost: line.unitPrice,
            referenceId: order.id,
            notes: `Order ${orderId} allocation`,
          },
        });
      }

      // Log system event
      await tx.systemEvent.create({
        data: {
          eventType: 'ORDER_CREATED',
          entityType: 'ORDER',
          entityId: order.id,
          userId: req.user?.id,
          description: `Order ${orderId} created for ${customer.name}`,
          metadata: {
            orderId,
            customerId,
            value: finalValue,
            lineCount: lines.length,
          },
        },
      });

      return order;
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: result,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update order
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Don't allow updating orderId
    if (updates.orderId && updates.orderId !== existingOrder.orderId) {
      return res.status(400).json({ error: 'Cannot change order ID' });
    }

    // Handle stage transitions
    if (updates.currentStage && updates.currentStage !== existingOrder.currentStage) {
      // Validate stage transition
      const validTransitions: Record<string, string[]> = {
        'ORDER_RECEIVED': ['PROCUREMENT'],
        'PROCUREMENT': ['IN_PRODUCTION', 'WAITING_FOR_STOCK'],
        'WAITING_FOR_STOCK': ['FILLING'],
        'IN_PRODUCTION': ['FILLING'],
        'FILLING': ['BRANDING'],
        'BRANDING': ['DISPATCH_READY'],
        'DISPATCH_READY': ['DISPATCHED'],
        'DISPATCHED': ['DELIVERED'],
      };

      const currentStage = existingOrder.currentStage;
      const newStage = updates.currentStage;
      
      if (validTransitions[currentStage] && !validTransitions[currentStage].includes(newStage)) {
        return res.status(400).json({
          error: `Invalid stage transition from ${currentStage} to ${newStage}`,
          validTransitions: validTransitions[currentStage],
        });
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: updates,
      include: {
        customer: {
          select: {
            id: true,
            customerId: true,
            name: true,
          },
        },
        lines: true,
      },
    });

    // Log system event for stage changes
    if (updates.currentStage && updates.currentStage !== existingOrder.currentStage) {
      await prisma.systemEvent.create({
        data: {
          eventType: 'ORDER_STAGE_CHANGED',
          entityType: 'ORDER',
          entityId: order.id,
          userId: req.user?.id,
          description: `Order ${order.orderId} moved from ${existingOrder.currentStage} to ${updates.currentStage}`,
          metadata: {
            fromStage: existingOrder.currentStage,
            toStage: updates.currentStage,
          },
        },
      });
    }

    res.json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete order (cancel)
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Cannot cancel completed order' });
    }

    if (order.currentStage === 'DISPATCHED' || order.currentStage === 'DELIVERED') {
      return res.status(400).json({ error: 'Cannot cancel dispatched or delivered order' });
    }

    // Use transaction to cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          currentStage: 'ORDER_RECEIVED',
        },
      });

      // Restore stock for each line
      for (const line of order.lines) {
        await tx.product.update({
          where: { sku: line.sku },
          data: {
            stockOnHand: {
              increment: line.qty,
            },
          },
        });

        // Create stock transaction for cancellation
        await tx.stockTransaction.create({
          data: {
            transactionId: `ST-CANCEL-${order.orderId}-${line.sku}`,
            sku: line.sku,
            transactionType: 'RETURN',
            qty: line.qty,
            unitCost: line.unitPrice,
            referenceId: order.id,
            notes: `Order ${order.orderId} cancellation`,
          },
        });
      }

      // Log system event
      await tx.systemEvent.create({
        data: {
          eventType: 'ORDER_CANCELLED',
          entityType: 'ORDER',
          entityId: order.id,
          userId: req.user?.id,
          description: `Order ${order.orderId} cancelled`,
          metadata: {
            orderId: order.orderId,
            value: order.value,
            lineCount: order.lines.length,
          },
        },
      });
    });

    res.json({
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get order statistics
export const getOrderStatistics = async (req: AuthRequest, res: Response) => {
  try {
    // Get counts by status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        value: true,
      },
    });

    // Get counts by stage
    const stageCounts = await prisma.order.groupBy({
      by: ['currentStage'],
      _count: true,
    });

    // Get counts by risk status
    const riskCounts = await prisma.order.groupBy({
      by: ['riskStatus'],
      _count: true,
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderId: true,
        status: true,
        currentStage: true,
        value: true,
        dueDate: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            customerId: true,
            name: true,
          },
        },
      },
    });

    // Get orders at risk (due in next 7 days or overdue)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const ordersAtRisk = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        dueDate: {
          lte: nextWeek,
        },
        OR: [
          { riskStatus: { in: ['HIGH', 'CRITICAL'] } },
          {
            dueDate: {
              lte: today,
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            customerId: true,
            name: true,
            priority: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Calculate overall statistics
    const totalOrders = await prisma.order.count();
    const totalValue = await prisma.order.aggregate({
      _sum: { value: true },
    });
    
    const activeOrders = await prisma.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
    });
    
    const completedOrders = await prisma.order.count({
      where: { status: 'COMPLETED' },
    });

    // Get monthly order value trend
    const monthlyTrend = await prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { value: true },
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Last 6 months
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Format monthly trend data
    const formattedTrend = monthlyTrend.map(item => ({
      month: item.createdAt.toISOString().slice(0, 7), // YYYY-MM format
      value: item._sum.value || 0,
    }));

    // Group by month
    const monthlyData: Record<string, number> = {};
    formattedTrend.forEach(item => {
      monthlyData[item.month] = (monthlyData[item.month] || 0) + item.value;
    });

    const monthlyTrendData = Object.entries(monthlyData).map(([month, value]) => ({
      month,
      value,
    }));

    res.json({
      statusCounts,
      stageCounts,
      riskCounts,
      recentOrders,
      ordersAtRisk,
      statistics: {
        totalOrders,
        totalValue: totalValue._sum.value || 0,
        activeOrders,
        completedOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        averageOrderValue: totalOrders > 0 ? (totalValue._sum.value || 0) / totalOrders : 0,
      },
      monthlyTrend: monthlyTrendData,
    });
  } catch (error) {
    console.error('Get order statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update order line status
export const updateOrderLineStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, lineId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order line exists
    const orderLine = await prisma.orderLine.findUnique({
      where: { id: lineId },
    });

    if (!orderLine) {
      return res.status(404).json({ error: 'Order line not found' });
    }

    // Update order line status
    const updatedLine = await prisma.orderLine.update({
      where: { id: lineId },
      data: { status },
      include: {
        product: {
          select: {
            sku: true,
            productName: true,
          },
        },
      },
    });

    // Log system event
    await prisma.systemEvent.create({
      data: {
        eventType: 'ORDER_LINE_STATUS_CHANGED',
        entityType: 'ORDER_LINE',
        entityId: lineId,
        userId: req.user?.id,
        description: `Order line ${orderLine.orderLineId} status changed to ${status}`,
        metadata: {
          orderId: order.orderId,
          lineId: orderLine.orderLineId,
          sku: orderLine.sku,
          fromStatus: orderLine.status,
          toStatus: status,
        },
      },
    });

    res.json({
      message: 'Order line status updated successfully',
      orderLine: updatedLine,
    });
  } catch (error) {
    console.error('Update order line status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add line to existing order
export const addOrderLine = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { sku, qty, unitPrice } = req.body;

    if (!sku || !qty || qty <= 0) {
      return res.status(400).json({ error: 'Invalid order line data' });
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      return res.status(404).json({ error: `Product with SKU ${sku} not found` });
    }

    // Check if order line already exists for this SKU
    const existingLine = await prisma.orderLine.findFirst({
      where: {
        orderId,
        sku,
      },
    });

    if (existingLine) {
      return res.status(409).json({ error: 'Order line for this SKU already exists' });
    }

    const linePrice = unitPrice || product.unitPrice;
    const lineTotal = linePrice * qty;
    const orderLineId = `${order.orderId}-${sku}-${Date.now()}`;

    // Use transaction to add line and update order value
    const result = await prisma.$transaction(async (tx) => {
      // Create order line
      const orderLine = await tx.orderLine.create({
        data: {
          orderLineId,
          orderId,
          sku,
          qty,
          unitPrice: linePrice,
          lineTotal,
        },
      });

      // Update order value
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          value: {
            increment: lineTotal,
          },
        },
      });

      // Update stock levels
      await tx.product.update({
        where: { sku },
        data: {
          stockOnHand: {
            decrement: qty,
          },
        },
      });

      // Create stock transaction
      await tx.stockTransaction.create({
        data: {
          transactionId: `ST-ADD-${order.orderId}-${sku}`,
          sku,
          transactionType: 'SALE',
          qty,
          unitCost: linePrice,
          referenceId: order.id,
          notes: `Added to order ${order.orderId}`,
        },
      });

      // Log system event
      await tx.systemEvent.create({
        data: {
          eventType: 'ORDER_LINE_ADDED',
          entityType: 'ORDER_LINE',
          entityId: orderLine.id,
          userId: req.user?.id,
          description: `Order line added to ${order.orderId} for SKU ${sku}`,
          metadata: {
            orderId: order.orderId,
            sku,
            qty,
            unitPrice: linePrice,
            lineTotal,
          },
        },
      });

      return { orderLine, updatedOrder };
    });

    res.status(201).json({
      message: 'Order line added successfully',
      ...result,
    });
  } catch (error) {
    console.error('Add order line error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove line from order
export const removeOrderLine = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, lineId } = req.params;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order line exists
    const orderLine = await prisma.orderLine.findUnique({
      where: { id: lineId },
    });

    if (!orderLine) {
      return res.status(404).json({ error: 'Order line not found' });
    }

    // Use transaction to remove line and update order
    await prisma.$transaction(async (tx) => {
      // Delete order line
      await tx.orderLine.delete({
        where: { id: lineId },
      });

      // Update order value
      await tx.order.update({
        where: { id: orderId },
        data: {
          value: {
            decrement: orderLine.lineTotal,
          },
        },
      });

      // Restore stock
      await tx.product.update({
        where: { sku: orderLine.sku },
        data: {
          stockOnHand: {
            increment: orderLine.qty,
          },
        },
      });

      // Create stock transaction for removal
      await tx.stockTransaction.create({
        data: {
          transactionId: `ST-REMOVE-${order.orderId}-${orderLine.sku}`,
          sku: orderLine.sku,
          transactionType: 'RETURN',
          qty: orderLine.qty,
          unitCost: orderLine.unitPrice,
          referenceId: order.id,
          notes: `Removed from order ${order.orderId}`,
        },
      });

      // Log system event
      await tx.systemEvent.create({
        data: {
          eventType: 'ORDER_LINE_REMOVED',
          entityType: 'ORDER_LINE',
          entityId: lineId,
          userId: req.user?.id,
          description: `Order line removed from ${order.orderId} for SKU ${orderLine.sku}`,
          metadata: {
            orderId: order.orderId,
            sku: orderLine.sku,
            qty: orderLine.qty,
            lineTotal: orderLine.lineTotal,
          },
        },
      });
    });

    res.json({
      message: 'Order line removed successfully',
    });
  } catch (error) {
    console.error('Remove order line error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};