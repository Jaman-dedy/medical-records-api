import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer } from './config/express';
import { initializeDatabase } from './config/database';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();

    // Create and start express app
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

// Start server
startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});