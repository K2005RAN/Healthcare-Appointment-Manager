import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/dashboard', AdminController.getDashboard);
router.post('/doctors', AdminController.createDoctor);
router.patch('/doctors/:id', AdminController.updateDoctor);

router.get('/doctors/:id/leave-conflicts', AdminController.checkLeaveConflicts);
router.post('/doctors/:id/leave', AdminController.createLeave);
router.get('/leaves', AdminController.getLeaves);
router.delete('/leaves/:id', AdminController.deleteLeave);

router.get('/specializations', AdminController.getSpecializations);
router.post('/specializations', AdminController.createSpecialization);

router.get('/notifications', AdminController.getFailedNotifications);
router.post('/notifications/:id/retry', AdminController.retryNotification);

router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
