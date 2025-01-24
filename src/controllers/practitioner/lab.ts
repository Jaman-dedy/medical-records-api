// controllers/practitioner/lab.controller.ts
import { Response } from 'express';
import { AppDataSource } from '../../config/database';
import { LabOrder, LabOrderStatus } from '../../database/entities/LabOrder';
import { LabResult, LabResultStatus } from '../../database/entities/LabResult';
import { MedicalRecord } from '../../database/entities/MedicalRecord';
import { ApiError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../types/auth';
import { BasePractitionerController } from './base';
import { logger } from '../../utils/logger';

export class LabManagementController extends BasePractitionerController {
    private labOrderRepository = AppDataSource.getRepository(LabOrder);
    private labResultRepository = AppDataSource.getRepository(LabResult);
    private medicalRecordRepository = AppDataSource.getRepository(MedicalRecord);

    // Create a new lab order
    createLabOrder = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;
            const { testType, instructions, notes } = req.body;

            const medicalRecord = await this.medicalRecordRepository.findOne({
                where: { patient: { id: patientId } }
            });

            if (!medicalRecord) {
                throw new ApiError(404, 'Medical record not found');
            }

            const labOrder = this.labOrderRepository.create({
                medicalRecord,
                testType,
                instructions,
                notes,
                status: LabOrderStatus.PENDING
            });

            await this.labOrderRepository.save(labOrder);

            res.status(201).json({
                success: true,
                data: labOrder
            });
        } catch (error) {
            this.handleError(error, res, 'createLabOrder');
        }
    };

    // Update an existing lab order
    updateLabOrder = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { testType, instructions, notes, status } = req.body;

            const labOrder = await this.labOrderRepository.findOne({
                where: { id }
            });

            if (!labOrder) {
                throw new ApiError(404, 'Lab order not found');
            }

            // Validate status transition
            if (status && !this.isValidStatusTransition(labOrder.status, status as LabOrderStatus)) {
                throw new ApiError(400, 'Invalid status transition');
            }

            Object.assign(labOrder, {
                testType: testType || labOrder.testType,
                instructions: instructions || labOrder.instructions,
                notes: notes || labOrder.notes,
                status: status || labOrder.status
            });

            await this.labOrderRepository.save(labOrder);

            res.status(200).json({
                success: true,
                data: labOrder
            });
        } catch (error) {
            this.handleError(error, res, 'updateLabOrder');
        }
    };

    // Add a lab result to an order
    addLabResult = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { patientId } = req.params;
            const {
                labOrderId,
                resultData,
                status,
                interpretation,
                performedBy,
                fileUrl
            } = req.body;

            const labOrder = await this.labOrderRepository.findOne({
                where: {
                    id: labOrderId,
                    medicalRecord: { patient: { id: patientId } }
                }
            });

            if (!labOrder) {
                throw new ApiError(404, 'Lab order not found');
            }

            if (labOrder.status === LabOrderStatus.CANCELLED) {
                throw new ApiError(400, 'Cannot add result to cancelled order');
            }

            const labResult = this.labResultRepository.create({
                labOrder,
                resultData,
                status: status as LabResultStatus,
                interpretation,
                performedBy,
                fileUrl
            });

            await this.labResultRepository.save(labResult);

            // Update lab order status
            labOrder.status = LabOrderStatus.COMPLETED;
            await this.labOrderRepository.save(labOrder);

            res.status(201).json({
                success: true,
                data: labResult
            });
        } catch (error) {
            this.handleError(error, res, 'addLabResult');
        }
    };

    // Update an existing lab result
    updateLabResult = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const {
                resultData,
                status,
                interpretation,
                performedBy,
                fileUrl
            } = req.body;

            const labResult = await this.labResultRepository.findOne({
                where: { id },
                relations: ['labOrder']
            });

            if (!labResult) {
                throw new ApiError(404, 'Lab result not found');
            }

            if (labResult.labOrder.status === LabOrderStatus.CANCELLED) {
                throw new ApiError(400, 'Cannot update result of cancelled order');
            }

            Object.assign(labResult, {
                resultData: resultData || labResult.resultData,
                status: status || labResult.status,
                interpretation: interpretation || labResult.interpretation,
                performedBy: performedBy || labResult.performedBy,
                fileUrl: fileUrl || labResult.fileUrl
            });

            await this.labResultRepository.save(labResult);

            res.status(200).json({
                success: true,
                data: labResult
            });
        } catch (error) {
            this.handleError(error, res, 'updateLabResult');
        }
    };

    // Delete (soft delete) a lab order
    deleteLabOrder = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const labOrder = await this.labOrderRepository.findOne({
                where: { id }
            });

            if (!labOrder) {
                throw new ApiError(404, 'Lab order not found');
            }

            // Instead of deleting, mark as cancelled
            labOrder.status = LabOrderStatus.CANCELLED;
            await this.labOrderRepository.save(labOrder);

            res.status(200).json({
                success: true,
                message: 'Lab order cancelled successfully'
            });
        } catch (error) {
            this.handleError(error, res, 'deleteLabOrder');
        }
    };

    // Delete (soft delete) a lab result
    deleteLabResult = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const result = await this.labResultRepository.softDelete(id);

            if (result.affected === 0) {
                throw new ApiError(404, 'Lab result not found');
            }

            res.status(200).json({
                success: true,
                message: 'Lab result deleted successfully'
            });
        } catch (error) {
            this.handleError(error, res, 'deleteLabResult');
        }
    };

    // Helper method to validate status transitions
    private validTransitions: Record<LabOrderStatus, LabOrderStatus[]> = {
        [LabOrderStatus.PENDING]: [LabOrderStatus.IN_PROGRESS, LabOrderStatus.CANCELLED],
        [LabOrderStatus.IN_PROGRESS]: [LabOrderStatus.COMPLETED, LabOrderStatus.CANCELLED],
        [LabOrderStatus.COMPLETED]: [], // Cannot change status once completed
        [LabOrderStatus.CANCELLED]: []  // Cannot change status once cancelled
    };

    private isValidStatusTransition(currentStatus: LabOrderStatus, newStatus: LabOrderStatus): boolean {
        const allowedTransitions = this.validTransitions[currentStatus];
        return allowedTransitions?.includes(newStatus) ?? false;
    };

    uploadLabResultFile = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            logger.debug('Starting file upload for lab result:', { id });

            logger.debug('Request file object:', {
                file: req.file,
                body: req.body
            });

            if (!req.file) {
                logger.warn('No file in request');
                throw new ApiError(400, 'No file uploaded');
            }

            logger.debug('File details:', {
                originalName: req.file.originalname,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            const labResult = await this.labResultRepository.findOne({
                where: { id }
            });

            if (!labResult) {
                logger.warn(`Lab result not found: ${id}`);
                throw new ApiError(404, 'Lab result not found');
            }

            logger.debug('Found lab result:', { labResult });

            labResult.fileUrl = req.file.path;
            await this.labResultRepository.save(labResult);

            logger.debug('Successfully saved file URL to lab result');

            res.status(200).json({
                success: true,
                data: {
                    fileUrl: labResult.fileUrl,
                    originalName: req.file.originalname
                },
                message: 'File uploaded successfully'
            });
        } catch (error: unknown) {
            logger.error('Error in uploadLabResultFile:', {
                error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined,
                requestParams: req.params,
                fileDetails: req.file
            });

            // Type guard for Cloudinary error
            if (error && typeof error === 'object' && 'http_code' in error) {
                logger.error('Cloudinary error:', {
                    httpCode: (error as { http_code: number }).http_code,
                    message: (error as { message?: string }).message || 'Unknown Cloudinary error',
                    details: error
                });
            }

            this.handleError(error, res, 'uploadLabResultFile');
        }
    };

}