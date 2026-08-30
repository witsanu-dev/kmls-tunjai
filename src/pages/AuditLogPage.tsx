import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '../types/emergency';
import { fetchAuditLogsApi } from '../services/api';
import { ShieldCheck, History, Search, RefreshCw, Activity, User, Server } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAuditLogsApi();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.target_resource || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (act: string) => {
    if (act.includes('LOGIN')) {
      return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">{act}</span>;
    }
    if (act.includes('CREATE')) {
      return <span className="bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded">{act}</span>;
    }
    if (act.includes('UPDATE')) {
      return <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">{act}</span>;
    }
    if (act.includes('DELETE')) {
      return <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">{act}</span>;
    }
    return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded">{act}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header Banner - Light Theme */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 uppercase tracking-wide">
            Audit Trail & Security Standard
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600" />
            <span>ประวัติบันทึกกิจกรรมและตรวจสอบย้อนหลัง (Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกการเข้าใช้งานระบบ การแจ้งเหตุ การปรับสถานะ และการกรอกข้อมูล F-PCT-001/ER อย่างสมบูรณ์
          </p>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-md transition-colors border border-slate-300 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามผู้ใช้งาน, กิจกรรม, หรือรหัสเคส..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md pl-9 pr-3 py-2 outline-none font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-600">
          <span>ประเภทกิจกรรม:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-3 py-2 font-medium outline-none"
          >
            <option value="all">ทุกกิจกรรม ({logs.length})</option>
            <option value="LOGIN_SUCCESS">เข้าสู่ระบบ (LOGIN_SUCCESS)</option>
            <option value="LOGOUT">ออกจากระบบ (LOGOUT)</option>
            <option value="CREATE_CASE">สร้างเคสใหม่ (CREATE_CASE)</option>
            <option value="UPDATE_CASE_STATUS">ปรับสถานะเคส (UPDATE_CASE_STATUS)</option>
            <option value="CREATE_USER">สร้างผู้ใช้ (CREATE_USER)</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-3">วัน-เวลา (ISO)</th>
                <th className="p-3">ผู้ใช้งาน (User)</th>
                <th className="p-3">สิทธิ (Role)</th>
                <th className="p-3">กิจกรรม (Action)</th>
                <th className="p-3">ทรัพยากร (Target)</th>
                <th className="p-3">รายละเอียด (Details)</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    กำลังดึงข้อมูล Audit Logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                    ยังไม่มีข้อมูล Audit Logs ที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {new Date(log.created_at).toLocaleString('th-TH')}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.full_name || log.username}</div>
                      <div className="font-mono text-[10px] text-slate-500">Username: {log.username}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold text-slate-600">{log.role}</td>
                    <td className="p-3 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-[11px] font-bold text-indigo-700">
                      {log.target_resource}
                    </td>
                    <td className="p-3 font-normal text-slate-700 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
