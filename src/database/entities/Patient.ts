// src/database/entities/Patient.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { MedicalRecord } from './MedicalRecord';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dateOfBirth: Date;

  @Column({ nullable: true })
  bloodType: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  // Reference to base user
  @OneToOne(() => User, user => user.patient)
  @JoinColumn()
  user: User;

  @OneToMany(() => MedicalRecord, record => record.patient)
  medicalRecords: MedicalRecord[];
}