import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api.js';
import { Shield, ArrowLeft, RefreshCw, FileText } from 'lucide-react';

interface AuditLogsViewProps {
  onBack: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    const res = await apiRequest('/admin/audit-logs');
    if (res.ok && res.data) {
      setLogs(res.data.logs || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>नियंत्रण कक्ष पर वापस</span>
        </button>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश करें</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              सुरक्षा एवं प्रशासनिक ऑडिट लॉग (Security Audit Logs)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              गोपनीयता नियम: ऑडिट लॉग में कभी भी छात्रों या शिक्षकों के पिन, पासवर्ड या संवेदनशील क्रेडेंशियल रिकॉर्ड नहीं किए जाते।
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b">
              <tr>
                <th className="p-3">समय (Timestamp)</th>
                <th className="p-3">उपयोगकर्ता (Actor)</th>
                <th className="p-3">भूमिका (Role)</th>
                <th className="p-3">कार्रवाई (Action)</th>
                <th className="p-3">संसाधन (Resource)</th>
                <th className="p-3">विवरण (Safe Details)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-slate-800">{log.actor_name || 'अज्ञात'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase bg-slate-100 text-slate-700">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-blue-700">{log.action}</td>
                  <td className="p-3 font-mono text-slate-600">{log.target_resource}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate" title={log.details}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
