"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patientController_1 = require("../controllers/patientController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.PATIENT, User_1.UserRole.ADMIN));
router.get('/summaries', patientController_1.PatientController.getSummaries);
router.get('/prescriptions', patientController_1.PatientController.getPrescriptions);
router.get('/medications', patientController_1.PatientController.getMedications);
exports.default = router;
//# sourceMappingURL=patientRoutes.js.map