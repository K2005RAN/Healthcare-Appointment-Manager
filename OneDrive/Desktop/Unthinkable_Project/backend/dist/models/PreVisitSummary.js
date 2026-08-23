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
exports.PreVisitSummary = exports.AISummaryStatus = exports.UrgencyLevel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["LOW"] = "Low";
    UrgencyLevel["MEDIUM"] = "Medium";
    UrgencyLevel["HIGH"] = "High";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
var AISummaryStatus;
(function (AISummaryStatus) {
    AISummaryStatus["PENDING"] = "PENDING";
    AISummaryStatus["COMPLETED"] = "COMPLETED";
    AISummaryStatus["FAILED"] = "FAILED";
})(AISummaryStatus || (exports.AISummaryStatus = AISummaryStatus = {}));
const PreVisitSummarySchema = new mongoose_1.Schema({
    appointmentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    urgencyLevel: { type: String, enum: Object.values(UrgencyLevel), default: UrgencyLevel.LOW },
    chiefComplaint: { type: String, default: '' },
    summary: { type: String, default: '' },
    suggestedQuestions: [{ type: String }],
    status: { type: String, enum: Object.values(AISummaryStatus), default: AISummaryStatus.PENDING },
    aiModel: { type: String, default: 'Gemini-1.5-Pro' },
    error: { type: String },
}, { timestamps: true });
PreVisitSummarySchema.index({ status: 1 });
exports.PreVisitSummary = mongoose_1.default.model('PreVisitSummary', PreVisitSummarySchema);
//# sourceMappingURL=PreVisitSummary.js.map