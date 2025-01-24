import { Response } from 'express';

import { AppDataSource } from '../../config/database';
import { Allergy } from '../../database/entities/Allergy';
import { Patient } from '../../database/entities/Patient';
import { Practitioner } from '../../database/entities/Practitioner';
import { MedicalRecord } from '../../database/entities/MedicalRecord';
import { ApiError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../types/auth';
import { BasePractitionerController } from './base';
import { logger } from '../../utils/logger';

export class AllergyManagementController extends BasePractitionerController {
    private allergyRepository = AppDataSource.getRepository(Allergy);
    private medicalRecordRepository = AppDataSource.getRepository(MedicalRecord);
    private patientRepository = AppDataSource.getRepository(Patient);
    private practitionerRepository = AppDataSource.getRepository(Practitioner);

    addAllergy = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;
            const { name, severity, reaction, notes } = req.body;
            const practitionerId = req.user?.userId; // Changed from id to userId

            if (!practitionerId) {
                throw new ApiError(401, 'Unauthorized');
            }

            await AppDataSource.transaction(async transactionalEntityManager => {
                // Find patient
                const patient = await this.patientRepository.findOne({
                    where: { id: patientId }
                });

                if (!patient) {
                    throw new ApiError(404, 'Patient not found');
                }

                // Find practitioner
                const practitioner = await this.practitionerRepository.findOne({
                    where: { user: { id: practitionerId } },
                    relations: ['user']
                });

                if (!practitioner) {
                    throw new ApiError(404, 'Practitioner not found');
                }

                // Get or create medical record
                let medicalRecord = await this.medicalRecordRepository.findOne({
                    where: { patient: { id: patientId } }
                });

                if (!medicalRecord) {
                    medicalRecord = this.medicalRecordRepository.create({
                        patient,
                        practitioner,
                        notes: `Medical record created during allergy entry`
                    });

                    await this.medicalRecordRepository.save(medicalRecord);
                    logger.info(`Created new medical record for patient ${patientId}`);
                }

                // Create allergy
                const allergy = this.allergyRepository.create({
                    medicalRecord,
                    name,
                    severity,
                    reaction,
                    notes
                });

                await this.allergyRepository.save(allergy);

                res.status(201).json({
                    success: true,
                    data: allergy,
                    message: 'Allergy added successfully'
                });
            });
        } catch (error) {
            this.handleError(error, res, 'addAllergy');
        }
    };


    updateAllergy = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { name, severity, reaction, notes } = req.body;

            const allergy = await this.allergyRepository.findOne({
                where: { id }
            });

            if (!allergy) {
                throw new ApiError(404, 'Allergy not found');
            }

            Object.assign(allergy, {
                name: name || allergy.name,
                severity: severity || allergy.severity,
                reaction: reaction || allergy.reaction,
                notes: notes || allergy.notes
            });

            await this.allergyRepository.save(allergy);

            res.status(200).json({
                success: true,
                data: allergy
            });
        } catch (error) {
            this.handleError(error, res, 'updateAllergy');
        }
    };

    deleteAllergy = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const result = await this.allergyRepository.softDelete(id);

            if (result.affected === 0) {
                throw new ApiError(404, 'Allergy not found');
            }

            res.status(200).json({
                success: true,
                message: 'Allergy deleted successfully'
            });
        } catch (error) {
            this.handleError(error, res, 'deleteAllergy');
        }
    };
}