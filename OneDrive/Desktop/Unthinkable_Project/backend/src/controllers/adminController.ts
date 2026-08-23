import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AdminService } from '../services/adminService';
import { LeaveService } from '../services/leaveService';
import { NotificationService } from '../services/notificationService';
import { Doctor } from '../models/Doctor';
import { Specialization } from '../models/Specialization';
import { DoctorLeave } from '../models/DoctorLeave';
import { ApiError } from '../utils/apiError';

export class AdminController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDoctor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminService.createDoctor(req.body, req.user!.userId);
      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDoctor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.params.id;
      const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, req.body, { new: true })
        .populate('userId', 'name email status phone')
        .populate('specializationIds', 'name');

      if (!updatedDoctor) throw ApiError.notFound('Doctor not found');

      res.status(200).json({
        success: true,
        message: 'Doctor updated successfully',
        data: { doctor: updatedDoctor },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createLeave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.params.id;
      const { startDate, endDate, reason } = req.body;

      if (!startDate || !endDate || !reason) {
        throw ApiError.badRequest('startDate, endDate, and reason are required');
      }

      const result = await LeaveService.createDoctorLeave({
        doctorId,
        startDate,
        endDate,
        reason,
        createdBy: req.user!.userId,
      });

      res.status(201).json({
        success: true,
        message: `Doctor leave created successfully. ${result.affectedAppointmentsCount} appointments affected and notified.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkLeaveConflicts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.params.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw ApiError.badRequest('startDate and endDate query parameters are required');
      }

      const conflicts = await LeaveService.checkLeaveConflicts(
        doctorId,
        startDate as string,
        endDate as string
      );

      res.status(200).json({
        success: true,
        data: conflicts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLeave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leaveId = req.params.id;
      await LeaveService.deleteDoctorLeave(leaveId, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Doctor leave cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLeaves(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const leaves = await DoctorLeave.find()
        .sort({ startDate: -1 })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email' },
        });

      res.status(200).json({
        success: true,
        data: { leaves },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSpecializations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const specializations = await Specialization.find().sort({ name: 1 });
      res.status(200).json({
        success: true,
        data: { specializations },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSpecialization(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = req.body;
      const spec = await Specialization.create({ name, description, status: 'ACTIVE' });
      res.status(201).json({
        success: true,
        message: 'Specialization created successfully',
        data: { specialization: spec },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFailedNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await NotificationService.getFailedNotifications(Number(page), Number(limit));
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async retryNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notificationId = req.params.id;
      const success = await NotificationService.retryFailedNotification(notificationId);
      res.status(200).json({
        success: true,
        message: success ? 'Notification re-sent successfully' : 'Notification retry scheduled',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await AdminService.getAuditLogs(Number(page), Number(limit));
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
