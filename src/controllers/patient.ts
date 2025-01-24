import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../database/entities/Patient';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';
import { LabOrderStatus } from '../database/entities/LabOrder';

export class PatientController {
    private patientRepository = AppDataSource.getRepository(Patient);

    // Get patient profile
    private handleError(error: unknown, res: Response, methodName: string): void {
        logger.error(`Error in ${methodName}:`, error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }


    getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            const patient = await this.patientRepository.findOne({
                where: { user: { id: userId } },
                relations: ['user']
            });

            if (!patient) {
                throw new ApiError(404, 'Patient profile not found');
            }

            res.status(200).json({
                success: true,
                data: {
                    id: patient.id,
                    dateOfBirth: patient.dateOfBirth,
                    bloodType: patient.bloodType,
                    emergencyContact: patient.emergencyContact,
                    emergencyPhone: patient.emergencyPhone,
                    firstName: patient.user.firstName,
                    lastName: patient.user.lastName,
                    email: patient.user.email
                }
            });
        } catch (error) {
            logger.error('Error in getProfile:', error);
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get all medical records
    getMedicalRecords = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            // Find patient with all related medical records and their associated data
            const patient = await this.patientRepository.findOne({
                where: { user: { id: userId } },
                relations: [
                    'medicalRecords',
                    'medicalRecords.allergies',
                    'medicalRecords.labOrders',
                    'medicalRecords.labOrders.results',
                    'medicalRecords.prescriptions'
                ]
            });

            if (!patient) {
                throw new ApiError(404, 'Patient not found');
            }

            // Organize the data in a more meaningful structure
            const organizedMedicalHistory = {
                allergies: [] as any[],
                labOrders: [] as any[],
                prescriptions: [] as any[],
                recentUpdates: [] as any[]
            };

            // Process all medical records
            patient.medicalRecords.forEach(record => {
                // Process allergies
                record.allergies?.forEach(allergy => {
                    organizedMedicalHistory.allergies.push({
                        id: allergy.id,
                        name: allergy.name,
                        severity: allergy.severity,
                        reaction: allergy.reaction,
                        notes: allergy.notes,
                        recordedAt: allergy.createdAt
                    });
                });

                // Process lab orders and their results
                record.labOrders?.forEach(order => {
                    const labOrder = {
                        id: order.id,
                        testType: order.testType,
                        status: order.status,
                        instructions: order.instructions,
                        orderedAt: order.createdAt,
                        results: order.results?.map(result => ({
                            id: result.id,
                            status: result.status,
                            data: result.resultData,
                            interpretation: result.interpretation,
                            performedBy: result.performedBy,
                            fileUrl: result.fileUrl,
                            resultDate: result.createdAt
                        })) || []
                    };
                    organizedMedicalHistory.labOrders.push(labOrder);
                });

                // Process prescriptions
                record.prescriptions?.forEach(prescription => {
                    organizedMedicalHistory.prescriptions.push({
                        id: prescription.id,
                        medication: prescription.medication,
                        dosage: prescription.dosage,
                        frequency: prescription.frequency,
                        startDate: prescription.startDate,
                        endDate: prescription.endDate,
                        isActive: prescription.isActive,
                        instructions: prescription.instructions,
                        notes: prescription.notes,
                        prescribedAt: prescription.createdAt
                    });
                });
            });

            // Sort all arrays by date
            organizedMedicalHistory.allergies.sort((a, b) =>
                new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
            );
            organizedMedicalHistory.labOrders.sort((a, b) =>
                new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
            );
            organizedMedicalHistory.prescriptions.sort((a, b) =>
                new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime()
            );

            // Add recent updates (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            organizedMedicalHistory.recentUpdates = [
                ...organizedMedicalHistory.allergies
                    .filter(a => new Date(a.recordedAt) >= thirtyDaysAgo)
                    .map(a => ({ type: 'allergy', ...a })),
                ...organizedMedicalHistory.labOrders
                    .filter(l => new Date(l.orderedAt) >= thirtyDaysAgo)
                    .map(l => ({ type: 'labOrder', ...l })),
                ...organizedMedicalHistory.prescriptions
                    .filter(p => new Date(p.prescribedAt) >= thirtyDaysAgo)
                    .map(p => ({ type: 'prescription', ...p }))
            ].sort((a, b) =>
                new Date(b.recordedAt || b.orderedAt || b.prescribedAt).getTime() -
                new Date(a.recordedAt || a.orderedAt || a.prescribedAt).getTime()
            );

            // Add summary statistics
            const summary = {
                totalAllergies: organizedMedicalHistory.allergies.length,
                activePrescriptions: organizedMedicalHistory.prescriptions.filter(p => p.isActive).length,
                pendingLabResults: organizedMedicalHistory.labOrders.filter(l =>
                    l.status === LabOrderStatus.PENDING ||
                    l.status === LabOrderStatus.IN_PROGRESS
                ).length
            };

            res.status(200).json({
                success: true,
                data: {
                    summary,
                    ...organizedMedicalHistory
                }
            });
        } catch (error) {
            logger.error('Error in getMedicalRecords:', error);
            this.handleError(error, res, 'getMedicalRecords');
        }
    };

    // Get patient's allergies
    getAllergies = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            const patient = await this.patientRepository.findOne({
                where: { user: { id: userId } },
                relations: ['medicalRecords', 'medicalRecords.allergies']
            });

            if (!patient) {
                throw new ApiError(404, 'Patient not found');
            }

            const allergies = patient.medicalRecords.flatMap(record =>
                record.allergies.map(allergy => ({
                    id: allergy.id,
                    name: allergy.name,
                    severity: allergy.severity,
                    reaction: allergy.reaction,
                    notes: allergy.notes,
                    createdAt: allergy.createdAt
                }))
            );

            res.status(200).json({
                success: true,
                data: allergies
            });
        } catch (error) {
            logger.error('Error in getAllergies:', error);
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get patient's lab orders
    getLabOrders = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            const patient = await this.patientRepository.findOne({
                where: { user: { id: userId } },
                relations: ['medicalRecords', 'medicalRecords.labOrders', 'medicalRecords.labOrders.results']
            });

            if (!patient) {
                throw new ApiError(404, 'Patient not found');
            }

            const labOrders = patient.medicalRecords.flatMap(record =>
                record.labOrders.map(order => ({
                    id: order.id,
                    testType: order.testType,
                    status: order.status,
                    instructions: order.instructions,
                    createdAt: order.createdAt,
                    results: order.results.map(result => ({
                        id: result.id,
                        status: result.status,
                        resultData: result.resultData,
                        interpretation: result.interpretation,
                        performedBy: result.performedBy,
                        fileUrl: result.fileUrl,
                        createdAt: result.createdAt
                    }))
                }))
            );

            res.status(200).json({
                success: true,
                data: labOrders
            });
        } catch (error) {
            logger.error('Error in getLabOrders:', error);
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get patient's prescriptions
    getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            const patient = await this.patientRepository.findOne({
                where: { user: { id: userId } },
                relations: ['medicalRecords', 'medicalRecords.prescriptions']
            });

            if (!patient) {
                throw new ApiError(404, 'Patient not found');
            }

            const prescriptions = patient.medicalRecords.flatMap(record =>
                record.prescriptions.map(prescription => ({
                    id: prescription.id,
                    medication: prescription.medication,
                    dosage: prescription.dosage,
                    frequency: prescription.frequency,
                    startDate: prescription.startDate,
                    endDate: prescription.endDate,
                    isActive: prescription.isActive,
                    instructions: prescription.instructions,
                    notes: prescription.notes,
                    createdAt: prescription.createdAt
                }))
            );

            res.status(200).json({
                success: true,
                data: prescriptions
            });
        } catch (error) {
            logger.error('Error in getPrescriptions:', error);
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}