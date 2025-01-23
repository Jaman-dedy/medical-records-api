import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrations1737569582224 implements MigrationInterface {
    name = 'InitialMigrations1737569582224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioners" DROP CONSTRAINT "UQ_c7932b854f76db35b48876c78f0"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."practitioners_role_enum"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "UQ_64e2031265399f5690b0beba6a5"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."patients_role_enum"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD CONSTRAINT "UQ_8e10670bbe5780d2eea8e432f01" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "UQ_2c24c3490a26d04b0d70f92057a" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD CONSTRAINT "FK_8e10670bbe5780d2eea8e432f01" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP CONSTRAINT "FK_8e10670bbe5780d2eea8e432f01"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "UQ_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP CONSTRAINT "UQ_8e10670bbe5780d2eea8e432f01"`);
        await queryRunner.query(`ALTER TABLE "practitioners" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."patients_role_enum" AS ENUM('patient', 'practitioner')`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "role" "public"."patients_role_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "UQ_64e2031265399f5690b0beba6a5" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."practitioners_role_enum" AS ENUM('patient', 'practitioner')`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "role" "public"."practitioners_role_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "practitioners" ADD CONSTRAINT "UQ_c7932b854f76db35b48876c78f0" UNIQUE ("email")`);
    }

}
