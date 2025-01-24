import { Router } from 'express';
import { PatientController } from '../controllers/patient';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/role';
import { UserRole } from '../database/entities/User';

const router = Router();
const patientController = new PatientController();

router.use(authMiddleware);

/**
* @swagger
 * /patient/my-profile:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Get patient profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PatientProfile'
 */
router.get('/my-profile', checkRole([UserRole.PATIENT]), patientController.getProfile);

/**
* @swagger
* /api/v1/patient/my-medical-records:
*   get:
*     tags:
*       - Patient
*     summary: Get all patient medical records
*     description: Retrieve complete medical history including allergies, lab orders, prescriptions and recent updates
*     security:
*       - bearerAuth: []
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

router.get('/my-medical-records', checkRole([UserRole.PATIENT]), patientController.getMedicalRecords);

/**
* @swagger
* /api/v1/patient/my-allergies:
*   get:
*     tags:
*       - Patient
*     summary: Get patient allergies
*     description: Retrieve list of patient allergies with details
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Allergies retrieved successfully
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
*                     $ref: '#/components/schemas/Allergy'
*       401:
*         description: Unauthorized
*       404:
*         description: Patient not found
*/

router.get('/my-allergies', checkRole([UserRole.PATIENT]), patientController.getAllergies);

/**
* @swagger
* /api/v1/patient/my-lab-orders:
*   get:
*     tags:
*       - Patient
*     summary: Get patient lab orders
*     description: Retrieve all lab orders with their results
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Lab orders retrieved successfully
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
*                       id:
*                         type: string
*                       testType:
*                         type: string
*                       status:
*                         type: string
*                         enum: [pending, in_progress, completed, cancelled]
*                       instructions:
*                         type: string
*                       createdAt:
*                         type: string
*                         format: date-time
*                       results:
*                         type: array
*                         items:
*                           type: object
*                           properties:
*                             id:
*                               type: string
*                             status:
*                               type: string
*                               enum: [normal, abnormal, critical, inconclusive]
*                             resultData:
*                               type: object
*                             interpretation:
*                               type: string
*                             performedBy:
*                               type: string
*                             fileUrl:
*                               type: string
*                             createdAt:
*                               type: string
*                               format: date-time
*       401:
*         description: Unauthorized
*       404:
*         description: Patient not found
*/


router.get('/my-lab-orders', checkRole([UserRole.PATIENT]), patientController.getLabOrders);
/**
* @swagger
* /api/v1/patient/my-prescriptions:
*   get:
*     tags:
*       - Patient
*     summary: Get patient prescriptions
*     description: Retrieve all patient prescriptions including active and past medications
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Prescriptions retrieved successfully
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
*                       id:
*                         type: string
*                       medication:
*                         type: string
*                       dosage:
*                         type: string
*                       frequency:
*                         type: string
*                       startDate:
*                         type: string
*                         format: date
*                       endDate:
*                         type: string
*                         format: date
*                       isActive:
*                         type: boolean
*                       instructions:
*                         type: string
*                       notes:
*                         type: string
*                       createdAt:
*                         type: string
*                         format: date-time
*       401:
*         description: Unauthorized
*       404:
*         description: Patient not found
*/
router.get('/my-prescriptions', checkRole([UserRole.PATIENT]), patientController.getPrescriptions);

export default router;