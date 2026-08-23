import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User, UserRole, UserStatus } from '../models/User';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { Specialization } from '../models/Specialization';
import { Appointment, AppointmentStatus } from '../models/Appointment';
import { SymptomSubmission } from '../models/SymptomSubmission';
import { PreVisitSummary, UrgencyLevel, AISummaryStatus } from '../models/PreVisitSummary';
import { Consultation } from '../models/Consultation';
import { Prescription } from '../models/Prescription';
import { MedicationReminder } from '../models/MedicationReminder';
import { DoctorLeave } from '../models/DoctorLeave';
import { AuditLog, AuditAction } from '../models/AuditLog';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');

    await mongoose.connection.dropDatabase();

    console.log('[Seed] Creating Specializations...');
    const specs = await Specialization.create([
      { name: 'Cardiology', description: 'Heart and cardiovascular system care' },
      { name: 'Dermatology', description: 'Skin, hair, and nail treatments' },
      { name: 'General Physician', description: 'Primary healthcare and internal medicine' },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
      { name: 'Orthopedics', description: 'Musculoskeletal system and bone care' },
      { name: 'Dentistry', description: 'Oral and dental health care' },
    ]);

    const defaultPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    console.log('[Seed] Creating Admin Account...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      phone: '+1 (555) 000-1111',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    console.log('[Seed] Creating Sample Doctors...');
    const doctorData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@aurahealth.com',
        specIndex: 0, // Cardiology
        experience: 12,
        consultationFee: 1500,
        bio: 'Board-certified cardiologist specializing in preventive cardiology, hypertension, and heart disease management.',
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@aurahealth.com',
        specIndex: 1, // Dermatology
        experience: 9,
        consultationFee: 1200,
        bio: 'Dermatologist dedicated to treating eczema, acne, psoriasis, and performing aesthetic skin checks.',
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@aurahealth.com',
        specIndex: 2, // General Physician
        experience: 15,
        consultationFee: 800,
        bio: 'Senior General Physician focusing on comprehensive wellness, chronic disease management, and diagnostic care.',
      },
      {
        name: 'Dr. David Chen',
        email: 'david.chen@aurahealth.com',
        specIndex: 3, // Pediatrics
        experience: 8,
        consultationFee: 1000,
        bio: 'Pediatrician providing compassionate newborn, infant, and adolescent developmental care.',
      },
      {
        name: 'Dr. Robert Thorne',
        email: 'robert.thorne@aurahealth.com',
        specIndex: 4, // Orthopedics
        experience: 14,
        consultationFee: 1600,
        bio: 'Orthopedic specialist in joint replacement, sports injury rehabilitation, and spine mechanics.',
      },
    ];

    const doctorsList = [];
    for (const d of doctorData) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        passwordHash: defaultPassword,
        phone: '+1 (555) 234-5678',
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
      });

      const doctor = await Doctor.create({
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
      const user = await User.create({
        name: p.name,
        email: p.email,
        passwordHash: defaultPassword,
        phone: '+1 (555) 987-6543',
        role: UserRole.PATIENT,
        status: UserStatus.ACTIVE,
      });

      const patient = await Patient.create({
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
    const appt1 = await Appointment.create({
      patientId: patientsList[0]._id,
      doctorId: doctorsList[0]._id,
      startTime: tomorrow,
      endTime: appEnd,
      status: AppointmentStatus.CONFIRMED,
    });

    const symptoms1 = await SymptomSubmission.create({
      appointmentId: appt1._id,
      patientId: patientsList[0]._id,
      chiefComplaint: 'Mild chest tightness after exercise and shortness of breath',
      symptoms: ['Chest tightness', 'Shortness of breath', 'Fatigue'],
      duration: '3 days',
      severity: 'Moderate',
      additionalInfo: 'Worse when climbing stairs. Family history of heart disease.',
    });

    const summary1 = await PreVisitSummary.create({
      appointmentId: appt1._id,
      urgencyLevel: UrgencyLevel.MEDIUM,
      chiefComplaint: symptoms1.chiefComplaint,
      summary: 'Patient reports 3-day history of exercise-induced chest tightness accompanied by dyspnea.',
      suggestedQuestions: [
        'How frequently do episodes occur during exertion?',
        'Are there radiating pains down left arm or jaw?',
        'When was your last lipid panel performed?',
      ],
      status: AISummaryStatus.COMPLETED,
    });

    await Appointment.findByIdAndUpdate(appt1._id, {
      symptomSubmissionId: symptoms1._id,
      preVisitSummaryId: summary1._id,
    });

    // Appointment 2: Completed with Consultation & Prescription
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    pastDate.setHours(14, 0, 0, 0);
    const pastEnd = new Date(pastDate);
    pastEnd.setMinutes(30);

    const appt2 = await Appointment.create({
      patientId: patientsList[1]._id,
      doctorId: doctorsList[2]._id,
      startTime: pastDate,
      endTime: pastEnd,
      status: AppointmentStatus.COMPLETED,
    });

    const prescription2 = await Prescription.create({
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

    const consultation2 = await Consultation.create({
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

    await Appointment.findByIdAndUpdate(appt2._id, { consultationId: consultation2._id });

    await MedicationReminder.create({
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
    await AuditLog.create({
      userId: adminUser._id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: adminUser._id.toString(),
    });

    console.log('====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Credentials for login:');
    console.log(' Admin:   admin@example.com  / admin123');
    console.log(' Doctor:  sarah.jenkins@aurahealth.com / password123');
    console.log(' Patient: emily.watson@example.com / password123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
