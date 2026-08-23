"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const doctorRoutes_1 = __importDefault(require("./doctorRoutes"));
const appointmentRoutes_1 = __importDefault(require("./appointmentRoutes"));
const patientRoutes_1 = __importDefault(require("./patientRoutes"));
const googleCalendarRoutes_1 = __importDefault(require("./googleCalendarRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/doctors', doctorRoutes_1.default);
router.use('/appointments', appointmentRoutes_1.default);
router.use('/patient', patientRoutes_1.default);
router.use('/google-calendar', googleCalendarRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map