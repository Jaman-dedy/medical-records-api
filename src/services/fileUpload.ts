import { v2 as cloudinary } from 'cloudinary';
import multer, { FileFilterCallback, MulterError } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Constants
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'lab-results',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        format: 'jpg',
        resource_type: 'auto',
        transformation: [{ quality: 'auto' }]
    } as any
});

// Simple file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        logger.warn('File type rejected:', file.mimetype);
        cb(null, false);
    }
};

// Create multer instance
const uploader = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter
});

type UploadMiddleware = (req: Request, res: Response, next: NextFunction) => void;

// Export middleware
export const upload = (fieldName: string = 'file'): UploadMiddleware => {
    return (req: Request, res: Response, next: NextFunction): void => {
        logger.debug('Starting upload middleware', {
            contentType: req.headers['content-type'],
            contentLength: req.headers['content-length']
        });
        uploader.single(fieldName)(req, res, (err: any) => {
            if (err) {
                logger.error('Upload error details:', {
                    error: err,
                    code: err.code,
                    field: err.field,
                    storageError: err.storageErrors
                });

                if (err instanceof MulterError) {
                    res.status(400).json({
                        success: false,
                        message: err.code === 'LIMIT_FILE_SIZE'
                            ? `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
                            : err.message
                    });
                    return;
                }

                res.status(400).json({
                    success: false,
                    message: err.message || 'File upload failed'
                });
                return;
            }

            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'No file uploaded or invalid file type'
                });
                return;
            }

            next();
        });
    };
};

// Helper function for file deletion
export const deleteFile = async (publicId: string): Promise<boolean> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        logger.error('File deletion error:', error);
        return false;
    }
};

export const FILE_UPLOAD_CONSTANTS = {
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE
};