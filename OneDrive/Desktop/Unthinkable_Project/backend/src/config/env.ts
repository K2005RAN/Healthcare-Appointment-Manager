import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthcare_appointment_manager',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_medibridge_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_medibridge_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  LLM_API_KEY: process.env.LLM_API_KEY || '',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"MediBridge Care" <no-reply@medibridge.com>',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google-calendar/callback',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  SLOT_HOLD_DURATION_MINUTES: parseInt(process.env.SLOT_HOLD_DURATION_MINUTES || '5', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
};
