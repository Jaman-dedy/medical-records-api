import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { UserRole } from '../database/entities/User';
import { logger } from '../utils/logger';

export const checkRole = (allowedRoles: UserRole[]) => (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access forbidden: Insufficient permissions'
            });
            return;
        }

        next();
    } catch (error) {
        logger.error('Role middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during role verification'
        });
        return;
    }
};
