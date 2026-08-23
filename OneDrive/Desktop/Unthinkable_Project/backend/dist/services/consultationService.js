"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Consultation_1 = require("../models/Consultation");
const Prescription_1 = require("../models/Prescription");
const Appointment_1 = require("../models/Appointment");
const MedicationReminder_1 = require("../models/MedicationReminder");
const AuditLog_1 = require("../models/AuditLog");
const apiError_1 = require("../utils/apiError");
const aiService_1 = require("../integrations/aiService");
class ConsultationService {
    static async recordConsultation(input) {
        const { appointmentId, doctorId, patientId, clinicalNotes, diagnosis, treatmentNotes, followUpInstructions, medications = [], prescriptionInstructions, } = input;
        const appointment = await Appointment_1.Appointment.findById(appointmentId);
        if (!appointment)
            throw apiError_1.ApiError.notFound('Appointment not found');
        const session = await mongoose_1.default.startSession();
        let consultationDoc = null;
        let prescriptionDoc = null;
        try {
            await session.withTransaction(async () => {
                // Create Prescription if medications provided
                if (medications.length > 0) {
                    prescriptionDoc = new Prescription_1.Prescription({
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
                        await MedicationReminder_1.MedicationReminder.create([
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
                        ], { session });
                    }
                }
                // Create Consultation Document
                consultationDoc = new Consultation_1.Consultation({
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
                appointment.status = Appointment_1.AppointmentStatus.COMPLETED;
                appointment.consultationId = consultationDoc._id;
                await appointment.save({ session });
                await AuditLog_1.AuditLog.create([
                    {
                        userId: doctorId,
                        action: AuditLog_1.AuditAction.CONSULTATION_COMPLETED,
                        entity: 'Consultation',
                        entityId: consultationDoc._id.toString(),
                        metadata: { appointmentId, patientId, hasPrescription: !!prescriptionDoc },
                    },
                ], { session });
            });
        }
        finally {
            await session.endSession();
        }
        if (!consultationDoc) {
            throw apiError_1.ApiError.internal('Failed to record consultation transaction');
        }
        const consDoc = consultationDoc;
        // Asynchronously generate AI Post-Visit Summary for patient
        process.nextTick(async () => {
            try {
                const aiPostSummary = await aiService_1.AIService.generatePostVisitSummary({
                    clinicalNotes,
                    diagnosis,
                    treatmentNotes,
                    followUpInstructions,
                    medications,
                });
                await Consultation_1.Consultation.findByIdAndUpdate(consDoc._id, {
                    patientFriendlySummary: aiPostSummary.summary,
                });
            }
            catch (err) {
                console.error('[Async Post-Visit AI Summary Warning]:', err.message);
            }
        });
        return {
            consultation: consDoc,
            prescription: prescriptionDoc || undefined,
        };
    }
}
exports.ConsultationService = ConsultationService;
//# sourceMappingURL=consultationService.js.map