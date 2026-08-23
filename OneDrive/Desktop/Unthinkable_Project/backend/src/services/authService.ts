import bcrypt from 'bcryptjs';
import { User, IUser, UserRole, UserStatus } from '../models/User';
import { Patient, IPatient } from '../models/Patient';
import { Doctor, IDoctor } from '../models/Doctor';
import { AuditLog, AuditAction } from '../models/AuditLog';
import { generateTokens, verifyRefreshToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const { name, email, password, phone, dateOfBirth, gender, role = UserRole.PATIENT } = input;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists.', 'EMAIL_IN_USE');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role,
      status: UserStatus.ACTIVE,
    });

    let patientId: string | undefined;
    let doctorId: string | undefined;

    if (role === UserRole.PATIENT) {
      const patient = await Patient.create({
        userId: user._id,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        phone,
      });
      patientId = patient._id.toString();
    }

    await AuditLog.create({
      userId: user._id,
      action: AuditAction.REGISTER,
      entity: 'User',
      entityId: user._id.toString(),
      metadata: { role },
    });

    const tokens = generateTokens({
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

  static async login(input: LoginInput) {
    const { email, password } = input;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.forbidden(`Your account is currently ${user.status.toLowerCase()}. Please contact support.`, 'ACCOUNT_INACTIVE');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    let patientId: string | undefined;
    let doctorId: string | undefined;

    if (user.role === UserRole.PATIENT) {
      const patient = await Patient.findOne({ userId: user._id });
      if (patient) patientId = patient._id.toString();
    } else if (user.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) doctorId = doctor._id.toString();
    }

    await AuditLog.create({
      userId: user._id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user._id.toString(),
    });

    const tokens = generateTokens({
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

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw ApiError.unauthorized('Invalid or inactive user account');
      }

      let patientId: string | undefined;
      let doctorId: string | undefined;

      if (user.role === UserRole.PATIENT) {
        const patient = await Patient.findOne({ userId: user._id });
        if (patient) patientId = patient._id.toString();
      } else if (user.role === UserRole.DOCTOR) {
        const doctor = await Doctor.findOne({ userId: user._id });
        if (doctor) doctorId = doctor._id.toString();
      }

      const tokens = generateTokens({
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
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }
}
