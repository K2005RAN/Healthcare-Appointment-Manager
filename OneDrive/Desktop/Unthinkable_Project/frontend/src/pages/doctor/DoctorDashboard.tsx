import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi } from '../../api/services';
import { Appointment } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, User, BrainCircuit, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Doctor Portal — Welcome, {user?.name}</h1>
            <p className="text-slate-500 mt-1">Review AI pre-visit symptom summaries and record consultations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-subtle">
              <p className="text-xs text-slate-500 font-semibold uppercase">Today's Appointments</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{todayAppointments.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-subtle">
              <p className="text-xs text-slate-500 font-semibold uppercase">Pending Consultations</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {appointments.filter((a) => a.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card-subtle">
              <p className="text-xs text-slate-500 font-semibold uppercase">Completed Consultations</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {appointments.filter((a) => a.status === 'COMPLETED').length}
              </p>
            </div>
          </div>

          {/* Appointments Agenda Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Patient Appointment Agenda</h2>

            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">AI Urgency</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{appt.patientId?.userId?.name}</td>
                        <td className="p-3">
                          {new Date(appt.startTime).toLocaleDateString()} at{' '}
                          {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3">
                          <Badge variant={appt.status === 'CONFIRMED' ? 'success' : appt.status === 'COMPLETED' ? 'info' : 'danger'}>
                            {appt.status}
                          </Badge>
                        </td>
                        <td className="p-3">
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
                            <span className="text-xs text-slate-400">Pending</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            leftIcon={<BrainCircuit className="w-4 h-4" />}
                            onClick={() => navigate(`/doctor/consultation/${appt._id}`)}
                          >
                            Open Consultation
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic py-8 text-center">No patient appointments scheduled.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
