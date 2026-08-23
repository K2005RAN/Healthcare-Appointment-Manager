import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Consultation } from '../models/Consultation';
import { Prescription } from '../models/Prescription';
import { MedicationReminder } from '../models/MedicationReminder';
import { ApiError } from '../utils/apiError';

export class PatientController {
  static async getSummaries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.patientId;
      if (!patientId) throw ApiError.forbidden('User is not a patient');

      const summaries = await Consultation.find({ patientId })
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
    } catch (error) {
      next(error);
    }
  }

  static async getPrescriptions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.patientId;
      if (!patientId) throw ApiError.forbidden('User is not a patient');

      const prescriptions = await Prescription.find({ patientId })
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
    } catch (error) {
      next(error);
    }
  }

  static async getMedications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const patientId = req.user?.patientId;
      if (!patientId) throw ApiError.forbidden('User is not a patient');

      const medications = await MedicationReminder.find({ patientId })
        .sort({ createdAt: -1 })
        .populate('prescriptionId');

      return res.status(200).json({
        success: true,
        data: { medications },
      });
    } catch (error) {
      next(error);
    }
  }
}
