"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const consultationController_1 = require("../controllers/consultationController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/hold', (0, auth_1.authorize)(User_1.UserRole.PATIENT), appointmentController_1.AppointmentController.holdSlot);
router.post('/', (0, auth_1.authorize)(User_1.UserRole.PATIENT), appointmentController_1.AppointmentController.createAppointment);
router.get('/', appointmentController_1.AppointmentController.getAppointments);
router.get('/:id', appointmentController_1.AppointmentController.getAppointmentById);
router.post('/:id/reschedule', appointmentController_1.AppointmentController.reschedule);
router.post('/:id/cancel', appointmentController_1.AppointmentController.cancel);
// AI pre-visit summary routes
router.post('/:id/pre-visit-summary/retry', appointmentController_1.AppointmentController.retryPreVisitSummary);
// Consultation & Prescription routes
router.post('/:id/consultation', (0, auth_1.authorize)(User_1.UserRole.DOCTOR, User_1.UserRole.ADMIN), consultationController_1.ConsultationController.recordConsultation);
router.get('/:id/consultation', consultationController_1.ConsultationController.getConsultation);
exports.default = router;
//# sourceMappingURL=appointmentRoutes.js.map