import { Response } from 'express';
import { ILike } from 'typeorm';

import { AppDataSource } from '../../config/database';
import { Patient } from '../../database/entities/Patient';
import { ApiError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../types/auth';
import { BasePractitionerController } from './base';

export class PatientManagementController extends BasePractitionerController {
    private patientRepository = AppDataSource.getRepository(Patient);

    getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const patients = await this.patientRepository.find({
                relations: ['user'],
                select: {
                    id: true,
                    dateOfBirth: true,
                    bloodType: true,
                    user: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: patients
            });
        } catch (error) {
            this.handleError(error, res, 'getPatients');
        }
    };

    getPatientMedicalRecords = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;

            const patient = await this.patientRepository.findOne({
                where: { id: patientId },
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

            res.status(200).json({
                success: true,
                data: patient.medicalRecords
            });
        } catch (error) {
            this.handleError(error, res, 'getPatientMedicalRecords');
        }
    };

    searchPatients = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { query } = req.query;
            const searchTerm = query ? String(query) : '';

            const patients = await this.patientRepository.find({
                where: [
                    { user: { firstName: ILike(`%${searchTerm}%`) } },
                    { user: { lastName: ILike(`%${searchTerm}%`) } },
                    { user: { email: ILike(`%${searchTerm}%`) } }
                ],
                relations: ['user'],
                select: {
                    id: true,
                    dateOfBirth: true,
                    bloodType: true,
                    user: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: patients
            });
        } catch (error) {
            this.handleError(error, res, 'searchPatients');
        }
    };

    getPatientSummary = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;

            const patient = await this.patientRepository.findOne({
                where: { id: patientId },
                relations: [
                    'medicalRecords',
                    'medicalRecords.allergies',
                    'medicalRecords.labOrders',
                    'medicalRecords.labOrders.results',
                    'medicalRecords.prescriptions',
                    'user'
                ]
            });

            if (!patient) {
                throw new ApiError(404, 'Patient not found');
            }

            // Aggregate patient data
            const summary = {
                patientInfo: {
                    id: patient.id,
                    name: `${patient.user.firstName} ${patient.user.lastName}`,
                    dateOfBirth: patient.dateOfBirth,
                    bloodType: patient.bloodType
                },
                statistics: {
                    activeAllergies: 0,
                    activePrescriptions: 0,
                    pendingLabOrders: 0,
                    recentResults: 0
                },
                recentActivities: [] as Array<{
                    type: string;
                    date: Date;
                    description: string;
                }>
            };

            // Calculate statistics from medical records
            patient.medicalRecords.forEach(record => {
                // Count active allergies
                summary.statistics.activeAllergies += record.allergies.length;

                // Count active prescriptions
                summary.statistics.activePrescriptions += record.prescriptions.filter(p => p.isActive).length;

                // Count pending lab orders
                summary.statistics.pendingLabOrders += record.labOrders.filter(o => o.status === 'pending').length;

                // Count recent lab results (last 30 days)
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                summary.statistics.recentResults += record.labOrders
                    .flatMap(o => o.results)
                    .filter(r => r && new Date(r.createdAt) > thirtyDaysAgo).length;

                // Collect recent activities
                record.prescriptions.forEach(prescription => {
                    if (new Date(prescription.createdAt) > thirtyDaysAgo) {
                        summary.recentActivities.push({
                            type: 'Prescription',
                            date: prescription.createdAt,
                            description: `New prescription: ${prescription.medication}`
                        });
                    }
                });

                record.labOrders.forEach(order => {
                    if (new Date(order.createdAt) > thirtyDaysAgo) {
                        summary.recentActivities.push({
                            type: 'Lab Order',
                            date: order.createdAt,
                            description: `New lab order: ${order.testType}`
                        });
                    }
                });

                record.allergies.forEach(allergy => {
                    if (new Date(allergy.createdAt) > thirtyDaysAgo) {
                        summary.recentActivities.push({
                            type: 'Allergy',
                            date: allergy.createdAt,
                            description: `New allergy recorded: ${allergy.name}`
                        });
                    }
                });
            });

            // Sort recent activities by date
            summary.recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            this.handleError(error, res, 'getPatientSummary');
        }
    };
}