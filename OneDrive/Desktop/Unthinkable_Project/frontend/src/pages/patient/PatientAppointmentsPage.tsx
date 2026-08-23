import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/services';
import { Appointment } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, XCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentApi.getAppointments({
        status: activeTab === 'ALL' ? undefined : activeTab,
      });
      if (res.success) setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppt) return;
    setActionLoading(true);
    try {
      const res = await appointmentApi.cancel(selectedAppt._id, cancelReason);
      if (res.success) {
        showToast('Appointment cancelled successfully', 'success');
        setShowCancelModal(false);
        fetchAppointments();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Healthcare Appointments</h1>
            <p className="text-slate-400 mt-1">Track upcoming consultations, reschedule, or review past visits.</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-4 mb-6">
            {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-brand-500/20 text-sky-350 border border-brand-500/30 shadow-glow-brand'
                    : 'bg-slate-950/60 text-slate-400 hover:bg-slate-900 border border-slate-850 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Appointments List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-32 glass-panel-accent rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="glass-panel-accent rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/15 text-sky-400 font-bold text-xl flex items-center justify-center shrink-0 border border-brand-500/30 shadow-glow-brand">
                      {appt.doctorId?.userId?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Dr. {appt.doctorId?.userId?.name}</h3>
                      <p className="text-xs text-slate-400 font-semibold">{appt.doctorId?.specializationIds?.[0]?.name}</p>
                      <p className="text-xs text-sky-450 font-bold mt-1">
                        {new Date(appt.startTime).toLocaleDateString()} at{' '}
                        {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge
                      variant={
                        appt.status === 'CONFIRMED'
                          ? 'success'
                          : appt.status === 'COMPLETED'
                          ? 'info'
                          : 'danger'
                      }
                    >
                      {appt.status}
                    </Badge>

                    {appt.status === 'CONFIRMED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-450 hover:bg-rose-500/10 hover:text-rose-300 border border-rose-900/30 transition-all duration-200"
                        onClick={() => {
                          setSelectedAppt(appt);
                          setShowCancelModal(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-950/60 rounded-3xl border border-slate-800">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Appointments Found</h3>
            </div>
          )}
        </main>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to cancel your appointment with Dr.{' '}
            <strong className="text-white">{selectedAppt?.doctorId?.userId?.name}</strong>?
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-350 mb-1.5">Reason for Cancellation</label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Conflict in schedule..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
              Keep Appointment
            </Button>
            <Button variant="danger" className="shadow-glow-rose" isLoading={actionLoading} onClick={handleCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
