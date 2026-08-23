import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorApi, appointmentApi } from '../../api/services';
import { Doctor, GeneratedSlot, SlotHold } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { HoldCountdown } from '../../components/ui/HoldCountdown';
import { useToast } from '../../context/ToastContext';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Stethoscope,
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const BookingFlowPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<GeneratedSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GeneratedSlot | null>(null);
  const [activeHold, setActiveHold] = useState<SlotHold | null>(null);

  // Symptoms state
  const [symptomsForm, setSymptomsForm] = useState({
    chiefComplaint: '',
    symptomsStr: '',
    duration: '2 days',
    severity: 'Moderate' as 'Mild' | 'Moderate' | 'Severe',
    additionalInfo: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<any>(null);

  useEffect(() => {
    if (doctorId) fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    if (doctorId && selectedDate) fetchAvailability();
  }, [doctorId, selectedDate]);

  const fetchDoctorDetails = async () => {
    try {
      const res = await doctorApi.getDoctorById(doctorId!);
      if (res.success) setDoctor(res.data.doctor);
    } catch (err) {
      showToast('Failed to load doctor profile', 'error');
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await doctorApi.getAvailability(doctorId!, selectedDate);
      if (res.success) setSlots(res.data.slots);
    } catch (err) {
      console.error(err);
    }
  };

  // Step 2 -> Step 3: Create Temporary Slot Hold
  const handleHoldSlot = async () => {
    if (!selectedSlot) {
      showToast('Please select an available time slot', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await appointmentApi.holdSlot({
        doctorId: doctorId!,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      if (res.success) {
        setActiveHold(res.data.hold);
        showToast('Slot temporarily held for 5 minutes!', 'success');
        setStep(3); // Move to Symptoms step
      }
    } catch (err: any) {
      const errCode = err.response?.data?.error?.code;
      const errMsg = err.response?.data?.error?.message || 'Slot hold failed';
      showToast(errMsg, 'error');

      if (errCode === 'SLOT_ALREADY_BOOKED') {
        fetchAvailability(); // Refresh available slots
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4 -> Confirm Booking
  const handleConfirmBooking = async () => {
    if (!symptomsForm.chiefComplaint.trim()) {
      showToast('Please enter your chief complaint / main symptom', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const symptomsList = symptomsForm.symptomsStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (symptomsList.length === 0) {
        symptomsList.push(symptomsForm.chiefComplaint);
      }

      const res = await appointmentApi.confirmBooking({
        holdId: activeHold?._id,
        doctorId: doctorId!,
        startTime: selectedSlot!.startTime,
        endTime: selectedSlot!.endTime,
        symptoms: {
          chiefComplaint: symptomsForm.chiefComplaint,
          symptoms: symptomsList,
          duration: symptomsForm.duration,
          severity: symptomsForm.severity,
          additionalInfo: symptomsForm.additionalInfo,
        },
      });

      if (res.success) {
        setBookingConfirmed(res.data.appointment);
        setStep(5); // Confirmed screen
        showToast('Appointment confirmed successfully!', 'success');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Booking failed';
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full">
          {/* Booking Progress Indicator */}
          {step < 5 && (
            <div className="mb-8 glass-panel-accent p-4 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Step {step} of 4</span>
                <span>
                  {step === 1 && 'Select Doctor'}
                  {step === 2 && 'Choose Date & Slot'}
                  {step === 3 && 'Share Symptoms'}
                  {step === 4 && 'Review & Confirm'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 shadow-glow-brand h-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Slot Hold Countdown Banner */}
          {activeHold && step >= 3 && step < 5 && (
            <div className="mb-6">
              <HoldCountdown
                expiresAt={activeHold.expiresAt}
                onExpire={() => {
                  showToast('Your 5-minute slot hold has expired. Please select a slot again.', 'error');
                  setActiveHold(null);
                  setStep(2);
                }}
              />
            </div>
          )}

          {/* STEP 1 & 2: Select Date and Slot */}
          {step <= 2 && doctor && (
            <div className="glass-panel-accent rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                  {doctor.userId?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Dr. {doctor.userId?.name}</h2>
                  <p className="text-sm text-slate-400">{doctor.specializationIds?.[0]?.name}</p>
                  <p className="text-xs text-sky-400 font-semibold mt-0.5">₹{doctor.consultationFee} consultation fee</p>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Select Appointment Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-64 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>

              {/* Slots Grid */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Available Time Slots</label>
                {slots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={slot.startTime}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-glow-brand ring-2 ring-brand-400'
                              : slot.isAvailable
                              ? 'bg-slate-850 hover:bg-brand-500/20 text-slate-200 border-slate-750 hover:border-brand-500/40'
                              : 'bg-slate-900 text-slate-500 border-slate-800/80 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.timeLabel}
                          {!slot.isAvailable && (
                            <span className="block text-[10px] text-slate-500 font-normal no-underline">
                              {slot.reason || 'Booked'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic p-4 bg-slate-950/60 rounded-xl border border-slate-850">
                    No available time slots for this date (Doctor may be on leave or non-working day).
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button
                  disabled={!selectedSlot}
                  isLoading={isLoading}
                  onClick={handleHoldSlot}
                  variant="gradient"
                  className="shadow-glow-brand"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Hold Slot & Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Symptoms Form */}
          {step === 3 && (
            <div className="glass-panel-accent rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Enter Your Symptoms</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Our AI will synthesize a pre-visit summary for Dr. {doctor?.userId?.name}.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1">Chief Complaint *</label>
                  <input
                    type="text"
                    required
                    value={symptomsForm.chiefComplaint}
                    onChange={(e) => setSymptomsForm({ ...symptomsForm, chiefComplaint: e.target.value })}
                    placeholder="e.g. Persistent dry cough and sore throat"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1">Specific Symptoms (comma separated)</label>
                  <input
                    type="text"
                    value={symptomsForm.symptomsStr}
                    onChange={(e) => setSymptomsForm({ ...symptomsForm, symptomsStr: e.target.value })}
                    placeholder="Fever, fatigue, headache"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-350 mb-1">Symptom Duration</label>
                    <input
                      type="text"
                      value={symptomsForm.duration}
                      onChange={(e) => setSymptomsForm({ ...symptomsForm, duration: e.target.value })}
                      placeholder="e.g. 3 days"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-355 mb-1">Severity</label>
                    <select
                      value={symptomsForm.severity}
                      onChange={(e) => setSymptomsForm({ ...symptomsForm, severity: e.target.value as any })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all [&>option]:bg-slate-950 [&>option]:text-white"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={symptomsForm.additionalInfo}
                    onChange={(e) => setSymptomsForm({ ...symptomsForm, additionalInfo: e.target.value })}
                    placeholder="Any allergies, current medications, or secondary symptoms..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button variant="gradient" className="shadow-glow-brand" onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Review Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Confirm */}
          {step === 4 && (
            <div className="glass-panel-accent rounded-2xl p-6 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-white">Review & Finalize Booking</h2>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="font-bold text-white flex items-center gap-1">Dr. {doctor?.userId?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="font-bold text-sky-400">
                    {new Date(selectedSlot!.startTime).toLocaleDateString()} at {selectedSlot!.timeLabel}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Chief Complaint:</span>
                  <span className="font-medium text-white">{symptomsForm.chiefComplaint}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Edit Symptoms
                </Button>
                <Button variant="gradient" className="shadow-glow-brand" isLoading={isLoading} onClick={handleConfirmBooking}>
                  Confirm Appointment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Success Confirmed Screen */}
          {step === 5 && bookingConfirmed && (
            <div className="glass-panel-accent border-glow-emerald rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-scale-up">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glow-teal">
                <CheckCircle2 className="w-12 h-12 animate-pulse-glow" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold mb-2">
                  ✓ Appointment Confirmed
                </span>
                <h2 className="text-2xl font-extrabold text-white">Dr. {doctor?.userId?.name}</h2>
                <p className="text-sm text-slate-400">{doctor?.specializationIds?.[0]?.name}</p>
                <p className="text-lg font-bold text-sky-400 mt-3">
                  {new Date(bookingConfirmed.startTime).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}{' '}
                  at {new Date(bookingConfirmed.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* AI Pre-visit notice */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-left text-xs text-purple-250 flex items-start gap-3">
                <BrainCircuit className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-purple-300">AI Pre-Visit Symptom Summary Queued</p>
                  <p className="mt-0.5 text-slate-300 opacity-90 leading-relaxed">
                    Your symptoms are being processed. An AI summary with urgency indicators will be delivered to your doctor prior to consultation.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/patient/appointments">
                  <Button variant="gradient" className="shadow-glow-brand">View My Appointments</Button>
                </Link>
                <Link to="/patient/dashboard">
                  <Button variant="outline">Return to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
