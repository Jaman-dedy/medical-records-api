import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { errorHandler } from '../middleware/errorHandler';
import { notFoundHandler } from '../middleware/errorHandler';

export const createServer = (): Application => {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Medical Records API',
        version: '1.0.0',
        description: 'API for managing patient medical records',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
        },
      ],
    },
    apis: ['./src/routes/*.ts'],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};