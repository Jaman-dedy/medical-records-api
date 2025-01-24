import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrations1737671619034 implements MigrationInterface {
    name = 'InitialMigrations1737671619034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "practitioners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specialization" character varying NOT NULL, "licenseNumber" character varying NOT NULL, "userId" uuid, CONSTRAINT "REL_8e10670bbe5780d2eea8e432f0" UNIQUE ("userId"), CONSTRAINT "PK_88941574a3e4fe907d36ee2f8cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "allergies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "severity" text, "reaction" text, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "medicalRecordId" uuid, CONSTRAINT "PK_f72e0cf363a832b8fa8cf657118" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."lab_results_status_enum" AS ENUM('normal', 'abnormal', 'critical', 'inconclusive')`);
        await queryRunner.query(`CREATE TABLE "lab_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resultData" jsonb NOT NULL, "status" "public"."lab_results_status_enum", "interpretation" text, "performedBy" character varying, "fileUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "labOrderId" uuid, CONSTRAINT "PK_4f1c5b3b5813c98fb531e5db738" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."lab_orders_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "lab_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "testType" character varying NOT NULL, "status" "public"."lab_orders_status_enum" NOT NULL DEFAULT 'pending', "instructions" text, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "medicalRecordId" uuid, CONSTRAINT "PK_a488d533e758e6ba02958198f1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prescriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "medication" character varying NOT NULL, "dosage" character varying NOT NULL, "frequency" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date, "isActive" boolean NOT NULL DEFAULT true, "instructions" text, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "medicalRecordId" uuid, CONSTRAINT "PK_097b2cc2f2b7e56825468188503" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medical_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patientId" uuid, "practitionerId" uuid, CONSTRAINT "PK_c200c0b76638124b7ed51424823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dateOfBirth" TIMESTAMP NOT NULL, "bloodType" character varying, "emergencyContact" character varying, "emergencyPhone" character varying, "userId" uuid, CONSTRAINT "REL_2c24c3490a26d04b0d70f92057" UNIQUE ("userId"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('patient', 'practitioner')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD CONSTRAINT "FK_8e10670bbe5780d2eea8e432f01" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "allergies" ADD CONSTRAINT "FK_ef5ab0172ddba669b364f778cbc" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_results" ADD CONSTRAINT "FK_ca42f1790039876dc4e5dbb1810" FOREIGN KEY ("labOrderId") REFERENCES "lab_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_orders" ADD CONSTRAINT "FK_2727fdd102879642094fc152c5b" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_03f01483943c80a8ff1b596446d" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_9ecd57657a3a0301e55e10468f2" FOREIGN KEY ("practitionerId") REFERENCES "practitioners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_9ecd57657a3a0301e55e10468f2"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_03f01483943c80a8ff1b596446d"`);
        await queryRunner.query(`ALTER TABLE "lab_orders" DROP CONSTRAINT "FK_2727fdd102879642094fc152c5b"`);
        await queryRunner.query(`ALTER TABLE "lab_results" DROP CONSTRAINT "FK_ca42f1790039876dc4e5dbb1810"`);
        await queryRunner.query(`ALTER TABLE "allergies" DROP CONSTRAINT "FK_ef5ab0172ddba669b364f778cbc"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP CONSTRAINT "FK_8e10670bbe5780d2eea8e432f01"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TABLE "medical_records"`);
        await queryRunner.query(`DROP TABLE "prescriptions"`);
        await queryRunner.query(`DROP TABLE "lab_orders"`);
        await queryRunner.query(`DROP TYPE "public"."lab_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "lab_results"`);
        await queryRunner.query(`DROP TYPE "public"."lab_results_status_enum"`);
        await queryRunner.query(`DROP TABLE "allergies"`);
        await queryRunner.query(`DROP TABLE "practitioners"`);
    }

}
