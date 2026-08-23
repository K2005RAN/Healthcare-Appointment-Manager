import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ConsultationService } from '../services/consultationService';
import { Consultation } from '../models/Consultation';
import { Prescription } from '../models/Prescription';
import { Appointment } from '../models/Appointment';
import { ApiError } from '../utils/apiError';

export class ConsultationController {
  static async recordConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user?.doctorId;
      if (!doctorId) throw ApiError.forbidden('Only doctors can record consultations');

      const appointmentId = req.params.id;
      const appt = await Appointment.findById(appointmentId);
      if (!appt) throw ApiError.notFound('Appointment not found');

      const { clinicalNotes, diagnosis, treatmentNotes, followUpInstructions, medications, prescriptionInstructions } = req.body;

      if (!clinicalNotes || !diagnosis || !treatmentNotes) {
        throw ApiError.badRequest('clinicalNotes, diagnosis, and treatmentNotes are required');
      }

      const result = await ConsultationService.recordConsultation({
        appointmentId,
        doctorId,
        patientId: appt.patientId.toString(),
        clinicalNotes,
        diagnosis,
        treatmentNotes,
        followUpInstructions: followUpInstructions || '',
        medications,
        prescriptionInstructions,
      });

      return res.status(201).json({
        success: true,
        message: 'Consultation recorded and prescriptions issued successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConsultation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const appointmentId = req.params.id;

      const consultation = await Consultation.findOne({ appointmentId })
        .populate('doctorId', 'userId')
        .populate('patientId', 'userId');

      const prescription = await Prescription.findOne({ appointmentId });

      if (!consultation) {
        throw ApiError.notFound('Consultation record not found for this appointment');
      }

      return res.status(200).json({
        success: true,
        data: { consultation, prescription },
      });
    } catch (error) {
      next(error);
    }
  }
}
