import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/services';
import { Button } from '../components/ui/Button';
import { HeartPulse, User as UserIcon, Mail, Lock, Phone, Calendar } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authApi.register(formData);
      if (res.success) {
        login(res.data.user, res.data.accessToken);
        showToast('Registration successful! Welcome to MediBridge.', 'success');
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Registration failed.', 'error');
    } finally {
      setIsLoading(false);
    }
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Create Patient Account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200/80 sm:rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
              Complete Registration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
