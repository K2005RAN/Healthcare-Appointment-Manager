"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
const leaveService_1 = require("../services/leaveService");
const notificationService_1 = require("../services/notificationService");
const Doctor_1 = require("../models/Doctor");
const Specialization_1 = require("../models/Specialization");
const DoctorLeave_1 = require("../models/DoctorLeave");
const apiError_1 = require("../utils/apiError");
class AdminController {
    static async getDashboard(req, res, next) {
        try {
            const stats = await adminService_1.AdminService.getDashboardStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createDoctor(req, res, next) {
        try {
            const result = await adminService_1.AdminService.createDoctor(req.body, req.user.userId);
            res.status(201).json({
                success: true,
                message: 'Doctor created successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateDoctor(req, res, next) {
        try {
            const doctorId = req.params.id;
            const updatedDoctor = await Doctor_1.Doctor.findByIdAndUpdate(doctorId, req.body, { new: true })
                .populate('userId', 'name email status phone')
                .populate('specializationIds', 'name');
            if (!updatedDoctor)
                throw apiError_1.ApiError.notFound('Doctor not found');
            res.status(200).json({
                success: true,
                message: 'Doctor updated successfully',
                data: { doctor: updatedDoctor },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createLeave(req, res, next) {
        try {
            const doctorId = req.params.id;
            const { startDate, endDate, reason } = req.body;
            if (!startDate || !endDate || !reason) {
                throw apiError_1.ApiError.badRequest('startDate, endDate, and reason are required');
            }
            const result = await leaveService_1.LeaveService.createDoctorLeave({
                doctorId,
                startDate,
                endDate,
                reason,
                createdBy: req.user.userId,
            });
            res.status(201).json({
                success: true,
                message: `Doctor leave created successfully. ${result.affectedAppointmentsCount} appointments affected and notified.`,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async checkLeaveConflicts(req, res, next) {
        try {
            const doctorId = req.params.id;
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                throw apiError_1.ApiError.badRequest('startDate and endDate query parameters are required');
            }
            const conflicts = await leaveService_1.LeaveService.checkLeaveConflicts(doctorId, startDate, endDate);
            res.status(200).json({
                success: true,
                data: conflicts,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteLeave(req, res, next) {
        try {
            const leaveId = req.params.id;
            await leaveService_1.LeaveService.deleteDoctorLeave(leaveId, req.user.userId);
            res.status(200).json({
                success: true,
                message: 'Doctor leave cancelled successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getLeaves(req, res, next) {
        try {
            const leaves = await DoctorLeave_1.DoctorLeave.find()
                .sort({ startDate: -1 })
                .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'name email' },
            });
            res.status(200).json({
                success: true,
                data: { leaves },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSpecializations(req, res, next) {
        try {
            const specializations = await Specialization_1.Specialization.find().sort({ name: 1 });
            res.status(200).json({
                success: true,
                data: { specializations },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createSpecialization(req, res, next) {
        try {
            const { name, description } = req.body;
            const spec = await Specialization_1.Specialization.create({ name, description, status: 'ACTIVE' });
            res.status(201).json({
                success: true,
                message: 'Specialization created successfully',
                data: { specialization: spec },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getFailedNotifications(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const data = await notificationService_1.NotificationService.getFailedNotifications(Number(page), Number(limit));
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async retryNotification(req, res, next) {
        try {
            const notificationId = req.params.id;
            const success = await notificationService_1.NotificationService.retryFailedNotification(notificationId);
            res.status(200).json({
                success: true,
                message: success ? 'Notification re-sent successfully' : 'Notification retry scheduled',
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAuditLogs(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;
            const data = await adminService_1.AdminService.getAuditLogs(Number(page), Number(limit));
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map