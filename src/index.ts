import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer } from './config/express';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;
const app = createServer();

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

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