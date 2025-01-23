import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Medical Records API',
            version: '1.0.0',
            description: 'API for Patient Medical History Management System',
            contact: {
                name: 'API Support',
                email: 'support@efiche.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./src/routes/**/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);

// src/routes/auth.ts
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 *
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */

// src/routes/patient.ts
/**
 * @swagger
 * /api/patient/my-profile:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Get patient profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *
 * /api/patient/my-medical-records:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Get patient medical records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 *
 * /api/patient/my-allergies:
 *   get:
 *     tags:
 *       - Patient
 *     summary: Get patient allergies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Allergies retrieved successfully
 */

// src/routes/practitioner.ts
/**
 * @swagger
 * /api/practitioner/patients:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Get all patients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 * 
 * /api/practitioner/patients/{patientId}/medical-records:
 *   get:
 *     tags:
 *       - Practitioner
 *     summary: Get patient medical records
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 * 
 * /api/practitioner/medical-records/{patientId}/allergies:
 *   post:
 *     tags:
 *       - Practitioner
 *     summary: Add patient allergy
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
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
 *               severity:
 *                 type: string
 *               reaction:
 *                 type: string
 *               notes:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Allergy added successfully
 */