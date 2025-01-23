import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import { User, UserRole } from '../entities/User';
import { Patient } from '../entities/Patient';
import { Practitioner } from '../entities/Practitioner';
import { logger } from '../../utils/logger';

export const runSeeds = async (dataSource: DataSource) => {
    try {
        // Check if default practitioner exists
        const practitionerExists = await dataSource
            .getRepository(User)
            .findOne({ 
                where: { email: 'doc1@example.com' },
                relations: ['practitioner']  // Check the relation
            });

        if (!practitionerExists) {
            // Create user first
            const practitionerUser = new User();
            practitionerUser.email = 'doc1@example.com';
            practitionerUser.password = await hash('pass123', 10);
            practitionerUser.firstName = 'John';
            practitionerUser.lastName = 'Doe';
            practitionerUser.role = UserRole.PRACTITIONER;
            
            // Save user
            const savedUser = await dataSource.manager.save(User, practitionerUser);
            
            // Create practitioner with reference to user
            const practitioner = new Practitioner();
            practitioner.specialization = 'General Practice';
            practitioner.licenseNumber = 'MD12345';
            practitioner.user = savedUser;  // Set the relationship
            
            await dataSource.manager.save(Practitioner, practitioner);
            logger.info('Default practitioner account created');
        }
        
        // Check if default patient exists
        const patientExists = await dataSource
            .getRepository(User)
            .findOne({ 
                where: { email: 'patient1@example.com' },
                relations: ['patient']  // Check the relation
            });

        if (!patientExists) {
            // Create user first
            const patientUser = new User();
            patientUser.email = 'patient1@example.com';
            patientUser.password = await hash('pass123', 10);
            patientUser.firstName = 'Jane';
            patientUser.lastName = 'Smith';
            patientUser.role = UserRole.PATIENT;
            
            // Save user
            const savedUser = await dataSource.manager.save(User, patientUser);
            
            // Create patient with reference to user
            const patient = new Patient();
            patient.dateOfBirth = new Date('1990-01-01');
            patient.bloodType = 'A+';
            patient.user = savedUser;  // Set the relationship
            
            await dataSource.manager.save(Patient, patient);
            logger.info('Default patient account created');
        }

        logger.info('Seed check completed');
    } catch (error) {
        logger.error('Error checking/running seeds:', error);
        throw error;
    }
};