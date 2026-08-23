import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorLeave extends Document {
  _id: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorLeaveSchema: Schema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

DoctorLeaveSchema.index({ doctorId: 1 });
DoctorLeaveSchema.index({ doctorId: 1, startDate: 1, endDate: 1 });

export const DoctorLeave = mongoose.model<IDoctorLeave>('DoctorLeave', DoctorLeaveSchema);
