"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Patient_1 = require("../models/Patient");
const Doctor_1 = require("../models/Doctor");
const AuditLog_1 = require("../models/AuditLog");
const jwt_1 = require("../utils/jwt");
const apiError_1 = require("../utils/apiError");
class AuthService {
    static async register(input) {
        const { name, email, password, phone, dateOfBirth, gender, role = User_1.UserRole.PATIENT } = input;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw apiError_1.ApiError.conflict('An account with this email address already exists.', 'EMAIL_IN_USE');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            phone,
            role,
            status: User_1.UserStatus.ACTIVE,
        });
        let patientId;
        let doctorId;
        if (role === User_1.UserRole.PATIENT) {
            const patient = await Patient_1.Patient.create({
                userId: user._id,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                gender,
                phone,
            });
            patientId = patient._id.toString();
        }
        await AuditLog_1.AuditLog.create({
            userId: user._id,
            action: AuditLog_1.AuditAction.REGISTER,
            entity: 'User',
            entityId: user._id.toString(),
            metadata: { role },
        });
        const tokens = (0, jwt_1.generateTokens)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            patientId,
            doctorId,
        });
        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                patientId,
                doctorId,
            },
            ...tokens,
        };
    }
    static async login(input) {
        const { email, password } = input;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw apiError_1.ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
        }
        if (user.status !== User_1.UserStatus.ACTIVE) {
            throw apiError_1.ApiError.forbidden(`Your account is currently ${user.status.toLowerCase()}. Please contact support.`, 'ACCOUNT_INACTIVE');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw apiError_1.ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
        }
        let patientId;
        let doctorId;
        if (user.role === User_1.UserRole.PATIENT) {
            const patient = await Patient_1.Patient.findOne({ userId: user._id });
            if (patient)
                patientId = patient._id.toString();
        }
        else if (user.role === User_1.UserRole.DOCTOR) {
            const doctor = await Doctor_1.Doctor.findOne({ userId: user._id });
            if (doctor)
                doctorId = doctor._id.toString();
        }
        await AuditLog_1.AuditLog.create({
            userId: user._id,
            action: AuditLog_1.AuditAction.LOGIN,
            entity: 'User',
            entityId: user._id.toString(),
        });
        const tokens = (0, jwt_1.generateTokens)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            patientId,
            doctorId,
        });
        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                patientId,
                doctorId,
            },
            ...tokens,
        };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            const user = await User_1.User.findById(decoded.userId);
            if (!user || user.status !== User_1.UserStatus.ACTIVE) {
                throw apiError_1.ApiError.unauthorized('Invalid or inactive user account');
            }
            let patientId;
            let doctorId;
            if (user.role === User_1.UserRole.PATIENT) {
                const patient = await Patient_1.Patient.findOne({ userId: user._id });
                if (patient)
                    patientId = patient._id.toString();
            }
            else if (user.role === User_1.UserRole.DOCTOR) {
                const doctor = await Doctor_1.Doctor.findOne({ userId: user._id });
                if (doctor)
                    doctorId = doctor._id.toString();
            }
            const tokens = (0, jwt_1.generateTokens)({
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                patientId,
                doctorId,
            });
            return {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    patientId,
                    doctorId,
                },
                ...tokens,
            };
        }
        catch (error) {
            throw apiError_1.ApiError.unauthorized('Invalid or expired refresh token');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map