"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationController = void 0;
const consultationService_1 = require("../services/consultationService");
const Consultation_1 = require("../models/Consultation");
const Prescription_1 = require("../models/Prescription");
const Appointment_1 = require("../models/Appointment");
const apiError_1 = require("../utils/apiError");
class ConsultationController {
    static async recordConsultation(req, res, next) {
        try {
            const doctorId = req.user?.doctorId;
            if (!doctorId)
                throw apiError_1.ApiError.forbidden('Only doctors can record consultations');
            const appointmentId = req.params.id;
            const appt = await Appointment_1.Appointment.findById(appointmentId);
            if (!appt)
                throw apiError_1.ApiError.notFound('Appointment not found');
            const { clinicalNotes, diagnosis, treatmentNotes, followUpInstructions, medications, prescriptionInstructions } = req.body;
            if (!clinicalNotes || !diagnosis || !treatmentNotes) {
                throw apiError_1.ApiError.badRequest('clinicalNotes, diagnosis, and treatmentNotes are required');
            }
            const result = await consultationService_1.ConsultationService.recordConsultation({
                appointmentId,
                doctorId,
                patientId: appt.patientId.toString(),
                clinicalNotes,
                diagnosis,
                treatmentNotes,
                followUpInstructions: followUpInstructions || '',
                medications,
                prescriptionInstructions,
            });
            return res.status(201).json({
                success: true,
                message: 'Consultation recorded and prescriptions issued successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getConsultation(req, res, next) {
        try {
            const appointmentId = req.params.id;
            const consultation = await Consultation_1.Consultation.findOne({ appointmentId })
                .populate('doctorId', 'userId')
                .populate('patientId', 'userId');
            const prescription = await Prescription_1.Prescription.findOne({ appointmentId });
            if (!consultation) {
                throw apiError_1.ApiError.notFound('Consultation record not found for this appointment');
            }
            return res.status(200).json({
                success: true,
                data: { consultation, prescription },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ConsultationController = ConsultationController;
//# sourceMappingURL=consultationController.js.map