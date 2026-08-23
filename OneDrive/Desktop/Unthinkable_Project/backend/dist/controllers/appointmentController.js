"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointmentService_1 = require("../services/appointmentService");
const Appointment_1 = require("../models/Appointment");
const PreVisitSummary_1 = require("../models/PreVisitSummary");
const SymptomSubmission_1 = require("../models/SymptomSubmission");
const aiService_1 = require("../integrations/aiService");
const apiError_1 = require("../utils/apiError");
class AppointmentController {
    /**
     * Hold a time slot temporarily for 5 minutes.
     */
    static async holdSlot(req, res, next) {
        try {
            const patientId = req.user?.patientId;
            if (!patientId)
                throw apiError_1.ApiError.forbidden('Only patients can hold appointment slots');
            const { doctorId, startTime, endTime } = req.body;
            if (!doctorId || !startTime || !endTime) {
                throw apiError_1.ApiError.badRequest('doctorId, startTime, and endTime are required');
            }
            const hold = await appointmentService_1.AppointmentService.createSlotHold({
                doctorId,
                patientId,
                startTime,
                endTime,
            });
            return res.status(201).json({
                success: true,
                message: 'Slot held for 5 minutes',
                data: { hold },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Finalize appointment confirmation.
     */
    static async createAppointment(req, res, next) {
        try {
            const patientId = req.user?.patientId;
            if (!patientId)
                throw apiError_1.ApiError.forbidden('Only patients can book appointments');
            const { doctorId, startTime, endTime, symptoms, holdId } = req.body;
            if (!doctorId || !startTime || !endTime || !symptoms || !symptoms.chiefComplaint) {
                throw apiError_1.ApiError.badRequest('doctorId, startTime, endTime, and chiefComplaint are required');
            }
            const appointment = await appointmentService_1.AppointmentService.confirmBooking({
                holdId,
                doctorId,
                patientId,
                startTime,
                endTime,
                symptoms,
            });
            return res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                data: { appointment },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get user's appointments (Patient, Doctor, or Admin).
     */
    static async getAppointments(req, res, next) {
        try {
            const { status, date, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const filter = {};
            if (req.user?.role === 'PATIENT') {
                filter.patientId = req.user.patientId;
            }
            else if (req.user?.role === 'DOCTOR') {
                filter.doctorId = req.user.doctorId;
            }
            if (status) {
                filter.status = status;
            }
            if (date) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                filter.startTime = { $gte: startOfDay, $lte: endOfDay };
            }
            const appointments = await Appointment_1.Appointment.find(filter)
                .sort({ startTime: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate({
                path: 'doctorId',
                populate: { path: 'userId specializationIds', select: 'name email phone' },
            })
                .populate({
                path: 'patientId',
                populate: { path: 'userId', select: 'name email phone' },
            })
                .populate('symptomSubmissionId')
                .populate('preVisitSummaryId')
                .populate('consultationId');
            const total = await Appointment_1.Appointment.countDocuments(filter);
            return res.status(200).json({
                success: true,
                data: { appointments, total, page: Number(page), limit: Number(limit) },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get single appointment details.
     */
    static async getAppointmentById(req, res, next) {
        try {
            const appointment = await Appointment_1.Appointment.findById(req.params.id)
                .populate({
                path: 'doctorId',
                populate: { path: 'userId specializationIds' },
            })
                .populate({
                path: 'patientId',
                populate: { path: 'userId' },
            })
                .populate('symptomSubmissionId')
                .populate('preVisitSummaryId')
                .populate('consultationId');
            if (!appointment)
                throw apiError_1.ApiError.notFound('Appointment not found');
            return res.status(200).json({
                success: true,
                data: { appointment },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reschedule appointment.
     */
    static async reschedule(req, res, next) {
        try {
            const { newStartTime, newEndTime } = req.body;
            const appointmentId = req.params.id;
            if (!newStartTime || !newEndTime) {
                throw apiError_1.ApiError.badRequest('newStartTime and newEndTime are required');
            }
            const updatedAppt = await appointmentService_1.AppointmentService.rescheduleAppointment(appointmentId, newStartTime, newEndTime, req.user.userId);
            return res.status(200).json({
                success: true,
                message: 'Appointment rescheduled successfully',
                data: { appointment: updatedAppt },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cancel appointment.
     */
    static async cancel(req, res, next) {
        try {
            const appointmentId = req.params.id;
            const { reason } = req.body;
            const updatedAppt = await appointmentService_1.AppointmentService.cancelAppointment(appointmentId, req.user.userId, reason);
            return res.status(200).json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: { appointment: updatedAppt },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Retry AI Pre-visit summary generation.
     */
    static async retryPreVisitSummary(req, res, next) {
        try {
            const appointmentId = req.params.id;
            const appt = await Appointment_1.Appointment.findById(appointmentId);
            if (!appt)
                throw apiError_1.ApiError.notFound('Appointment not found');
            const symptomsDoc = await SymptomSubmission_1.SymptomSubmission.findOne({ appointmentId });
            if (!symptomsDoc)
                throw apiError_1.ApiError.notFound('No symptoms found for this appointment');
            const aiResult = await aiService_1.AIService.generatePreVisitSummary({
                chiefComplaint: symptomsDoc.chiefComplaint,
                symptoms: symptomsDoc.symptoms,
                duration: symptomsDoc.duration,
                severity: symptomsDoc.severity,
                additionalInfo: symptomsDoc.additionalInfo,
            });
            const updatedSummary = await PreVisitSummary_1.PreVisitSummary.findOneAndUpdate({ appointmentId }, {
                urgencyLevel: aiResult.urgencyLevel,
                chiefComplaint: aiResult.chiefComplaint,
                summary: aiResult.summary,
                suggestedQuestions: aiResult.suggestedQuestions,
                status: PreVisitSummary_1.AISummaryStatus.COMPLETED,
                error: undefined,
            }, { upsert: true, new: true });
            await Appointment_1.Appointment.findByIdAndUpdate(appointmentId, { preVisitSummaryId: updatedSummary._id });
            return res.status(200).json({
                success: true,
                message: 'AI Pre-visit summary generated successfully',
                data: { preVisitSummary: updatedSummary },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AppointmentController = AppointmentController;
//# sourceMappingURL=appointmentController.js.map