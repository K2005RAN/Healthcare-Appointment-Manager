"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorController_1 = require("../controllers/doctorController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/', doctorController_1.DoctorController.getDoctors);
router.get('/:id', doctorController_1.DoctorController.getDoctorById);
router.get('/:id/availability', doctorController_1.DoctorController.getDoctorAvailability);
router.patch('/availability', auth_1.authenticate, (0, auth_1.authorize)(User_1.UserRole.DOCTOR, User_1.UserRole.ADMIN), doctorController_1.DoctorController.updateMyAvailability);
exports.default = router;
//# sourceMappingURL=doctorRoutes.js.map