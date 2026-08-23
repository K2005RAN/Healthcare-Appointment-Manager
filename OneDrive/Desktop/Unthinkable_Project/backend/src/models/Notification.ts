import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  CANCELLATION = 'CANCELLATION',
  RESCHEDULE = 'RESCHEDULE',
  DOCTOR_LEAVE = 'DOCTOR_LEAVE',
  MEDICATION_REMINDER = 'MEDICATION_REMINDER',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  type: NotificationType;
  channel: 'EMAIL' | 'SMS' | 'PUSH';
  recipient: string;
  subject: string;
  body: string;
  status: NotificationStatus;
  attemptCount: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    channel: { type: String, enum: ['EMAIL', 'SMS', 'PUSH'], default: 'EMAIL' },
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },
    attemptCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    nextRetryAt: { type: Date },
    error: { type: String },
  },
  { timestamps: true }
);

NotificationSchema.index({ status: 1, nextRetryAt: 1 });
NotificationSchema.index({ appointmentId: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
