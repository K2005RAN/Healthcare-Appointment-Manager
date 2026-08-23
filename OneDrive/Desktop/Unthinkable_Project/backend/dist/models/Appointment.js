"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = exports.AppointmentStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "PENDING";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["RESCHEDULED"] = "RESCHEDULED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
const AppointmentSchema = new mongoose_1.Schema({
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: Object.values(AppointmentStatus),
        default: AppointmentStatus.CONFIRMED,
        required: true,
    },
    symptomSubmissionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SymptomSubmission' },
    preVisitSummaryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PreVisitSummary' },
    consultationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Consultation' },
    googleCalendarEventIds: [{ type: String }],
    cancellationReason: { type: String },
}, { timestamps: true });
AppointmentSchema.index({ patientId: 1, startTime: 1 });
AppointmentSchema.index({ status: 1 });
// UNIQUE Partial Index: Guarantees that at most ONE active appointment (CONFIRMED/PENDING)
// can exist for a given doctor and time slot across the entire database!
AppointmentSchema.index({ doctorId: 1, startTime: 1 }, {
    unique: true,
    partialFilterExpression: {
        status: { $in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
    },
});
exports.Appointment = mongoose_1.default.model('Appointment', AppointmentSchema);
//# sourceMappingURL=Appointment.js.map