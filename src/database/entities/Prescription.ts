import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn
  } from 'typeorm';
  import { MedicalRecord } from './MedicalRecord';
  
  @Entity('prescriptions')
  export class Prescription {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => MedicalRecord, record => record.prescriptions)
    @JoinColumn()
    medicalRecord: MedicalRecord;
  
    @Column()
    medication: string;
  
    @Column()
    dosage: string;
  
    @Column()
    frequency: string;
  
    @Column({ type: 'date' })
    startDate: Date;
  
    @Column({ type: 'date', nullable: true })
    endDate: Date;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column({ type: 'text', nullable: true })
    instructions: string;
  
    @Column({ type: 'text', nullable: true })
    notes: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }