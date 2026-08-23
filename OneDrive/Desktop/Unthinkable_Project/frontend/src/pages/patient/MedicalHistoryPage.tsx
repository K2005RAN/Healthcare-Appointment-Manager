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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Medical History & Prescriptions</h1>
            <p className="text-slate-400 mt-1">Review consultation summaries, clinical diagnoses, and prescribed medicines.</p>
          </div>

          <div className="space-y-8">
            {/* Consultation Summaries */}
            <div className="glass-panel-accent rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse-glow" />
                AI Post-Visit Consultation Summaries
              </h2>

              {summaries.length > 0 ? (
                <div className="space-y-6">
                  {summaries.map((sum) => (
                    <div key={sum._id} className="p-6 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-white">Dr. {sum.doctorId?.userId?.name}</h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Visit Date: {new Date(sum.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="info">Diagnosis: {sum.diagnosis}</Badge>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Patient Summary</h4>
                        <p className="text-sm text-slate-200 leading-relaxed font-medium">
                          {sum.patientFriendlySummary || sum.clinicalNotes}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Follow-up Instructions</h4>
                        <p className="text-xs text-slate-350">{sum.followUpInstructions || 'No specific follow-up.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic py-6 text-center bg-slate-950/60 rounded-2xl border border-slate-800">No past consultation records found.</p>
              )}
            </div>

            {/* Prescriptions */}
            <div className="glass-panel-accent rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-400" />
                Issued Digital Prescriptions
              </h2>

              {prescriptions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {prescriptions.map((p) => (
                    <div key={p._id} className="p-5 rounded-xl border border-slate-850 bg-slate-950/60 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">Dr. {p.doctorId?.userId?.name}</h4>
                          <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Print Prescription"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        {p.medications.map((m: any, idx: number) => (
                          <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs">
                            <p className="font-bold text-white">{m.name} ({m.dosage})</p>
                            <p className="text-slate-450 mt-0.5">{m.frequency} • Duration: {m.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic py-6 text-center bg-slate-950/60 rounded-2xl border border-slate-800">No digital prescriptions issued yet.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
