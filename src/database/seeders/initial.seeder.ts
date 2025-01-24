import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import { User, UserRole } from '../entities/User';
import { Patient } from '../entities/Patient';
import { Practitioner } from '../entities/Practitioner';
import { logger } from '../../utils/logger';

// seeds.ts
export const runSeeds = async (dataSource: DataSource) => {
    try {
        // Update existing users if they exist
        const usersToUpdate = await dataSource
            .getRepository(User)
            .find({
                where: [
                    { email: 'doc1@example.com' },
                    { email: 'patient1@example.com' }
                ]
            });

        for (const user of usersToUpdate) {
            user.password = await hash('pass123', 10);
            await dataSource.manager.save(User, user);
            logger.info(`Updated password for user ${user.email}`);
        }

        // Rest of your seeder code remains the same
        const practitionerExists = await dataSource
            .getRepository(User)
            .findOne({
                where: { email: 'doc1@example.com' },
                relations: ['practitioner']
            });

        if (!practitionerExists) {
            const practitionerUser = new User();
            practitionerUser.email = 'doc1@example.com';
            practitionerUser.password = await hash('pass123', 10);
            practitionerUser.firstName = 'John';
            practitionerUser.lastName = 'Doe';
            practitionerUser.role = UserRole.PRACTITIONER;

            const savedUser = await dataSource.manager.save(User, practitionerUser);

            const practitioner = new Practitioner();
            practitioner.specialization = 'General Practice';
            practitioner.licenseNumber = 'MD12345';
            practitioner.user = savedUser;

            await dataSource.manager.save(Practitioner, practitioner);
            logger.info('Default practitioner account created');
        }

        const patientExists = await dataSource
            .getRepository(User)
            .findOne({
                where: { email: 'patient1@example.com' },
                relations: ['patient']
            });

        if (!patientExists) {
            const patientUser = new User();
            patientUser.email = 'patient1@example.com';
            patientUser.password = await hash('pass123', 10);
            patientUser.firstName = 'Jane';
            patientUser.lastName = 'Smith';
            patientUser.role = UserRole.PATIENT;

            const savedUser = await dataSource.manager.save(User, patientUser);

            const patient = new Patient();
            patient.dateOfBirth = new Date('1990-01-01');
            patient.bloodType = 'A+';
            patient.user = savedUser;
            await dataSource.manager.save(Patient, patient);
            logger.info('Default patient account created');
        }

        logger.info('Seed check completed');
    } catch (error) {
        logger.error('Error checking/running seeds:', error);
        throw error;
    }
};