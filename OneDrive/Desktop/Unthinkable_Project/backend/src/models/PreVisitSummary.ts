import mongoose, { Schema, Document } from 'mongoose';

export enum UrgencyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum AISummaryStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IPreVisitSummary extends Document {
  _id: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  urgencyLevel: UrgencyLevel;
  chiefComplaint: string;
  summary: string;
  suggestedQuestions: string[];
  status: AISummaryStatus;
  aiModel?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PreVisitSummarySchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    urgencyLevel: { type: String, enum: Object.values(UrgencyLevel), default: UrgencyLevel.LOW },
    chiefComplaint: { type: String, default: '' },
    summary: { type: String, default: '' },
    suggestedQuestions: [{ type: String }],
    status: { type: String, enum: Object.values(AISummaryStatus), default: AISummaryStatus.PENDING },
    aiModel: { type: String, default: 'Gemini-1.5-Pro' },
    error: { type: String },
  },
  { timestamps: true }
);


PreVisitSummarySchema.index({ status: 1 });

export const PreVisitSummary = mongoose.model<IPreVisitSummary>('PreVisitSummary', PreVisitSummarySchema);
