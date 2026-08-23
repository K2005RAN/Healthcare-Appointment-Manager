"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("../models");
const Appointment_1 = require("../models/Appointment");
const SlotHold_1 = require("../models/SlotHold");
const Doctor_1 = require("../models/Doctor");
const Patient_1 = require("../models/Patient");
const DoctorLeave_1 = require("../models/DoctorLeave");
const SymptomSubmission_1 = require("../models/SymptomSubmission");
const PreVisitSummary_1 = require("../models/PreVisitSummary");
const AuditLog_1 = require("../models/AuditLog");
const apiError_1 = require("../utils/apiError");
const env_1 = require("../config/env");
const aiService_1 = require("../integrations/aiService");
const emailService_1 = require("../integrations/emailService");
const googleCalendarService_1 = require("../integrations/googleCalendarService");
class AppointmentService {
    /**
     * Step 1: Temporarily hold an appointment slot for 5 minutes.
     * Atomic double-booking prevention at hold creation phase.
     */
    static async createSlotHold(params) {
        const { doctorId, patientId, startTime, endTime } = params;
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        if (start <= now) {
            throw apiError_1.ApiError.badRequest('Cannot hold an appointment slot in the past');
        }
        // Verify doctor exists and active
        const doctor = await Doctor_1.Doctor.findById(doctorId);
        if (!doctor || doctor.status !== 'ACTIVE') {
            throw apiError_1.ApiError.notFound('Doctor not found or currently unavailable');
        }
        // Verify doctor leave for this slot
        const leaveConflict = await DoctorLeave_1.DoctorLeave.findOne({
            doctorId,
            startDate: { $lte: end },
            endDate: { $gte: start },
        });
        if (leaveConflict) {
            throw apiError_1.ApiError.badRequest('Doctor is on leave during the selected time slot');
        }
        // Check if slot is already booked in Appointment collection
        const existingBooking = await Appointment_1.Appointment.findOne({
            doctorId,
            startTime: start,
            status: { $in: [Appointment_1.AppointmentStatus.CONFIRMED, Appointment_1.AppointmentStatus.PENDING] },
        });
        if (existingBooking) {
            throw apiError_1.ApiError.slotAlreadyBooked();
        }
        // Check existing active holds for this slot by any other patient
        const existingHold = await SlotHold_1.SlotHold.findOne({
            doctorId,
            startTime: start,
            status: SlotHold_1.SlotHoldStatus.HELD,
            expiresAt: { $gt: now },
        });
        if (existingHold) {
            if (existingHold.patientId.toString() === patientId) {
                // Patient re-holding their own slot - refresh TTL
                existingHold.expiresAt = new Date(now.getTime() + env_1.env.SLOT_HOLD_DURATION_MINUTES * 60 * 1000);
                await existingHold.save();
                return existingHold;
            }
            else {
                throw apiError_1.ApiError.slotAlreadyBooked('This slot is currently held by another patient. Please select a different slot.');
            }
        }
        // Create atomic slot hold
        const holdDurationMs = env_1.env.SLOT_HOLD_DURATION_MINUTES * 60 * 1000;
        const expiresAt = new Date(now.getTime() + holdDurationMs);
        try {
            const hold = await SlotHold_1.SlotHold.create({
                doctorId,
                patientId,
                startTime: start,
                endTime: end,
                expiresAt,
                status: SlotHold_1.SlotHoldStatus.HELD,
            });
            return hold;
        }
        catch (error) {
            if (error.code === 11000) {
                throw apiError_1.ApiError.slotAlreadyBooked();
            }
            throw error;
        }
    }
    /**
     * Step 2: Confirm appointment inside a safe MongoDB Session Transaction.
     */
    static async confirmBooking(params) {
        const { doctorId, patientId, startTime, endTime, symptoms, holdId } = params;
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        // Check MongoDB session transaction support
        const session = await mongoose_1.default.startSession();
        let createdAppointment = null;
        try {
            await session.withTransaction(async () => {
                // 1. Verify Patient & Doctor
                const patient = await Patient_1.Patient.findById(patientId).session(session);
                if (!patient)
                    throw apiError_1.ApiError.notFound('Patient record not found');
                const doctor = await Doctor_1.Doctor.findById(doctorId).session(session);
                if (!doctor || doctor.status !== 'ACTIVE')
                    throw apiError_1.ApiError.notFound('Doctor not found or inactive');
                // 2. Check Doctor Leave
                const leaveConflict = await DoctorLeave_1.DoctorLeave.findOne({
                    doctorId,
                    startDate: { $lte: end },
                    endDate: { $gte: start },
                }).session(session);
                if (leaveConflict) {
                    throw apiError_1.ApiError.badRequest('Doctor is on leave during this time slot.');
                }
                // 3. Double-Booking Prevention Check inside transaction
                const existingAppointment = await Appointment_1.Appointment.findOne({
                    doctorId,
                    startTime: start,
                    status: { $in: [Appointment_1.AppointmentStatus.CONFIRMED, Appointment_1.AppointmentStatus.PENDING] },
                }).session(session);
                if (existingAppointment) {
                    throw apiError_1.ApiError.slotAlreadyBooked();
                }
                // 4. Create Symptom Submission
                const symptomDoc = new SymptomSubmission_1.SymptomSubmission({
                    appointmentId: new mongoose_1.default.Types.ObjectId(),
                    patientId,
                    chiefComplaint: symptoms.chiefComplaint,
                    symptoms: symptoms.symptoms,
                    duration: symptoms.duration,
                    severity: symptoms.severity,
                    additionalInfo: symptoms.additionalInfo,
                });
                // 5. Create Appointment Document
                const appointmentDoc = new Appointment_1.Appointment({
                    patientId,
                    doctorId,
                    startTime: start,
                    endTime: end,
                    status: Appointment_1.AppointmentStatus.CONFIRMED,
                    symptomSubmissionId: symptomDoc._id,
                });
                symptomDoc.appointmentId = appointmentDoc._id;
                await symptomDoc.save({ session });
                await appointmentDoc.save({ session });
                // 6. Confirm / release hold if holdId provided
                if (holdId && mongoose_1.default.Types.ObjectId.isValid(holdId)) {
                    await SlotHold_1.SlotHold.findByIdAndUpdate(holdId, { status: SlotHold_1.SlotHoldStatus.CONFIRMED }, { session });
                }
                else {
                    await SlotHold_1.SlotHold.updateMany({ doctorId, startTime: start, status: SlotHold_1.SlotHoldStatus.HELD }, { status: SlotHold_1.SlotHoldStatus.CONFIRMED }, { session });
                }
                // 7. Record Audit Log
                await AuditLog_1.AuditLog.create([
                    {
                        userId: patient.userId,
                        action: AuditLog_1.AuditAction.APPOINTMENT_CREATED,
                        entity: 'Appointment',
                        entityId: appointmentDoc._id.toString(),
                        metadata: { doctorId, startTime, endTime },
                    },
                ], { session });
                createdAppointment = appointmentDoc;
            });
        }
        catch (txnError) {
            // If standalone MongoDB without replica set (Code 20), fallback to safe non-transactional atomic check
            if (txnError.code === 20 || txnError.message?.includes('replica set')) {
                const patient = await Patient_1.Patient.findById(patientId);
                if (!patient)
                    throw apiError_1.ApiError.notFound('Patient record not found');
                const doctor = await Doctor_1.Doctor.findById(doctorId);
                if (!doctor || doctor.status !== 'ACTIVE')
                    throw apiError_1.ApiError.notFound('Doctor not found or inactive');
                const existingAppointment = await Appointment_1.Appointment.findOne({
                    doctorId,
                    startTime: start,
                    status: { $in: [Appointment_1.AppointmentStatus.CONFIRMED, Appointment_1.AppointmentStatus.PENDING] },
                });
                if (existingAppointment) {
                    throw apiError_1.ApiError.slotAlreadyBooked();
                }
                const symptomDoc = new SymptomSubmission_1.SymptomSubmission({
                    appointmentId: new mongoose_1.default.Types.ObjectId(),
                    patientId,
                    chiefComplaint: symptoms.chiefComplaint,
                    symptoms: symptoms.symptoms,
                    duration: symptoms.duration,
                    severity: symptoms.severity,
                    additionalInfo: symptoms.additionalInfo,
                });
                const appointmentDoc = new Appointment_1.Appointment({
                    patientId,
                    doctorId,
                    startTime: start,
                    endTime: end,
                    status: Appointment_1.AppointmentStatus.CONFIRMED,
                    symptomSubmissionId: symptomDoc._id,
                });
                symptomDoc.appointmentId = appointmentDoc._id;
                await symptomDoc.save();
                try {
                    await appointmentDoc.save();
                }
                catch (saveError) {
                    if (saveError.code === 11000) {
                        throw apiError_1.ApiError.slotAlreadyBooked();
                    }
                    throw saveError;
                }
                await SlotHold_1.SlotHold.updateMany({ doctorId, startTime: start, status: SlotHold_1.SlotHoldStatus.HELD }, { status: SlotHold_1.SlotHoldStatus.CONFIRMED });
                await AuditLog_1.AuditLog.create({
                    userId: patient.userId,
                    action: AuditLog_1.AuditAction.APPOINTMENT_CREATED,
                    entity: 'Appointment',
                    entityId: appointmentDoc._id.toString(),
                    metadata: { doctorId, startTime, endTime },
                });
                createdAppointment = appointmentDoc;
            }
            else {
                throw txnError;
            }
        }
        finally {
            await session.endSession();
        }
        if (!createdAppointment) {
            throw apiError_1.ApiError.internal('Failed to finalize appointment transaction');
        }
        const appt = createdAppointment;
        // --- POST-COMMIT PHASE: Asynchronous background jobs ---
        // AI pre-visit summary, Email, Calendar (non-blocking)
        process.nextTick(async () => {
            try {
                // A. Generate AI Pre-Visit Symptom Summary
                const aiSummary = await aiService_1.AIService.generatePreVisitSummary(symptoms);
                const preVisitDoc = await PreVisitSummary_1.PreVisitSummary.create({
                    appointmentId: appt._id,
                    urgencyLevel: aiSummary.urgencyLevel,
                    chiefComplaint: aiSummary.chiefComplaint,
                    summary: aiSummary.summary,
                    suggestedQuestions: aiSummary.suggestedQuestions,
                    status: PreVisitSummary_1.AISummaryStatus.COMPLETED,
                    aiModel: 'Gemini-1.5-Pro',
                });
                await Appointment_1.Appointment.findByIdAndUpdate(appt._id, { preVisitSummaryId: preVisitDoc._id });
            }
            catch (err) {
                console.error('[Async AI Summary Warning]:', err.message);
                await PreVisitSummary_1.PreVisitSummary.create({
                    appointmentId: appt._id,
                    urgencyLevel: PreVisitSummary_1.UrgencyLevel.LOW,
                    chiefComplaint: symptoms.chiefComplaint,
                    summary: 'AI Pre-visit summary generation pending or failed. Doctor can review symptoms directly.',
                    suggestedQuestions: [],
                    status: PreVisitSummary_1.AISummaryStatus.FAILED,
                    error: err.message,
                });
            }
            try {
                // B. Send Booking Confirmation Emails to BOTH Patient & Doctor
                const patient = await Patient_1.Patient.findById(patientId).populate('userId');
                const doctor = await Doctor_1.Doctor.findById(doctorId).populate('userId');
                const patientUser = patient ? patient.userId : null;
                const doctorUser = doctor ? doctor.userId : null;
                const dateStr = start.toLocaleDateString();
                const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                // 1. Email to Patient
                if (patientUser && patientUser.email) {
                    const patientEmailData = emailService_1.EmailService.getBookingConfirmationTemplate({
                        patientName: patientUser.name,
                        doctorName: doctorUser ? doctorUser.name : 'Doctor',
                        specialization: 'Specialist Healthcare',
                        date: dateStr,
                        time: timeStr,
                    });
                    await emailService_1.EmailService.sendEmail({
                        to: patientUser.email,
                        subject: patientEmailData.subject,
                        html: patientEmailData.html,
                    });
                }
                // 2. Email to Doctor
                if (doctorUser && doctorUser.email) {
                    const doctorEmailData = emailService_1.EmailService.getDoctorBookingNotificationTemplate({
                        doctorName: doctorUser.name,
                        patientName: patientUser ? patientUser.name : 'Patient',
                        date: dateStr,
                        time: timeStr,
                        chiefComplaint: symptoms.chiefComplaint,
                    });
                    await emailService_1.EmailService.sendEmail({
                        to: doctorUser.email,
                        subject: doctorEmailData.subject,
                        html: doctorEmailData.html,
                    });
                }
            }
            catch (err) {
                console.error('[Async Booking Email Warning]:', err.message);
            }
            try {
                // C. Sync to Google Calendar
                const patient = await Patient_1.Patient.findById(patientId);
                if (patient) {
                    await googleCalendarService_1.GoogleCalendarService.syncAppointmentEvent({
                        userId: patient.userId.toString(),
                        appointmentId: appt._id.toString(),
                        summary: `Healthcare Appointment`,
                        description: `Appointment with doctor. Symptoms: ${symptoms.chiefComplaint}`,
                        startTime: start,
                        endTime: end,
                    });
                }
            }
            catch (err) {
                console.error('[Async Calendar Warning]:', err.message);
            }
        });
        return appt;
    }
    /**
     * Reschedule an existing appointment.
     */
    static async rescheduleAppointment(appointmentId, newStartTime, newEndTime, userId) {
        const start = new Date(newStartTime);
        const end = new Date(newEndTime);
        const appt = await Appointment_1.Appointment.findById(appointmentId);
        if (!appt)
            throw apiError_1.ApiError.notFound('Appointment not found');
        if (appt.status === Appointment_1.AppointmentStatus.CANCELLED || appt.status === Appointment_1.AppointmentStatus.COMPLETED) {
            throw apiError_1.ApiError.badRequest(`Cannot reschedule an appointment with status ${appt.status}`);
        }
        // Check slot availability for doctor
        const conflict = await Appointment_1.Appointment.findOne({
            _id: { $ne: appointmentId },
            doctorId: appt.doctorId,
            startTime: start,
            status: { $in: [Appointment_1.AppointmentStatus.CONFIRMED, Appointment_1.AppointmentStatus.PENDING] },
        });
        if (conflict) {
            throw apiError_1.ApiError.slotAlreadyBooked('Selected new time slot is already booked');
        }
        appt.startTime = start;
        appt.endTime = end;
        appt.status = Appointment_1.AppointmentStatus.RESCHEDULED;
        await appt.save();
        await AuditLog_1.AuditLog.create({
            userId,
            action: AuditLog_1.AuditAction.APPOINTMENT_RESCHEDULED,
            entity: 'Appointment',
            entityId: appointmentId,
            metadata: { newStartTime, newEndTime },
        });
        // Send Reschedule Notification Emails to BOTH Patient & Doctor
        setImmediate(async () => {
            try {
                const patient = await Patient_1.Patient.findById(appt.patientId).populate('userId');
                const doctor = await Doctor_1.Doctor.findById(appt.doctorId).populate('userId');
                const patientUser = patient ? patient.userId : null;
                const doctorUser = doctor ? doctor.userId : null;
                const dateStr = start.toLocaleDateString();
                const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (patientUser && patientUser.email) {
                    const patientEmail = emailService_1.EmailService.getRescheduleTemplate({
                        patientName: patientUser.name,
                        doctorName: doctorUser ? doctorUser.name : 'Doctor',
                        newDate: dateStr,
                        newTime: timeStr,
                    });
                    await emailService_1.EmailService.sendEmail({ to: patientUser.email, subject: patientEmail.subject, html: patientEmail.html });
                }
                if (doctorUser && doctorUser.email) {
                    const doctorEmail = emailService_1.EmailService.getDoctorRescheduleTemplate({
                        doctorName: doctorUser.name,
                        patientName: patientUser ? patientUser.name : 'Patient',
                        newDate: dateStr,
                        newTime: timeStr,
                    });
                    await emailService_1.EmailService.sendEmail({ to: doctorUser.email, subject: doctorEmail.subject, html: doctorEmail.html });
                }
            }
            catch (err) {
                console.error('[Async Reschedule Email Warning]:', err.message);
            }
        });
        return appt;
    }
    /**
     * Cancel an appointment.
     */
    static async cancelAppointment(appointmentId, userId, reason) {
        const appt = await Appointment_1.Appointment.findById(appointmentId);
        if (!appt)
            throw apiError_1.ApiError.notFound('Appointment not found');
        if (appt.status === Appointment_1.AppointmentStatus.CANCELLED) {
            throw apiError_1.ApiError.badRequest('Appointment is already cancelled');
        }
        appt.status = Appointment_1.AppointmentStatus.CANCELLED;
        appt.cancellationReason = reason || 'Cancelled by user';
        await appt.save();
        await AuditLog_1.AuditLog.create({
            userId,
            action: AuditLog_1.AuditAction.APPOINTMENT_CANCELLED,
            entity: 'Appointment',
            entityId: appointmentId,
            metadata: { reason },
        });
        // Send Cancellation Emails to BOTH Patient & Doctor
        setImmediate(async () => {
            try {
                const patient = await Patient_1.Patient.findById(appt.patientId).populate('userId');
                const doctor = await Doctor_1.Doctor.findById(appt.doctorId).populate('userId');
                const patientUser = patient ? patient.userId : null;
                const doctorUser = doctor ? doctor.userId : null;
                const dateStr = appt.startTime.toLocaleDateString();
                const timeStr = appt.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (patientUser && patientUser.email) {
                    const patientEmail = emailService_1.EmailService.getCancellationTemplate({
                        patientName: patientUser.name,
                        doctorName: doctorUser ? doctorUser.name : 'Doctor',
                        date: dateStr,
                        time: timeStr,
                        reason: appt.cancellationReason,
                    });
                    await emailService_1.EmailService.sendEmail({ to: patientUser.email, subject: patientEmail.subject, html: patientEmail.html });
                }
                if (doctorUser && doctorUser.email) {
                    const doctorEmail = emailService_1.EmailService.getDoctorCancellationTemplate({
                        doctorName: doctorUser.name,
                        patientName: patientUser ? patientUser.name : 'Patient',
                        date: dateStr,
                        time: timeStr,
                        reason: appt.cancellationReason,
                    });
                    await emailService_1.EmailService.sendEmail({ to: doctorUser.email, subject: doctorEmail.subject, html: doctorEmail.html });
                }
            }
            catch (err) {
                console.error('[Async Cancellation Email Warning]:', err.message);
            }
        });
        return appt;
    }
}
exports.AppointmentService = AppointmentService;
//# sourceMappingURL=appointmentService.js.map