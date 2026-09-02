import React, { useState, useEffect } from 'react';
import { Hospital as HospitalIcon, Clock, CheckCircle2, Navigation, Eye, Trash2, RefreshCw, AlertTriangle, UserCheck, Siren, MapPin, Map, RotateCcw, Timer, Activity, TrendingUp, CalendarClock, FileText, Images, X, ChevronDown, ChevronUp, ShieldOff } from 'lucide-react';
import { CaseRecord, CaseStatus, Hospital } from '../types/emergency';
import { UrgencyRing, getUrgency, fmtRemaining } from '../components/UrgencyTimer';
import { HospitalRecordForm } from '../components/HospitalRecordForm';
import { fetchHospitalRecord } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Clinical Time KPI Helpers ---

/** Format minutes to "X ชม. Y นาที" or "Y นาที" */
function fmtMinutes(totalMinutes: number): string {
  const absMin = Math.abs(Math.round(totalMinutes));
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  if (h > 0) return `${h} ชม. ${m} นาที`;
  return `${m} นาที`;
}

/** Time difference in minutes between two ISO strings (a → b) */
function diffMinutes(isoA: string, isoB: string): number | null {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  if (isNaN(a) || isNaN(b)) return null;
  return (b - a) / 60000;
}

/** Format ISO to Thai time HH:MM */
function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } catch { return '--:--'; }
}

