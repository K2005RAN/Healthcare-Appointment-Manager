import { Router } from 'express';
import { GoogleCalendarController } from '../controllers/googleCalendarController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/callback', GoogleCalendarController.handleCallback);

router.use(authenticate);
router.post('/connect', GoogleCalendarController.getConnectUrl);
router.delete('/disconnect', GoogleCalendarController.disconnect);
router.get('/status', GoogleCalendarController.getStatus);

export default router;
