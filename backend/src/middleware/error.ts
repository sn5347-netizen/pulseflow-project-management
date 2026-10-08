import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error Catcher]:', err);

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
    return;
  }

  // Prisma record not found error
  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'The requested record was not found.',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

