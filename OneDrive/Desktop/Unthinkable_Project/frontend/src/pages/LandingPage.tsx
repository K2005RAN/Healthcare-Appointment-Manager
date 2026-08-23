import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  BrainCircuit,
  Stethoscope,
  Pill,
  ShieldCheck,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Activity,
  Heart,
  Lock,
  Zap,
  Search,
  Star,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      <Navbar />

      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-slate-200/90 shadow-sm text-brand-700 text-xs font-bold mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Next-Gen Healthcare Management & AI Summaries</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Healthcare appointments,{' '}
                <span className="bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                  simplified.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
                Book trusted doctors with dynamic availability, share symptoms securely, receive intelligent AI pre-visit and post-visit summaries, and maintain concurrency-safe booking.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link to="/doctors">
                  <Button size="lg" className="w-full sm:w-auto shadow-glow-brand" leftIcon={<Stethoscope className="w-5 h-5" />}>
                    Find a Doctor
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/80" rightIcon={<ArrowRight className="w-5 h-5 text-brand-600" />}>
                    Create Free Account
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-brand-600" />
                    <span className="text-2xl font-bold text-slate-900">100%</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Concurrency Safe</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-slate-900">5-Min</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Slot Hold Countdown</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-slate-900">AI-Powered</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Symptom Summaries</p>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive UI Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-5 relative z-10 animate-scale-up">
                
                {/* Doctor Profile Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-brand-500/20">
                      SJ
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-base">Dr. Sarah Jenkins</h3>
                        <CheckCircle className="w-4 h-4 text-brand-600 fill-brand-50" />
                      </div>
                      <p className="text-xs text-slate-500">Cardiology Specialist • 12 Yrs Exp</p>
                    </div>
                  </div>
                </div>

                {/* Selected Time Slot Showcase */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Selected Slot</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Available
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 font-bold text-sm">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>Today, 10:30 AM</span>
                  </div>
                </div>

                {/* AI Summary Preview Card */}
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <div className="flex items-center justify-between text-purple-900 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4 text-purple-600" />
                      AI Symptom Analysis
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">Medium</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    "Patient reports 3-day history of exercise-induced chest tightness."
                  </p>
                </div>

                <Link to="/doctors" className="block">
                  <Button className="w-full shadow-glow-brand" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Production-Grade Healthcare Infrastructure
            </h2>
            <p className="mt-4 text-slate-600 text-base">
              Designed for Patients, Doctors, and Administrators with total concurrency safety.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200/90 card-hover-lift">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center mb-6 shadow-md shadow-brand-500/20">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Double-Booking Safety</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Atomic MongoDB index constraints and multi-document transactions guarantee that two patients can never successfully book the exact same slot.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200/90 card-hover-lift">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-400 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Visit Summaries</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Asynchronous pre-visit symptom synthesis for doctors and plain-language post-visit consultation summaries for patients.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200/90 card-hover-lift">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
                <Pill className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Digital Prescriptions</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Doctors issue structured digital prescriptions that automatically populate patient medication schedules and email reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Connected Timeline Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-extrabold uppercase tracking-widest border border-brand-200 inline-block mb-3">
              Patient Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How MediBridge Operates
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              5 simple steps from doctor discovery to personalized recovery.
            </p>
          </div>

          <div className="relative">
            {/* Desktop Connected Progress Line */}
            <div className="hidden md:block absolute top-12 left-16 right-16 h-1 bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400 z-0 rounded-full opacity-30"></div>

            <div className="grid md:grid-cols-5 gap-6 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Find Doctor',
                  desc: 'Filter verified doctors by medical specialization and experience.',
                  icon: Search,
                  gradient: 'from-brand-600 to-sky-400',
                  shadow: 'shadow-brand-500/20',
                },
                {
                  step: '02',
                  title: 'Select Slot',
                  desc: 'Reserve your ideal consultation time with instant slot holds.',
                  icon: Clock,
                  gradient: 'from-sky-500 to-cyan-400',
                  shadow: 'shadow-sky-500/20',
                },
                {
                  step: '03',
                  title: 'Share Symptoms',
                  desc: 'Share your health concerns so AI can summarize them for your doctor.',
                  icon: BrainCircuit,
                  gradient: 'from-purple-600 to-indigo-400',
                  shadow: 'shadow-purple-500/20',
                },
                {
                  step: '04',
                  title: 'Doctor Visit',
                  desc: 'Connect with your doctor who reviews your AI symptom summary.',
                  icon: Stethoscope,
                  gradient: 'from-indigo-600 to-brand-500',
                  shadow: 'shadow-indigo-500/20',
                },
                {
                  step: '05',
                  title: 'Personal Care Plan',
                  desc: 'Receive digital prescriptions and timely medication alerts.',
                  icon: Pill,
                  gradient: 'from-emerald-600 to-teal-400',
                  shadow: 'shadow-emerald-500/20',
                },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.step}
                    className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-card-subtle card-hover-lift flex flex-col items-center text-center relative group"
                  >
                    {/* Top Step Number Tag */}
                    <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">
                      {item.step}
                    </span>

                    {/* Gradient Icon Circle */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center mb-5 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7" />
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Ultra-Premium Patient-Centric Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
            
            {/* Brand Information Column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <Heart className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white tracking-tight">MediBridge</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-extrabold border border-brand-400/30 uppercase tracking-widest">
                    Care Hub
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
                MediBridge bridges the gap between patients and specialized healthcare practitioners. Instant appointments, intelligent AI symptom summaries, and digital prescriptions in one secure platform.
              </p>

              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium tracking-wide shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>All Healthcare Services Ready</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-normal">100% Safe & Private</span>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-white font-extrabold uppercase tracking-wider text-[11px]">Portals</h4>
              <ul className="space-y-2.5 text-slate-400 font-medium">
                <li><Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Patient Register</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Doctor Portal</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Care Features */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white font-extrabold uppercase tracking-wider text-[11px]">Specialties & Features</h4>
              <ul className="space-y-2.5 text-slate-400 font-medium">
                <li><span className="text-slate-300">Instant Appointment Booking</span></li>
                <li><span className="text-slate-300">AI Pre & Post Visit Summaries</span></li>
                <li><span className="text-slate-300">Digital Rx & Medication Schedule</span></li>
                <li><span className="text-slate-300">Google Calendar Sync</span></li>
              </ul>
            </div>

            {/* Emergency & Support */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white font-extrabold uppercase tracking-wider text-[11px]">Patient Assistance</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                For non-emergency appointment assistance and healthcare scheduling support:
              </p>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                <p className="text-brand-400 font-bold">MediBridge Support</p>
                <p className="text-[11px] text-slate-400 mt-0.5">support@medibridge.care</p>
              </div>
            </div>

          </div>

          {/* Copyright & Legal Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <p>© 2026 MediBridge Healthcare Technologies Inc. All rights reserved.</p>
              <span className="hidden sm:inline text-slate-700">•</span>
              <p className="text-slate-400">
                Developed by{' '}
                <a
                  href="https://www.linkedin.com/in/karan-rai-a961aa292/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 font-semibold hover:text-brand-300 underline underline-offset-2 transition-colors"
                >
                  Karan Rai
                </a>
              </p>
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Care</span>
              <span>•</span>
              <span>Patient Security Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
