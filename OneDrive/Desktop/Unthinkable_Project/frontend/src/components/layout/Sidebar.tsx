import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Search,
  FileText,
  Pill,
  Clock,
  UserCheck,
  CalendarDays,
  Bell,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctors', label: 'Find Doctors', icon: Search },
    { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/patient/medical-history', label: 'Medical History', icon: FileText },
    { to: '/patient/medications', label: 'Medication Reminders', icon: Pill },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments Agenda', icon: Calendar },
    { to: '/doctor/availability', label: 'Availability & Hours', icon: Clock },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Analytics', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Manage Doctors', icon: UserCheck },
    { to: '/admin/leaves', label: 'Doctor Leaves', icon: CalendarDays },
    { to: '/admin/notifications', label: 'Notification Queue', icon: Bell },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
  ];

  const links =
    user.role === 'PATIENT'
      ? patientLinks
      : user.role === 'DOCTOR'
      ? doctorLinks
      : adminLinks;

  return (
    <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 shadow-xl">
      <div>
        <div className="px-3 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>{user.role} PORTAL</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <nav className="mt-3 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/30 to-sky-500/10 text-sky-300 border border-brand-500/30 shadow-glow-brand'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-sky-400" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
