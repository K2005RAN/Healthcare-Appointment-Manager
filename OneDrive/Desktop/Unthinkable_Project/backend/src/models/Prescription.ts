import mongoose, { Schema, Document } from 'mongoose';

export interface IMedication {
  name: string;
  dosage: string;      // e.g. "500 mg"
  frequency: string;   // e.g. "Twice daily"
  duration: string;    // e.g. "5 days"
  instructions?: string; // e.g. "After meals"
}

export interface IPrescription extends Document {
  _id: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  medications: IMedication[];
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String },
  },
  { _id: false }
);

const PrescriptionSchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    medications: [MedicationSchema],
    instructions: { type: String },
  },
  { timestamps: true }
);


PrescriptionSchema.index({ patientId: 1 });
PrescriptionSchema.index({ doctorId: 1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
