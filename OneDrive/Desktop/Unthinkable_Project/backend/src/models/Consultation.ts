import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultation extends Document {
  _id: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  clinicalNotes: string;
  diagnosis: string;
  treatmentNotes: string;
  prescriptionId?: mongoose.Types.ObjectId;
  patientFriendlySummary?: string;
  followUpInstructions: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    clinicalNotes: { type: String, required: true },
    diagnosis: { type: String, required: true },
    treatmentNotes: { type: String, required: true },
    prescriptionId: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    patientFriendlySummary: { type: String },
    followUpInstructions: { type: String, default: '' },
  },
  { timestamps: true }
);


ConsultationSchema.index({ doctorId: 1 });
ConsultationSchema.index({ patientId: 1 });

export const Consultation = mongoose.model<IConsultation>('Consultation', ConsultationSchema);
