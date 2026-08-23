"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const Consultation_1 = require("../models/Consultation");
const Prescription_1 = require("../models/Prescription");
const MedicationReminder_1 = require("../models/MedicationReminder");
const apiError_1 = require("../utils/apiError");
class PatientController {
    static async getSummaries(req, res, next) {
        try {
            const patientId = req.user?.patientId;
            if (!patientId)
                throw apiError_1.ApiError.forbidden('User is not a patient');
            const summaries = await Consultation_1.Consultation.find({ patientId })
                .sort({ createdAt: -1 })
                .populate({
                path: 'doctorId',
                populate: { path: 'userId specializationIds', select: 'name email' },
            })
                .populate('appointmentId');
            return res.status(200).json({
                success: true,
                data: { summaries },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPrescriptions(req, res, next) {
        try {
            const patientId = req.user?.patientId;
            if (!patientId)
                throw apiError_1.ApiError.forbidden('User is not a patient');
            const prescriptions = await Prescription_1.Prescription.find({ patientId })
                .sort({ createdAt: -1 })
                .populate({
                path: 'doctorId',
                populate: { path: 'userId specializationIds', select: 'name' },
            })
                .populate('appointmentId');
            return res.status(200).json({
                success: true,
                data: { prescriptions },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMedications(req, res, next) {
        try {
            const patientId = req.user?.patientId;
            if (!patientId)
                throw apiError_1.ApiError.forbidden('User is not a patient');
            const medications = await MedicationReminder_1.MedicationReminder.find({ patientId })
                .sort({ createdAt: -1 })
                .populate('prescriptionId');
            return res.status(200).json({
                success: true,
                data: { medications },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PatientController = PatientController;
//# sourceMappingURL=patientController.js.map