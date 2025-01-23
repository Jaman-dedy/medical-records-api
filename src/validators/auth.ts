import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginDTO = z.infer<typeof loginSchema>;

export const validateLogin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        loginSchema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Login validation failed:', error.errors);
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