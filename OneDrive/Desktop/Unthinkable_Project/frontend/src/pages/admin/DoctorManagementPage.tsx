import React, { useState, useEffect } from 'react';
import { doctorApi, adminApi } from '../../api/services';
import { Doctor, Specialization } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, UserCheck, Stethoscope } from 'lucide-react';

export const DoctorManagementPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    specializationIds: [] as string[],
    experience: 5,
    bio: '',
    consultationFee: 100,
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docRes, specRes] = await Promise.all([
        doctorApi.getDoctors({ page: 1 }),
        adminApi.getSpecializations(),
      ]);
      if (docRes.success) setDoctors(docRes.data.doctors);
      if (specRes.success) setSpecializations(specRes.data.specializations);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminApi.createDoctor({
        ...formData,
        specializationIds: formData.specializationIds.length > 0 ? formData.specializationIds : [specializations[0]?._id],
      });
      if (res.success) {
        showToast('Doctor created successfully!', 'success');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Failed to create doctor', 'error');
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Doctor Directory Management</h1>
              <p className="text-slate-500 mt-1">Register new doctors, adjust consultation fees, and assign specializations.</p>
            </div>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
              Add New Doctor
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Doctor Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Specialization</th>
                    <th className="p-3">Experience</th>
                    <th className="p-3">Fee</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((d) => (
                    <tr key={d._id}>
                      <td className="p-3 font-bold text-slate-900">{d.userId?.name}</td>
                      <td className="p-3 text-slate-500">{d.userId?.email}</td>
                      <td className="p-3">{d.specializationIds?.[0]?.name || 'General'}</td>
                      <td className="p-3">{d.experience} Years</td>
                      <td className="p-3 font-bold">₹{d.consultationFee}</td>
                      <td className="p-3">
                        <Badge variant={d.status === 'ACTIVE' ? 'success' : 'warning'}>{d.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add Doctor Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Doctor">
        <form onSubmit={handleCreateDoctor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              placeholder="Dr. Jane Smith"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              placeholder="jane.smith@medibridge.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (₹)</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
            <select
              value={formData.specializationIds[0] || ''}
              onChange={(e) => setFormData({ ...formData, specializationIds: [e.target.value] })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
            >
              {specializations.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Qualifications</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
              placeholder="Specialist biography..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Doctor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
