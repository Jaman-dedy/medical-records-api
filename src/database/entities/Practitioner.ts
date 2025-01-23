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

@Entity('practitioners')
export class Practitioner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  specialization: string;

  @Column()
  licenseNumber: string;

  // Reference to base user
  @OneToOne(() => User, user => user.practitioner)
  @JoinColumn()
  user: User;

  @OneToMany(() => MedicalRecord, record => record.practitioner)
  patientRecords: MedicalRecord[];
}