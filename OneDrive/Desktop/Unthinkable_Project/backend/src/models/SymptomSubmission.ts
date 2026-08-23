import mongoose, { Schema, Document } from 'mongoose';

export interface ISymptomSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SymptomSubmissionSchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    chiefComplaint: { type: String, required: true, trim: true },
    symptoms: [{ type: String, required: true }],
    duration: { type: String, required: true },
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], required: true },
    additionalInfo: { type: String, trim: true },
  },
  { timestamps: true }
);


SymptomSubmissionSchema.index({ patientId: 1 });

export const SymptomSubmission = mongoose.model<ISymptomSubmission>('SymptomSubmission', SymptomSubmissionSchema);
