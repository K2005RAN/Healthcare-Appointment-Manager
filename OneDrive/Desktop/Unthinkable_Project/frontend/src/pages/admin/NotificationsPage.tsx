import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { Bell, RefreshCw, CheckCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await adminApi.getNotifications();
      if (res.success) setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const res = await adminApi.retryNotification(id);
      if (res.success) {
        showToast('Notification retry triggered', 'success');
        fetchNotifications();
      }
    } catch (err) {
      showToast('Notification retry failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Notification Queue & Failures</h1>
            <p className="text-slate-400 mt-1">Monitor exponential backoff email retries and manually trigger failed dispatches.</p>
          </div>

          <div className="glass-panel-accent rounded-3xl p-6 shadow-xl">
            {notifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Recipient</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Attempts</th>
                      <th className="p-3.5">Error</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/85">
                    {notifications.map((n) => (
                      <tr key={n._id} className="hover:bg-slate-850/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">{n.recipient}</td>
                        <td className="p-3.5"><Badge variant="warning">{n.type}</Badge></td>
                        <td className="p-3.5 text-slate-300">{n.attemptCount} / 4</td>
                        <td className="p-3.5 text-xs text-rose-400 font-mono truncate max-w-xs" title={n.error}>{n.error || 'N/A'}</td>
                        <td className="p-3.5 text-right">
                          <Button size="sm" variant="gradient" className="shadow-glow-brand" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => handleRetry(n._id)}>
                            Retry
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 shadow-inner">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-pulse-glow" />
                <p className="text-white font-bold">No Failed Notifications</p>
                <p className="text-xs text-slate-400 mt-1">All email notifications dispatched cleanly or scheduled in queue.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
