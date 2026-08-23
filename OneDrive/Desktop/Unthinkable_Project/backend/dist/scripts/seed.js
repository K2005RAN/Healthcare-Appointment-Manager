"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Patient_1 = require("../models/Patient");
const Doctor_1 = require("../models/Doctor");
const Specialization_1 = require("../models/Specialization");
const Appointment_1 = require("../models/Appointment");
const SymptomSubmission_1 = require("../models/SymptomSubmission");
const PreVisitSummary_1 = require("../models/PreVisitSummary");
const Consultation_1 = require("../models/Consultation");
const Prescription_1 = require("../models/Prescription");
const MedicationReminder_1 = require("../models/MedicationReminder");
const AuditLog_1 = require("../models/AuditLog");
const seedDatabase = async () => {
    try {
        await (0, db_1.connectDB)();
        console.log('[Seed] Clearing existing collections...');
        await mongoose_1.default.connection.dropDatabase();
        console.log('[Seed] Creating Specializations...');
        const specs = await Specialization_1.Specialization.create([
            { name: 'Cardiology', description: 'Heart and cardiovascular system care' },
            { name: 'Dermatology', description: 'Skin, hair, and nail treatments' },
            { name: 'General Physician', description: 'Primary healthcare and internal medicine' },
            { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
            { name: 'Orthopedics', description: 'Musculoskeletal system and bone care' },
            { name: 'Dentistry', description: 'Oral and dental health care' },
        ]);
        const defaultPassword = await bcryptjs_1.default.hash('password123', 10);
        const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
        console.log('[Seed] Creating Admin Account...');
        const adminUser = await User_1.User.create({
            name: 'System Admin',
            email: 'admin@example.com',
            passwordHash: adminPassword,
            phone: '+1 (555) 000-1111',
            role: User_1.UserRole.ADMIN,
            status: User_1.UserStatus.ACTIVE,
        });
        console.log('[Seed] Creating Sample Doctors...');
        const doctorData = [
            {
                name: 'Dr. Sarah Jenkins',
                email: 'sarah.jenkins@medibridge.com',
                specIndex: 0, // Cardiology
                experience: 12,
                consultationFee: 1500,
                bio: 'Board-certified cardiologist specializing in preventive cardiology, hypertension, and heart disease management.',
            },
            {
                name: 'Dr. Marcus Vance',
                email: 'marcus.vance@medibridge.com',
                specIndex: 1, // Dermatology
                experience: 9,
                consultationFee: 1200,
                bio: 'Dermatologist dedicated to treating eczema, acne, psoriasis, and performing aesthetic skin checks.',
            },
            {
                name: 'Dr. Elena Rostova',
                email: 'elena.rostova@medibridge.com',
                specIndex: 2, // General Physician
                experience: 15,
                consultationFee: 800,
                bio: 'Senior General Physician focusing on comprehensive wellness, chronic disease management, and diagnostic care.',
            },
            {
                name: 'Dr. David Chen',
                email: 'david.chen@medibridge.com',
                specIndex: 3, // Pediatrics
                experience: 8,
                consultationFee: 1000,
                bio: 'Pediatrician providing compassionate newborn, infant, and adolescent developmental care.',
            },
            {
                name: 'Dr. Robert Thorne',
                email: 'robert.thorne@medibridge.com',
                specIndex: 4, // Orthopedics
                experience: 14,
                consultationFee: 1600,
                bio: 'Orthopedic specialist in joint replacement, sports injury rehabilitation, and spine mechanics.',
            },
        ];
        const doctorsList = [];
        for (const d of doctorData) {
            const user = await User_1.User.create({
                name: d.name,
                email: d.email,
                passwordHash: defaultPassword,
                phone: '+1 (555) 234-5678',
                role: User_1.UserRole.DOCTOR,
                status: User_1.UserStatus.ACTIVE,
            });
            const doctor = await Doctor_1.Doctor.create({
                userId: user._id,
                specializationIds: [specs[d.specIndex]._id],
                experience: d.experience,
                bio: d.bio,
                consultationFee: d.consultationFee,
                slotDuration: 30,
                workingHours: [
                    { dayOfWeek: 1, dayName: 'Monday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
                    { dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
                    { dayOfWeek: 3, dayName: 'Wednesday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
                    { dayOfWeek: 4, dayName: 'Thursday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
                    { dayOfWeek: 5, dayName: 'Friday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
                ],
                status: 'ACTIVE',
            });
            doctorsList.push(doctor);
        }
        console.log('[Seed] Creating Sample Patients...');
        const patientData = [
            { name: 'Emily Watson', email: 'emily.watson@example.com', gender: 'Female', dob: '1992-05-14' },
            { name: 'James Miller', email: 'james.miller@example.com', gender: 'Male', dob: '1985-11-20' },
            { name: 'Sophia Martinez', email: 'sophia.martinez@example.com', gender: 'Female', dob: '1998-03-08' },
            { name: 'Michael Brown', email: 'michael.brown@example.com', gender: 'Male', dob: '1976-08-30' },
            { name: 'Olivia Taylor', email: 'olivia.taylor@example.com', gender: 'Female', dob: '2001-01-25' },
        ];
        const patientsList = [];
        for (const p of patientData) {
            const user = await User_1.User.create({
                name: p.name,
                email: p.email,
                passwordHash: defaultPassword,
                phone: '+1 (555) 987-6543',
                role: User_1.UserRole.PATIENT,
                status: User_1.UserStatus.ACTIVE,
            });
            const patient = await Patient_1.Patient.create({
                userId: user._id,
                gender: p.gender,
                dateOfBirth: new Date(p.dob),
            });
            patientsList.push(patient);
        }
        console.log('[Seed] Creating Demo Appointments & Follow-ups...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        const appEnd = new Date(tomorrow);
        appEnd.setMinutes(30);
        // Appointment 1: Upcoming
        const appt1 = await Appointment_1.Appointment.create({
            patientId: patientsList[0]._id,
            doctorId: doctorsList[0]._id,
            startTime: tomorrow,
            endTime: appEnd,
            status: Appointment_1.AppointmentStatus.CONFIRMED,
        });
        const symptoms1 = await SymptomSubmission_1.SymptomSubmission.create({
            appointmentId: appt1._id,
            patientId: patientsList[0]._id,
            chiefComplaint: 'Mild chest tightness after exercise and shortness of breath',
            symptoms: ['Chest tightness', 'Shortness of breath', 'Fatigue'],
            duration: '3 days',
            severity: 'Moderate',
            additionalInfo: 'Worse when climbing stairs. Family history of heart disease.',
        });
        const summary1 = await PreVisitSummary_1.PreVisitSummary.create({
            appointmentId: appt1._id,
            urgencyLevel: PreVisitSummary_1.UrgencyLevel.MEDIUM,
            chiefComplaint: symptoms1.chiefComplaint,
            summary: 'Patient reports 3-day history of exercise-induced chest tightness accompanied by dyspnea.',
            suggestedQuestions: [
                'How frequently do episodes occur during exertion?',
                'Are there radiating pains down left arm or jaw?',
                'When was your last lipid panel performed?',
            ],
            status: PreVisitSummary_1.AISummaryStatus.COMPLETED,
        });
        await Appointment_1.Appointment.findByIdAndUpdate(appt1._id, {
            symptomSubmissionId: symptoms1._id,
            preVisitSummaryId: summary1._id,
        });
        // Appointment 2: Completed with Consultation & Prescription
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 3);
        pastDate.setHours(14, 0, 0, 0);
        const pastEnd = new Date(pastDate);
        pastEnd.setMinutes(30);
        const appt2 = await Appointment_1.Appointment.create({
            patientId: patientsList[1]._id,
            doctorId: doctorsList[2]._id,
            startTime: pastDate,
            endTime: pastEnd,
            status: Appointment_1.AppointmentStatus.COMPLETED,
        });
        const prescription2 = await Prescription_1.Prescription.create({
            appointmentId: appt2._id,
            doctorId: doctorsList[2]._id,
            patientId: patientsList[1]._id,
            medications: [
                {
                    name: 'Amoxicillin',
                    dosage: '500 mg',
                    frequency: 'Twice daily',
                    duration: '7 days',
                    instructions: 'Take with food and water',
                },
            ],
            instructions: 'Rest and stay hydrated.',
        });
        const consultation2 = await Consultation_1.Consultation.create({
            appointmentId: appt2._id,
            doctorId: doctorsList[2]._id,
            patientId: patientsList[1]._id,
            clinicalNotes: 'Patient presented with acute bacterial sinus infection.',
            diagnosis: 'Acute Sinusitis',
            treatmentNotes: 'Prescribed 7-day antibiotic course.',
            prescriptionId: prescription2._id,
            patientFriendlySummary: 'Your doctor confirmed an acute sinus infection and prescribed antibiotics. Complete the full 7-day course.',
            followUpInstructions: 'Return if fever or severe headache develops.',
        });
        await Appointment_1.Appointment.findByIdAndUpdate(appt2._id, { consultationId: consultation2._id });
        await MedicationReminder_1.MedicationReminder.create({
            patientId: patientsList[1]._id,
            prescriptionId: prescription2._id,
            medicationName: 'Amoxicillin',
            dosage: '500 mg',
            frequency: 'Twice daily',
            instructions: 'Take with food and water',
            nextReminderAt: new Date(Date.now() + 8 * 3600 * 1000),
            status: 'ACTIVE',
        });
        console.log('[Seed] Creating Audit Logs...');
        await AuditLog_1.AuditLog.create({
            userId: adminUser._id,
            action: AuditLog_1.AuditAction.LOGIN,
            entity: 'User',
            entityId: adminUser._id.toString(),
        });
        console.log('====================================================');
        console.log(' SEEDING COMPLETED SUCCESSFULLY!');
        console.log(' Credentials for login:');
        console.log(' Admin:   admin@example.com  / admin123');
        console.log(' Doctor:  sarah.jenkins@medibridge.com / password123');
        console.log(' Patient: emily.watson@example.com / password123');
        console.log('====================================================');
        process.exit(0);
    }
    catch (error) {
        console.error('[Seed Error]:', error);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map