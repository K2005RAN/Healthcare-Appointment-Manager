import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentApi, consultationApi } from '../../api/services';
import { Appointment, Medication } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  BrainCircuit,
  AlertTriangle,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const ConsultationRecorderPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consultation Form State
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);

  // Temp Medication State
  const [newMed, setNewMed] = useState<Medication>({
    name: '',
    dosage: '500 mg',
    frequency: 'Twice daily',
    duration: '5 days',
    instructions: 'After meals',
  });

  useEffect(() => {
    if (appointmentId) fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const res = await appointmentApi.getAppointmentById(appointmentId!);
      if (res.success) setAppointment(res.data.appointment);
    } catch (err) {
      showToast('Failed to load appointment details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedication = () => {
    if (!newMed.name.trim()) return;
    setMedications([...medications, newMed]);
    setNewMed({
      name: '',
      dosage: '500 mg',
      frequency: 'Twice daily',
      duration: '5 days',
      instructions: 'After meals',
    });
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNotes || !diagnosis || !treatmentNotes) {
      showToast('Please fill out clinical notes, diagnosis, and treatment plan', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await consultationApi.recordConsultation(appointmentId!, {
        clinicalNotes,
        diagnosis,
        treatmentNotes,
        followUpInstructions,
        medications,
      });

      if (res.success) {
        showToast('Consultation completed and prescription issued successfully!', 'success');
        navigate('/doctor/dashboard');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Failed to submit consultation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Loading patient consultation file...</p>
      </div>
    );
  }

  const preSummary = appointment.preVisitSummaryId;
  const symptoms = appointment.symptomSubmissionId;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Patient Consultation — {appointment.patientId?.userId?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Date: {new Date(appointment.startTime).toLocaleString()}
              </p>
            </div>
            <Badge variant={appointment.status === 'COMPLETED' ? 'info' : 'success'}>
              Status: {appointment.status}
            </Badge>
          </div>

          <div className="space-y-8">
            {/* AI Pre-Visit Symptom Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-card-subtle relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-base">
                  <BrainCircuit className="w-5 h-5 text-purple-600" />
                  AI Pre-Visit Symptom Analysis
                </div>
                {preSummary && (
                  <Badge
                    variant={
                      preSummary.urgencyLevel === 'High'
                        ? 'danger'
                        : preSummary.urgencyLevel === 'Medium'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {preSummary.urgencyLevel} Urgency
                  </Badge>
                )}
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-sm text-purple-950 space-y-3">
                <p>
                  <strong>Chief Complaint:</strong> {symptoms?.chiefComplaint || 'N/A'}
                </p>
                <p className="leading-relaxed">
                  <strong>Summary:</strong> {preSummary?.summary || 'AI synthesis pending or symptoms uploaded directly.'}
                </p>

                {preSummary?.suggestedQuestions && preSummary.suggestedQuestions.length > 0 && (
                  <div>
                    <strong className="block text-xs uppercase tracking-wider text-purple-900 mb-1">
                      Suggested Clinical Questions for Doctor:
                    </strong>
                    <ul className="list-disc list-inside space-y-1 text-xs text-purple-900">
                      {preSummary.suggestedQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 italic">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  AI-generated information is intended to assist the healthcare professional and does not constitute a medical diagnosis.
                </span>
              </div>
            </div>

            {/* Doctor Consultation Recording Form */}
            <form onSubmit={handleSubmitConsultation} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Clinical Diagnosis & Consultation Notes
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Diagnosis / Clinical Assessment *</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Bronchitis / Hypertension Grade 1"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Clinical Observations & Examination Notes *</label>
                  <textarea
                    rows={4}
                    required
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Detailed doctor notes from physical exam and patient interview..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Treatment Plan *</label>
                  <textarea
                    rows={3}
                    required
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    placeholder="Treatment recommendations and patient advice..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Digital Prescription Builder */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Issue Digital Prescription</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Medication Name"
                      value={newMed.name}
                      onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                      className="p-2 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="p-2 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Frequency (Twice daily)"
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                      className="p-2 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={newMed.duration}
                      onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                      className="p-2 rounded-lg border border-slate-300 text-xs"
                    />
                    <Button type="button" size="sm" onClick={handleAddMedication} leftIcon={<Plus className="w-4 h-4" />}>
                      Add Med
                    </Button>
                  </div>

                  {/* Added Medications Table */}
                  {medications.length > 0 && (
                    <div className="space-y-2">
                      {medications.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-xs font-semibold">
                          <span>
                            {m.name} — {m.dosage} • {m.frequency} ({m.duration})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(idx)}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Follow-up Instructions</label>
                  <input
                    type="text"
                    value={followUpInstructions}
                    onChange={(e) => setFollowUpInstructions(e.target.value)}
                    placeholder="e.g. Schedule follow-up appointment in 10 days if symptoms persist."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Complete Consultation & Generate Patient Summary
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};
