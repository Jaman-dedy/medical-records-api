// src/controllers/practitioner/prescription.controller.ts
import { Response } from 'express';
import { DeepPartial } from 'typeorm';

import { AppDataSource } from '../../config/database';
import { Prescription } from '../../database/entities/Prescription';
import { MedicalRecord } from '../../database/entities/MedicalRecord';
import { ApiError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../types/auth';
import { BasePractitionerController } from './base';
import { CreatePrescriptionDTO, UpdatePrescriptionDTO } from '../../validators/prescription';

export class PrescriptionManagementController extends BasePractitionerController {
    private prescriptionRepository = AppDataSource.getRepository(Prescription);
    private medicalRecordRepository = AppDataSource.getRepository(MedicalRecord);

    // Add new prescription
    addPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;
            const prescriptionData: CreatePrescriptionDTO = req.body;

            const medicalRecord = await this.medicalRecordRepository.findOne({
                where: { patient: { id: patientId } }
            });

            if (!medicalRecord) {
                throw new ApiError(404, 'Medical record not found');
            }

            // Validate dates
            const startDate = new Date(prescriptionData.startDate);
            const endDate = prescriptionData.endDate ? new Date(prescriptionData.endDate) : undefined;

            if (endDate && startDate > endDate) {
                throw new ApiError(400, 'Start date cannot be later than end date');
            }

            const prescriptionDataToSave: DeepPartial<Prescription> = {
                medication: prescriptionData.medication,
                dosage: prescriptionData.dosage,
                frequency: prescriptionData.frequency,
                startDate: startDate,
                endDate: endDate,
                isActive: prescriptionData.isActive ?? true,
                instructions: prescriptionData.instructions,
                notes: prescriptionData.notes,
                medicalRecord: medicalRecord
            };

            const prescription = this.prescriptionRepository.create(prescriptionDataToSave);
            await this.prescriptionRepository.save(prescription);

            res.status(201).json({
                success: true,
                data: prescription
            });
        } catch (error) {
            this.handleError(error, res, 'addPrescription');
        }
    };

    // Update prescription
    updatePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData: UpdatePrescriptionDTO = req.body;

            const prescription = await this.prescriptionRepository.findOne({
                where: { id }
            });

            if (!prescription) {
                throw new ApiError(404, 'Prescription not found');
            }

            // Validate dates if they're being updated
            if (updateData.startDate || updateData.endDate) {
                const startDate = updateData.startDate ?
                    new Date(updateData.startDate) :
                    prescription.startDate;
                const endDate = updateData.endDate ?
                    new Date(updateData.endDate) :
                    prescription.endDate;

                if (endDate && startDate > endDate) {
                    throw new ApiError(400, 'Start date cannot be later than end date');
                }
            }

            Object.assign(prescription, {
                ...updateData,
                startDate: updateData.startDate ? new Date(updateData.startDate) : prescription.startDate,
                endDate: updateData.endDate ? new Date(updateData.endDate) : prescription.endDate
            });

            await this.prescriptionRepository.save(prescription);

            res.status(200).json({
                success: true,
                data: prescription
            });
        } catch (error) {
            this.handleError(error, res, 'updatePrescription');
        }
    };

    // Delete prescription (soft delete)
    deletePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // First deactivate the prescription
            const prescription = await this.prescriptionRepository.findOne({
                where: { id }
            });

            if (!prescription) {
                throw new ApiError(404, 'Prescription not found');
            }

            // Mark as inactive before soft delete
            prescription.isActive = false;
            await this.prescriptionRepository.save(prescription);

            // Perform soft delete
            const result = await this.prescriptionRepository.softDelete(id);

            if (result.affected === 0) {
                throw new ApiError(404, 'Prescription not found');
            }

            res.status(200).json({
                success: true,
                message: 'Prescription successfully deleted'
            });
        } catch (error) {
            this.handleError(error, res, 'deletePrescription');
        }
    };

    // Get active prescriptions for a patient
    getActivePrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;

            const prescriptions = await this.prescriptionRepository.find({
                where: {
                    medicalRecord: { patient: { id: patientId } },
                    isActive: true
                },
                order: {
                    startDate: 'DESC'
                }
            });

            res.status(200).json({
                success: true,
                data: prescriptions
            });
        } catch (error) {
            this.handleError(error, res, 'getActivePrescriptions');
        }
    };

    // Get prescription history for a patient
    getPrescriptionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;

            const prescriptions = await this.prescriptionRepository.find({
                where: {
                    medicalRecord: { patient: { id: patientId } }
                },
                order: {
                    startDate: 'DESC'
                },
                withDeleted: true // Include soft-deleted records
            });

            res.status(200).json({
                success: true,
                data: prescriptions
            });
        } catch (error) {
            this.handleError(error, res, 'getPrescriptionHistory');
        }
    };
}