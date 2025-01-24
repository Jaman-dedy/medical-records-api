import { Router } from 'express';
import { AppDataSource } from '../config/database';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Get API health status
 *     description: Check if the API server is running
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 * 
 * /api/health/db:
 *   get:
 *     tags:
 *       - Health
 *     summary: Get database health status
 *     description: Check if the database connection is alive
 *     responses:
 *       200:
 *         description: Database is connected
 *       503:
 *         description: Database connection failed
 */

// Basic API health check
router.get('/', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Database health check
router.get('/db', async (req, res) => {
    try {
        const isConnected = AppDataSource.isInitialized;

        if (isConnected) {
            res.status(200).json({
                status: 'ok',
                message: 'Database connection is healthy',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                status: 'error',
                message: 'Database connection is not initialized',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Database health check failed',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;