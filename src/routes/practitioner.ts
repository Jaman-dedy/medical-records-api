import { Router } from 'express';
import { PractitionerController } from '../controllers/practitioner';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/role';
import { UserRole } from '../database/entities/User';
import { upload } from '../services/fileUpload';
import { logger } from '../utils/logger'

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

/**
 * @swagger
 * /api/v1/practitioner/patients:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Get all patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientProfile'
 *       401:
 *         description: Unauthorized
 */
router.get('/patients', practitionerController.getPatients);

/**
 * @swagger
 * /api/v1/practitioner/patients/summary:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Get summary of all patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient summaries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       patientId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       activePrescriptions:
 *                         type: integer
 *                       pendingLabResults:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/patients/summary', practitionerController.getPatientSummary);

/**
 * @swagger
 * /api/v1/practitioner/patients/search:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Search patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term (name or ID)
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientProfile'
 *       401:
 *         description: Unauthorized
 */


router.get('/patients/search', practitionerController.searchPatients);

/**
 * @swagger
 * /api/v1/practitioner/patients/{patientId}/medical-records:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Get patient's medical records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient's unique ID
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MedicalRecord'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */


router.get('/patients/:patientId/medical-records', practitionerController.getPatientMedicalRecords);

// Medical Records Management

/**
 * @swagger
 * /api/v1/practitioner/medical-records/{patientId}/allergies:
 *   post:
 *     tags:
 *       - Practitioner
 *     summary: Add new allergy for patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Penicillin"
 *               severity:
 *                 type: string
 *                 example: "Severe"
 *               reaction:
 *                 type: string
 *                 example: "Anaphylaxis"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Allergy added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Allergy'
 */

router.post('/medical-records/:patientId/allergies', practitionerController.addAllergy);

/**
 * @swagger
 * /api/v1/practitioner/medical-records/{patientId}/lab-orders:
 *   post:
 *     tags:
 *       - Practitioner
 *     summary: Create new lab order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testType
 *             properties:
 *               testType:
 *                 type: string
 *                 example: "Complete Blood Count"
 *               instructions:
 *                 type: string
 *                 example: "Fasting required for 12 hours"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lab order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LabOrder'
 */

router.post('/medical-records/:patientId/lab-orders', validateCreateLabOrder, practitionerController.createLabOrder);
/**
 * @swagger
 * /api/v1/practitioner/medical-records/{patientId}/lab-results:
 *   post:
 *     tags:
 *       - Practitioner
 *     summary: Add lab result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labOrderId
 *               - resultData
 *             properties:
 *               labOrderId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [normal, abnormal, critical, inconclusive]
 *               resultData:
 *                 type: object
 *               interpretation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lab result added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/LabResult'
 */

router.post('/medical-records/:patientId/lab-results', validateCreateLabResult, practitionerController.addLabResult);
/**
 * @swagger
 * /api/v1/practitioner/medical-records/{patientId}/prescriptions:
 *   post:
 *     tags:
 *       - Practitioner
 *     summary: Add new prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient's unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medication
 *               - dosage
 *               - frequency
 *               - startDate
 *             properties:
 *               medication:
 *                 type: string
 *                 example: "Amoxicillin"
 *               dosage:
 *                 type: string
 *                 example: "500mg"
 *               frequency:
 *                 type: string
 *                 example: "Twice daily"
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               instructions:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Prescription'
 */

router.post('/medical-records/:patientId/prescriptions', practitionerController.addPrescription);

/**
 * @swagger
 * /api/v1/practitioner/medical-records/allergies/{id}:
 *   put:
 *     tags:
 *       - Practitioner
 *     summary: Update allergy information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Allergy record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               severity:
 *                 type: string
 *               reaction:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Allergy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Allergy'
 *   delete:
 *     tags:
 *       - Practitioner
 *     summary: Delete allergy record (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Allergy deleted successfully
 */

/**
 * @swagger
 * /api/v1/practitioner/medical-records/lab-orders/{id}:
 *   put:
 *     tags:
 *       - Practitioner
 *     summary: Update lab order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testType:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               instructions:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lab order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabOrder'
 *   delete:
 *     tags:
 *       - Practitioner
 *     summary: Delete lab order (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab order deleted successfully
 */

/**
 * @swagger
 * /api/v1/practitioner/medical-records/lab-results/{id}:
 *   put:
 *     tags:
 *       - Practitioner
 *     summary: Update lab result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [normal, abnormal, critical, inconclusive]
 *               resultData:
 *                 type: object
 *               interpretation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lab result updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabResult'
 *   delete:
 *     tags:
 *       - Practitioner
 *     summary: Delete lab result (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab result deleted successfully
 */

/**
 * @swagger
 * /api/v1/practitioner/medical-records/prescriptions/{id}:
 *   put:
 *     tags:
 *       - Practitioner
 *     summary: Update prescription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medication:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *               instructions:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prescription'
 *   delete:
 *     tags:
 *       - Practitioner
 *     summary: Delete prescription (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription deleted successfully
 */

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

/**
 * @swagger
 * /api/v1/practitioner/medical-records/{patientId}/active-prescriptions:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Get active prescriptions for a patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active prescriptions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prescription'
 */

const verifyCloudinaryConfig = () => {
    const requiredConfig = [
        process.env.CLOUDINARY_CLOUD_NAME,
        process.env.CLOUDINARY_API_KEY,
        process.env.CLOUDINARY_API_SECRET
    ];

    if (requiredConfig.some(config => !config)) {
        logger.error('Missing Cloudinary configuration');
        throw new Error('Invalid Cloudinary configuration');
    }
};

/**
 * @swagger
 * /api/v1/practitioner/medical-records/lab-results/{id}/file:
 *   post:
 *     tags:
 *       - Practitioner
 *     summary: Upload lab result file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 */

router.post(
    '/medical-records/lab-results/:id/file',
    verifyCloudinaryConfig,
    upload('file'),
    practitionerController.uploadLabResultFile
);

/**
 * @swagger
 * /api/v1/practitioner/medical-records/{patientId}/prescription-history:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Get prescription history for a patient
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prescription'
 */


router.get('/medical-records/:patientId/active-prescriptions', practitionerController.getActivePrescriptions);
router.get('/medical-records/:patientId/prescription-history', practitionerController.getPrescriptionHistory);

export default router;