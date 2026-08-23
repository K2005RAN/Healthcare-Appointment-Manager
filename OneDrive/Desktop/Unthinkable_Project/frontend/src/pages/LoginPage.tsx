import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/services';
import { Button } from '../components/ui/Button';
import { HeartPulse, Mail, Lock, Sparkles, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.success) {
        login(res.data.user, res.data.accessToken);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');

        const role = res.data.user.role;
        if (role === 'PATIENT') navigate('/patient/dashboard');
        else if (role === 'DOCTOR') navigate('/doctor/dashboard');
        else if (role === 'ADMIN') navigate('/admin/dashboard');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Login failed. Please check email and password.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoRole: string) => {
    const pwd = demoRole === 'ADMIN' ? 'admin123' : 'password123';
    setEmail(demoEmail);
    setPassword(pwd);
    showToast(`Loaded ${demoRole} credentials into form. Click 'Sign In' to continue.`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 text-sky-400" /> Back to Home
        </Link>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <HeartPulse className="w-7 h-7 animate-pulse-glow" />
          </div>
          <span className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
            MediBridge
          </span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-white tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          New to MediBridge?{' '}
          <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2">
            Create a patient account
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-2xl py-8 px-6 shadow-2xl border border-slate-800 rounded-3xl sm:px-10 space-y-6">
          
          {/* Quick Demo Credentials Helper */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Quick Demo Login
              </span>
              <span className="text-[10px] text-slate-400">Select Role</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('emily.watson@example.com', 'PATIENT')}
                className="px-2.5 py-2 bg-slate-800 hover:bg-brand-500/20 text-slate-200 hover:text-sky-300 border border-slate-700 hover:border-brand-500/40 rounded-xl text-xs font-semibold transition-all duration-200 text-center"
              >
                🏥 Patient
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('sarah.jenkins@medibridge.com', 'DOCTOR')}
                className="px-2.5 py-2 bg-slate-800 hover:bg-purple-500/20 text-slate-200 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 rounded-xl text-xs font-semibold transition-all duration-200 text-center"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin@example.com', 'ADMIN')}
                className="px-2.5 py-2 bg-slate-800 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 rounded-xl text-xs font-semibold transition-all duration-200 text-center"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-sky-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-sky-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full py-3 shadow-glow-brand font-bold text-sm" isLoading={isLoading}>
              Sign In to MediBridge
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit Encrypted Healthcare Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};
