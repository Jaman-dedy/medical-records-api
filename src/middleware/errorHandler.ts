import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const { statusCode = 500, message, isOperational = true, stack } = err;

  logger.error({
    message,
    url: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? stack : undefined
  });

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 && !isOperational ? 'Internal Server Error' : message,
    ...(process.env.NODE_ENV === 'development' && { stack })
  });
};