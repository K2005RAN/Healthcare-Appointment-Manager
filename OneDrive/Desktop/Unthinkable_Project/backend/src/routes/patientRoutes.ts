import { Router } from 'express';
import { PatientController } from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate, authorize(UserRole.PATIENT, UserRole.ADMIN));

router.get('/summaries', PatientController.getSummaries);
router.get('/prescriptions', PatientController.getPrescriptions);
router.get('/medications', PatientController.getMedications);

export default router;
