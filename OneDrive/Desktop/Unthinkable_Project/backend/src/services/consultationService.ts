import mongoose from 'mongoose';
import { Consultation, IConsultation } from '../models/Consultation';
import { Prescription, IPrescription, IMedication } from '../models/Prescription';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { MedicationReminder } from '../models/MedicationReminder';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { ApiError } from '../utils/apiError';
import { AIService } from '../integrations/aiService';

export interface CreateConsultationInput {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  clinicalNotes: string;
  diagnosis: string;
  treatmentNotes: string;
  followUpInstructions: string;
  medications?: IMedication[];
  prescriptionInstructions?: string;
}

export class ConsultationService {
  static async recordConsultation(input: CreateConsultationInput): Promise<{
    consultation: IConsultation;
    prescription?: IPrescription;
  }> {
    const {
      appointmentId,
      doctorId,
      patientId,
      clinicalNotes,
      diagnosis,
      treatmentNotes,
      followUpInstructions,
      medications = [],
      prescriptionInstructions,
    } = input;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw ApiError.notFound('Appointment not found');

    const session = await mongoose.startSession();
    let consultationDoc: IConsultation | null = null;
    let prescriptionDoc: IPrescription | null = null;

    try {
      await session.withTransaction(async () => {
        // Create Prescription if medications provided
        if (medications.length > 0) {
          prescriptionDoc = new Prescription({
            appointmentId,
            doctorId,
            patientId,
            medications,
            instructions: prescriptionInstructions,
          });
          await prescriptionDoc.save({ session });

          // Create Medication Reminders for patient
          for (const med of medications) {
            const nextReminder = new Date();
            nextReminder.setHours(nextReminder.getHours() + 12); // Default first reminder in 12h

            await MedicationReminder.create(
              [
                {
                  patientId,
                  prescriptionId: prescriptionDoc._id,
                  medicationName: med.name,
                  dosage: med.dosage,
                  frequency: med.frequency,
                  instructions: med.instructions || prescriptionInstructions,
                  nextReminderAt: nextReminder,
                  status: 'ACTIVE',
                },
              ],
              { session }
            );
          }
        }

        // Create Consultation Document
        consultationDoc = new Consultation({
          appointmentId,
          doctorId,
          patientId,
          clinicalNotes,
          diagnosis,
          treatmentNotes,
          prescriptionId: prescriptionDoc ? prescriptionDoc._id : undefined,
          followUpInstructions,
        });
        await consultationDoc.save({ session });

        // Update Appointment status to COMPLETED
        appointment.status = AppointmentStatus.COMPLETED;
        appointment.consultationId = consultationDoc._id;
        await appointment.save({ session });

        await AuditLog.create(
          [
            {
              userId: doctorId,
              action: AuditAction.CONSULTATION_COMPLETED,
              entity: 'Consultation',
              entityId: consultationDoc._id.toString(),
              metadata: { appointmentId, patientId, hasPrescription: !!prescriptionDoc },
            },
          ],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    if (!consultationDoc) {
      throw ApiError.internal('Failed to record consultation transaction');
    }

    const consDoc: IConsultation = consultationDoc;

    // Asynchronously generate AI Post-Visit Summary for patient
    process.nextTick(async () => {
      try {
        const aiPostSummary = await AIService.generatePostVisitSummary({
          clinicalNotes,
          diagnosis,
          treatmentNotes,
          followUpInstructions,
          medications,
        });

        await Consultation.findByIdAndUpdate(consDoc._id, {
          patientFriendlySummary: aiPostSummary.summary,
        });
      } catch (err: any) {
        console.error('[Async Post-Visit AI Summary Warning]:', err.message);
      }
    });

    return {
      consultation: consDoc,
      prescription: prescriptionDoc || undefined,
    };
  }
}
