import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi, patientApi, calendarApi } from '../../api/services';
import { Appointment } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Stethoscope,
  Pill,
  FileText,
  PlusCircle,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appRes, medRes, sumRes, calRes] = await Promise.all([
        appointmentApi.getAppointments(),
        patientApi.getMedications(),
        patientApi.getSummaries(),
        calendarApi.getStatus().catch(() => ({ data: { isConnected: false } })),
      ]);

      if (appRes.success) setAppointments(appRes.data.appointments);
      if (medRes.success) setMedications(medRes.data.medications);
      if (sumRes.success) setSummaries(sumRes.data.summaries);
      if (calRes?.data?.isConnected) setCalendarConnected(true);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const res = await calendarApi.getConnectUrl();
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
        showToast('Google Calendar OAuth opened in a new window', 'info');
      }
    } catch (err: any) {
      showToast('Calendar connect feature active.', 'info');
    }
  };

  const nextAppointment = appointments.find((a) => a.status === 'CONFIRMED');
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          {/* Welcome Banner with Rich Dark Gradient */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-sky-300 text-xs font-bold border border-brand-500/30 inline-flex items-center gap-1.5 mb-3 shadow-glow-brand">
                <Sparkles className="w-3.5 h-3.5" />
                Patient Care Hub
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome back, {user?.name}
              </h1>
              <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-xl font-medium">
                Manage your healthcare appointments, view AI pre & post visit briefings, and track active medication schedules.
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-sky-400 flex items-center justify-center font-bold border border-brand-500/30 shrink-0 shadow-glow-brand">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Upcoming</p>
                <p className="text-2xl font-extrabold text-white">{appointments.filter((a) => a.status === 'CONFIRMED').length}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shrink-0 shadow-glow-teal">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-extrabold text-white">{completedCount}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30 shrink-0 shadow-glow-indigo">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Active Meds</p>
                <p className="text-2xl font-extrabold text-white">{medications.length}</p>
              </div>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold border border-sky-500/30 shrink-0 shadow-glow-brand">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">AI Summaries</p>
                <p className="text-2xl font-extrabold text-white">{summaries.length}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Left Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Next Scheduled Appointment Card */}
              <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-sky-400 flex items-center justify-center border border-brand-500/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Next Scheduled Consultation</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnectCalendar}
                    leftIcon={<Calendar className="w-4 h-4 text-sky-400" />}
                  >
                    {calendarConnected ? 'Google Calendar Sync Active' : 'Connect Google Calendar'}
                  </Button>
                </div>

                {nextAppointment ? (
                  <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl bg-slate-850 border border-slate-750">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
                        {nextAppointment.doctorId?.userId?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Dr. {nextAppointment.doctorId?.userId?.name}</h3>
                        <p className="text-xs text-slate-400 font-semibold">
                          {nextAppointment.doctorId?.specializationIds?.[0]?.name || 'Specialist Doctor'}
                        </p>
                        <p className="text-xs text-sky-400 font-bold mt-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-400" />
                          {new Date(nextAppointment.startTime).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(nextAppointment.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-10 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                    <Stethoscope className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">No upcoming appointments scheduled</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Search verified medical specialists with real-time dynamic availability and 5-minute slot holds.
                    </p>
                    <Link to="/doctors" className="mt-4 inline-block">
                      <Button variant="gradient" size="sm" className="shadow-glow-brand" leftIcon={<PlusCircle className="w-4 h-4" />}>
                        Find Doctor & Book
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent AI Visit Summary */}
              <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Latest AI Visit Summary & Guidelines
                </h2>

                {summaries.length > 0 ? (
                  <div className="p-6 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Diagnosis: {summaries[0].diagnosis}
                      </span>
                      <span className="text-[11px] text-purple-400 font-semibold">
                        {new Date(summaries[0].createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium leading-relaxed">
                      {summaries[0].patientFriendlySummary || summaries[0].clinicalNotes}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic p-4 bg-slate-950/60 rounded-xl border border-slate-800">No consultation summaries recorded yet.</p>
                )}
              </div>
            </div>

            {/* Right Side Column */}
            <div className="space-y-8">
              
              {/* Quick Actions Panel */}
              <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/doctors" className="block">
                    <Button variant="outline" className="w-full justify-start py-2.5" leftIcon={<Stethoscope className="w-4 h-4 text-sky-400" />}>
                      Book Appointment
                    </Button>
                  </Link>
                  <Link to="/patient/medical-history" className="block">
                    <Button variant="outline" className="w-full justify-start py-2.5" leftIcon={<FileText className="w-4 h-4 text-purple-400" />}>
                      View Prescriptions
                    </Button>
                  </Link>
                  <Link to="/patient/medications" className="block">
                    <Button variant="outline" className="w-full justify-start py-2.5" leftIcon={<Pill className="w-4 h-4 text-emerald-400" />}>
                      Medication Reminders
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Today's Medications Widget */}
              <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Active Medications</h3>
                  <Badge variant="info">{medications.length}</Badge>
                </div>
                {medications.length > 0 ? (
                  <div className="space-y-3">
                    {medications.map((m) => (
                      <div key={m._id} className="p-3.5 rounded-xl bg-slate-850 border border-slate-750 text-xs space-y-1">
                        <p className="font-bold text-white">{m.medicationName} ({m.dosage})</p>
                        <p className="text-slate-400 font-medium">{m.frequency} • {m.instructions}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No active medication reminders.</p>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
