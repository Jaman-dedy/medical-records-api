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
  import { LabOrder } from './LabOrder';
  
  export enum LabResultStatus {
    NORMAL = 'normal',
    ABNORMAL = 'abnormal',
    CRITICAL = 'critical',
    INCONCLUSIVE = 'inconclusive'
  }
  
  @Entity('lab_results')
  export class LabResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => LabOrder, order => order.results)
    @JoinColumn()
    labOrder: LabOrder;
  
    @Column({ type: 'jsonb' })
    resultData: Record<string, any>;
  
    @Column({
      type: 'enum',
      enum: LabResultStatus,
      nullable: true
    })
    status: LabResultStatus;
  
    @Column({ type: 'text', nullable: true })
    interpretation: string;
  
    @Column({ nullable: true })
    performedBy: string;
  
    @Column({ nullable: true })
    fileUrl: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }