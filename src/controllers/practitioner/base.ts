import { Response } from 'express';
import { ApiError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { AuthRequest } from '../../types/auth';

export abstract class BasePractitionerController {
    protected handleError(error: unknown, res: Response, context: string): void {
        // Log the complete error object for debugging
        logger.error(`Error in ${context}:`, {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            details: (error as any)?.details || error
        });

        // Handle ApiError
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }

        // Handle Cloudinary error
        if (typeof error === 'object' && error !== null && 'http_code' in error) {
            res.status((error as any).http_code).json({
                success: false,
                message: (error as any).message || 'File upload failed',
                details: (error as any).details || 'No additional details available'
            });
            return;
        }

        // Handle Multer errors
        if (error instanceof Error && error.name === 'MulterError') {
            res.status(400).json({
                success: false,
                message: 'File upload error',
                details: error.message
            });
            return;
        }

        // Default error response
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }

    protected async validatePractitionerAccess(req: AuthRequest, patientId: string): Promise<void> {
        // Add validation logic here if needed
        // For example, checking if the practitioner has access to this patient
    }
}