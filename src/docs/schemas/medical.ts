export const medicalSchemas = {
    // Patient Profile Schema
    PatientProfile: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            bloodType: { type: 'string' },
            emergencyContact: { type: 'string' },
            emergencyPhone: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' }
        }
    },

    // Medical Record Summary
    MedicalRecordSummary: {
        type: 'object',
        properties: {
            totalAllergies: { type: 'integer', example: 3 },
            activePrescriptions: { type: 'integer', example: 2 },
            pendingLabResults: { type: 'integer', example: 1 }
        }
    },

    // Allergy Schema
    Allergy: {
        type: 'object',
        properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'Penicillin' },
            severity: { type: 'string', example: 'Severe' },
            reaction: { type: 'string', example: 'Anaphylaxis' },
            notes: { type: 'string', example: 'Avoid all penicillin-based antibiotics' },
            createdAt: { type: 'string', format: 'date-time' }
        }
    },

    // Lab Order Schema
    LabOrder: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            testType: { type: 'string', example: 'Blood Test' },
            status: {
                type: 'string',
                enum: ['pending', 'in_progress', 'completed', 'cancelled'],
                example: 'pending'
            },
            instructions: { type: 'string', example: 'Fasting required for 12 hours' },
            createdAt: { type: 'string', format: 'date-time' },
            results: {
                type: 'array',
                items: { $ref: '#/components/schemas/LabResult' }
            }
        }
    },

    // Lab Result Schema
    LabResult: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            status: {
                type: 'string',
                enum: ['normal', 'abnormal', 'critical', 'inconclusive'],
                example: 'normal'
            },
            resultData: {
                type: 'object',
                example: {
                    glucose: '90 mg/dL',
                    cholesterol: '180 mg/dL'
                }
            },
            interpretation: { type: 'string', example: 'All values within normal range' },
            performedBy: { type: 'string', example: 'Dr. Smith' },
            fileUrl: { type: 'string', example: 'https://example.com/results/123.pdf' },
            createdAt: { type: 'string', format: 'date-time' }
        }
    },

    // Prescription Schema
    Prescription: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            medication: { type: 'string', example: 'Amoxicillin' },
            dosage: { type: 'string', example: '500mg' },
            frequency: { type: 'string', example: 'Twice daily' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            isActive: { type: 'boolean', example: true },
            instructions: { type: 'string', example: 'Take with food' },
            notes: { type: 'string', example: 'Stop if rash develops' },
            createdAt: { type: 'string', format: 'date-time' }
        }
    },

    // Complete Medical Record
    MedicalRecord: {
        type: 'object',
        properties: {
            summary: { $ref: '#/components/schemas/MedicalRecordSummary' },
            allergies: {
                type: 'array',
                items: { $ref: '#/components/schemas/Allergy' }
            },
            labOrders: {
                type: 'array',
                items: { $ref: '#/components/schemas/LabOrder' }
            },
            prescriptions: {
                type: 'array',
                items: { $ref: '#/components/schemas/Prescription' }
            },
            recentUpdates: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['allergy', 'labOrder', 'prescription'],
                            example: 'prescription'
                        },
                        data: {
                            type: 'object',
                            description: 'Contains the actual record data based on type'
                        },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    }
};