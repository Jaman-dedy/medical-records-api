import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer } from './config/express';
import { initializeDatabase } from './config/database';
import { logger } from './utils/logger';

dotenv.config();

const startServer = async () => {
  try {
    await initializeDatabase();

    const app = createServer();
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Swagger documentation available at http://localhost:${port}/api-docs`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});