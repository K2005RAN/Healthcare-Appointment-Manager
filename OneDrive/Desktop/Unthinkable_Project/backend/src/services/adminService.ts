import bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { Specialization } from '../models/Specialization';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { Notification, NotificationStatus } from '../models/Notification';
import { ApiError } from '../utils/apiError';

export interface CreateDoctorInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  specializationIds: string[];
  experience: number;
  bio: string;
  consultationFee: number;
  slotDuration?: number;
  workingHours?: any[];
}

export class AdminService {
  static async getDashboardStats() {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      startTime: { $gte: startOfToday, $lte: endOfToday },
    });

    const completedAppointments = await Appointment.countDocuments({
      status: AppointmentStatus.COMPLETED,
    });

    const cancelledAppointments = await Appointment.countDocuments({
      status: AppointmentStatus.CANCELLED,
    });

    const upcomingAppointments = await Appointment.countDocuments({
      startTime: { $gt: endOfToday },
      status: AppointmentStatus.CONFIRMED,
    });

    const failedNotificationsCount = await Notification.countDocuments({
      status: NotificationStatus.FAILED,
    });

    // Monthly appointment trend (last 6 months)
    const appointmentsOverTime = await Appointment.aggregate([
      {
        $group: {
          _id: { $month: '$startTime' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Status breakdown
    const statusBreakdown = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalPatients,
      totalDoctors,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      upcomingAppointments,
      failedNotificationsCount,
      appointmentsOverTime,
      statusBreakdown,
    };
  }

  static async createDoctor(input: CreateDoctorInput, adminUserId: string) {
    const {
      name,
      email,
      password,
      phone,
      specializationIds,
      experience,
      bio,
      consultationFee,
      slotDuration = 30,
      workingHours,
    } = input;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
    });

    // Default working hours Monday-Friday 09:00-17:00 if not provided
    const defaultWorkingHours = [
      { dayOfWeek: 1, dayName: 'Monday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
      { dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
      { dayOfWeek: 3, dayName: 'Wednesday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
      { dayOfWeek: 4, dayName: 'Thursday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
      { dayOfWeek: 5, dayName: 'Friday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
      { dayOfWeek: 6, dayName: 'Saturday', startTime: '09:00', endTime: '13:00', isActive: false },
      { dayOfWeek: 0, dayName: 'Sunday', startTime: '09:00', endTime: '13:00', isActive: false },
    ];

    const doctor = await Doctor.create({
      userId: user._id,
      specializationIds,
      experience,
      bio,
      consultationFee,
      slotDuration,
      workingHours: workingHours || defaultWorkingHours,
      status: 'ACTIVE',
    });

    await AuditLog.create({
      userId: adminUserId,
      action: AuditAction.DOCTOR_CREATED,
      entity: 'Doctor',
      entityId: doctor._id.toString(),
      metadata: { doctorName: name, email },
    });

    return { user, doctor };
  }

  static async getAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role');

    const total = await AuditLog.countDocuments();
    return { logs, total, page, limit };
  }
}
