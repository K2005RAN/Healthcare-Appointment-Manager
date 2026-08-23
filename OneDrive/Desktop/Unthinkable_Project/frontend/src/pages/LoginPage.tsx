import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/services';
import { Button } from '../components/ui/Button';
import { HeartPulse, Mail, Lock, Sparkles } from 'lucide-react';

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
    showToast(`Loaded ${demoRole} credentials into form. Click 'Sign In' to login.`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <HeartPulse className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold text-slate-900">MediBridge</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            create a new patient account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200/80 sm:rounded-2xl sm:px-10">
          
          {/* Fill Demo Credentials Helper */}
          <div className="mb-6 p-4 rounded-xl bg-brand-50/80 border border-brand-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Fill Demo Credentials (Optional)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('emily.watson@example.com', 'PATIENT')}
                className="px-2 py-1.5 bg-white border border-brand-200 rounded-lg text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Fill Patient
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('sarah.jenkins@medibridge.com', 'DOCTOR')}
                className="px-2 py-1.5 bg-white border border-brand-200 rounded-lg text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Fill Doctor
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin@example.com', 'ADMIN')}
                className="px-2 py-1.5 bg-white border border-brand-200 rounded-lg text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                Fill Admin
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
