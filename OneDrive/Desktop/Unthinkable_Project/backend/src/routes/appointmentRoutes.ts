import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { ConsultationController } from '../controllers/consultationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.post('/hold', authorize(UserRole.PATIENT), AppointmentController.holdSlot);
router.post('/', authorize(UserRole.PATIENT), AppointmentController.createAppointment);
router.get('/', AppointmentController.getAppointments);
router.get('/:id', AppointmentController.getAppointmentById);
router.post('/:id/reschedule', AppointmentController.reschedule);
router.post('/:id/cancel', AppointmentController.cancel);

// AI pre-visit summary routes
router.post('/:id/pre-visit-summary/retry', AppointmentController.retryPreVisitSummary);

// Consultation & Prescription routes
router.post('/:id/consultation', authorize(UserRole.DOCTOR, UserRole.ADMIN), ConsultationController.recordConsultation);
router.get('/:id/consultation', ConsultationController.getConsultation);

export default router;
