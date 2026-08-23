import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/services';
import { AuditLog } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Badge } from '../../components/ui/Badge';
import { ClipboardList, ShieldCheck } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await adminApi.getAuditLogs();
      if (res.success) setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Audit Trail & Logs</h1>
            <p className="text-slate-400 mt-1">Immutable security audit logs tracking appointments, auth, and doctor modifications.</p>
          </div>

          <div className="glass-panel-accent rounded-3xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-xs font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Entity</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/85 font-mono text-xs">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-3.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-3.5">
                        <Badge variant="info">{log.action}</Badge>
                      </td>
                      <td className="p-3.5 font-sans font-semibold text-white">
                        {log.userId?.name || 'System'}
                      </td>
                      <td className="p-3.5 text-slate-300">{log.entity}</td>
                      <td className="p-3.5 text-slate-400 truncate max-w-xs" title={JSON.stringify(log.metadata || {})}>
                        {JSON.stringify(log.metadata || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
