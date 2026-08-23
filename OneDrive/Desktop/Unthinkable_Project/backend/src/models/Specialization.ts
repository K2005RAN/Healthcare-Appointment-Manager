import mongoose, { Schema, Document } from 'mongoose';

export interface ISpecialization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const SpecializationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);



export const Specialization = mongoose.model<ISpecialization>('Specialization', SpecializationSchema);
