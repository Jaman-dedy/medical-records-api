import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn
  } from 'typeorm';
  import { MedicalRecord } from './MedicalRecord';
  import { LabResult } from './LabResult';
  
  export enum LabOrderStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
  }
  
  @Entity('lab_orders')
  export class LabOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => MedicalRecord, record => record.labOrders)
    @JoinColumn()
    medicalRecord: MedicalRecord;
  
    @OneToMany(() => LabResult, result => result.labOrder)
    results: LabResult[];
  
    @Column()
    testType: string;
  
    @Column({
      type: 'enum',
      enum: LabOrderStatus,
      default: LabOrderStatus.PENDING
    })
    status: LabOrderStatus;
  
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