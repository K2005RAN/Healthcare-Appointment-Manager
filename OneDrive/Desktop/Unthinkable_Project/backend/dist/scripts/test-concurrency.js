"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const Doctor_1 = require("../models/Doctor");
const Patient_1 = require("../models/Patient");
const appointmentService_1 = require("../services/appointmentService");
const runConcurrencyTest = async () => {
    try {
        console.log('\n==========================================================');
        console.log(' STARTING CONCURRENCY DOUBLE-BOOKING PREVENTION TEST');
        console.log('==========================================================\n');
        await (0, db_1.connectDB)();
        const doctor = await Doctor_1.Doctor.findOne({ status: 'ACTIVE' });
        const patients = await Patient_1.Patient.find().limit(5);
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
            severity: 'Mild',
        };
        const promises = patients.map((patient, index) => {
            return appointmentService_1.AppointmentService.confirmBooking({
                doctorId: doctor._id.toString(),
                patientId: patient._id.toString(),
                startTime: startTimeIso,
                endTime: endTimeIso,
                symptoms: symptomsPayload,
            })
                .then((res) => ({
                patientIndex: index + 1,
                success: true,
                appointmentId: res._id.toString(),
            }))
                .catch((err) => ({
                patientIndex: index + 1,
                success: false,
                errorCode: err.errorCode || err.code || 'UNKNOWN_ERROR',
                message: err.message,
            }));
        });
        const results = await Promise.all(promises);
        console.log('--- CONCURRENCY TEST RESULTS ---');
        let successCount = 0;
        let failureCount = 0;
        results.forEach((res) => {
            if (res.success) {
                successCount++;
                console.log(`✅ Patient #${res.patientIndex}: BOOKING SUCCESSFUL! (Appt ID: ${res.appointmentId})`);
            }
            else {
                failureCount++;
                console.log(`❌ Patient #${res.patientIndex}: BOOKING REJECTED! Code: [${res.errorCode}] - ${res.message}`);
            }
        });
        console.log('\n----------------------------------------------------------');
        console.log(`Total Successes: ${successCount} (Expected: 1)`);
        console.log(`Total Rejections: ${failureCount} (Expected: ${patients.length - 1})`);
        if (successCount === 1 && failureCount === patients.length - 1) {
            console.log('🎉 TEST PASSED! System successfully prevented double-booking under high concurrency!');
        }
        else {
            console.error('⚠️ TEST FAILED! Race condition detected.');
        }
        console.log('----------------------------------------------------------\n');
        process.exit(0);
    }
    catch (error) {
        console.error('Unhandled concurrency test failure:', error);
        process.exit(1);
    }
};
runConcurrencyTest();
//# sourceMappingURL=test-concurrency.js.map