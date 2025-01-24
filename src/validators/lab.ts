// src/validators/lab.validator.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { LabOrderStatus } from '../database/entities/LabOrder';
import { LabResultStatus } from '../database/entities/LabResult';

// Lab Order Schemas
const createLabOrderSchema = z.object({
    testType: z.string().min(1, 'Test type is required').max(100),
    instructions: z.string().max(500).optional(),
    notes: z.string().max(500).optional()
});

const updateLabOrderSchema = z.object({
    testType: z.string().max(100).optional(),
    instructions: z.string().max(500).optional(),
    notes: z.string().max(500).optional(),
    status: z.enum([
        LabOrderStatus.PENDING,
        LabOrderStatus.IN_PROGRESS,
        LabOrderStatus.COMPLETED,
        LabOrderStatus.CANCELLED
    ]).optional()
});

// Lab Result Schemas
const resultDataSchema = z.object({
    value: z.string().min(1, 'Result value is required'),
    unit: z.string().min(1, 'Unit is required'),
    referenceRange: z.string().optional()
});

const createLabResultSchema = z.object({
    labOrderId: z.string().uuid('Invalid lab order ID'),
    resultData: resultDataSchema,
    status: z.enum([
        LabResultStatus.NORMAL,
        LabResultStatus.ABNORMAL,
        LabResultStatus.CRITICAL,
        LabResultStatus.INCONCLUSIVE
    ], {
        required_error: 'Result status is required'
    }),
    interpretation: z.string().max(1000).optional(),
    performedBy: z.string().min(1, 'Performer information is required').max(100),
    fileUrl: z.string().url('Invalid file URL').optional()
});

const updateLabResultSchema = z.object({
    resultData: resultDataSchema.optional(),
    status: z.enum([
        LabResultStatus.NORMAL,
        LabResultStatus.ABNORMAL,
        LabResultStatus.CRITICAL,
        LabResultStatus.INCONCLUSIVE
    ]).optional(),
    interpretation: z.string().max(1000).optional(),
    performedBy: z.string().max(100).optional(),
    fileUrl: z.string().url('Invalid file URL').optional()
});

// Export types
export type CreateLabOrderDTO = z.infer<typeof createLabOrderSchema>;
export type UpdateLabOrderDTO = z.infer<typeof updateLabOrderSchema>;
export type CreateLabResultDTO = z.infer<typeof createLabResultSchema>;
export type UpdateLabResultDTO = z.infer<typeof updateLabResultSchema>;

// Validation middlewares
export const validateCreateLabOrder = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        createLabOrderSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Create lab order validation failed:', error.errors);
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

export const validateUpdateLabOrder = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        updateLabOrderSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Update lab order validation failed:', error.errors);
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

export const validateCreateLabResult = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        createLabResultSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Create lab result validation failed:', error.errors);
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

export const validateUpdateLabResult = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        updateLabResultSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Update lab result validation failed:', error.errors);
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