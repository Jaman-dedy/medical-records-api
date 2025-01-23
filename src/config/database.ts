import { DataSource } from 'typeorm';
import { join } from 'path';
import { logger } from '../utils/logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'medical_records',
  entities: [join(__dirname, '../database/entities/**/*{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/**/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  extra: {
    max: 20,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000
  }
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');

    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      logger.info('Running pending migrations...');
      await AppDataSource.runMigrations();
      logger.info('Migrations completed');
    }

    const { runSeeds } = await import('../database/seeders/initial.seeder');
    await runSeeds(AppDataSource);

  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
};