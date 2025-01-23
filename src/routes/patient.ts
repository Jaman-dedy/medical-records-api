import { Router } from 'express';
import { PatientController } from '../controllers/patient';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/role';
import { UserRole } from '../database/entities/User';

const router = Router();
const patientController = new PatientController();

router.use(authMiddleware);
router.get('/my-profile', checkRole([UserRole.PATIENT]), patientController.getProfile);
router.get('/my-medical-records', checkRole([UserRole.PATIENT]), patientController.getMedicalRecords);
router.get('/my-allergies', checkRole([UserRole.PATIENT]), patientController.getAllergies);
router.get('/my-lab-orders', checkRole([UserRole.PATIENT]), patientController.getLabOrders);
router.get('/my-prescriptions', checkRole([UserRole.PATIENT]), patientController.getPrescriptions);

export default router;