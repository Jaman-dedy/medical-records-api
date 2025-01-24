import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  OneToOne
} from 'typeorm';
import { hash } from 'bcryptjs';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';

export enum UserRole {
  PATIENT = 'patient',
  PRACTITIONER = 'practitioner',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;


  @OneToOne(() => Patient, patient => patient.user)
  patient: Patient;

  @OneToOne(() => Practitioner, practitioner => practitioner.user)
  practitioner: Practitioner;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }
}