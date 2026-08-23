"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
class EmailService {
    static transporter = nodemailer_1.default.createTransport({
        host: env_1.env.EMAIL_HOST,
        port: env_1.env.EMAIL_PORT,
        secure: env_1.env.EMAIL_PORT === 465,
        auth: {
            user: env_1.env.EMAIL_USER,
            pass: env_1.env.EMAIL_PASSWORD,
        },
    });
    static async sendEmail(payload) {
        try {
            if (!env_1.env.EMAIL_USER || env_1.env.EMAIL_USER === 'dev@medibridge.com' || env_1.env.EMAIL_USER === 'mock_user') {
                // Log clean message for development when SMTP credentials are mock
                console.log(`[Email Simulation] To: ${payload.to} | Subject: ${payload.subject}`);
                return true;
            }
            await this.transporter.sendMail({
                from: env_1.env.EMAIL_FROM,
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                text: payload.text || payload.subject,
            });
            console.log(`[Email Sent Successfully] To: ${payload.to}`);
            return true;
        }
        catch (error) {
            console.error(`[Email Send Error] To: ${payload.to}:`, error);
            throw error;
        }
    }
    // --- Responsive HTML Email Templates ---
    static getBookingConfirmationTemplate(data) {
        const subject = `Appointment Confirmed with Dr. ${data.doctorName} - MediBridge`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <div style="background-color: #0284c7; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MediBridge</h1>
          <p style="color: #e0f2fe; margin: 5px 0 0 0;">Healthcare Appointments & Follow-up Manager</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">Appointment Confirmed</h2>
          <p style="color: #475569;">Dear <strong>${data.patientName}</strong>,</p>
          <p style="color: #475569;">Your healthcare appointment has been successfully scheduled and confirmed.</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Doctor:</strong> Dr. ${data.doctorName} (${data.specialization})</p>
            <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Date:</strong> ${data.date}</p>
            <p style="margin: 0; color: #0f172a;"><strong>Time:</strong> ${data.time}</p>
          </div>

          <p style="color: #475569;">You will receive an AI-generated pre-visit summary and reminders prior to your consultation.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">MediBridge SaaS • Confidential Healthcare Communication</p>
        </div>
      </div>
    `;
        return { subject, html };
    }
    static getCancellationTemplate(data) {
        const subject = `Appointment Cancelled - Dr. ${data.doctorName}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MediBridge</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">Appointment Cancellation Notice</h2>
          <p style="color: #475569;">Dear <strong>${data.patientName}</strong>,</p>
          <p style="color: #475569;">Your appointment scheduled for <strong>${data.date} at ${data.time}</strong> with Dr. ${data.doctorName} has been cancelled.</p>
          ${data.reason ? `<p style="color: #475569;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
          <p style="color: #475569;">You can log into your patient dashboard at any time to select a new available date and time.</p>
        </div>
      </div>
    `;
        return { subject, html };
    }
    static getDoctorBookingNotificationTemplate(data) {
        const subject = `New Appointment Scheduled: ${data.patientName} - MediBridge`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MediBridge Doctor Hub</h1>
          <p style="color: #94a3b8; margin: 5px 0 0 0;">New Patient Appointment Notification</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">New Consultation Scheduled</h2>
          <p style="color: #475569;">Dear <strong>Dr. ${data.doctorName}</strong>,</p>
          <p style="color: #475569;">A new patient has booked an appointment slot on your calendar.</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Patient Name:</strong> ${data.patientName}</p>
            <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Date:</strong> ${data.date}</p>
            <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>Time:</strong> ${data.time}</p>
            ${data.chiefComplaint ? `<p style="margin: 0; color: #0f172a;"><strong>Chief Complaint:</strong> ${data.chiefComplaint}</p>` : ''}
          </div>

          <p style="color: #475569;">An AI pre-visit summary will be synthesized and attached to this patient's chart prior to consultation.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">MediBridge Clinical SaaS System Notification</p>
        </div>
      </div>
    `;
        return { subject, html };
    }
    static getDoctorCancellationTemplate(data) {
        const subject = `Appointment Cancelled: ${data.patientName}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MediBridge Slot Freed</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">Appointment Cancellation Notice</h2>
          <p style="color: #475569;">Dear <strong>Dr. ${data.doctorName}</strong>,</p>
          <p style="color: #475569;">The appointment with <strong>${data.patientName}</strong> scheduled for <strong>${data.date} at ${data.time}</strong> has been cancelled.</p>
          ${data.reason ? `<p style="color: #475569;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
          <p style="color: #10b981; font-weight: bold;">This time slot has been freed and made available on your booking calendar.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">MediBridge Clinical SaaS System Notification</p>
        </div>
      </div>
    `;
        return { subject, html };
    }
    static getRescheduleTemplate(data) {
        const subject = `Appointment Rescheduled with Dr. ${data.doctorName}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MediBridge</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">Appointment Time Updated</h2>
          <p style="color: #475569;">Dear <strong>${data.patientName}</strong>,</p>
          <p style="color: #475569;">Your consultation with Dr. ${data.doctorName} has been rescheduled to:</p>
          <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>New Date:</strong> ${data.newDate}</p>
            <p style="margin: 0; color: #0f172a;"><strong>New Time:</strong> ${data.newTime}</p>
          </div>
          <p style="color: #475569;">You can log into your patient dashboard at any time to review your appointment details.</p>
        </div>
      </div>
    `;
        return { subject, html };
    }
    static getDoctorRescheduleTemplate(data) {
        const subject = `Appointment Rescheduled: ${data.patientName}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <div style="background-color: #6366f1; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MediBridge</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; margin-top: 0;">Patient Appointment Rescheduled</h2>
          <p style="color: #475569;">Dear <strong>Dr. ${data.doctorName}</strong>,</p>
          <p style="color: #475569;">The appointment with patient <strong>${data.patientName}</strong> has been updated to:</p>
          <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0; color: #0f172a;"><strong>New Date:</strong> ${data.newDate}</p>
            <p style="margin: 0; color: #0f172a;"><strong>New Time:</strong> ${data.newTime}</p>
          </div>
        </div>
      </div>
    `;
        return { subject, html };
    }
    static getMedicationReminderTemplate(data) {
        const subject = `Medication Reminder: ${data.medicationName} (${data.dosage})`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
        <div style="background-color: #10b981; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">MediBridge Medication Reminder</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <p style="color: #475569;">Hello <strong>${data.patientName}</strong>,</p>
          <p style="color: #475569;">This is a friendly reminder to take your prescribed medication:</p>
          
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 5px 0; color: #065f46;">${data.medicationName}</h3>
            <p style="margin: 0 0 5px 0; color: #047857;"><strong>Dosage:</strong> ${data.dosage}</p>
            <p style="margin: 0 0 5px 0; color: #047857;"><strong>Frequency:</strong> ${data.frequency}</p>
            ${data.instructions ? `<p style="margin: 0; color: #047857;"><strong>Instructions:</strong> ${data.instructions}</p>` : ''}
          </div>
        </div>
      </div>
    `;
        return { subject, html };
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map