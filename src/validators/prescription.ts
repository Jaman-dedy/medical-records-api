import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

const createPrescriptionSchema = z.object({
    medication: z.string().min(1, 'Medication name is required').max(100),
    dosage: z.string().min(1, 'Dosage is required').max(50),
    frequency: z.string().min(1, 'Frequency is required').max(50),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date').optional(),
    isActive: z.boolean().optional().default(true),
    instructions: z.string().max(500).optional(),
    notes: z.string().max(500).optional()
});

const updatePrescriptionSchema = z.object({
    medication: z.string().max(100).optional(),
    dosage: z.string().max(50).optional(),
    frequency: z.string().max(50).optional(),
    startDate: z.string().datetime('Invalid start date').optional(),
    endDate: z.string().datetime('Invalid end date').optional(),
    isActive: z.boolean().optional(),
    instructions: z.string().max(500).optional(),
    notes: z.string().max(500).optional()
});

// Export types
export type CreatePrescriptionDTO = z.infer<typeof createPrescriptionSchema>;
export type UpdatePrescriptionDTO = z.infer<typeof updatePrescriptionSchema>;

export const validateCreatePrescription = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        createPrescriptionSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Create prescription validation failed:', error.errors);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
            return;
        }
        logger.error('Unexpected validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during validation'
        });
    }
};

export const validateUpdatePrescription = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        updatePrescriptionSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Update prescription validation failed:', error.errors);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
            return;
        }
        logger.error('Unexpected validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during validation'
        });
    }
};