import mongoose from 'mongoose';
import { DoctorLeave, IDoctorLeave } from '../models/DoctorLeave';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { ApiError } from '../utils/apiError';

export interface CreateLeaveInput {
  doctorId: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  reason: string;
  createdBy: string; // User ID
}

export class LeaveService {
  /**
   * Preview affected appointments before confirming doctor leave.
   */
  static async checkLeaveConflicts(doctorId: string, startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const affectedAppointments = await Appointment.find({
      doctorId,
      startTime: { $lte: end },
      endTime: { $gte: start },
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
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
  static async createDoctorLeave(input: CreateLeaveInput): Promise<{ leave: IDoctorLeave; affectedAppointmentsCount: number }> {
    const { doctorId, startDate, endDate, reason, createdBy } = input;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw ApiError.badRequest('End date must be after start date');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw ApiError.notFound('Doctor not found');

    const session = await mongoose.startSession();
    let leaveDoc: IDoctorLeave | null = null;
    let affectedCount = 0;

    try {
      await session.withTransaction(async () => {
        leaveDoc = new DoctorLeave({
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
        const affectedApps = await Appointment.find({
          doctorId,
          startTime: { $lte: end },
          endTime: { $gte: start },
          status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
        }).session(session);

        affectedCount = affectedApps.length;

        // Cancel affected appointments gracefully with clear reason
        for (const app of affectedApps) {
          app.status = AppointmentStatus.CANCELLED;
          app.cancellationReason = `Doctor on leave: ${reason}`;
          await app.save({ session });
        }

        await AuditLog.create(
          [
            {
              userId: createdBy,
              action: AuditAction.DOCTOR_LEAVE_CREATED,
              entity: 'DoctorLeave',
              entityId: leaveDoc._id.toString(),
              metadata: { doctorId, startDate, endDate, affectedCount },
            },
          ],
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    if (!leaveDoc) {
      throw ApiError.internal('Failed to create doctor leave transaction');
    }

    return {
      leave: leaveDoc,
      affectedAppointmentsCount: affectedCount,
    };
  }

  /**
   * Delete or cancel a doctor leave.
   */
  static async deleteDoctorLeave(leaveId: string, userId: string): Promise<boolean> {
    const leave = await DoctorLeave.findById(leaveId);
    if (!leave) throw ApiError.notFound('Doctor leave record not found');

    await DoctorLeave.findByIdAndDelete(leaveId);

    // Reset doctor status to ACTIVE if currently ON_LEAVE
    const doctor = await Doctor.findById(leave.doctorId);
    if (doctor && doctor.status === 'ON_LEAVE') {
      doctor.status = 'ACTIVE';
      await doctor.save();
    }

    await AuditLog.create({
      userId,
      action: AuditAction.DOCTOR_LEAVE_DELETED,
      entity: 'DoctorLeave',
      entityId: leaveId,
    });

    return true;
  }
}
