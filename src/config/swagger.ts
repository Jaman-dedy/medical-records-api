import swaggerJsdoc from 'swagger-jsdoc';
import { authSchemas } from '../docs/schemas/auth';
import { medicalSchemas } from '../docs/schemas/medical'
import path from 'path';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Medical Records API',
            version: '1.0.0',
            description: 'API for Patient Medical History Management System'
        },
        servers: [
            {
                url: '/api',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                ...authSchemas,
                ...medicalSchemas
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: [
        path.join(__dirname, '../routes/*.ts'),
        path.join(__dirname, '../routes/**/*.ts')
    ]
};

export const swaggerSpec = swaggerJsdoc(options);