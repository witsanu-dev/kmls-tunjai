import React, { useState, useMemo } from 'react';
import {
  Table, Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight,
  Eye, Calendar, Hospital, User, FileText, CheckCircle2, Clock, Activity, AlertCircle, X
} from 'lucide-react';
import { CaseRecord } from '../types/emergency';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface DataTablesHistoryPageProps {
  cases: CaseRecord[];
}

export const DataTablesHistoryPage: React.FC<DataTablesHistoryPageProps> = ({ cases }) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hospitalFilter, setHospitalFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<'reported_at' | 'patient_name' | 'id'>('reported_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination & Page Size
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selected Detail Modal state
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);

  // Unique Hospital list for filter dropdown
  const hospitalList = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      if (c.hospital_name) set.add(c.hospital_name);
    });
    return Array.from(set);
  }, [cases]);

  // Filtered and Sorted Cases
  const filteredCases = useMemo(() => {
    return cases
      .filter((c) => {
        // Search term matching
        const term = searchTerm.toLowerCase();
        const matchSearch =
          !term ||
          c.id.toLowerCase().includes(term) ||
          c.patient_name.toLowerCase().includes(term) ||
          c.fr_name.toLowerCase().includes(term) ||
          c.location.toLowerCase().includes(term) ||
          c.hospital_name.toLowerCase().includes(term);

        // Status match
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;

        // Hospital match
        const matchHospital = hospitalFilter === 'all' || c.hospital_name === hospitalFilter;

        // Date range match
        let matchDate = true;
        const caseTime = new Date(c.reported_at).getTime();
        if (startDate) {
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          if (caseTime < start) matchDate = false;
        }
        if (endDate) {
          const end = new Date(endDate).setHours(23, 59, 59, 999);
          if (caseTime > end) matchDate = false;
        }

        return matchSearch && matchStatus && matchHospital && matchDate;
      })
      .sort((a, b) => {
        let valA: string | number = a[sortField] || '';
        let valB: string | number = b[sortField] || '';
        if (sortField === 'reported_at') {
          valA = new Date(a.reported_at).getTime();
          valB = new Date(b.reported_at).getTime();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [cases, searchTerm, statusFilter, hospitalFilter, startDate, endDate, sortField, sortOrder]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  const handleSort = (field: 'reported_at' | 'patient_name' | 'id') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setHospitalFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Export CSV
  const exportCSV = () => {
    if (filteredCases.length === 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'ไม่มีข้อมูลส่งออก',
        text: 'ไม่พบรายการเคสตามเงื่อนไขที่เลือก',
        confirmButtonColor: '#0d9488',
      });
      return;
    }
    const headers = [
      'Case ID',
      'Reported Time',
      'FR Responder',
      'Patient Name',
      'Age',
      'Sex',
      'Location',
      'Hospital',
      'FAST Symptoms',
      'NIHSS Score',
      'Status',
    ];
    const rows = filteredCases.map((c) => [
      c.id,
      new Date(c.reported_at).toLocaleString('th-TH'),
      `"${c.fr_name}"`,
      `"${c.patient_name}"`,
      c.age || '-',
      c.sex || '-',
      `"${c.location}"`,
      `"${c.hospital_name}"`,
      `"${[c.face ? 'Face' : null, c.arm ? 'Arm' : null, c.speech ? 'Speech' : null].filter(Boolean).join(',') || 'None'}"`,
      c.nihss_total !== null ? `${c.nihss_total}` : '-',
      c.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stroke_alert_cases_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>ใหม่ (รอรับแจ้ง)</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>รับแจ้งแล้ว</span>
          </span>
        );
      case 'arrived':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ถึง รพ. แล้ว</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner - Standard Light Theme */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 uppercase tracking-wide">
            Medical Case Records & Audit
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Table className="w-6 h-6 text-teal-600" />
            <span>ประวัติเคสรับแจ้งเหตุ (Case Records & Audit Trail)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สืบค้นข้อมูล ตรวจสอบประวัติการรับแจ้ง กรองสถานะ ยอดสรุปรายวัน และส่งออกข้อมูลมาตรฐาน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกข้อมูล (CSV)</span>
          </button>
        </div>
      </div>

      {/* Advanced Search & Multi-Filter Card */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-teal-600" />
            <span>ตัวกรองและสืบค้นข้อมูลแบบละเอียด</span>
          </h3>
          {(searchTerm || statusFilter !== 'all' || hospitalFilter !== 'all' || startDate || endDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="lg:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">ค้นหารายการ</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ค้นหาตามรหัสเคส, ชื่อผู้ป่วย, กู้ชีพ, สถานที่..."
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-md pl-9 pr-3 py-2 outline-none font-medium focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">สถานะเคส</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-2 font-semibold outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">ทุกสถานะ ({cases.length})</option>
              <option value="new">ใหม่ (รอรับแจ้ง)</option>
              <option value="accepted">รับแจ้งแล้ว</option>
              <option value="arrived">ถึง รพ. แล้ว</option>
            </select>
          </div>

          {/* Hospital Filter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">รพ. ปลายทาง</label>
            <select
              value={hospitalFilter}
              onChange={(e) => {
                setHospitalFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-2 font-semibold outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">ทุกโรงพยาบาล</option>
              {hospitalList.map((hName) => (
                <option key={hName} value={hName}>
                  {hName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start & End */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ตั้งแต่วันที่</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-1.5 font-medium outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Responsive Table Container with Horizontal Scroll Container */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        {/* Responsive Table Wrapper with Standard Scrollbar Styling */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider whitespace-nowrap">
              <tr>
                <th scope="col" className="p-3">
                  <button
                    type="button"
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-1 hover:text-teal-700 cursor-pointer"
                  >
                    <span>รหัสเคส</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="p-3">
                  <button
                    type="button"
                    onClick={() => handleSort('reported_at')}
                    className="flex items-center gap-1 hover:text-teal-700 cursor-pointer"
                  >
                    <span>วัน-เวลา รับแจ้ง</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="p-3">ผู้แจ้งเหตุ / สังกัด</th>
                <th scope="col" className="p-3">
                  <button
                    type="button"
                    onClick={() => handleSort('patient_name')}
                    className="flex items-center gap-1 hover:text-teal-700 cursor-pointer"
                  >
                    <span>ผู้ป่วย</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </button>
                </th>
                <th scope="col" className="p-3">อาการ FAST</th>
                <th scope="col" className="p-3">NIHSS Score</th>
                <th scope="col" className="p-3">สถานที่เกิดเหตุ</th>
                <th scope="col" className="p-3">รพ. ปลายทาง</th>
                <th scope="col" className="p-3 text-center">สถานะ</th>
                <th scope="col" className="p-3 text-center min-w-[70px]">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-semibold">
                    ไม่พบรายการประวัติเคสที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    {/* Case ID */}
                    <td className="p-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                      {c.id}
                    </td>

                    {/* Reported Time */}
                    <td className="p-3 whitespace-nowrap text-slate-600 font-mono">
                      {new Date(c.reported_at).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>

                    {/* FR Responder */}
                    <td className="p-3 text-slate-900 font-bold whitespace-nowrap">
                      {c.fr_name}
                    </td>

                    {/* Patient Name & Demographics */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{c.patient_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        อายุ {c.age || '-'} ปี · เพศ {c.sex || '-'}
                      </div>
                    </td>

                    {/* FAST Symptoms */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {c.face && <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-200">F-ปากเบี้ยว</span>}
                        {c.arm && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200">A-แขนอ่อนแรง</span>}
                        {c.speech && <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200">S-พูดไม่ชัด</span>}
                        {!c.face && !c.arm && !c.speech && <span className="text-slate-400 text-[11px]">-</span>}
                      </div>
                    </td>

                    {/* NIHSS Score */}
                    <td className="p-3 whitespace-nowrap">
                      {c.nihss_total !== null ? (
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {c.nihss_total} / 42
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="p-3 text-slate-700 max-w-[200px] truncate" title={c.location}>
                      {c.location}
                    </td>

                    {/* Target Hospital */}
                    <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                      {c.hospital_name}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* View Details Action */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedCase(c)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200 cursor-pointer"
                        title="ดูรายละเอียดข้อมูลเคสอย่างสมบูรณ์"
                      >
                        <Eye className="w-4 h-4 text-teal-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Responsive Table Footer with Page Size Selector & Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              แสดง {filteredCases.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} ถึง{' '}
              {Math.min(currentPage * pageSize, filteredCases.length)} จากทั้งหมด{' '}
              <strong className="text-slate-900">{filteredCases.length}</strong> รายการ
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-300">
              <span className="font-medium text-slate-500">แสดงหน้าละ:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded px-2 py-0.5 font-bold outline-none"
              >
                <option value={5}>5 รายการ</option>
                <option value={10}>10 รายการ</option>
                <option value={20}>20 รายการ</option>
                <option value={50}>50 รายการ</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-800">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Case Details Modal Popup */}
      {selectedCase && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  รายละเอียดประวัติเคส: {selectedCase.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Status Header */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">สถานะปัจจุบัน</div>
                  <div className="mt-0.5">{getStatusBadge(selectedCase.status)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold">เวลาแจ้งเหตุ</div>
                  <div className="font-mono font-bold text-slate-800">
                    {new Date(selectedCase.reported_at).toLocaleString('th-TH')}
                  </div>
                </div>
              </div>

              {/* Patient & Responder Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>ผู้ป่วย</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{selectedCase.patient_name}</div>
                  <div className="text-slate-500">
                    อายุ {selectedCase.age || '-'} ปี · เพศ {selectedCase.sex || '-'}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>เจ้าหน้าที่แจ้งเหตุ</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{selectedCase.fr_name}</div>
                  <div className="text-slate-500">สังกัดหน่วยงานภาคสนาม</div>
                </div>
              </div>

              {/* Hospital & Location */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <Hospital className="w-3.5 h-3.5 text-teal-600" />
                  <span>โรงพยาบาลรับตัว & สถานที่เกิดเหตุ</span>
                </div>
                <div className="font-bold text-teal-800">{selectedCase.hospital_name}</div>
                <div className="text-slate-600">{selectedCase.location}</div>
              </div>

              {/* FAST Assessment & NIHSS Score */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>ผลการประเมินทางคลินิก (FAST & NIHSS)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="font-semibold text-slate-500 block text-[10px]">อาการ FAST Track</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {[
                        selectedCase.face ? 'F-ปากเบี้ยว' : null,
                        selectedCase.arm ? 'A-แขนอ่อนแรง' : null,
                        selectedCase.speech ? 'S-พูดไม่ชัด' : null,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'ไม่มีอาการชี้ชัด'}
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="font-semibold text-slate-500 block text-[10px]">คะแนน NIHSS รวม</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {selectedCase.nihss_total !== null
                        ? `${selectedCase.nihss_total} / 42 (${selectedCase.nihss_severity || ''})`
                        : 'ไม่ได้ประเมิน'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-bold text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
