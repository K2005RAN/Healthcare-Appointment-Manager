import mongoose, { Schema, Document } from 'mongoose';

export interface IGoogleCalendarConnection extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoogleCalendarConnectionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    scope: { type: String },
  },
  { timestamps: true }
);



export const GoogleCalendarConnection = mongoose.model<IGoogleCalendarConnection>(
  'GoogleCalendarConnection',
  GoogleCalendarConnectionSchema
);
