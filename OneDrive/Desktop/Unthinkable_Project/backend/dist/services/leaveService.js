"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const DoctorLeave_1 = require("../models/DoctorLeave");
const Appointment_1 = require("../models/Appointment");
const Doctor_1 = require("../models/Doctor");
const AuditLog_1 = require("../models/AuditLog");
const apiError_1 = require("../utils/apiError");
class LeaveService {
    /**
     * Preview affected appointments before confirming doctor leave.
     */
    static async checkLeaveConflicts(doctorId, startDateStr, endDateStr) {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        const affectedAppointments = await Appointment_1.Appointment.find({
            doctorId,
            startTime: { $lte: end },
            endTime: { $gte: start },
            status: { $in: [Appointment_1.AppointmentStatus.CONFIRMED, Appointment_1.AppointmentStatus.PENDING] },
        })
            .populate('patientId')
            .populate('doctorId');
        return {
            affectedCount: affectedAppointments.length,
            affectedAppointments,
        };
    }
    /**
     * Create doctor leave and resolve affected appointments.
     */
    static async createDoctorLeave(input) {
        const { doctorId, startDate, endDate, reason, createdBy } = input;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            throw apiError_1.ApiError.badRequest('End date must be after start date');
        }
        const doctor = await Doctor_1.Doctor.findById(doctorId);
        if (!doctor)
            throw apiError_1.ApiError.notFound('Doctor not found');
        const session = await mongoose_1.default.startSession();
        let leaveDoc = null;
        let affectedCount = 0;
        try {
            await session.withTransaction(async () => {
                leaveDoc = new DoctorLeave_1.DoctorLeave({
                    doctorId,
                    startDate: start,
                    endDate: end,
                    reason,
                    createdBy,
                });
                await leaveDoc.save({ session });
                // Update doctor status if leave starts today
                const now = new Date();
                if (start <= now && end >= now) {
                    doctor.status = 'ON_LEAVE';
                    await doctor.save({ session });
                }
                // Find affected appointments
                const affectedApps = await Appointment_1.Appointment.find({
                    doctorId,
                    startTime: { $lte: end },
                    endTime: { $gte: start },
                    status: { $in: [Appointment_1.AppointmentStatus.CONFIRMED, Appointment_1.AppointmentStatus.PENDING] },
                }).session(session);
                affectedCount = affectedApps.length;
                // Cancel affected appointments gracefully with clear reason
                for (const app of affectedApps) {
                    app.status = Appointment_1.AppointmentStatus.CANCELLED;
                    app.cancellationReason = `Doctor on leave: ${reason}`;
                    await app.save({ session });
                }
                await AuditLog_1.AuditLog.create([
                    {
                        userId: createdBy,
                        action: AuditLog_1.AuditAction.DOCTOR_LEAVE_CREATED,
                        entity: 'DoctorLeave',
                        entityId: leaveDoc._id.toString(),
                        metadata: { doctorId, startDate, endDate, affectedCount },
                    },
                ], { session });
            });
        }
        finally {
            await session.endSession();
        }
        if (!leaveDoc) {
            throw apiError_1.ApiError.internal('Failed to create doctor leave transaction');
        }
        return {
            leave: leaveDoc,
            affectedAppointmentsCount: affectedCount,
        };
    }
    /**
     * Delete or cancel a doctor leave.
     */
    static async deleteDoctorLeave(leaveId, userId) {
        const leave = await DoctorLeave_1.DoctorLeave.findById(leaveId);
        if (!leave)
            throw apiError_1.ApiError.notFound('Doctor leave record not found');
        await DoctorLeave_1.DoctorLeave.findByIdAndDelete(leaveId);
        // Reset doctor status to ACTIVE if currently ON_LEAVE
        const doctor = await Doctor_1.Doctor.findById(leave.doctorId);
        if (doctor && doctor.status === 'ON_LEAVE') {
            doctor.status = 'ACTIVE';
            await doctor.save();
        }
        await AuditLog_1.AuditLog.create({
            userId,
            action: AuditLog_1.AuditAction.DOCTOR_LEAVE_DELETED,
            entity: 'DoctorLeave',
            entityId: leaveId,
        });
        return true;
    }
}
exports.LeaveService = LeaveService;
//# sourceMappingURL=leaveService.js.map