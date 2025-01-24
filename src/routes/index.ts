import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';

import authRoutes from './auth';
import patientRoutes from './patient';
import practitionerRoutes from './practitioner';
import healthRoutes from './health';


const router = Router();

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerSpec));

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/patient', patientRoutes);
router.use('/api/v1/practitioner', practitionerRoutes);
router.use('/api/v1/health', healthRoutes);

export default router;