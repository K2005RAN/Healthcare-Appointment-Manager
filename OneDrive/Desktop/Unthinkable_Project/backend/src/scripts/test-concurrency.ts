import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { User } from '../models/User';
import { AppointmentService } from '../services/appointmentService';

type TestSuccess = { patientIndex: number; success: true; appointmentId: string };
type TestFailure = { patientIndex: number; success: false; errorCode: string; message: string };
type TestResult = TestSuccess | TestFailure;

const runConcurrencyTest = async () => {
  try {
    console.log('\n==========================================================');
    console.log(' STARTING CONCURRENCY DOUBLE-BOOKING PREVENTION TEST');
    console.log('==========================================================\n');

    await connectDB();

    const doctor = await Doctor.findOne({ status: 'ACTIVE' });
    const patients = await Patient.find().limit(5);

    if (!doctor || patients.length < 2) {
      console.error('Test requirements not met. Run `npm run seed` first.');
      process.exit(1);
    }

    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 5);
    testDate.setHours(11, 0, 0, 0);

    const testEndDate = new Date(testDate);
    testEndDate.setMinutes(30);

    const startTimeIso = testDate.toISOString();
    const endTimeIso = testEndDate.toISOString();

    console.log(`[Target Slot]: ${startTimeIso} for Doctor ID: ${doctor._id}`);
    console.log(`[Simultaneous Requests]: Firing ${patients.length} concurrent booking requests at the exact same millisecond...\n`);

    const symptomsPayload = {
      chiefComplaint: 'Concurrency stress testing',
      symptoms: ['Test Symptom'],
      duration: '1 day',
      severity: 'Mild' as const,
    };

    const promises: Promise<TestResult>[] = patients.map((patient, index) => {
      return AppointmentService.confirmBooking({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        startTime: startTimeIso,
        endTime: endTimeIso,
        symptoms: symptomsPayload,
      })
        .then((res): TestSuccess => ({
          patientIndex: index + 1,
          success: true,
          appointmentId: res._id.toString(),
        }))
        .catch((err: any): TestFailure => ({
          patientIndex: index + 1,
          success: false,
          errorCode: err.errorCode || err.code || 'UNKNOWN_ERROR',
          message: err.message,
        }));
    });

    const results: TestResult[] = await Promise.all(promises);

    console.log('--- CONCURRENCY TEST RESULTS ---');
    let successCount = 0;
    let failureCount = 0;

    results.forEach((res) => {
      if (res.success) {
        successCount++;
        console.log(`✅ Patient #${res.patientIndex}: BOOKING SUCCESSFUL! (Appt ID: ${res.appointmentId})`);
      } else {
        failureCount++;
        console.log(`❌ Patient #${res.patientIndex}: BOOKING REJECTED! Code: [${res.errorCode}] - ${res.message}`);
      }
    });

    console.log('\n----------------------------------------------------------');
    console.log(`Total Successes: ${successCount} (Expected: 1)`);
    console.log(`Total Rejections: ${failureCount} (Expected: ${patients.length - 1})`);

    if (successCount === 1 && failureCount === patients.length - 1) {
      console.log('🎉 TEST PASSED! System successfully prevented double-booking under high concurrency!');
    } else {
      console.error('⚠️ TEST FAILED! Race condition detected.');
    }
    console.log('----------------------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Unhandled concurrency test failure:', error);
    process.exit(1);
  }
};

runConcurrencyTest();
