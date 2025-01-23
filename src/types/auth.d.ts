import { Request } from 'express';
import { UserRole } from '../database/entities/User';

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            profileId?: string;
        };
        token: string;
    };
}