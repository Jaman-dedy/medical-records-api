// src/config/express.ts
import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import routes from '../routes';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const createServer = (): Application => {
  const app = express();

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));

  // Essential Security Middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  }));
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Compression - Important for reducing payload size
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression for all text-based responses
      return compression.filter(req, res);
    },
    level: 6 // Balanced setting between compression ratio and CPU usage
  }));

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));
  }

  // Request timeout
  app.use((req, res, next) => {
    req.setTimeout(30000, () => {
      res.status(408).json({ message: 'Request Timeout' });
    });
    next();
  });

  // Trust proxy if behind reverse proxy
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Routes
  app.use(routes);

  // Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }));

  return app;
};