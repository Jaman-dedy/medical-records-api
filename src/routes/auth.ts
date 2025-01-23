import { Router } from 'express';
import { AuthController } from '../../controllers/auth/auth';
import { validateLogin } from '../validators/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', validateLogin, (req, res) => authController.login(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;