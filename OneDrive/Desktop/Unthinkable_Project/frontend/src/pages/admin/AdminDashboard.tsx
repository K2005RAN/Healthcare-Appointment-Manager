import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Bell,
  TrendingUp,
  Activity,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getDashboard();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = [
    { month: 'Jan', appointments: 12 },
    { month: 'Feb', appointments: 19 },
    { month: 'Mar', appointments: 28 },
    { month: 'Apr', appointments: 35 },
    { month: 'May', appointments: 42 },
    { month: 'Jun', appointments: 56 },
  ];

  const pieData = [
    { name: 'Confirmed', value: stats?.upcomingAppointments || 10, color: '#38bdf8' },
    { name: 'Completed', value: stats?.completedAppointments || 25, color: '#34d399' },
    { name: 'Cancelled', value: stats?.cancelledAppointments || 4, color: '#fb7185' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          {/* Header Banner */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-sky-300 text-xs font-bold border border-brand-500/30 inline-flex items-center gap-1.5 mb-3 shadow-glow-brand">
                <ShieldCheck className="w-3.5 h-3.5" />
                System Administration Hub
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                MediBridge Analytics & Operations
              </h1>
              <p className="text-slate-300 mt-2 text-sm sm:text-base max-w-xl font-medium">
                Monitor platform metrics, doctor leave conflict resolution engines, notification dispatches, and security audit logs.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="glass-panel-accent border-glow-brand p-5 rounded-2xl shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-sky-400 flex items-center justify-center font-bold border border-brand-500/30 shrink-0 shadow-glow-brand">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total Patients</p>
                <p className="text-2xl font-extrabold text-white">{stats?.totalPatients || 0}</p>
              </div>
            </div>

            <div className="glass-panel-accent border-glow-purple p-5 rounded-2xl shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 shrink-0 shadow-glow-indigo">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total Doctors</p>
                <p className="text-2xl font-extrabold text-white">{stats?.totalDoctors || 0}</p>
              </div>
            </div>

            <div className="glass-panel-accent border-glow-emerald p-5 rounded-2xl shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shrink-0 shadow-glow-teal">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Today's Appts</p>
                <p className="text-2xl font-extrabold text-white">{stats?.todayAppointments || 0}</p>
              </div>
            </div>

            <div className="glass-panel-accent border-glow-rose p-5 rounded-2xl shadow-xl glass-card-hover flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30 shrink-0 shadow-glow-rose">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Failed Alerts</p>
                <p className="text-2xl font-extrabold text-white">{stats?.failedNotificationsCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel-accent p-6 rounded-3xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-400" />
                Appointments Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="appointments" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel-accent p-6 rounded-3xl shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Status Distribution
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
