export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  patientId?: string;
  doctorId?: string;
  phone?: string;
}

export interface Specialization {
  _id: string;
  name: string;
  description?: string;
  status: string;
}

export interface WorkingHour {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
}

export interface Doctor {
  _id: string;
  userId: User;
  specializationIds: Specialization[];
  experience: number;
  bio: string;
  consultationFee: number;
  slotDuration: number;
  workingHours: WorkingHour[];
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  profileImage?: string;
}

export interface Patient {
  _id: string;
  userId: User;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

export interface GeneratedSlot {
  startTime: string;
  endTime: string;
  timeLabel: string;
  isAvailable: boolean;
  isHeldByMe?: boolean;
  reason?: 'BOOKED' | 'HELD' | 'LEAVE' | 'PAST' | null;
}

export interface SlotHold {
  _id: string;
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  expiresAt: string;
  status: 'HELD' | 'CONFIRMED' | 'EXPIRED';
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export interface SymptomSubmission {
  _id: string;
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  additionalInfo?: string;
}

export interface PreVisitSummary {
  _id: string;
  urgencyLevel: 'Low' | 'Medium' | 'High';
  chiefComplaint: string;
  summary: string;
  suggestedQuestions: string[];
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  appointmentId: string;
  doctorId: Doctor;
  patientId: Patient;
  medications: Medication[];
  instructions?: string;
  createdAt: string;
}

export interface Consultation {
  _id: string;
  appointmentId: string;
  doctorId: Doctor;
  patientId: Patient;
  clinicalNotes: string;
  diagnosis: string;
  treatmentNotes: string;
  prescriptionId?: Prescription;
  patientFriendlySummary?: string;
  followUpInstructions: string;
  createdAt: string;
}

export interface Appointment {
  _id: string;
  patientId: Patient;
  doctorId: Doctor;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  symptomSubmissionId?: SymptomSubmission;
  preVisitSummaryId?: PreVisitSummary;
  consultationId?: Consultation;
  cancellationReason?: string;
  createdAt: string;
}

export interface DoctorLeave {
  _id: string;
  doctorId: Doctor;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  userId?: User;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: User;
  type: string;
  recipient: string;
  subject: string;
  body: string;
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED';
  attemptCount: number;
  error?: string;
  createdAt: string;
}
