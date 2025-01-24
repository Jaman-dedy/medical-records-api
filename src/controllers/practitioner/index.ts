// src/controllers/practitioner/index.ts
export * from './base';
export * from './lab';
export * from './prescription';
export * from './patient';
export * from './allergy';

// Or create a main PractitionerController that combines all controllers:
import { PatientManagementController } from './patient';
import { LabManagementController } from './lab';
import { PrescriptionManagementController } from './prescription';
import { AllergyManagementController } from './allergy';

export class PractitionerController {
    private patientController = new PatientManagementController();
    private labController = new LabManagementController();
    private prescriptionController = new PrescriptionManagementController();
    private allergyController = new AllergyManagementController();

    // Patient management
    getPatients = this.patientController.getPatients;
    getPatientMedicalRecords = this.patientController.getPatientMedicalRecords;

    // Lab management
    createLabOrder = this.labController.createLabOrder;
    updateLabOrder = this.labController.updateLabOrder;
    deleteLabOrder = this.labController.deleteLabOrder;
    addLabResult = this.labController.addLabResult;
    updateLabResult = this.labController.updateLabResult;
    deleteLabResult = this.labController.deleteLabResult;
    uploadLabResultFile = this.labController.uploadLabResultFile;

    // Prescription management
    addPrescription = this.prescriptionController.addPrescription;
    updatePrescription = this.prescriptionController.updatePrescription;
    deletePrescription = this.prescriptionController.deletePrescription;
    getActivePrescriptions = this.prescriptionController.getActivePrescriptions;
    getPrescriptionHistory = this.prescriptionController.getPrescriptionHistory;
    searchPatients = this.patientController.searchPatients;
    getPatientSummary = this.patientController.getPatientSummary

    // Allergy management
    addAllergy = this.allergyController.addAllergy;
    updateAllergy = this.allergyController.updateAllergy;
    deleteAllergy = this.allergyController.deleteAllergy;
}