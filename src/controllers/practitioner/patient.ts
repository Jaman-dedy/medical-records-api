// controllers/practitioner/patient.controller.ts
import { Response } from 'express';
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
}