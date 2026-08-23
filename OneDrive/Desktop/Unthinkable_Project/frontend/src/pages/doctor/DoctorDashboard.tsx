import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/services';
import { Appointment } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, User, BrainCircuit, Activity, Sparkles, CheckCircle } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentApi.getAppointments();
      if (res.success) setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(
    (a) => new Date(a.startTime).toISOString().split('T')[0] === todayStr
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          {/* Header Banner */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 inline-flex items-center gap-1.5 mb-3 shadow-glow-indigo">
                <Sparkles className="w-3.5 h-3.5" />
                Clinical Practice Portal
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome, {user?.name}
              </h1>
              <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-xl font-medium">
                Review AI pre-visit clinical briefings, assess urgency indicators, and record patient consultations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl glass-card-hover">
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Today's Consultations</p>
              <p className="text-3xl font-extrabold text-white mt-2">{todayAppointments.length}</p>
            </div>
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl glass-card-hover">
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Pending Appointments</p>
              <p className="text-3xl font-extrabold text-sky-400 mt-2">
                {appointments.filter((a) => a.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl glass-card-hover">
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Completed Consultations</p>
              <p className="text-3xl font-extrabold text-emerald-400 mt-2">
                {appointments.filter((a) => a.status === 'COMPLETED').length}
              </p>
            </div>
          </div>

          {/* Appointments Agenda Table */}
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              Patient Consultation Agenda
            </h2>

            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Patient</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">AI Urgency Brief</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {appointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="p-3.5 font-bold text-white">{appt.patientId?.userId?.name}</td>
                        <td className="p-3.5 text-slate-300">
                          {new Date(appt.startTime).toLocaleDateString()} at{' '}
                          {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3.5">
                          <Badge variant={appt.status === 'CONFIRMED' ? 'success' : appt.status === 'COMPLETED' ? 'info' : 'danger'}>
                            {appt.status}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          {appt.preVisitSummaryId ? (
                            <Badge
                              variant={
                                appt.preVisitSummaryId.urgencyLevel === 'High'
                                  ? 'danger'
                                  : appt.preVisitSummaryId.urgencyLevel === 'Medium'
                                  ? 'warning'
                                  : 'info'
                              }
                            >
                              {appt.preVisitSummaryId.urgencyLevel} Urgency
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Pending Brief</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="gradient"
                            size="sm"
                            leftIcon={<BrainCircuit className="w-4 h-4" />}
                            onClick={() => navigate(`/doctor/consultation/${appt._id}`)}
                          >
                            Start Consultation
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic py-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
                No patient appointments scheduled.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
