import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationReminder extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  prescriptionId: mongoose.Types.ObjectId;
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  nextReminderAt: Date;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const MedicationReminderSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    prescriptionId: { type: Schema.Types.ObjectId, ref: 'Prescription', required: true },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    instructions: { type: String },
    nextReminderAt: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

MedicationReminderSchema.index({ patientId: 1 });
MedicationReminderSchema.index({ status: 1, nextReminderAt: 1 });

export const MedicationReminder = mongoose.model<IMedicationReminder>('MedicationReminder', MedicationReminderSchema);
