import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/', DoctorController.getDoctors);
router.get('/:id', DoctorController.getDoctorById);
router.get('/:id/availability', DoctorController.getDoctorAvailability);

router.patch(
  '/availability',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  DoctorController.updateMyAvailability
);

export default router;
