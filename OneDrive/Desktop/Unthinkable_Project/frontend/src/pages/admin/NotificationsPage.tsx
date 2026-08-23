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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Notification Queue & Failures</h1>
            <p className="text-slate-500 mt-1">Monitor exponential backoff email retries and manually trigger failed dispatches.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card-subtle">
            {notifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Attempts</th>
                      <th className="p-3">Error</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <tr key={n._id}>
                        <td className="p-3 font-bold text-slate-900">{n.recipient}</td>
                        <td className="p-3"><Badge variant="warning">{n.type}</Badge></td>
                        <td className="p-3">{n.attemptCount} / 4</td>
                        <td className="p-3 text-xs text-rose-600 font-mono truncate max-w-xs">{n.error || 'N/A'}</td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => handleRetry(n._id)}>
                            Retry
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-700 font-bold">No Failed Notifications</p>
                <p className="text-xs text-slate-400 mt-1">All email notifications dispatched cleanly or scheduled in queue.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
