"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const Doctor_1 = require("../models/Doctor");
const slotService_1 = require("../services/slotService");
const apiError_1 = require("../utils/apiError");
class DoctorController {
    static async getDoctors(req, res, next) {
        try {
            const { search, specialization, page = 1, limit = 12 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const filter = { status: 'ACTIVE' };
            if (specialization) {
                filter.specializationIds = specialization;
            }
            let doctorsQuery = Doctor_1.Doctor.find(filter)
                .populate('userId', 'name email phone status')
                .populate('specializationIds', 'name description');
            if (search) {
                // Find users matching name
                doctorsQuery = doctorsQuery.where({
                    $or: [
                        { bio: { $regex: search, $options: 'i' } },
                    ],
                });
            }
            const doctors = await doctorsQuery.skip(skip).limit(Number(limit));
            const total = await Doctor_1.Doctor.countDocuments(filter);
            return res.status(200).json({
                success: true,
                data: { doctors, total, page: Number(page), limit: Number(limit) },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDoctorById(req, res, next) {
        try {
            const doctor = await Doctor_1.Doctor.findById(req.params.id)
                .populate('userId', 'name email phone')
                .populate('specializationIds', 'name description');
            if (!doctor) {
                throw apiError_1.ApiError.notFound('Doctor profile not found');
            }
            return res.status(200).json({
                success: true,
                data: { doctor },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDoctorAvailability(req, res, next) {
        try {
            const doctorId = req.params.id;
            const dateStr = req.query.date; // YYYY-MM-DD
            const patientId = req.user?.patientId;
            if (!dateStr) {
                throw apiError_1.ApiError.badRequest('Query parameter "date" (YYYY-MM-DD) is required');
            }
            const slots = await slotService_1.SlotService.getDoctorAvailability(doctorId, dateStr, patientId);
            return res.status(200).json({
                success: true,
                data: { doctorId, date: dateStr, slots },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMyAvailability(req, res, next) {
        try {
            const doctorId = req.user?.doctorId;
            if (!doctorId)
                throw apiError_1.ApiError.forbidden('User is not a registered doctor');
            const { workingHours, slotDuration } = req.body;
            const updateData = {};
            if (workingHours)
                updateData.workingHours = workingHours;
            if (slotDuration)
                updateData.slotDuration = slotDuration;
            const updatedDoctor = await Doctor_1.Doctor.findByIdAndUpdate(doctorId, updateData, { new: true })
                .populate('userId', 'name email')
                .populate('specializationIds', 'name');
            return res.status(200).json({
                success: true,
                message: 'Availability settings updated successfully',
                data: { doctor: updatedDoctor },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DoctorController = DoctorController;
//# sourceMappingURL=doctorController.js.map