import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: string;
  phone?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    phone: { type: String },
    emergencyContact: { type: String },
  },
  { timestamps: true }
);



export const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
