import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/services';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { FileText, Stethoscope, Sparkles, Printer } from 'lucide-react';

export const MedicalHistoryPage: React.FC = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [sumRes, presRes] = await Promise.all([
        patientApi.getSummaries(),
        patientApi.getPrescriptions(),
      ]);
      if (sumRes.success) setSummaries(sumRes.data.summaries);
      if (presRes.success) setPrescriptions(presRes.data.prescriptions);
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Medical History & Prescriptions</h1>
            <p className="text-slate-500 mt-1">Review consultation summaries, clinical diagnoses, and prescribed medicines.</p>
          </div>

          <div className="space-y-8">
            {/* Consultation Summaries */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Post-Visit Consultation Summaries
              </h2>

              {summaries.length > 0 ? (
                <div className="space-y-6">
                  {summaries.map((sum) => (
                    <div key={sum._id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <h3 className="font-bold text-slate-900">Dr. {sum.doctorId?.userId?.name}</h3>
                          <p className="text-xs text-slate-500">Visit Date: {new Date(sum.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="info">Diagnosis: {sum.diagnosis}</Badge>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient Summary</h4>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                          {sum.patientFriendlySummary || sum.clinicalNotes}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Follow-up Instructions</h4>
                        <p className="text-xs text-slate-600">{sum.followUpInstructions || 'No specific follow-up.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No past consultation records found.</p>
              )}
            </div>

            {/* Prescriptions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                Issued Digital Prescriptions
              </h2>

              {prescriptions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {prescriptions.map((p) => (
                    <div key={p._id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900">Dr. {p.doctorId?.userId?.name}</h4>
                          <p className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                          title="Print Prescription"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        {p.medications.map((m: any, idx: number) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 text-xs">
                            <p className="font-bold text-slate-900">{m.name} ({m.dosage})</p>
                            <p className="text-slate-500">{m.frequency} • Duration: {m.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No digital prescriptions issued yet.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
