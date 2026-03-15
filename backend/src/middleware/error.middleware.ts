import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const err = error as any;

  // Prisma known request errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Duplicate entry',
          details: 'A record with this value already exists'
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found',
          details: 'The requested record does not exist'
        });
      default:
        return res.status(500).json({
          error: 'Database error',
          details: 'An unexpected database error occurred'
        });
    }
  }

  // Prisma validation errors
  if (err.constructor?.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: 'Invalid data provided'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Default error
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: error.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};
