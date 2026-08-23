import mongoose from 'mongoose';
import '../models';
import { Appointment, AppointmentStatus, IAppointment } from '../models/Appointment';
import { SlotHold, SlotHoldStatus, ISlotHold } from '../models/SlotHold';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { DoctorLeave } from '../models/DoctorLeave';
import { SymptomSubmission } from '../models/SymptomSubmission';
import { PreVisitSummary, UrgencyLevel, AISummaryStatus } from '../models/PreVisitSummary';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';
import { AIService } from '../integrations/aiService';
import { EmailService } from '../integrations/emailService';
import { GoogleCalendarService } from '../integrations/googleCalendarService';

export interface CreateHoldParams {
  doctorId: string;
  patientId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export interface ConfirmBookingParams {
  holdId?: string;
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  symptoms: {
    chiefComplaint: string;
    symptoms: string[];
    duration: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    additionalInfo?: string;
  };
}

export class AppointmentService {
  /**
   * Step 1: Temporarily hold an appointment slot for 5 minutes.
   * Atomic double-booking prevention at hold creation phase.
   */
  static async createSlotHold(params: CreateHoldParams): Promise<ISlotHold> {
    const { doctorId, patientId, startTime, endTime } = params;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      throw ApiError.badRequest('Cannot hold an appointment slot in the past');
    }

    // Verify doctor exists and active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'ACTIVE') {
      throw ApiError.notFound('Doctor not found or currently unavailable');
    }

