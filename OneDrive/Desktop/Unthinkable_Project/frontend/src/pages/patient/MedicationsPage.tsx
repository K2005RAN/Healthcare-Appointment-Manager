import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/services';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { Pill, Clock, CheckCircle } from 'lucide-react';

export const MedicationsPage: React.FC = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await patientApi.getMedications();
      if (res.success) setMedications(res.data.medications);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Medication Reminders</h1>
            <p className="text-slate-500 mt-1">Automated email alerts based on your active doctor prescriptions.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle">
            {medications.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medications.map((med) => (
                  <div key={med._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <Badge variant="success">{med.status}</Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{med.medicationName}</h3>
                      <p className="text-xs text-slate-500 font-semibold">{med.dosage}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                      <p><strong>Frequency:</strong> {med.frequency}</p>
                      {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                      <p className="text-brand-700 font-semibold pt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Next alert: {new Date(med.nextReminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No active medication schedules.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
