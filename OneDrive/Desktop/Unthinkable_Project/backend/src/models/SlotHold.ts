import mongoose, { Schema, Document } from 'mongoose';

export enum SlotHoldStatus {
  HELD = 'HELD',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
}

export interface ISlotHold extends Document {
  _id: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  expiresAt: Date;
  status: SlotHoldStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SlotHoldSchema: Schema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(SlotHoldStatus),
      default: SlotHoldStatus.HELD,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL Index for automatic MongoDB cleanup when holds expire
SlotHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index to quickly find holds for doctor and time slot
SlotHoldSchema.index({ doctorId: 1, startTime: 1, status: 1 });
SlotHoldSchema.index({ patientId: 1, status: 1 });

export const SlotHold = mongoose.model<ISlotHold>('SlotHold', SlotHoldSchema);
