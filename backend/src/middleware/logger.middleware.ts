import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requestLogger = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;

  // Capture response body
  let responseBody: any;
  res.send = function(body: any): any {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Log after response is sent
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const userId = (req as any).user?.id;

    try {
      await prisma.systemEvent.create({
        data: {
          eventType: 'API_REQUEST',
          entityType: req.method,
          entityId: req.path,
          userId: userId,
          description: `${req.method} ${req.path} - ${res.statusCode}`,
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent'),
            ip: req.ip,
            query: Object.keys(req.query).length > 0 ? req.query : undefined,
            params: Object.keys(req.params).length > 0 ? req.params : undefined,
            responseSize: responseBody ? JSON.stringify(responseBody).length : 0
          }
        }
      });
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  });

  next();
};