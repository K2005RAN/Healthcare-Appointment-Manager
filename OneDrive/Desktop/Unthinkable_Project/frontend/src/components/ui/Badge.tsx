import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-xs shadow-amber-500/10',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-xs shadow-rose-500/10',
    info: 'bg-sky-500/10 text-sky-300 border-sky-500/30 shadow-xs shadow-sky-500/10',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-xs shadow-purple-500/10',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700/80',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
