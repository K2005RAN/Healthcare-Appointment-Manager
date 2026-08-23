# AuraHealth — Production Healthcare Appointment & Follow-up Manager

AuraHealth is a production-quality, full-stack Healthcare SaaS platform that connects **Patients**, **Doctors**, and **Administrators** to support the complete healthcare appointment lifecycle.

Built from scratch with React, TypeScript, Express, MongoDB Atlas, AI integrations (Pre & Post visit summaries), concurrency-safe slot holds, doctor leave conflict resolution, exponential notification retries, and Google Calendar sync.

---

## 1. Key Platform Features

### 🏥 Patient Portal
- **Doctor Discovery**: Search doctors by name or medical specialization (Cardiology, Dermatology, Pediatrics, Orthopedics, General Physician, etc.).
- **Dynamic Slot Selection**: Real-time availability generation accounting for doctor working hours, breaks, existing appointments, active holds, and doctor leaves.
- **5-Minute Slot Hold**: Atomic slot hold mechanism with live UI countdown to reserve slots during symptom entry.
- **AI Pre-Visit Symptom Summaries**: Patient symptoms are synthesized asynchronously into structured clinical summaries for doctors.
- **Digital Prescriptions & Reminders**: View prescriptions and receive automated email reminders based on dosage schedules.
- **Google Calendar Synchronization**: Non-blocking OAuth integration to sync appointments.

### 🩺 Doctor Portal
- **Clinical Agenda Dashboard**: View today's appointments and patient history.
- **AI Pre-Visit Symptom View**: Read AI-generated symptom summaries with Urgency Indicators (`Low`, `Medium`, `High`) and suggested diagnostic questions before starting consultations.
- **Consultation & Prescription Recorder**: Record clinical notes, assessment, treatment plans, and prescribe digital medications.
- **AI Post-Visit Summaries**: Converts clinical notes into plain-language patient follow-up guidelines.
- **Availability Management**: Configure weekly shift hours, break periods, and slot durations.

### 🛡️ Admin Portal
- **Analytics Dashboard**: Real-time metrics and Recharts visualizations (Appointments trend, status distribution).
- **Doctor Directory Management**: Onboard new doctors, set consultation fees, and assign specializations.
- **Doctor Leave Conflict Engine**: Schedule doctor leaves with automatic conflict analysis ("X appointments affected"), cancellation execution, and patient notifications.
- **Notification Queue Monitor**: Track failed email notifications and trigger exponential backoff retries.
- **System Audit Logs**: Immutable audit log viewer tracking platform actions.

---

## 2. Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, TanStack Query, React Hook Form, Zod.
- **Backend**: Node.js, TypeScript, Express.js (Clean Architecture: Controller -> Service -> Repository -> Mongoose Model).
- **Database**: MongoDB Atlas / Mongoose (Strict validation, Compound Indexes, Transactions, Sessions, TTL Indexes).
- **Security & Auth**: JWT (AccessToken + HTTP-only Refresh Cookies), Passwords hashed with bcryptjs.
- **Async Workers & Retry**: Exponential backoff notification queue with BullMQ / Redis support & in-memory fallback.
- **Integrations**: Structured AI Synthesis (Google Gemini / OpenAI), Nodemailer, Google Calendar OAuth 2.0.

---

## 3. Database Architecture & Collections

The MongoDB database consists of 16 decoupled collections:

1. `User` - User identity, role (`PATIENT` | `DOCTOR` | `ADMIN`), status. *Unique Index*: `email`.
2. `Patient` - Patient demographic profile. *Index*: `userId`.
3. `Doctor` - Doctor profile, specialization refs, fee, working hours schema. *Index*: `userId`.
4. `Specialization` - Medical specializations. *Unique Index*: `name`.
5. `DoctorLeave` - Doctor leave records. *Indexes*: `doctorId`, `doctorId + startDate + endDate`.
6. `SlotHold` - Temporary 5-minute reservations. *TTL Index*: `expiresAt`. *Compound Index*: `doctorId + startTime + status`.
7. `Appointment` - Core appointment record. *Indexes*: `doctorId + startTime`, `patientId + startTime`, `status`.
8. `SymptomSubmission` - Patient pre-visit symptoms.
9. `PreVisitSummary` - AI-generated clinical summaries with urgency levels.
10. `Consultation` - Doctor diagnosis, clinical notes, treatment plan.
11. `Prescription` - Prescribed medications list with dosage and frequency.
12. `MedicationReminder` - Patient medication schedule. *Indexes*: `status + nextReminderAt`.
13. `Notification` - Email log & retry state. *Indexes*: `status + nextRetryAt`.
14. `GoogleCalendarConnection` - OAuth tokens. *Unique Index*: `userId`.
15. `CalendarEvent` - Synced Google Calendar event IDs.
16. `AuditLog` - Platform security logs. *Indexes*: `userId + createdAt`, `entity + entityId`.

