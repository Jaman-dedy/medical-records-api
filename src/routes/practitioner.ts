import { Router } from 'express';
import { PractitionerController } from '../controllers/practitioner';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/role';
import { UserRole } from '../database/entities/User';

import {
    validateCreateLabOrder,
    validateUpdateLabOrder,
    validateCreateLabResult,
    validateUpdateLabResult
} from '../validators/lab';

const router = Router();
const practitionerController = new PractitionerController();


router.use(authMiddleware);
router.use(checkRole([UserRole.PRACTITIONER]));

router.get('/patients', practitionerController.getPatients);
router.get('/patients/:patientId/medical-records', practitionerController.getPatientMedicalRecords);

// Medical Records Management
router.post('/medical-records/:patientId/allergies', practitionerController.addAllergy);
router.post('/medical-records/:patientId/lab-orders', validateCreateLabOrder, practitionerController.createLabOrder);
router.post('/medical-records/:patientId/lab-results', validateCreateLabResult, practitionerController.addLabResult);
router.post('/medical-records/:patientId/prescriptions', practitionerController.addPrescription);

// Updates
router.put('/medical-records/allergies/:id', practitionerController.updateAllergy);
router.put('/medical-records/lab-orders/:id', validateUpdateLabOrder, practitionerController.updateLabOrder);
router.put('/medical-records/lab-results/:id', validateUpdateLabResult, practitionerController.updateLabResult);
router.put('/medical-records/prescriptions/:id', practitionerController.updatePrescription);

// Deletions (soft delete)
router.delete('/medical-records/allergies/:id', practitionerController.deleteAllergy);
router.delete('/medical-records/lab-orders/:id', practitionerController.deleteLabOrder);
router.delete('/medical-records/lab-results/:id', practitionerController.deleteLabResult);
router.delete('/medical-records/prescriptions/:id', practitionerController.deletePrescription);

export default router;