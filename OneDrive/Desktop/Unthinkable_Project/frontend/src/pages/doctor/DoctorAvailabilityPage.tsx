import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Clock, Check } from 'lucide-react';
import { doctorApi as docService } from '../../api/services';

export const DoctorAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [workingHours, setWorkingHours] = useState([
    { dayOfWeek: 1, dayName: 'Monday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
    { dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
    { dayOfWeek: 3, dayName: 'Wednesday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
    { dayOfWeek: 4, dayName: 'Thursday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
    { dayOfWeek: 5, dayName: 'Friday', startTime: '09:00', endTime: '17:00', breakStart: '13:00', breakEnd: '14:00', isActive: true },
    { dayOfWeek: 6, dayName: 'Saturday', startTime: '09:00', endTime: '13:00', isActive: false },
    { dayOfWeek: 0, dayName: 'Sunday', startTime: '09:00', endTime: '13:00', isActive: false },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await docService.updateAvailability({ workingHours, slotDuration });
      if (res.success) {
        showToast('Working hours & slot settings updated successfully', 'success');
      }
    } catch (err: any) {
      showToast('Failed to update availability settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Manage Availability & Working Hours</h1>
            <p className="text-slate-500 mt-1">Configure your recurring work shifts, breaks, and consultation slot durations.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle space-y-6">
            {/* Slot Duration */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">Appointment Slot Duration</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full sm:w-64 p-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            {/* Weekly Schedule Builder */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Weekly Practice Hours</h3>
              <div className="space-y-3">
                {workingHours.map((wh, idx) => (
                  <div key={wh.dayName} className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-3 w-32">
                      <input
                        type="checkbox"
                        checked={wh.isActive}
                        onChange={(e) => {
                          const updated = [...workingHours];
                          updated[idx].isActive = e.target.checked;
                          setWorkingHours(updated);
                        }}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className={wh.isActive ? 'text-slate-900 font-bold' : 'text-slate-400'}>{wh.dayName}</span>
                    </div>

                    {wh.isActive ? (
                      <div className="flex items-center gap-2">
                        <span>Shift:</span>
                        <input
                          type="time"
                          value={wh.startTime}
                          onChange={(e) => {
                            const updated = [...workingHours];
                            updated[idx].startTime = e.target.value;
                            setWorkingHours(updated);
                          }}
                          className="p-1.5 rounded border border-slate-300"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={wh.endTime}
                          onChange={(e) => {
                            const updated = [...workingHours];
                            updated[idx].endTime = e.target.value;
                            setWorkingHours(updated);
                          }}
                          className="p-1.5 rounded border border-slate-300"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-400 font-normal">Off / Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button isLoading={isSaving} onClick={handleSave} leftIcon={<Check className="w-4 h-4" />}>
                Save Schedule Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