---

## 4. Double-Booking Prevention & System Design

### Simultaneous Booking Prevention
The system uses a **two-tier concurrency protection architecture**:
1. **Atomic `SlotHold` creation**: When a patient selects a time slot, the system attempts to create a document in the `SlotHold` collection. A compound unique index on `doctorId + startTime + status('HELD')` ensures that simultaneous requests for the exact same slot fail atomically at the database level.
2. **MongoDB Session Transaction (`session.startTransaction()`)**: Upon confirmation, the booking service opens a multi-document MongoDB transaction:
   - Validates patient, doctor, working hours, and doctor leave.
   - Checks active appointment collisions for `doctorId + startTime`.
   - Creates `Appointment` document.
   - Atomically updates `SlotHold` status to `CONFIRMED`.
   - Commits transaction.
   - Rejections return exact error JSON:
     ```json
     {
       "success": false,
       "error": {
         "code": "SLOT_ALREADY_BOOKED",
         "message": "This appointment slot is no longer available."
       }
     }
     ```

### Non-Blocking Post-Commit Architecture
External APIs (AI generation, Nodemailer, Google Calendar) are executed **after** the MongoDB transaction commits (`process.nextTick()`). If Google Calendar or AI API fails, the appointment remains 100% confirmed, and error states are recorded gracefully with manual retry capabilities.

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### Installation

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install
```

### Seeding the Database
Populates initial specializations, admin user, 5 doctors, 5 patients, and demo appointments.

```bash
cd backend
npm run seed
```

**Demo Credentials**:
- **Admin**: `admin@example.com` / `admin123`
- **Doctor**: `sarah.jenkins@aurahealth.com` / `password123`
- **Patient**: `emily.watson@example.com` / `password123`

---

## 6. Running Concurrency Stress Test

To verify double-booking prevention under simultaneous request loads, run the included stress test:

```bash
cd backend
npm run test:concurrency
```

**Expected Result**:
5 simultaneous HTTP booking requests are fired for the exact same doctor and time slot. Exactly **1 request succeeds** and **4 requests are rejected** with code `SLOT_ALREADY_BOOKED`.

---

## 7. Running the Full Stack Application

```bash
# Terminal 1: Run Backend API Server (Port 5000)
cd backend
npm run dev

# Terminal 2: Run Frontend Vite Server (Port 3000)
cd frontend
npm run dev
```

Open your browser to `http://localhost:3000`.

---

## 8. API Documentation Quick Reference

| Method | Endpoint | Description | Auth Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new patient account | Public |
| `POST` | `/api/auth/login` | User login (returns JWT) | Public |
| `GET` | `/api/doctors` | List active doctors & search | Public |
| `GET` | `/api/doctors/:id/availability` | Dynamic slot availability generator | Public / Patient |
| `POST` | `/api/appointments/hold` | Hold slot for 5 minutes | PATIENT |
| `POST` | `/api/appointments` | Confirm appointment (Transaction) | PATIENT |
| `POST` | `/api/appointments/:id/symptoms` | Submit symptoms & trigger AI | PATIENT |
| `POST` | `/api/appointments/:id/consultation` | Record doctor consultation & prescription | DOCTOR |
| `GET` | `/api/patient/summaries` | View AI post-visit summaries | PATIENT |
| `GET` | `/api/admin/dashboard` | Admin analytics & system stats | ADMIN |
| `POST` | `/api/admin/doctors/:id/leave` | Create doctor leave with conflict resolution | ADMIN |
| `GET` | `/api/admin/notifications` | Monitor failed notification queue | ADMIN |
| `GET` | `/api/admin/audit-logs` | Platform audit trail | ADMIN |
