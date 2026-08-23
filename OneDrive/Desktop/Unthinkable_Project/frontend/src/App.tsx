import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { DoctorSearchPage } from './pages/patient/DoctorSearchPage';
import { BookingFlowPage } from './pages/patient/BookingFlowPage';
import { PatientAppointmentsPage } from './pages/patient/PatientAppointmentsPage';
import { MedicalHistoryPage } from './pages/patient/MedicalHistoryPage';
import { MedicationsPage } from './pages/patient/MedicationsPage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { ConsultationRecorderPage } from './pages/doctor/ConsultationRecorderPage';
import { DoctorAvailabilityPage } from './pages/doctor/DoctorAvailabilityPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorManagementPage } from './pages/admin/DoctorManagementPage';
import { DoctorLeavePage } from './pages/admin/DoctorLeavePage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/doctors" element={<DoctorSearchPage />} />

              {/* Patient Routes */}
              <Route
                path="/book/:doctorId"
                element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <BookingFlowPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/appointments"
                element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <PatientAppointmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/medical-history"
                element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <MedicalHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/medications"
                element={
                  <ProtectedRoute roles={['PATIENT']}>
                    <MedicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/appointments"
                element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/consultation/:appointmentId"
                element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <ConsultationRecorderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/availability"
                element={
                  <ProtectedRoute roles={['DOCTOR']}>
                    <DoctorAvailabilityPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/doctors"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <DoctorManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leaves"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <DoctorLeavePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
