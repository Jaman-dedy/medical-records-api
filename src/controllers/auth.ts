import { Request, Response } from 'express';
import { compare } from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../database/entities/User';
import { generateToken } from '../utils/jwt.utils';
import { LoginDTO } from '../validators/auth';
import { logger } from '../utils/logger';

export class AuthController {
    private userRepository = AppDataSource.getRepository(User);

    public login = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { email, password }: LoginDTO = req.body;

            const user = await this.userRepository.findOne({
                where: { email },
                relations: ['patient', 'practitioner']
            });

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            if (!user.isActive) {
                res.status(403).json({
                    success: false,
                    message: 'Account is inactive'
                });
                return;
            }

            const isValidPassword = await compare(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            const token = generateToken({
                userId: user.id,
                email: user.email,
                role: user.role
            });

            const userData = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profileId: user.role === 'patient' ? user.patient?.id : user.practitioner?.id
            };

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    token
                }
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during login'
            });
        }
    };

    public refreshToken = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        res.status(501).json({
            success: false,
            message: 'Not implemented'
        });
    };

    public logout = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    };
}