import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  _id: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  googleEventId: string;
  status: 'SYNCED' | 'FAILED' | 'REMOVED';
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    googleEventId: { type: String, required: true },
    status: { type: String, enum: ['SYNCED', 'FAILED', 'REMOVED'], default: 'SYNCED' },
  },
  { timestamps: true }
);

CalendarEventSchema.index({ appointmentId: 1, userId: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
