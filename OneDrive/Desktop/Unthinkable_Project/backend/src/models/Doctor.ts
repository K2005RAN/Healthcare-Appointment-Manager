import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkingHour {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;   // 'Monday', etc.
  startTime: string; // '09:00'
  endTime: string;   // '17:00'
  breakStart?: string; // '13:00'
  breakEnd?: string;   // '14:00'
  isActive: boolean;
}

export interface IDoctor extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  specializationIds: mongoose.Types.ObjectId[];
  experience: number; // years
  bio: string;
  consultationFee: number;
  slotDuration: number; // minutes, default 30
  workingHours: IWorkingHour[];
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkingHourSchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    dayName: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    breakStart: { type: String },
    breakEnd: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const DoctorSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specializationIds: [{ type: Schema.Types.ObjectId, ref: 'Specialization' }],
    experience: { type: Number, required: true, default: 1 },
    bio: { type: String, default: '' },
    consultationFee: { type: Number, required: true, default: 100 },
    slotDuration: { type: Number, required: true, default: 30 },
    workingHours: [WorkingHourSchema],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'], default: 'ACTIVE' },
    profileImage: { type: String },
  },
  { timestamps: true }
);

DoctorSchema.index({ userId: 1 });
DoctorSchema.index({ specializationIds: 1 });
DoctorSchema.index({ status: 1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
