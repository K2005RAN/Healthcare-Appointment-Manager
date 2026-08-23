import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, LogOut, Calendar, Stethoscope, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'PATIENT') return '/patient/dashboard';
    if (user.role === 'DOCTOR') return '/doctor/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-all duration-300">
              <HeartPulse className="w-6 h-6 animate-pulse-glow" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                MediBridge
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-sky-400 border border-brand-500/20 shadow-glow-brand">
                <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                AI SaaS
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/doctors"
            className={`text-sm font-semibold transition-all flex items-center gap-2 px-3.5 py-2 rounded-xl ${
              location.pathname === '/doctors'
                ? 'bg-brand-500/20 text-sky-300 border border-brand-500/30 shadow-glow-brand'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-sky-400" />
            Find Doctors
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to={getDashboardPath()}>
                <Button variant="secondary" size="sm" leftIcon={<Calendar className="w-4 h-4 text-sky-400" />}>
                  Dashboard
                </Button>
              </Link>

              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <div className="flex items-center gap-2.5 bg-slate-800/90 p-1.5 pr-3 rounded-full border border-slate-700/80 shadow-md">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-glow-brand">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-100 leading-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-500/20"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
