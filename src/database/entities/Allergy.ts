import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { MedicalRecord } from './MedicalRecord';
  
  @Entity('allergies')
  export class Allergy {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => MedicalRecord, record => record.allergies)
    @JoinColumn()
    medicalRecord: MedicalRecord;
  
    @Column()
    name: string;
  
    @Column({ type: 'text', nullable: true })
    severity: string;
  
    @Column({ type: 'text', nullable: true })
    reaction: string;
  
    @Column({ type: 'text', nullable: true })
    notes: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }