import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../database/entities/Patient';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';

export class PatientController {
    private patientRepository = AppDataSource.getRepository(Patient);

    // Get patient profile
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

            const patient = await this.patientRepository.findOne({
                where: { user: { id: userId } },
                relations: ['medicalRecords']
            });

            if (!patient) {
                throw new ApiError(404, 'Patient not found');
            }

            res.status(200).json({
                success: true,
                data: patient.medicalRecords
            });
        } catch (error) {
            logger.error('Error in getMedicalRecords:', error);
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