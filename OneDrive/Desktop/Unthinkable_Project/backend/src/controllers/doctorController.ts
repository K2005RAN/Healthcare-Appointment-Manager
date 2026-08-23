import { Request, Response, NextFunction } from 'express';
import { Doctor } from '../models/Doctor';
import { SlotService } from '../services/slotService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiError } from '../utils/apiError';

export class DoctorController {
  static async getDoctors(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, specialization, page = 1, limit = 12 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = { status: 'ACTIVE' };

      if (specialization) {
        filter.specializationIds = specialization;
      }

      let doctorsQuery = Doctor.find(filter)
        .populate('userId', 'name email phone status')
        .populate('specializationIds', 'name description');

      if (search) {
        // Find users matching name
        doctorsQuery = doctorsQuery.where({
          $or: [
            { bio: { $regex: search as string, $options: 'i' } },
          ],
        });
      }

      const doctors = await doctorsQuery.skip(skip).limit(Number(limit));
      const total = await Doctor.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: { doctors, total, page: Number(page), limit: Number(limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await Doctor.findById(req.params.id)
        .populate('userId', 'name email phone')
        .populate('specializationIds', 'name description');

      if (!doctor) {
        throw ApiError.notFound('Doctor profile not found');
      }

      return res.status(200).json({
        success: true,
        data: { doctor },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const doctorId = req.params.id;
      const dateStr = req.query.date as string; // YYYY-MM-DD
      const patientId = req.user?.patientId;

      if (!dateStr) {
        throw ApiError.badRequest('Query parameter "date" (YYYY-MM-DD) is required');
      }

      const slots = await SlotService.getDoctorAvailability(doctorId, dateStr, patientId);

      return res.status(200).json({
        success: true,
        data: { doctorId, date: dateStr, slots },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user?.doctorId;
      if (!doctorId) throw ApiError.forbidden('User is not a registered doctor');

      const { workingHours, slotDuration } = req.body;
      const updateData: any = {};
      if (workingHours) updateData.workingHours = workingHours;
      if (slotDuration) updateData.slotDuration = slotDuration;

      const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, { new: true })
        .populate('userId', 'name email')
        .populate('specializationIds', 'name');

      return res.status(200).json({
        success: true,
        message: 'Availability settings updated successfully',
        data: { doctor: updatedDoctor },
      });
    } catch (error) {
      next(error);
    }
  }
}
