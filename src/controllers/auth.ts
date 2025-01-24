import { Request, Response } from 'express';
import { compare, hash } from 'bcryptjs';
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

            logger.debug('=== Login Debug Information ===');
            logger.debug(`Login attempt for email: ${email}`);
            logger.debug(`Raw password received: "${password}"`);
            logger.debug(`Password length: ${password.length}`);
            logger.debug(`Password bytes: ${Buffer.from(password).toString('hex')}`);

            const user = await this.userRepository.findOne({
                where: { email },
                relations: ['patient', 'practitioner']
            });

            if (!user) {
                logger.debug('User not found');
                res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
                return;
            }

            logger.debug(`Stored hash in database: ${user.password}`);
            logger.debug('User found, comparing passwords');

            // Try multiple comparison attempts
            const attempt1 = await compare('pass123', user.password);
            const attempt2 = await compare(password.trim(), user.password);
            const attempt3 = await compare(password, user.password);

            logger.debug('Password comparison attempts:');
            logger.debug(`1. Direct 'pass123': ${attempt1}`);
            logger.debug(`2. Trimmed password: ${attempt2}`);
            logger.debug(`3. Original password: ${attempt3}`);

            if (!user.isActive) {
                res.status(403).json({
                    success: false,
                    message: 'Account is inactive'
                });
                return;
            }

            // Create a new test hash
            const testHash = await hash(password, 10);
            logger.debug(`New test hash created: ${testHash}`);
            const testCompare = await compare(password, testHash);
            logger.debug(`Test comparison with new hash: ${testCompare}`);

            const isValidPassword = await compare(password, user.password);
            logger.debug(`Final password validation result: ${isValidPassword}`);

            logger.debug(`Password valid: ${isValidPassword}`);

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