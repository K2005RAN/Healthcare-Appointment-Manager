import { Router } from 'express';
import authRoutes from './authRoutes';
import doctorRoutes from './doctorRoutes';
import appointmentRoutes from './appointmentRoutes';
import patientRoutes from './patientRoutes';
import googleCalendarRoutes from './googleCalendarRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/patient', patientRoutes);
router.use('/google-calendar', googleCalendarRoutes);
router.use('/admin', adminRoutes);

export default router;
