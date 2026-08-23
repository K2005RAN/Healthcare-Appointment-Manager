import mongoose, { Schema, Document } from 'mongoose';

export enum AuditAction {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  DOCTOR_CREATED = 'DOCTOR_CREATED',
  DOCTOR_UPDATED = 'DOCTOR_UPDATED',
  DOCTOR_LEAVE_CREATED = 'DOCTOR_LEAVE_CREATED',
  DOCTOR_LEAVE_DELETED = 'DOCTOR_LEAVE_DELETED',
  CONSULTATION_COMPLETED = 'CONSULTATION_COMPLETED',
  PRESCRIPTION_CREATED = 'PRESCRIPTION_CREATED',
  AI_SUMMARY_GENERATED = 'AI_SUMMARY_GENERATED',
  NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',
}

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ action: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
