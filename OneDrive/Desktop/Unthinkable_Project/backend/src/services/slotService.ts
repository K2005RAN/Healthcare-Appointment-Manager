import mongoose from 'mongoose';
import { Doctor, IDoctor } from '../models/Doctor';
import { DoctorLeave } from '../models/DoctorLeave';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { SlotHold, SlotHoldStatus } from '../models/SlotHold';
import { ApiError } from '../utils/apiError';

export interface GeneratedSlot {
  startTime: string; // ISO String
  endTime: string;   // ISO String
  timeLabel: string; // e.g. "09:00 AM"
  isAvailable: boolean;
  isHeldByMe?: boolean;
  reason?: 'BOOKED' | 'HELD' | 'LEAVE' | 'PAST' | null;
}

export class SlotService {
  /**
   * Generates dynamic available appointment slots for a specific doctor on a given date.
   */
  static async getDoctorAvailability(
    doctorId: string,
    dateStr: string, // YYYY-MM-DD
    currentPatientId?: string
  ): Promise<GeneratedSlot[]> {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw ApiError.badRequest('Invalid doctor ID format');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'ACTIVE') {
      throw ApiError.notFound('Doctor not found or inactive');
    }

    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      throw ApiError.badRequest('Invalid date format. Use YYYY-MM-DD');
    }

    // Check doctor leave for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const activeLeave = await DoctorLeave.findOne({
      doctorId,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    });

    if (activeLeave) {
      return []; // Doctor is on leave, no slots available
    }

    // Get doctor working hours for the target day of week
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const workingConfig = doctor.workingHours.find(
      (wh: any) => wh.dayOfWeek === dayOfWeek && wh.isActive
    );

    if (!workingConfig) {
      return []; // Doctor does not work on this day
    }

    const slotDuration = doctor.slotDuration || 30;

    // Parse start and end times
    const [startHour, startMin] = workingConfig.startTime.split(':').map(Number);
    const [endHour, endMin] = workingConfig.endTime.split(':').map(Number);

    const workStart = new Date(targetDate);
    workStart.setHours(startHour, startMin, 0, 0);

    const workEnd = new Date(targetDate);
    workEnd.setHours(endHour, endMin, 0, 0);

    // Parse break times if configured
    let breakStart: Date | null = null;
    let breakEnd: Date | null = null;
    if (workingConfig.breakStart && workingConfig.breakEnd) {
      const [bStartH, bStartM] = workingConfig.breakStart.split(':').map(Number);
      const [bEndH, bEndM] = workingConfig.breakEnd.split(':').map(Number);
      breakStart = new Date(targetDate);
      breakStart.setHours(bStartH, bStartM, 0, 0);
      breakEnd = new Date(targetDate);
      breakEnd.setHours(bEndH, bEndM, 0, 0);
    }

    // Query existing active appointments for doctor on target date
    const existingAppointments = await Appointment.find({
      doctorId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
    });

    // Query active non-expired slot holds
    const now = new Date();
    const activeHolds = await SlotHold.find({
      doctorId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: SlotHoldStatus.HELD,
      expiresAt: { $gt: now },
    });

    const slots: GeneratedSlot[] = [];
    let currentSlotStart = new Date(workStart);

    while (currentSlotStart < workEnd) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + slotDuration * 60 * 1000);
      if (currentSlotEnd > workEnd) break;

      // Check if slot falls in break time
      const isBreakSlot =
        breakStart &&
        breakEnd &&
        currentSlotStart >= breakStart &&
        currentSlotStart < breakEnd;

      if (!isBreakSlot) {
        // Check if slot is in the past
        const isPast = currentSlotStart <= now;

        // Check appointment conflict
        const isBooked = existingAppointments.some(
          (app: any) => app.startTime.getTime() === currentSlotStart.getTime()
        );

        // Check hold conflict
        const matchingHold = activeHolds.find(
          (hold: any) => hold.startTime.getTime() === currentSlotStart.getTime()
        );
        const isHeld = !!matchingHold;
        const isHeldByMe = currentPatientId && matchingHold ? matchingHold.patientId.toString() === currentPatientId : false;

        let reason: 'BOOKED' | 'HELD' | 'LEAVE' | 'PAST' | null = null;
        let isAvailable = true;

        if (isPast) {
          isAvailable = false;
          reason = 'PAST';
        } else if (isBooked) {
          isAvailable = false;
          reason = 'BOOKED';
        } else if (isHeld && !isHeldByMe) {
          isAvailable = false;
          reason = 'HELD';
        }

        const timeLabel = currentSlotStart.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        slots.push({
          startTime: currentSlotStart.toISOString(),
          endTime: currentSlotEnd.toISOString(),
          timeLabel,
          isAvailable,
          isHeldByMe,
          reason,
        });
      }

      // Step to next slot
      currentSlotStart = currentSlotEnd;
    }

    return slots;
  }
}
