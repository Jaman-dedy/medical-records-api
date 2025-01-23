// controllers/practitioner/base.controller.ts
import { Response } from 'express';
import { AppDataSource } from '../../config/database';
import { ApiError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../types/auth';

export abstract class BasePractitionerController {
    protected handleError(error: unknown, res: Response, context: string): void {
        logger.error(`Error in ${context}:`, error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }

    protected async validatePractitionerAccess(req: AuthRequest, patientId: string): Promise<void> {
        // Add validation logic here if needed
        // For example, checking if the practitioner has access to this patient
    }
}