import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface HoldCountdownProps {
  expiresAt: string; // ISO string
  onExpire: () => void;
}

export const HoldCountdown: React.FC<HoldCountdownProps> = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all duration-300 ${
        isUrgent
          ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse-subtle'
          : 'bg-sky-50 border-sky-200 text-sky-900'
      }`}
    >
      <div className="flex items-center gap-3">
        {isUrgent ? (
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
        ) : (
          <Clock className="w-5 h-5 text-sky-600 shrink-0" />
        )}
        <div>
          <span className="font-semibold">Slot Held Temporarily</span>
          <p className="text-xs opacity-90">Complete booking before your temporary hold expires.</p>
        </div>
      </div>
      <div className="font-mono text-base font-bold tracking-wider px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-sm">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};
