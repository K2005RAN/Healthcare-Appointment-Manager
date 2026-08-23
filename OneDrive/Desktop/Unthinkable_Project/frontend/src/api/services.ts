import { apiClient } from './client';
import {
  User,
  Doctor,
  Appointment,
  GeneratedSlot,
  SlotHold,
  Consultation,
  Prescription,
  Medication,
  DoctorLeave,
  Specialization,
  AuditLog,
  NotificationItem,
} from '../types';

export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data).then((res) => res.data),
  login: (data: any) => apiClient.post('/auth/login', data).then((res) => res.data),
  logout: () => apiClient.post('/auth/logout').then((res) => res.data),
};

export const doctorApi = {
  getDoctors: (params?: { search?: string; specialization?: string; page?: number }) =>
    apiClient.get('/doctors', { params }).then((res) => res.data),
  getDoctorById: (id: string) => apiClient.get(`/doctors/${id}`).then((res) => res.data),
  getAvailability: (id: string, date: string) =>
    apiClient.get<{ success: boolean; data: { slots: GeneratedSlot[] } }>(`/doctors/${id}/availability`, { params: { date } }).then((res) => res.data),
  updateAvailability: (data: { workingHours?: any[]; slotDuration?: number }) =>
    apiClient.patch('/doctors/availability', data).then((res) => res.data),
};

export const appointmentApi = {
  holdSlot: (data: { doctorId: string; startTime: string; endTime: string }) =>
    apiClient.post<{ success: boolean; data: { hold: SlotHold } }>('/appointments/hold', data).then((res) => res.data),
  confirmBooking: (data: {
    holdId?: string;
    doctorId: string;
    startTime: string;
    endTime: string;
    symptoms: any;
  }) => apiClient.post('/appointments', data).then((res) => res.data),
  getAppointments: (params?: { status?: string; date?: string; page?: number }) =>
    apiClient.get<{ success: boolean; data: { appointments: Appointment[]; total: number } }>('/appointments', { params }).then((res) => res.data),
  getAppointmentById: (id: string) =>
    apiClient.get<{ success: boolean; data: { appointment: Appointment } }>(`/appointments/${id}`).then((res) => res.data),
  reschedule: (id: string, newStartTime: string, newEndTime: string) =>
    apiClient.post(`/appointments/${id}/reschedule`, { newStartTime, newEndTime }).then((res) => res.data),
  cancel: (id: string, reason?: string) =>
    apiClient.post(`/appointments/${id}/cancel`, { reason }).then((res) => res.data),
  retryPreVisitSummary: (id: string) =>
    apiClient.post(`/appointments/${id}/pre-visit-summary/retry`).then((res) => res.data),
};

export const consultationApi = {
  recordConsultation: (appointmentId: string, data: any) =>
    apiClient.post(`/appointments/${appointmentId}/consultation`, data).then((res) => res.data),
  getConsultation: (appointmentId: string) =>
    apiClient.get(`/appointments/${appointmentId}/consultation`).then((res) => res.data),
};

export const patientApi = {
  getSummaries: () => apiClient.get('/patient/summaries').then((res) => res.data),
  getPrescriptions: () => apiClient.get('/patient/prescriptions').then((res) => res.data),
  getMedications: () => apiClient.get('/patient/medications').then((res) => res.data),
};

export const adminApi = {
  getDashboard: () => apiClient.get('/admin/dashboard').then((res) => res.data),
  createDoctor: (data: any) => apiClient.post('/admin/doctors', data).then((res) => res.data),
  updateDoctor: (id: string, data: any) => apiClient.patch(`/admin/doctors/${id}`, data).then((res) => res.data),
  checkLeaveConflicts: (doctorId: string, startDate: string, endDate: string) =>
    apiClient.get(`/admin/doctors/${doctorId}/leave-conflicts`, { params: { startDate, endDate } }).then((res) => res.data),
  createLeave: (doctorId: string, data: { startDate: string; endDate: string; reason: string }) =>
    apiClient.post(`/admin/doctors/${doctorId}/leave`, data).then((res) => res.data),
  getLeaves: () => apiClient.get('/admin/leaves').then((res) => res.data),
  deleteLeave: (id: string) => apiClient.delete(`/admin/leaves/${id}`).then((res) => res.data),
  getSpecializations: () => apiClient.get('/admin/specializations').then((res) => res.data),
  createSpecialization: (data: { name: string; description?: string }) =>
    apiClient.post('/admin/specializations', data).then((res) => res.data),
  getNotifications: (page = 1) => apiClient.get('/admin/notifications', { params: { page } }).then((res) => res.data),
  retryNotification: (id: string) => apiClient.post(`/admin/notifications/${id}/retry`).then((res) => res.data),
  getAuditLogs: (page = 1) => apiClient.get('/admin/audit-logs', { params: { page } }).then((res) => res.data),
};

export const calendarApi = {
  getConnectUrl: () => apiClient.post('/google-calendar/connect').then((res) => res.data),
  getStatus: () => apiClient.get('/google-calendar/status').then((res) => res.data),
  disconnect: () => apiClient.delete('/google-calendar/disconnect').then((res) => res.data),
};
