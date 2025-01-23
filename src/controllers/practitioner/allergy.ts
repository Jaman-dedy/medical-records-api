import { Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Allergy } from '../../database/entities/Allergy';
import { MedicalRecord } from '../../database/entities/MedicalRecord';
import { ApiError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../types/auth';
import { BasePractitionerController } from './base';

export class AllergyManagementController extends BasePractitionerController {
    private allergyRepository = AppDataSource.getRepository(Allergy);
    private medicalRecordRepository = AppDataSource.getRepository(MedicalRecord);

    addAllergy = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;
            const { name, severity, reaction, notes } = req.body;

            const medicalRecord = await this.medicalRecordRepository.findOne({
                where: { patient: { id: patientId } }
            });

            if (!medicalRecord) {
                throw new ApiError(404, 'Medical record not found');
            }

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
                data: allergy
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