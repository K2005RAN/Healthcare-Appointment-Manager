import mongoose, { Schema, Document } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
}

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  symptomSubmissionId?: mongoose.Types.ObjectId;
  preVisitSummaryId?: mongoose.Types.ObjectId;
  consultationId?: mongoose.Types.ObjectId;
  googleCalendarEventIds?: string[];
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.CONFIRMED,
      required: true,
    },
    symptomSubmissionId: { type: Schema.Types.ObjectId, ref: 'SymptomSubmission' },
    preVisitSummaryId: { type: Schema.Types.ObjectId, ref: 'PreVisitSummary' },
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    googleCalendarEventIds: [{ type: String }],
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

AppointmentSchema.index({ patientId: 1, startTime: 1 });
AppointmentSchema.index({ status: 1 });

// UNIQUE Partial Index: Guarantees that at most ONE active appointment (CONFIRMED/PENDING)
// can exist for a given doctor and time slot across the entire database!
AppointmentSchema.index(
  { doctorId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
    },
  }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