    // Verify doctor leave for this slot
    const leaveConflict = await DoctorLeave.findOne({
      doctorId,
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (leaveConflict) {
      throw ApiError.badRequest('Doctor is on leave during the selected time slot');
    }

    // Check if slot is already booked in Appointment collection
    const existingBooking = await Appointment.findOne({
      doctorId,
      startTime: start,
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
    });

    if (existingBooking) {
      throw ApiError.slotAlreadyBooked();
    }

    // Check existing active holds for this slot by any other patient
    const existingHold = await SlotHold.findOne({
      doctorId,
      startTime: start,
      status: SlotHoldStatus.HELD,
      expiresAt: { $gt: now },
    });

    if (existingHold) {
      if (existingHold.patientId.toString() === patientId) {
        // Patient re-holding their own slot - refresh TTL
        existingHold.expiresAt = new Date(now.getTime() + env.SLOT_HOLD_DURATION_MINUTES * 60 * 1000);
        await existingHold.save();
        return existingHold;
      } else {
        throw ApiError.slotAlreadyBooked('This slot is currently held by another patient. Please select a different slot.');
      }
    }

    // Create atomic slot hold
    const holdDurationMs = env.SLOT_HOLD_DURATION_MINUTES * 60 * 1000;
    const expiresAt = new Date(now.getTime() + holdDurationMs);

    try {
      const hold = await SlotHold.create({
        doctorId,
        patientId,
        startTime: start,
        endTime: end,
        expiresAt,
        status: SlotHoldStatus.HELD,
      });

      return hold;
    } catch (error: any) {
      if (error.code === 11000) {
        throw ApiError.slotAlreadyBooked();
      }
      throw error;
    }
  }

  /**
   * Step 2: Confirm appointment inside a safe MongoDB Session Transaction.
   */
  static async confirmBooking(params: ConfirmBookingParams): Promise<IAppointment> {
    const { doctorId, patientId, startTime, endTime, symptoms, holdId } = params;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Check MongoDB session transaction support
    const session = await mongoose.startSession();
    let createdAppointment: IAppointment | null = null;

    try {
      await session.withTransaction(async () => {
        // 1. Verify Patient & Doctor
        const patient = await Patient.findById(patientId).session(session);
        if (!patient) throw ApiError.notFound('Patient record not found');

        const doctor = await Doctor.findById(doctorId).session(session);
        if (!doctor || doctor.status !== 'ACTIVE') throw ApiError.notFound('Doctor not found or inactive');

        // 2. Check Doctor Leave
        const leaveConflict = await DoctorLeave.findOne({
          doctorId,
          startDate: { $lte: end },
          endDate: { $gte: start },
        }).session(session);

        if (leaveConflict) {
          throw ApiError.badRequest('Doctor is on leave during this time slot.');
        }

        // 3. Double-Booking Prevention Check inside transaction
        const existingAppointment = await Appointment.findOne({
          doctorId,
          startTime: start,
          status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
        }).session(session);

        if (existingAppointment) {
          throw ApiError.slotAlreadyBooked();
        }

        // 4. Create Symptom Submission
        const symptomDoc = new SymptomSubmission({
          appointmentId: new mongoose.Types.ObjectId(),
          patientId,
          chiefComplaint: symptoms.chiefComplaint,
          symptoms: symptoms.symptoms,
          duration: symptoms.duration,
          severity: symptoms.severity,
          additionalInfo: symptoms.additionalInfo,
        });

        // 5. Create Appointment Document
        const appointmentDoc = new Appointment({
          patientId,
          doctorId,
          startTime: start,
          endTime: end,
          status: AppointmentStatus.CONFIRMED,
          symptomSubmissionId: symptomDoc._id,
        });

        symptomDoc.appointmentId = appointmentDoc._id;
        await symptomDoc.save({ session });
        await appointmentDoc.save({ session });

        // 6. Confirm / release hold if holdId provided
        if (holdId && mongoose.Types.ObjectId.isValid(holdId)) {
          await SlotHold.findByIdAndUpdate(
            holdId,
            { status: SlotHoldStatus.CONFIRMED },
            { session }
          );
        } else {
          await SlotHold.updateMany(
            { doctorId, startTime: start, status: SlotHoldStatus.HELD },
            { status: SlotHoldStatus.CONFIRMED },
            { session }
          );
        }

        // 7. Record Audit Log
        await AuditLog.create(
          [
            {
              userId: patient.userId,
              action: AuditAction.APPOINTMENT_CREATED,
              entity: 'Appointment',
              entityId: appointmentDoc._id.toString(),
              metadata: { doctorId, startTime, endTime },
            },
          ],
          { session }
        );

        createdAppointment = appointmentDoc;
      });
    } catch (txnError: any) {
      // If standalone MongoDB without replica set (Code 20), fallback to safe non-transactional atomic check
      if (txnError.code === 20 || txnError.message?.includes('replica set')) {
        const patient = await Patient.findById(patientId);
        if (!patient) throw ApiError.notFound('Patient record not found');

        const doctor = await Doctor.findById(doctorId);
        if (!doctor || doctor.status !== 'ACTIVE') throw ApiError.notFound('Doctor not found or inactive');

        const existingAppointment = await Appointment.findOne({
          doctorId,
          startTime: start,
          status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
        });

        if (existingAppointment) {
          throw ApiError.slotAlreadyBooked();
        }

        const symptomDoc = new SymptomSubmission({
          appointmentId: new mongoose.Types.ObjectId(),
          patientId,
          chiefComplaint: symptoms.chiefComplaint,
          symptoms: symptoms.symptoms,
          duration: symptoms.duration,
          severity: symptoms.severity,
          additionalInfo: symptoms.additionalInfo,
        });

        const appointmentDoc = new Appointment({
          patientId,
          doctorId,
          startTime: start,
          endTime: end,
          status: AppointmentStatus.CONFIRMED,
          symptomSubmissionId: symptomDoc._id,
        });

        symptomDoc.appointmentId = appointmentDoc._id;
        await symptomDoc.save();
        try {
          await appointmentDoc.save();
        } catch (saveError: any) {
          if (saveError.code === 11000) {
            throw ApiError.slotAlreadyBooked();
          }
          throw saveError;
        }

        await SlotHold.updateMany(
          { doctorId, startTime: start, status: SlotHoldStatus.HELD },
          { status: SlotHoldStatus.CONFIRMED }
        );

        await AuditLog.create({
          userId: patient.userId,
          action: AuditAction.APPOINTMENT_CREATED,
          entity: 'Appointment',
          entityId: appointmentDoc._id.toString(),
          metadata: { doctorId, startTime, endTime },
        });

        createdAppointment = appointmentDoc;
      } else {
        throw txnError;
      }
    } finally {
      await session.endSession();
    }

    if (!createdAppointment) {
      throw ApiError.internal('Failed to finalize appointment transaction');
    }

    const appt: IAppointment = createdAppointment;

    // --- POST-COMMIT PHASE: Asynchronous background jobs ---
    // AI pre-visit summary, Email, Calendar (non-blocking)
    process.nextTick(async () => {
      try {
        // A. Generate AI Pre-Visit Symptom Summary
        const aiSummary = await AIService.generatePreVisitSummary(symptoms);
        const preVisitDoc = await PreVisitSummary.create({
          appointmentId: appt._id,
          urgencyLevel: aiSummary.urgencyLevel,
          chiefComplaint: aiSummary.chiefComplaint,
          summary: aiSummary.summary,
          suggestedQuestions: aiSummary.suggestedQuestions,
          status: AISummaryStatus.COMPLETED,
          aiModel: 'Gemini-1.5-Pro',
        });

        await Appointment.findByIdAndUpdate(appt._id, { preVisitSummaryId: preVisitDoc._id });
      } catch (err: any) {
        console.error('[Async AI Summary Warning]:', err.message);
        await PreVisitSummary.create({
          appointmentId: appt._id,
          urgencyLevel: UrgencyLevel.LOW,
          chiefComplaint: symptoms.chiefComplaint,
          summary: 'AI Pre-visit summary generation pending or failed. Doctor can review symptoms directly.',
          suggestedQuestions: [],
          status: AISummaryStatus.FAILED,
          error: err.message,
        });
      }

      try {
        // B. Send Booking Confirmation Emails to BOTH Patient & Doctor
        const patient = await Patient.findById(patientId).populate('userId');
        const doctor = await Doctor.findById(doctorId).populate('userId');
        const patientUser = patient ? (patient.userId as any) : null;
        const doctorUser = doctor ? (doctor.userId as any) : null;

        const dateStr = start.toLocaleDateString();
        const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // 1. Email to Patient
        if (patientUser && patientUser.email) {
          const patientEmailData = EmailService.getBookingConfirmationTemplate({
            patientName: patientUser.name,
            doctorName: doctorUser ? doctorUser.name : 'Doctor',
            specialization: 'Specialist Healthcare',
            date: dateStr,
            time: timeStr,
          });

          await EmailService.sendEmail({
            to: patientUser.email,
            subject: patientEmailData.subject,
            html: patientEmailData.html,
          });
        }

        // 2. Email to Doctor
        if (doctorUser && doctorUser.email) {
          const doctorEmailData = EmailService.getDoctorBookingNotificationTemplate({
            doctorName: doctorUser.name,
            patientName: patientUser ? patientUser.name : 'Patient',
            date: dateStr,
            time: timeStr,
            chiefComplaint: symptoms.chiefComplaint,
          });

          await EmailService.sendEmail({
            to: doctorUser.email,
            subject: doctorEmailData.subject,
            html: doctorEmailData.html,
          });
        }
      } catch (err: any) {
        console.error('[Async Booking Email Warning]:', err.message);
      }

      try {
        // C. Sync to Google Calendar
        const patient = await Patient.findById(patientId);
        if (patient) {
          await GoogleCalendarService.syncAppointmentEvent({
            userId: patient.userId.toString(),
            appointmentId: appt._id.toString(),
            summary: `Healthcare Appointment`,
            description: `Appointment with doctor. Symptoms: ${symptoms.chiefComplaint}`,
            startTime: start,
            endTime: end,
          });
        }
      } catch (err: any) {
        console.error('[Async Calendar Warning]:', err.message);
      }
    });

    return appt;
  }

  /**
   * Reschedule an existing appointment.
   */
  static async rescheduleAppointment(
    appointmentId: string,
    newStartTime: string,
    newEndTime: string,
    userId: string
  ): Promise<IAppointment> {
    const start = new Date(newStartTime);
    const end = new Date(newEndTime);

    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw ApiError.notFound('Appointment not found');

    if (appt.status === AppointmentStatus.CANCELLED || appt.status === AppointmentStatus.COMPLETED) {
      throw ApiError.badRequest(`Cannot reschedule an appointment with status ${appt.status}`);
    }

    // Check slot availability for doctor
    const conflict = await Appointment.findOne({
      _id: { $ne: appointmentId },
      doctorId: appt.doctorId,
      startTime: start,
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
    });

    if (conflict) {
      throw ApiError.slotAlreadyBooked('Selected new time slot is already booked');
    }

    appt.startTime = start;
    appt.endTime = end;
    appt.status = AppointmentStatus.RESCHEDULED;
    await appt.save();

    await AuditLog.create({
      userId,
      action: AuditAction.APPOINTMENT_RESCHEDULED,
      entity: 'Appointment',
      entityId: appointmentId,
      metadata: { newStartTime, newEndTime },
    });

    // Send Reschedule Notification Emails to BOTH Patient & Doctor
    (globalThis as any).setImmediate(async () => {
      try {
        const patient = await Patient.findById(appt.patientId).populate('userId');
        const doctor = await Doctor.findById(appt.doctorId).populate('userId');
        const patientUser = patient ? (patient.userId as any) : null;
        const doctorUser = doctor ? (doctor.userId as any) : null;

        const dateStr = start.toLocaleDateString();
        const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (patientUser && patientUser.email) {
          const patientEmail = EmailService.getRescheduleTemplate({
            patientName: patientUser.name,
            doctorName: doctorUser ? doctorUser.name : 'Doctor',
            newDate: dateStr,
            newTime: timeStr,
          });
          await EmailService.sendEmail({ to: patientUser.email, subject: patientEmail.subject, html: patientEmail.html });
        }

        if (doctorUser && doctorUser.email) {
          const doctorEmail = EmailService.getDoctorRescheduleTemplate({
            doctorName: doctorUser.name,
            patientName: patientUser ? patientUser.name : 'Patient',
            newDate: dateStr,
            newTime: timeStr,
          });
          await EmailService.sendEmail({ to: doctorUser.email, subject: doctorEmail.subject, html: doctorEmail.html });
        }
      } catch (err: any) {
        console.error('[Async Reschedule Email Warning]:', err.message);
      }
    });

    return appt;
  }

  /**
   * Cancel an appointment.
   */
  static async cancelAppointment(
    appointmentId: string,
    userId: string,
    reason?: string
  ): Promise<IAppointment> {
    const appt = await Appointment.findById(appointmentId);
    if (!appt) throw ApiError.notFound('Appointment not found');

    if (appt.status === AppointmentStatus.CANCELLED) {
      throw ApiError.badRequest('Appointment is already cancelled');
    }

    appt.status = AppointmentStatus.CANCELLED;
    appt.cancellationReason = reason || 'Cancelled by user';
    await appt.save();

    await AuditLog.create({
      userId,
      action: AuditAction.APPOINTMENT_CANCELLED,
      entity: 'Appointment',
      entityId: appointmentId,
      metadata: { reason },
    });

    // Send Cancellation Emails to BOTH Patient & Doctor
    (globalThis as any).setImmediate(async () => {
      try {
        const patient = await Patient.findById(appt.patientId).populate('userId');
        const doctor = await Doctor.findById(appt.doctorId).populate('userId');
        const patientUser = patient ? (patient.userId as any) : null;
        const doctorUser = doctor ? (doctor.userId as any) : null;

        const dateStr = appt.startTime.toLocaleDateString();
        const timeStr = appt.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (patientUser && patientUser.email) {
          const patientEmail = EmailService.getCancellationTemplate({
            patientName: patientUser.name,
            doctorName: doctorUser ? doctorUser.name : 'Doctor',
            date: dateStr,
            time: timeStr,
            reason: appt.cancellationReason,
          });
          await EmailService.sendEmail({ to: patientUser.email, subject: patientEmail.subject, html: patientEmail.html });
        }

        if (doctorUser && doctorUser.email) {
          const doctorEmail = EmailService.getDoctorCancellationTemplate({
            doctorName: doctorUser.name,
            patientName: patientUser ? patientUser.name : 'Patient',
            date: dateStr,
            time: timeStr,
            reason: appt.cancellationReason,
          });
          await EmailService.sendEmail({ to: doctorUser.email, subject: doctorEmail.subject, html: doctorEmail.html });
        }
      } catch (err: any) {
        console.error('[Async Cancellation Email Warning]:', err.message);
      }
    });

    return appt;
  }
}
