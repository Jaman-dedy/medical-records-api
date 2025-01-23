import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';
  import { Patient } from './Patient';
  import { Practitioner } from './Practitioner';
  import { Allergy } from './Allergy';
  import { LabOrder } from './LabOrder';
  import { Prescription } from './Prescription';
  
  @Entity('medical_records')
  export class MedicalRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Patient, patient => patient.medicalRecords)
    @JoinColumn() 
    patient: Patient;
  
    @ManyToOne(() => Practitioner, practitioner => practitioner.patientRecords)
    @JoinColumn()
    practitioner: Practitioner;
  
    @OneToMany(() => Allergy, allergy => allergy.medicalRecord)
    allergies: Allergy[];
  
    @OneToMany(() => LabOrder, labOrder => labOrder.medicalRecord)
    labOrders: LabOrder[];
  
    @OneToMany(() => Prescription, prescription => prescription.medicalRecord)
    prescriptions: Prescription[];
  
    @Column({ type: 'text', nullable: true })
    notes: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }