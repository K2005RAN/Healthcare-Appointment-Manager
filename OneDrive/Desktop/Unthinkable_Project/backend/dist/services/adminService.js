"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Doctor_1 = require("../models/Doctor");
const Patient_1 = require("../models/Patient");
const Appointment_1 = require("../models/Appointment");
const AuditLog_1 = require("../models/AuditLog");
const Notification_1 = require("../models/Notification");
const apiError_1 = require("../utils/apiError");
class AdminService {
    static async getDashboardStats() {
        const totalPatients = await Patient_1.Patient.countDocuments();
        const totalDoctors = await Doctor_1.Doctor.countDocuments();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const todayAppointments = await Appointment_1.Appointment.countDocuments({
            startTime: { $gte: startOfToday, $lte: endOfToday },
        });
        const completedAppointments = await Appointment_1.Appointment.countDocuments({
            status: Appointment_1.AppointmentStatus.COMPLETED,
        });
        const cancelledAppointments = await Appointment_1.Appointment.countDocuments({
            status: Appointment_1.AppointmentStatus.CANCELLED,
        });
        const upcomingAppointments = await Appointment_1.Appointment.countDocuments({
            startTime: { $gt: endOfToday },
            status: Appointment_1.AppointmentStatus.CONFIRMED,
        });
        const failedNotificationsCount = await Notification_1.Notification.countDocuments({
            status: Notification_1.NotificationStatus.FAILED,
        });
        // Monthly appointment trend (last 6 months)
        const appointmentsOverTime = await Appointment_1.Appointment.aggregate([
            {
                $group: {
                    _id: { $month: '$startTime' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // Status breakdown
        const statusBreakdown = await Appointment_1.Appointment.aggregate([
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
    static async createDoctor(input, adminUserId) {
        const { name, email, password, phone, specializationIds, experience, bio, consultationFee, slotDuration = 30, workingHours, } = input;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw apiError_1.ApiError.conflict('User with this email already exists.');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            phone,
            role: User_1.UserRole.DOCTOR,
            status: User_1.UserStatus.ACTIVE,
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
        const doctor = await Doctor_1.Doctor.create({
            userId: user._id,
            specializationIds,
            experience,
            bio,
            consultationFee,
            slotDuration,
            workingHours: workingHours || defaultWorkingHours,
            status: 'ACTIVE',
        });
        await AuditLog_1.AuditLog.create({
            userId: adminUserId,
            action: AuditLog_1.AuditAction.DOCTOR_CREATED,
            entity: 'Doctor',
            entityId: doctor._id.toString(),
            metadata: { doctorName: name, email },
        });
        return { user, doctor };
    }
    static async getAuditLogs(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const logs = await AuditLog_1.AuditLog.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email role');
        const total = await AuditLog_1.AuditLog.countDocuments();
        return { logs, total, page, limit };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=adminService.js.map