/** Format ISO to Thai short date time: e.g. "18 ส.ค. 69 · 08:18 น." */
function fmtThaiDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '--/--/---- --:--';
    const day = d.getDate();
    const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = monthNames[d.getMonth()];
    const year = (d.getFullYear() + 543).toString().slice(-2);
    const time = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} ${year} · ${time} น.`;
  } catch {
    return '--/--/---- --:--';
  }
}

interface HospitalMonitorPageProps {
  cases: CaseRecord[];
  hospitals?: Hospital[];
  onUpdateStatus: (id: string, status: CaseStatus) => Promise<void>;
  onDeleteCase?: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onResetAll: () => Promise<void>;
}

/** Collapsible thumbnail strip for additional case photos */
const AdditionalPhotosStrip: React.FC<{ photos: string[] }> = ({ photos }) => {
  const [expanded, setExpanded] = useState(false);

  const openPreview = (url: string) => {
    MySwal.fire({
      title: 'รูปภาพประกอบ',
      imageUrl: url,
      imageAlt: 'รูปภาพเพิ่มเติม',
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#0d9488',
      customClass: { image: 'rounded-md max-h-[70vh] object-contain border border-slate-200 shadow-md' },
    });
  };

  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-100">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors w-full"
      >
        <Images className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>รูปภาพเพิ่มเติม ({photos.length} ภาพ)</span>
        {expanded
          ? <ChevronUp className="w-3 h-3 ml-auto text-slate-400" />
          : <ChevronDown className="w-3 h-3 ml-auto text-slate-400" />
        }
      </button>

      {expanded && (
        <div className="mt-2 grid grid-cols-5 sm:grid-cols-8 gap-1.5">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-md overflow-hidden border border-slate-200 shadow-sm cursor-pointer aspect-square"
              onClick={() => openPreview(url)}
            >
              <img
                src={url}
                alt={`ภาพที่ ${idx + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-4 h-4 text-white drop-shadow" />
              </div>
              <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-white drop-shadow select-none">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const HospitalMonitorPage: React.FC<HospitalMonitorPageProps> = ({
  cases,
  hospitals = [],
  onUpdateStatus,
  onDeleteCase,
  onRefresh,
  onResetAll,
}) => {
  const { user } = useAuth();
  const [nowMs, setNowMs] = useState(Date.now());
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'done' | 'mine'>('active');
  const [selectedCaseForForm, setSelectedCaseForForm] = useState<CaseRecord | null>(null);
  const [recordedCaseIds, setRecordedCaseIds] = useState<Set<string>>(new Set());

  // ── Role-Based Permission Matrix ──────────────────────────────────────────
  // FR (fr_dispatch): View only — ไม่สามารถรับเคส/อัปเดตสถานะ/ลบ/กรอกแบบบันทึก รพ.
  // ER Staff / Admin: สิทธิเต็ม — รับเคส อัปเดตสถานะ กรอกแบบบันทึก ลบ ยกเลิกสถานะ
  const role = user?.role ?? 'fr_dispatch';
  const canAccept     = role === 'er_staff' || role === 'admin';
  const canArrive     = role === 'er_staff' || role === 'admin';
  const canRevert     = role === 'er_staff' || role === 'admin';
  const canFillForm   = role === 'er_staff' || role === 'admin';
  const canDeleteCase = role === 'er_staff' || role === 'admin';
  const canResetAll   = role === 'admin';

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch recorded hospital forms status
  const checkRecordedForms = async () => {
    const updatedSet = new Set<string>();
    await Promise.all(
      cases.map(async c => {
        const rec = await fetchHospitalRecord(c.id);
        if (rec && (rec.recorded_by || rec.er_arrival_time || rec.er_nihss)) {
          updatedSet.add(c.id);
        }
      })
    );
    setRecordedCaseIds(updatedSet);
  };

  useEffect(() => {
    checkRecordedForms();
  }, [cases]);

  const activeCases = cases.filter(c => c.status !== 'arrived');
  const doneCases = cases.filter(c => c.status === 'arrived');
  const myCases = cases.filter(c => c.fr_name === user?.full_name);

  const displayedCases = cases.filter(c => {
    if (filterStatus === 'active') return c.status !== 'arrived';
    if (filterStatus === 'done') return c.status === 'arrived';
    if (filterStatus === 'mine') return c.fr_name === user?.full_name;
    return true;
  });

  // Sort cases by reported_at timestamp descending (latest case at the top)
  const sortedCases = [...displayedCases].sort((a, b) => {
    const tA = new Date(a.reported_at).getTime();
    const tB = new Date(b.reported_at).getTime();
    return tB - tA;
  });

  const handlePreviewPhoto = (photoUrl: string | null) => {
    if (!photoUrl) return;
    MySwal.fire({
      title: 'รูปถ่ายผู้ป่วย / บัตรประชาชน',
      imageUrl: photoUrl,
      imageAlt: 'Patient ID Card',
      confirmButtonText: 'ปิดหน้าต่าง',
      confirmButtonColor: '#0d9488',
      customClass: {
        image: 'rounded-md max-h-96 object-contain',
      }
    });
  };

  const handleDeleteSingleCaseConfirm = async (c: CaseRecord) => {
    const confirmRes = await MySwal.fire({
      title: 'ยืนยันการลบเคสนี้?',
      html: `
        <div class="text-left text-xs space-y-1.5 p-2.5 bg-rose-50 rounded border border-rose-200">
          <div><b class="text-slate-700">รหัสเคส:</b> <span class="font-mono font-bold text-rose-700">${c.id}</span></div>
          <div><b class="text-slate-700">ชื่อผู้ป่วย:</b> <span class="font-bold text-slate-800">${c.patient_name}</span> (${c.age || '-'} ปี, ${c.sex})</div>
          <div><b class="text-slate-700">ผู้แจ้งเหตุ:</b> ${c.fr_name}</div>
          <div class="text-[11px] text-rose-600 font-semibold pt-1 border-t border-rose-200">
            ⚠️ คำเตือน: ข้อมูลเคสนี้จะถูกลบออกจากฐานข้อมูลและระบบมอนิเตอร์เรียลไทม์อย่างถาวร
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันลบเคสนี้',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (confirmRes.isConfirmed && onDeleteCase) {
      await onDeleteCase(c.id);
      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `ลบเคสรหัส ${c.id} สำเร็จ`,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  const handleResetConfirm = async () => {
    const res = await MySwal.fire({
      title: 'ล้างข้อมูลเคสทั้งหมด?',
      text: 'การดำเนินการนี้จะลบรายการเคสทั้งหมดออกจากฐานข้อมูลหลักและระบบเรียลไทม์',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบข้อมูลทั้งหมด',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (res.isConfirmed) {
      await onResetAll();
      await onRefresh();
      MySwal.fire({
        icon: 'success',
        title: 'ล้างข้อมูลสำเร็จ',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleRevertStatus = async (c: CaseRecord, targetStatus: CaseStatus, labelText: string) => {
    const confirmRes = await MySwal.fire({
      title: 'ยืนยันการยกเลิกสถานะ?',
      html: `
        <div class="text-left text-xs space-y-1.5 p-2 bg-slate-50 rounded border border-slate-200">
          <div><b>รหัสเคส:</b> ${c.id}</div>
          <div><b>ผู้ป่วย:</b> ${c.patient_name}</div>
          <div><b>การดำเนินการ:</b> <span class="text-rose-600 font-bold">${labelText}</span></div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันยกเลิกสถานะ',
      cancelButtonText: 'ปิดหน้าต่าง',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (confirmRes.isConfirmed) {
      await onUpdateStatus(c.id, targetStatus);
      MySwal.fire({
        icon: 'success',
        title: 'ยกเลิกสถานะเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HospitalIcon className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">หน้าจอห้องฉุกเฉิน รพ. ปลายทาง (ER Monitor)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รับสัญญาณแจ้งเตือนผู้ป่วยวิกฤต real-time พร้อมนาฬิกานับถอยหลังช่วง Golden Hour (tPA 4.5 ชม.)
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>รีเฟรชข้อมูล</span>
          </button>

          {canResetAll && (
            <button
              type="button"
              onClick={handleResetConfirm}
              className="flex items-center justify-center p-2 text-rose-600 hover:bg-rose-50 rounded-md text-xs border border-rose-200 transition-colors"
              title="ล้างข้อมูลเคสทั้งหมด (Admin เท่านั้น)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs — Modern responsive scrollable pill bar */}
      <div className="relative">
        {/* Scroll container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">

          {/* กำลังรอดำเนินการ */}
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`shrink-0 relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer border ${
              filterStatus === 'active'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : `border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 ${activeCases.length > 0 ? 'text-rose-700' : ''}`
            }`}
          >
            <Siren className={`w-3.5 h-3.5 shrink-0 ${filterStatus !== 'active' && activeCases.length > 0 ? 'text-rose-500' : ''}`} />
            <span className="whitespace-nowrap">กำลังรอดำเนินการ</span>
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-md text-[10px] font-extrabold leading-none ${
              filterStatus === 'active'
                ? 'bg-white/25 text-white'
                : activeCases.length > 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-500'
            }`}>
              {activeCases.length}
            </span>
          </button>

          {/* ถึง รพ. แล้ว */}
          <button
            type="button"
            onClick={() => setFilterStatus('done')}
            className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 border ${
              filterStatus === 'done'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">ถึง รพ. แล้ว</span>
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-md text-[10px] font-extrabold leading-none ${
              filterStatus === 'done'
                ? 'bg-white/25 text-white'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {doneCases.length}
            </span>
          </button>

          {/* รายการทั้งหมด */}
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 border ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">ทั้งหมด</span>
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-md text-[10px] font-extrabold leading-none ${
              filterStatus === 'all'
                ? 'bg-white/25 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {cases.length}
            </span>
          </button>

          {/* Divider */}
          <div className="shrink-0 h-6 w-px bg-slate-200 mx-1" />

          {/* เคสของฉัน — only show when user is logged-in */}
          {user && (
            <button
              type="button"
              onClick={() => setFilterStatus('mine')}
              className={`shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 border ${
                filterStatus === 'mine'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : myCases.length > 0
                    ? 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                    : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">เคสของฉัน</span>
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-md text-[10px] font-extrabold leading-none ${
                filterStatus === 'mine'
                  ? 'bg-white/25 text-white'
                  : myCases.length > 0
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {myCases.length}
              </span>
            </button>
          )}
        </div>

        {/* Bottom border line */}
        <div className="h-px bg-slate-200 mt-2" />
      </div>

      {/* Cases List */}
      {sortedCases.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-slate-500 shadow-sm space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-slate-700">ไม่มีรายการเคสค้างในขณะนี้</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ระบบพร้อมรับสัญญาณแจ้งเตือนภัยตลอด 24 ชั่วโมง เมื่อหน่วยกู้ชีพกดส่งเหตุ ข้อมูลจะปรากฏบนหน้าจอนี้ทันที
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedCases.map((c) => {
            // --- tPA Timer Logic ---
            // When status is 'arrived': freeze the timer at the moment of arrival
            // (do NOT continue live countdown — patient is already at the ER)
            const isArrived = c.status === 'arrived';
            const urgency = getUrgency(c.onset_iso, isArrived ? new Date(c.reported_at).getTime() + 1 : nowMs);

            // Border & badge: arrived always shows emerald "completed", ignores urgency color
            let borderLeftClass = 'border-l-4 border-l-emerald-500';
            let badgeBgClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';

            if (!isArrived) {
              if (urgency.level === 'red') {
                borderLeftClass = 'border-l-4 border-l-rose-500 bg-rose-50/20';
                badgeBgClass = 'bg-rose-100 text-rose-800 border-rose-200';
              } else if (urgency.level === 'amber') {
                borderLeftClass = 'border-l-4 border-l-amber-500';
                badgeBgClass = 'bg-amber-100 text-amber-800 border-amber-200';
              } else if (urgency.level === 'expired') {
                borderLeftClass = 'border-l-4 border-l-slate-400';
                badgeBgClass = 'bg-slate-100 text-slate-600 border-slate-200';
              }
            }

            const mapsUrl = c.latitude && c.longitude
              ? `https://maps.google.com/?q=${c.latitude},${c.longitude}`
              : `https://maps.google.com/?q=${encodeURIComponent(c.location)}`;

            return (
              <div
                key={c.id}
                className={`bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${borderLeftClass}`}
              >
                {/* ── Row 1: Ring + Patient Info (full width) ── */}
                <div className="flex items-start gap-4">
                  {/* tPA Ring */}
                  <div className="shrink-0 pt-1">
                    {isArrived ? (
                      <UrgencyRing pct={urgency.pct} level="green" size={88} stroke={8}>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-0.5" />
                        <span className="text-[9px] text-emerald-700 font-bold leading-tight">ถึง รพ.</span>
                        <span className="text-[9px] text-emerald-600 leading-tight">แล้ว</span>
                      </UrgencyRing>
                    ) : (
                      <UrgencyRing pct={urgency.pct} level={urgency.level} size={88} stroke={8}>
                        <span className="font-bold text-slate-800 text-xs leading-none">
                          {urgency.level === 'expired' ? 'เกินเวลา' : fmtRemaining(urgency.remainingMin)}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-1 font-medium">เหลือ tPA</span>
                      </UrgencyRing>
                    )}
                  </div>

                  {/* Patient Main Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Status + Case ID + Hospital */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {c.id}
                      </span>
                      {c.status === 'new' && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md border border-rose-200 bg-rose-100 text-rose-800 flex items-center gap-1">
                          <Siren className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>รพ. ยังไม่กดรับตัว</span>
                        </span>
                      )}
                      {c.status === 'accepted' && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md border border-amber-200 bg-amber-100 text-amber-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>รพ. รับทราบแล้ว (เตรียมห้อง ER)</span>
                        </span>
                      )}
                      {c.status === 'arrived' && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200 bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>ถึงโรงพยาบาลแล้ว</span>
                        </span>
                      )}
                      {c.status === 'arrived' && (
                        recordedCaseIds.has(c.id) ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>กรอก F-PCT-001/ER แล้ว</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 alert-spread-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>รอแบบบันทึก รพ. (ยังไม่ได้กรอก)</span>
                          </span>
                        )
                      )}
                      <span className="text-xs font-medium text-slate-500">
                        แจ้งปลายทาง: <b>{c.hospital_name}</b>
                      </span>
                    </div>

                    {/* Patient Name */}
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {c.patient_name}{c.age ? ` · อายุ ${c.age} ปี` : ''}{c.sex ? ` (${c.sex})` : ''}
                    </h3>

                    {/* Location */}
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </p>

                    {/* FAST + NIHSS — full width */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 ${Boolean(c.face) ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                        <span className="font-black">F</span>
                        <span>{Boolean(c.face) ? 'ใบหน้าเบี้ยว' : 'ปกติ'}</span>
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 ${Boolean(c.arm) ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                        <span className="font-black">A</span>
                        <span>{Boolean(c.arm) ? 'แขนอ่อนแรง' : 'ปกติ'}</span>
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border flex items-center gap-1 ${Boolean(c.speech) ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                        <span className="font-black">S</span>
                        <span>{Boolean(c.speech) ? 'พูดไม่ชัด' : 'ปกติ'}</span>
                      </span>
                      {c.nihss_total !== null && (
                        <span className="text-[11px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-semibold border border-teal-200">
                          NIHSS {c.nihss_total}/42 · {c.nihss_severity}
                        </span>
                      )}
                    </div>

                    {/* Dispatcher & Thai Date Time */}
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>ผู้แจ้ง: <b className="text-slate-700">{c.fr_name}</b></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <CalendarClock className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>วัน-เวลาแจ้งเหตุ: <b className="text-slate-800 font-bold">{fmtThaiDate(c.reported_at)}</b></span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Row 2: Clinical Time KPIs (full width) ── */}
                {(() => {
                  const onsetToDispatch = diffMinutes(c.onset_iso, c.reported_at);
                  const dispatchElapsed = isArrived
                    ? null
                    : (nowMs - new Date(c.reported_at).getTime()) / 60000;
                  const tpaUsedPct = Math.min(100, Math.max(0,
                    ((nowMs - new Date(c.onset_iso).getTime()) / (270 * 60000)) * 100
                  ));
                  const tpaUsedMin = (nowMs - new Date(c.onset_iso).getTime()) / 60000;

                  return (
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                      {/* Onset → แจ้งเหตุ */}
                      {onsetToDispatch !== null && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 mb-0.5">
                            <CalendarClock className="w-2.5 h-2.5 shrink-0" />
                            Onset → แจ้งเหตุ
                          </span>
                          <span className={`text-xs font-bold ${onsetToDispatch <= 30 ? 'text-emerald-700' :
                              onsetToDispatch <= 60 ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                            {fmtMinutes(onsetToDispatch)}
                          </span>
                        </div>
                      )}

                      {/* นับตั้งแต่แจ้งเหตุ (active only) */}
                      {!isArrived && dispatchElapsed !== null && (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 mb-0.5">
                            <Timer className="w-2.5 h-2.5 shrink-0" />
                            นับตั้งแต่แจ้งเหตุ
                          </span>
                          <span className={`text-xs font-bold ${dispatchElapsed <= 20 ? 'text-emerald-700' :
                              dispatchElapsed <= 45 ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                            {fmtMinutes(dispatchElapsed)}
                          </span>
                        </div>
                      )}

                      {/* LKW */}
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 mb-0.5">
                          <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                          LKW (เริ่มอาการ)
                        </span>
                        <span className="text-xs font-bold text-slate-700">{fmtTime(c.onset_iso)} น.</span>
                      </div>

                      {/* tPA Progress — spans remaining columns */}
                      <div className="flex flex-col col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 mb-0.5">
                          <Activity className="w-2.5 h-2.5 shrink-0" />
                          {isArrived ? 'tPA ที่ใช้ ณ ถึง รพ.' : 'tPA ที่ใช้ไปแล้ว'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${tpaUsedPct < 50 ? 'bg-emerald-500' :
                                  tpaUsedPct < 80 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                              style={{ width: `${Math.min(100, tpaUsedPct)}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold whitespace-nowrap ${tpaUsedPct < 50 ? 'text-emerald-700' :
                              tpaUsedPct < 80 ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                            {Math.round(tpaUsedPct)}% · {fmtMinutes(tpaUsedMin)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Row 2.5: Additional Photos Strip ── */}
                {(() => {
                  const photos: string[] = Array.isArray(c.additional_photos) ? c.additional_photos : [];
                  if (photos.length === 0) return null;
                  return (
                    <AdditionalPhotosStrip photos={photos} />
                  );
                })()}

                {/* ── Row 3: Action Buttons (Responsive Layout) ── */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {/* Left Group: Primary Actions & Revert Buttons */}
                  <div className="flex flex-wrap items-center gap-2">

                    {/* FR View-Only Notice */}
                    {!canAccept && c.status === 'new' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
                        <ShieldOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        รอเจ้าหน้าที่ห้องฉุกเฉินดำเนินการรับเคส
                      </span>
                    )}
                    {!canArrive && c.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md">
                        <ShieldOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        รพ. รับทราบแล้ว — รอเจ้าหน้าที่ ER ยืนยันผู้ป่วยถึง
                      </span>
                    )}

                    {/* Accept (ER/Admin only) */}
                    {canAccept && c.status === 'new' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(c.id, 'accepted')}
                        className="flex-1 sm:flex-initial bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 sm:py-2 rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-[0.99]"
                      >
                        <UserCheck className="w-4 h-4 shrink-0" />
                        <span>กดรับแจ้งเหตุ (Accept)</span>
                      </button>
                    )}

                    {/* Patient Arrived (ER/Admin only) */}
                    {canArrive && c.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(c.id, 'arrived')}
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 sm:py-2 rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-[0.99]"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>ผู้ป่วยถึง รพ. แล้ว</span>
                      </button>
                    )}

                    {/* Revert status for accepted (ER/Admin only) */}
                    {canRevert && c.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => handleRevertStatus(c, 'new', 'ยกเลิกสถานะรับแจ้งเหตุ')}
                        className="bg-slate-100 hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-slate-200 hover:border-rose-300 font-semibold text-[11px] py-2.5 sm:py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1 shrink-0"
                        title="กรณีรับเคสผิดพลาด"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>ยกเลิกสถานะรับแจ้ง</span>
                      </button>
                    )}

                    {/* Arrived status actions (ER/Admin only) */}
                    {c.status === 'arrived' && (
                      <>
                        {canFillForm && (
                          <button
                            type="button"
                            onClick={() => setSelectedCaseForForm(c)}
                            className={`font-bold text-xs px-3.5 py-2.5 sm:py-2 rounded-md shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              recordedCaseIds.has(c.id)
                                ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-white alert-spread-pulse'
                            }`}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>
                              {recordedCaseIds.has(c.id) ? 'ดู/แก้ไขแบบบันทึก รพ. (F-PCT-001/ER)' : 'กรอกข้อมูล รพ. (F-PCT-001/ER)'}
                            </span>
                          </button>
                        )}
                        {!canFillForm && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            ผู้ป่วยถึงโรงพยาบาลแล้ว — รอเจ้าหน้าที่ ER กรอกแบบบันทึก
                          </span>
                        )}
                        {canRevert && (
                          <button
                            type="button"
                            onClick={() => handleRevertStatus(c, 'new', 'ยกเลิกสถานะผู้ป่วยถึงโรงพยาบาล')}
                            className="bg-slate-100 hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-slate-200 hover:border-rose-300 font-semibold text-[11px] py-2.5 sm:py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-1 shrink-0"
                            title="กรณีบันทึกผิดพลาด"
                          >
                            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                            <span>ยกเลิกสถานะถึง รพ.</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right Group: Google Maps, Preview Photo, Delete Case */}
                  <div className="flex items-center gap-2 justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-md transition-colors border border-slate-200"
                    >
                      <Map className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Google Maps</span>
                    </a>

                    {c.id_photo_url && (
                      <button
                        type="button"
                        onClick={() => handlePreviewPhoto(c.id_photo_url)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-1.5 rounded-md transition-colors border border-slate-200 flex items-center justify-center shrink-0"
                        title="ดูรูปถ่ายบัตร/อาการ"
                      >
                        <Eye className="w-4 h-4 text-teal-600" />
                      </button>
                    )}

                    {canDeleteCase && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSingleCaseConfirm(c)}
                        className="bg-slate-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 p-2 sm:p-1.5 rounded-md transition-colors border border-slate-200 hover:border-rose-300 flex items-center justify-center shrink-0"
                        title="ลบเคสนี้ออกจากระบบ (ER / Admin เท่านั้น)"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hospital Record Form Modal */}
      {selectedCaseForForm && (
        <HospitalRecordForm
          caseData={selectedCaseForForm}
          hospitals={hospitals}
          onClose={() => setSelectedCaseForForm(null)}
          onSaved={() => {
            setSelectedCaseForForm(null);
            checkRecordedForms();
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
