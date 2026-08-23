import React, { useState, useEffect } from 'react';
import { adminApi, doctorApi } from '../../api/services';
import { Doctor, DoctorLeave } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { CalendarDays, AlertTriangle, Trash2, Plus } from 'lucide-react';

export const DoctorLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Conflict state
  const [conflictChecked, setConflictChecked] = useState(false);
  const [affectedCount, setAffectedCount] = useState(0);
  const [affectedAppointments, setAffectedAppointments] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesRes, docsRes] = await Promise.all([
        adminApi.getLeaves(),
        doctorApi.getDoctors({ page: 1 }),
      ]);
      if (leavesRes.success) setLeaves(leavesRes.data.leaves);
      if (docsRes.success) setDoctors(docsRes.data.doctors);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckConflicts = async () => {
    if (!selectedDoctorId || !startDate || !endDate) {
      showToast('Select doctor, start date, and end date', 'warning');
      return;
    }

    setIsChecking(true);
    try {
      const res = await adminApi.checkLeaveConflicts(selectedDoctorId, startDate, endDate);
      if (res.success) {
        setAffectedCount(res.data.affectedCount);
        setAffectedAppointments(res.data.affectedAppointments);
        setConflictChecked(true);
      }
    } catch (err: any) {
      showToast('Failed to check leave conflicts', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmLeave = async () => {
    if (!reason.trim()) {
      showToast('Please enter a reason for doctor leave', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.createLeave(selectedDoctorId, {
        startDate,
        endDate,
        reason,
      });

      if (res.success) {
        showToast(`Doctor leave scheduled. ${res.data.affectedAppointmentsCount} appointments notified.`, 'success');
        setShowModal(false);
        setConflictChecked(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Failed to schedule leave', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    try {
      const res = await adminApi.deleteLeave(id);
      if (res.success) {
        showToast('Doctor leave cancelled', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to cancel doctor leave', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Doctor Leave & Absence Management</h1>
              <p className="text-slate-500 mt-1">Schedule leaves with automatic appointment conflict detection and patient notification.</p>
            </div>
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setShowModal(true);
                setConflictChecked(false);
              }}
            >
              Schedule Leave
            </Button>
          </div>

          {/* Leaves Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle">
            <h2 className="text-base font-bold text-slate-900 mb-4">Active & Upcoming Doctor Leaves</h2>
            {leaves.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">End Date</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaves.map((l) => (
                      <tr key={l._id}>
                        <td className="p-3 font-bold text-slate-900">Dr. {l.doctorId?.userId?.name}</td>
                        <td className="p-3">{new Date(l.startDate).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(l.endDate).toLocaleDateString()}</td>
                        <td className="p-3 text-slate-500">{l.reason}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteLeave(l._id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Cancel Leave"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic text-center py-8">No active doctor leaves recorded.</p>
            )}
          </div>
        </main>
      </div>

      {/* Schedule Leave Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule Doctor Leave">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.userId?.name} ({d.specializationIds?.[0]?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual Medical Conference / Personal Emergency"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {/* Conflict Analysis Section */}
          {conflictChecked && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{affectedCount} appointments will be affected.</span>
              </div>
              <p>Confirming this leave will automatically cancel affected bookings and notify patients.</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            {!conflictChecked ? (
              <Button isLoading={isChecking} onClick={handleCheckConflicts}>
                Check Conflicts
              </Button>
            ) : (
              <Button variant="danger" isLoading={isSubmitting} onClick={handleConfirmLeave}>
                Confirm Leave & Notify Patients
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
