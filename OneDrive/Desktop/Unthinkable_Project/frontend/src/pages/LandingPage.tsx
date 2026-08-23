import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  BrainCircuit,
  Stethoscope,
  Pill,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Search,
  Heart,
  CheckCircle,
  Activity,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden">
      <Navbar />

      {/* Ambient Radial Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-60 left-1/3 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-glow-brand text-sky-300 text-xs font-bold mb-6 animate-fade-in backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Next-Gen Healthcare Management & AI Clinical Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Healthcare appointments,{' '}
                <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  redefined.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-medium max-w-2xl">
                Book verified medical specialists with dynamic slot holds, share symptoms securely with instant AI clinical briefing summaries, and experience zero double-booking concurrency control.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link to="/doctors">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto shadow-glow-brand" leftIcon={<Stethoscope className="w-5 h-5" />}>
                    Find a Doctor
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-slate-900/60" rightIcon={<ArrowRight className="w-5 h-5 text-sky-400" />}>
                    Create Free Account
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-sky-400" />
                    <span className="text-2xl font-bold text-white">100%</span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Concurrency Safe</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span className="text-2xl font-bold text-white">5-Min</span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Atomic Slot Hold</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    <span className="text-2xl font-bold text-white">AI Engine</span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Clinical Summaries</p>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive UI Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5 relative z-10 animate-scale-up">
                
                {/* Doctor Profile Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
                      SJ
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-base">Dr. Sarah Jenkins</h3>
                        <CheckCircle className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                      </div>
                      <p className="text-xs text-slate-400">Cardiology Specialist • 12 Yrs Exp</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verified
                  </span>
                </div>

                {/* Selected Time Slot Showcase */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Selected Consultation Slot</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Held (04:32 remaining)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-850 border border-slate-750 text-white font-bold text-sm shadow-inner">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>Today, 10:30 AM — In-Person Consultation</span>
                  </div>
                </div>

                {/* AI Summary Preview Card */}
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-purple-300 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-purple-400" />
                      AI Pre-Visit Symptom Briefing
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">High Urgency</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    "Patient presents with chief complaint of acute chest tightness during exercise. Recommending priority cardiovascular screening."
                  </p>
                </div>

                <Link to="/doctors" className="block">
                  <Button variant="primary" className="w-full shadow-glow-brand" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Book Appointment Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Production-Grade Healthcare Infrastructure
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              Designed for Patients, Doctors, and Administrators with zero concurrency double-booking risks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-850/80 border border-slate-750/80 glass-card-hover">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center mb-6 shadow-lg shadow-brand-500/25">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Double-Booking Safety</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Atomic MongoDB index constraints and multi-document ACID transactions guarantee that two patients can never successfully book the exact same time slot.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-850/80 border border-slate-750/80 glass-card-hover">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 text-white flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Visit Summaries</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Asynchronous pre-visit symptom synthesis for doctors and plain-language post-visit consultation guidelines for patients.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-850/80 border border-slate-750/80 glass-card-hover">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                <Pill className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Digital Prescriptions</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Doctors issue structured digital prescriptions that automatically populate patient medication schedules and dosage dispatches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-brand-500/10 text-sky-400 text-xs font-extrabold uppercase tracking-widest border border-brand-500/20 inline-block mb-3">
              Patient Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How MediBridge Operates
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              5 simple steps from specialist discovery to personalized recovery.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 relative z-10">
            {[
              {
                step: '01',
                title: 'Find Doctor',
                desc: 'Filter verified doctors by medical specialization and experience.',
                icon: Search,
                gradient: 'from-brand-600 to-sky-400',
              },
              {
                step: '02',
                title: 'Select Slot',
                desc: 'Reserve your ideal consultation time with 5-min atomic slot holds.',
                icon: Clock,
                gradient: 'from-sky-500 to-cyan-400',
              },
              {
                step: '03',
                title: 'Share Symptoms',
                desc: 'Input health concerns so AI can synthesize a clinical briefing for your doctor.',
                icon: BrainCircuit,
                gradient: 'from-purple-600 to-indigo-400',
              },
              {
                step: '04',
                title: 'Doctor Visit',
                desc: 'Connect with your doctor who reviews your AI urgency brief.',
                icon: Stethoscope,
                gradient: 'from-indigo-600 to-brand-500',
              },
              {
                step: '05',
                title: 'Personal Care Plan',
                desc: 'Receive digital prescriptions and timely medication alerts.',
                icon: Pill,
                gradient: 'from-emerald-600 to-teal-400',
              },
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl glass-card-hover flex flex-col items-center text-center relative group"
                >
                  <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700">
                    {item.step}
                  </span>

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7" />
                  </div>

                  <h4 className="font-extrabold text-white text-base mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                  <Heart className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white tracking-tight">MediBridge</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-500/20 text-sky-300 text-[10px] font-extrabold border border-brand-500/30 uppercase tracking-widest">
                    Care Hub
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
                MediBridge bridges the gap between patients and specialized healthcare practitioners with instant appointments, intelligent AI symptom summaries, and digital prescriptions.
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="text-white font-extrabold uppercase tracking-wider text-[11px]">Portals</h4>
              <ul className="space-y-2.5 text-slate-400 font-medium">
                <li><Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Patient Register</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Doctor Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white font-extrabold uppercase tracking-wider text-[11px]">Features</h4>
              <ul className="space-y-2.5 text-slate-400 font-medium">
                <li><span className="text-slate-300">Instant Appointment Booking</span></li>
                <li><span className="text-slate-300">AI Pre & Post Visit Summaries</span></li>
                <li><span className="text-slate-300">Digital Rx & Dosage Schedule</span></li>
                <li><span className="text-slate-300">Google Calendar Sync</span></li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white font-extrabold uppercase tracking-wider text-[11px]">Patient Assistance</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                For scheduling support and platform assistance:
              </p>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                <p className="text-sky-400 font-bold">MediBridge Support</p>
                <p className="text-[11px] text-slate-400 mt-0.5">support@medibridge.care</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
            <p>© 2026 MediBridge Healthcare Technologies Inc. All rights reserved.</p>
            <p className="text-slate-400">
              Developed by{' '}
              <a
                href="https://www.linkedin.com/in/karan-rai-a961aa292/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 font-semibold hover:text-sky-300 underline underline-offset-2 transition-colors"
              >
                Karan Rai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
