import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Save, ClipboardList, Clock, Activity, Beaker, Scan,
  Brain, AlertCircle, Send, FileText, ChevronDown, ChevronUp, Loader2, Zap, Trash2, CheckCircle2
} from 'lucide-react';
import { HospitalRecord, CaseRecord, StrokeTrack, ArrivalMode, StrokeCTResult, Hospital } from '../types/emergency';
import { fetchHospitalRecord, saveHospitalRecord, fetchHospitals, deleteHospitalRecord } from '../services/api';
import { SearchableSelect } from './SearchableSelect';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '../context/AuthContext';

const MySwal = withReactContent(Swal);

// ────────────────────────────────────────────────────
// Empty record factory
// ────────────────────────────────────────────────────
function emptyRecord(caseId: string): Omit<HospitalRecord, 'id' | 'recorded_at'> {
  return {
    case_id: caseId, recorded_by: '',
    er_arrival_time: '', arrival_mode: '', refer_from_hospital: '',
    stroke_track: '', stroke_activate_time: '',
    er_weakness_side: '', er_communication: false, er_speech_unclear: false,
    er_facial_droop: false, er_unsteady_gait: false, er_visual_loss: false, er_drowsy: false,
    er_gcs_e: '', er_gcs_v: '', er_gcs_m: '',
    er_motor_arm_left: '', er_motor_arm_right: '', er_motor_leg_left: '', er_motor_leg_right: '',
    er_nihss: '',
    blood_draw_time: '', lab_send_time: '', lab_result_time: '',
    ct_order_time: '', ct_transfer_er_to_ct_time: '', ct_scan_time: '',
    ct_transfer_ct_to_er_time: '', ct_doctor_view_time: '', ct_official_result_time: '',
    ct_result_type: '',
    consult_neuro_med_time: '', rtpa_decision: '', rtpa_contraindication_reason: '',
    rtpa_bw_kg: '', rtpa_total_dose_mg: '', rtpa_bolus_dose_mg: '', rtpa_bolus_time: '',
    rtpa_drip_dose_mg: '', rtpa_drip_time: '', rtpa_finish_time: '',
    consult_neuro_sx_time: '', consult_neuro_med_hemo_time: '',
    surgery_decision: '', surgery_time: '',
    refer_to_hospital: '', refer_accept_time: '',
    transfer_center_contact_time: '', transfer_depart_time: '',
    problems_notes: '',
  };
}

// Helper: Get current HH:MM time string
function getCurrentTimeString(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, color, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200/90 rounded-md shadow-2xs">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-sm ${color} rounded-t-md transition-colors cursor-pointer`}
      >
        <span className="flex items-center gap-2">{icon}{title}</span>
        {open ? <ChevronUp className="w-4 h-4 opacity-75" /> : <ChevronDown className="w-4 h-4 opacity-75" />}
      </button>
      {open && <div className="p-4 space-y-3 bg-white rounded-b-md">{children}</div>}
    </div>
  );
}

function TimeInput({ label, value, onChange, required }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-slate-500 font-medium">{label}{required && <span className="text-rose-500 ml-0.5">*</span>}</label>
        <button
          type="button"
          onClick={() => onChange(getCurrentTimeString())}
          className="text-[10px] text-teal-600 hover:text-teal-800 hover:bg-teal-50 font-semibold px-1.5 py-0.5 rounded-md transition-colors flex items-center gap-0.5"
          title="กดเพื่อบันทึกเวลาปัจจุบัน"
        >
          <Zap className="w-3 h-3" />
          <span>ตอนนี้</span>
        </button>
      </div>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
      />
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[11px] text-slate-500 font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs border border-slate-200 rounded-md px-2 py-1.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-400 placeholder-slate-300"
      />
    </div>
  );
}

function NumInput({ label, value, onChange, min = 0, max = 99, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; min?: number; max?: number; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[11px] text-slate-500 font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        min={min} max={max}
        placeholder={placeholder}
        className="text-xs border border-slate-200 rounded-md px-2 py-1.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-400 placeholder-slate-300"
      />
    </div>
  );
}

function CheckboxItem({ label, checked, onChange, highlight }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; highlight?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer text-sm rounded-md px-2 py-1.5 transition-colors ${
      checked && highlight ? 'bg-rose-50 text-rose-800' : 'hover:bg-slate-50 text-slate-700'
    }`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-3.5 h-3.5 accent-teal-600 shrink-0"
      />
      <span className="text-xs font-medium">{label}</span>
    </label>
  );
}

function RadioGroup({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <label key={opt.value} className={`flex items-center gap-1.5 cursor-pointer text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
            value === opt.value
              ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="w-3 h-3 accent-teal-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────
// Main Modal Component
// ────────────────────────────────────────────────────
interface HospitalRecordFormProps {
  caseData: CaseRecord;
  hospitals?: Hospital[];
  onClose: () => void;
  onSaved: () => void;
}

export const HospitalRecordForm: React.FC<HospitalRecordFormProps> = ({ caseData, hospitals: propHospitals = [], onClose, onSaved }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<HospitalRecord, 'id' | 'recorded_at'>>(emptyRecord(caseData.id));
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>(propHospitals);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const currentUserText = user ? `${user.full_name}${user.agency_name ? ` (${user.agency_name})` : ''}` : 'ผู้ใช้งานในระบบ';

  // Load existing record & hospitals on mount
  useEffect(() => {
    Promise.all([
      fetchHospitalRecord(caseData.id),
      propHospitals.length > 0 ? Promise.resolve(propHospitals) : fetchHospitals(),
    ]).then(([rec, hospList]) => {
      if (rec) {
        setForm({ ...emptyRecord(caseData.id), ...rec, recorded_by: rec.recorded_by || currentUserText });
      } else {
        setForm(prev => ({ ...prev, recorded_by: currentUserText }));
      }
      setHospitalsList(hospList);
      setLoading(false);
    });
  }, [caseData.id, propHospitals, currentUserText]);

  function set<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    const ok = await saveHospitalRecord(caseData.id, form);
    setSaving(false);
    if (ok) {
      setSaveMsg('บันทึกสำเร็จ');
      setTimeout(() => { setSaveMsg(null); onSaved(); }, 1200);
    } else {
      setSaveMsg('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  }

  async function handleClearFormConfirm() {
    const confirmRes = await MySwal.fire({
      title: 'ล้างข้อมูลแบบบันทึก รพ.?',
      html: `
        <div class="text-left text-xs space-y-1.5 p-3 bg-rose-50 rounded border border-rose-200">
          <div><b class="text-slate-700">รหัสเคส:</b> <span class="font-mono font-bold text-rose-700">${caseData.id}</span></div>
          <div><b class="text-slate-700">ผู้ป่วย:</b> ${caseData.patient_name}</div>
          <div class="text-[11px] text-rose-600 font-semibold pt-1 border-t border-rose-200">
            ⚠️ คำเตือน: ข้อมูลการรักษาทางคลินิก (Door time, NIHSS, CT Scan, Lab, ฯลฯ) ของเคสนี้จะถูกรีเซ็ตและลบออกจากระบบอย่างถาวร
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันล้างข้อมูล',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (confirmRes.isConfirmed) {
      setSaving(true);
      await deleteHospitalRecord(caseData.id);
      setForm(emptyRecord(caseData.id));
      setSaving(false);
      setSaveMsg('ล้างข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => {
        setSaveMsg(null);
        onSaved();
      }, 1200);
    }
  }

  // ── GCS total
  const gcsTotal = (parseInt(form.er_gcs_e) || 0) + (parseInt(form.er_gcs_v) || 0) + (parseInt(form.er_gcs_m) || 0);

  if (loading) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-md p-6 shadow-2xl flex items-center gap-3 text-slate-700 border border-slate-100">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          <span className="text-sm font-semibold">กำลังโหลดข้อมูลแบบบันทึก...</span>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Modal Dialog Card Container */}
      <div className="bg-slate-50 rounded-md shadow-2xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Modal Header (Sticky) */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-600 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <ClipboardList className="w-5 h-5 text-teal-200 shrink-0" />
              <h2 className="font-bold text-sm sm:text-base leading-tight truncate">
                แบบบันทึกข้อมูลผู้ป่วย Stroke โรงพยาบาล (F-PCT-001/ER)
              </h2>
            </div>
            <div className="text-teal-100 text-[11px] sm:text-xs flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span>รหัสเคส: <b className="text-white font-mono font-semibold">{caseData.id}</b></span>
              <span className="hidden sm:inline text-teal-300">•</span>
              <span>ผู้ป่วย: <b className="text-white font-semibold">{caseData.patient_name}</b></span>
              {caseData.age && <span>({caseData.age} ปี{caseData.sex ? `, ${caseData.sex}` : ''})</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors shrink-0 text-white/90 hover:text-white"
            title="ปิดหน้าต่าง (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-3 sm:p-5 sm:space-y-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">

          {/* ── Section 1: ER Arrival ── */}
          <Section
            title="ส่วนที่ 1 — การรับผู้ป่วยที่ ER"
            icon={<Clock className="w-4 h-4" />}
            color="bg-teal-50 text-teal-800 hover:bg-teal-100"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <TimeInput label="เวลาถึง ER (Door Time)" value={form.er_arrival_time} onChange={v => set('er_arrival_time', v)} required />
              <TimeInput label="เวลา Activate Team (Fast Tract)" value={form.stroke_activate_time} onChange={v => set('stroke_activate_time', v)} />
            </div>
            <RadioGroup
              label="ช่องทางมา รพ."
              value={form.arrival_mode}
              onChange={v => set('arrival_mode', v as ArrivalMode)}
              options={[
                { value: 'self', label: 'มาเอง' },
                { value: 'ems', label: 'EMS / กู้ชีพ' },
                { value: 'refer', label: 'Refer จาก รพ. อื่น' },
              ]}
            />
            {form.arrival_mode === 'refer' && (
              <SearchableSelect
                label="Refer มาจาก รพ. (ค้นหาจากตารางข้อมูล)"
                placeholder="เลือกโรงพยาบาลต้นทาง..."
                hospitals={hospitalsList}
                selectedHospitalName={form.refer_from_hospital}
                onSelectHospital={(h) => set('refer_from_hospital', h.name)}
              />
            )}
            <RadioGroup
              label="ประเภท Track"
              value={form.stroke_track}
              onChange={v => set('stroke_track', v as StrokeTrack)}
              options={[
                { value: 'fast_tract', label: 'Stroke Fast Tract (< 4.5 ชม.)' },
                { value: 'non_fast_tract', label: 'Non-Fast Track' },
                { value: 'no_stroke', label: 'No Stroke' },
              ]}
            />
          </Section>

          {/* ── Section 2: Clinical Assessment ── */}
          <Section
            title="ส่วนที่ 2 — อาการและการแสดงที่ ER"
            icon={<Activity className="w-4 h-4" />}
            color="bg-rose-50 text-rose-800 hover:bg-rose-100"
          >
            <RadioGroup
              label="อ่อนแรงครึ่งซีก"
              value={form.er_weakness_side}
              onChange={v => set('er_weakness_side', v)}
              options={[
                { value: 'left', label: 'ซีกซ้าย' },
                { value: 'right', label: 'ซีกขวา' },
                { value: 'both', label: 'ทั้งสองข้าง' },
                { value: 'none', label: 'ไม่มี' },
              ]}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              <CheckboxItem label="สื่อสารไม่เข้าใจ" checked={Boolean(form.er_communication)} onChange={v => set('er_communication', v)} highlight />
              <CheckboxItem label="พูดไม่ชัด" checked={Boolean(form.er_speech_unclear)} onChange={v => set('er_speech_unclear', v)} highlight />
              <CheckboxItem label="ปากเบี้ยว" checked={Boolean(form.er_facial_droop)} onChange={v => set('er_facial_droop', v)} highlight />
              <CheckboxItem label="เดินเซ" checked={Boolean(form.er_unsteady_gait)} onChange={v => set('er_unsteady_gait', v)} highlight />
              <CheckboxItem label="ตามัว / มองไม่เห็น" checked={Boolean(form.er_visual_loss)} onChange={v => set('er_visual_loss', v)} highlight />
              <CheckboxItem label="ซึมลง" checked={Boolean(form.er_drowsy)} onChange={v => set('er_drowsy', v)} highlight />
            </div>

            {/* GCS */}
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1.5">Glasgow Coma Scale (GCS)</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 items-end">
                <NumInput label="E — Eye (1-4)" value={form.er_gcs_e} onChange={v => set('er_gcs_e', v)} min={1} max={4} placeholder="1-4" />
                <NumInput label="V — Verbal (1-5)" value={form.er_gcs_v} onChange={v => set('er_gcs_v', v)} min={1} max={5} placeholder="1-5" />
                <NumInput label="M — Motor (1-6)" value={form.er_gcs_m} onChange={v => set('er_gcs_m', v)} min={1} max={6} placeholder="1-6" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-400 font-medium">GCS รวม</span>
                  <div className={`text-sm font-bold px-2 py-1.5 rounded-md text-center border ${
                    gcsTotal >= 13 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    gcsTotal >= 9  ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    gcsTotal > 0   ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    {gcsTotal > 0 ? `${gcsTotal}/15` : '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Motor Power */}
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1.5">Motor Power (0–5)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <NumInput label="แขนซ้าย (L arm)" value={form.er_motor_arm_left} onChange={v => set('er_motor_arm_left', v)} min={0} max={5} placeholder="0-5" />
                <NumInput label="แขนขวา (R arm)" value={form.er_motor_arm_right} onChange={v => set('er_motor_arm_right', v)} min={0} max={5} placeholder="0-5" />
                <NumInput label="ขาซ้าย (L leg)" value={form.er_motor_leg_left} onChange={v => set('er_motor_leg_left', v)} min={0} max={5} placeholder="0-5" />
                <NumInput label="ขาขวา (R leg)" value={form.er_motor_leg_right} onChange={v => set('er_motor_leg_right', v)} min={0} max={5} placeholder="0-5" />
              </div>
            </div>

            <NumInput
              label={`NIHSS ที่ ER ประเมิน (0-42)${caseData.nihss_total !== null ? ` — FR บันทึก: ${caseData.nihss_total}` : ''}`}
              value={form.er_nihss}
              onChange={v => set('er_nihss', v)}
              min={0} max={42}
              placeholder="0-42"
            />
          </Section>

          {/* ── Section 3: Investigation Timeline ── */}
          <Section
            title="ส่วนที่ 3 — Investigation Timeline"
            icon={<Beaker className="w-4 h-4" />}
            color="bg-amber-50 text-amber-800 hover:bg-amber-100"
          >
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">ห้องปฏิบัติการ (Lab)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <TimeInput label="เจาะเลือด" value={form.blood_draw_time} onChange={v => set('blood_draw_time', v)} />
              <TimeInput label="ส่ง Lab" value={form.lab_send_time} onChange={v => set('lab_send_time', v)} />
              <TimeInput label="ได้ผล Lab" value={form.lab_result_time} onChange={v => set('lab_result_time', v)} />
            </div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mt-2">CT Scan Timeline</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <TimeInput label="โทรแจ้ง CT" value={form.ct_order_time} onChange={v => set('ct_order_time', v)} />
              <TimeInput label="Transfer ER → CT" value={form.ct_transfer_er_to_ct_time} onChange={v => set('ct_transfer_er_to_ct_time', v)} />
              <TimeInput label="ทำ CT" value={form.ct_scan_time} onChange={v => set('ct_scan_time', v)} />
              <TimeInput label="Transfer CT → ER" value={form.ct_transfer_ct_to_er_time} onChange={v => set('ct_transfer_ct_to_er_time', v)} />
              <TimeInput label="แพทย์ดู CT" value={form.ct_doctor_view_time} onChange={v => set('ct_doctor_view_time', v)} />
              <TimeInput label="ผล CT Official" value={form.ct_official_result_time} onChange={v => set('ct_official_result_time', v)} />
            </div>
            <RadioGroup
              label="ผลการวินิจฉัย CT"
              value={form.ct_result_type}
              onChange={v => set('ct_result_type', v as StrokeCTResult)}
              options={[
                { value: 'ischemic', label: 'Ischemic Stroke' },
                { value: 'hemorrhagic', label: 'Hemorrhagic Stroke' },
                { value: 'normal', label: 'Normal' },
                { value: 'other', label: 'อื่นๆ' },
              ]}
            />
          </Section>

          {/* ── Section 4: Ischemic Stroke ── */}
          {(form.ct_result_type === 'ischemic' || form.ct_result_type === '') && (
            <Section
              title="ส่วนที่ 4 — ผล CT: Ischemic Stroke"
              icon={<Brain className="w-4 h-4" />}
              color="bg-blue-50 text-blue-800 hover:bg-blue-100"
              defaultOpen={form.ct_result_type === 'ischemic'}
            >
              <TimeInput label="Consult Neuro Med เวลา" value={form.consult_neuro_med_time} onChange={v => set('consult_neuro_med_time', v)} />
              <NumInput label={`NIHSS (ประเมินซ้ำโดย Neuro Med)`} value={form.er_nihss} onChange={v => set('er_nihss', v)} min={0} max={42} />

              <RadioGroup
                label="การตัดสินใจให้ rt-PA"
                value={form.rtpa_decision}
                onChange={v => set('rtpa_decision', v as 'yes' | 'no' | '')}
                options={[
                  { value: 'yes', label: 'ให้ rt-PA' },
                  { value: 'no', label: 'ไม่ให้ rt-PA' },
                ]}
              />

              {form.rtpa_decision === 'no' && (
                <div className="flex flex-col gap-0.5">
                  <label className="text-[11px] text-slate-500 font-medium">เหตุผลที่ไม่ให้ rt-PA</label>
                  <textarea
                    value={form.rtpa_contraindication_reason}
                    onChange={e => set('rtpa_contraindication_reason', e.target.value)}
                    rows={2}
                    placeholder="ระบุ Contraindication หรือเหตุผล..."
                    className="text-xs border border-slate-200 rounded-md px-2 py-1.5 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-400 placeholder-slate-300 resize-none"
                  />
                </div>
              )}

              {form.rtpa_decision === 'yes' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                  <p className="text-xs font-semibold text-blue-800">รายละเอียดการให้ rt-PA</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <NumInput label="BW (kg)" value={form.rtpa_bw_kg} onChange={v => set('rtpa_bw_kg', v)} min={0} max={200} placeholder="kg" />
                    <NumInput label="Total dose (mg)" value={form.rtpa_total_dose_mg} onChange={v => set('rtpa_total_dose_mg', v)} min={0} max={999} placeholder="mg" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <NumInput label="Bolus dose (mg)" value={form.rtpa_bolus_dose_mg} onChange={v => set('rtpa_bolus_dose_mg', v)} min={0} max={999} placeholder="mg" />
                    <TimeInput label="Bolus เวลา" value={form.rtpa_bolus_time} onChange={v => set('rtpa_bolus_time', v)} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <NumInput label="Drip dose (mg)" value={form.rtpa_drip_dose_mg} onChange={v => set('rtpa_drip_dose_mg', v)} min={0} max={999} placeholder="mg" />
                    <TimeInput label="Drip เวลา" value={form.rtpa_drip_time} onChange={v => set('rtpa_drip_time', v)} />
                    <TimeInput label="ยาหมด at" value={form.rtpa_finish_time} onChange={v => set('rtpa_finish_time', v)} />
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* ── Section 5: Hemorrhagic Stroke ── */}
          {(form.ct_result_type === 'hemorrhagic' || form.ct_result_type === '') && (
            <Section
              title="ส่วนที่ 5 — ผล CT: Hemorrhagic Stroke"
              icon={<AlertCircle className="w-4 h-4" />}
              color="bg-red-50 text-red-800 hover:bg-red-100"
              defaultOpen={form.ct_result_type === 'hemorrhagic'}
            >
              <div className="grid grid-cols-2 gap-3">
                <TimeInput label="Consult Neuro Sx. รพ.กส." value={form.consult_neuro_sx_time} onChange={v => set('consult_neuro_sx_time', v)} />
                <TimeInput label="Consult Neuro Med รพ.กส." value={form.consult_neuro_med_hemo_time} onChange={v => set('consult_neuro_med_hemo_time', v)} />
              </div>
              <RadioGroup
                label="การพิจารณาผ่าตัด"
                value={form.surgery_decision}
                onChange={v => set('surgery_decision', v as 'yes' | 'no' | '')}
                options={[
                  { value: 'yes', label: 'ผ่าตัด' },
                  { value: 'no', label: 'ไม่ผ่าตัด' },
                ]}
              />
              {form.surgery_decision === 'yes' && (
                <TimeInput label="แพทย์ตัดสินใจผ่าตัด เวลา" value={form.surgery_time} onChange={v => set('surgery_time', v)} />
              )}
            </Section>
          )}

          {/* ── Section 6: Transfer ── */}
          <Section
            title="ส่วนที่ 6 — การส่งต่อ (Refer)"
            icon={<Send className="w-4 h-4" />}
            color="bg-violet-50 text-violet-800 hover:bg-violet-100"
            defaultOpen={false}
          >
            <SearchableSelect
              label="Refer ไปยัง รพ. (ค้นหาจากตารางข้อมูล)"
              placeholder="เลือกโรงพยาบาลปลายทาง..."
              hospitals={hospitalsList}
              selectedHospitalName={form.refer_to_hospital}
              onSelectHospital={(h) => set('refer_to_hospital', h.name)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <TimeInput label="รับเคส at เวลา" value={form.refer_accept_time} onChange={v => set('refer_accept_time', v)} />
              <TimeInput label="ประสานศูนย์ส่งต่อ" value={form.transfer_center_contact_time} onChange={v => set('transfer_center_contact_time', v)} />
              <TimeInput label="ส่งต่อ (ล้อหมุน)" value={form.transfer_depart_time} onChange={v => set('transfer_depart_time', v)} />
            </div>
          </Section>

          {/* ── Section 7: Notes ── */}
          <Section
            title="ส่วนที่ 7 — ปัญหาและอุปสรรค"
            icon={<FileText className="w-4 h-4" />}
            color="bg-slate-100 text-slate-700 hover:bg-slate-200"
            defaultOpen={false}
          >
            <textarea
              value={form.problems_notes}
              onChange={e => set('problems_notes', e.target.value)}
              rows={4}
              placeholder="บันทึกปัญหา อุปสรรค หรือหมายเหตุเพิ่มเติม..."
              className="text-xs border border-slate-200 rounded-md px-3 py-2 w-full text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-400 placeholder-slate-300 resize-none"
            />
          </Section>

          {/* ── Recorded By (Auto-filled & Locked from Auth system for Audit Transparency) ── */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              ชื่อผู้บันทึกข้อมูล
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={form.recorded_by || 'ผู้ใช้งานในระบบ'}
                className="w-full bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold rounded-md pl-3 pr-32 py-2 outline-none cursor-default"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>ยืนยันตัวตนแล้ว</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Fixed at bottom of dialog) */}
        <div className="bg-white border-t border-slate-200/90 px-4 sm:px-6 py-3 shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
          {saveMsg ? (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-md text-center sm:text-left animate-in fade-in duration-200 ${
              saveMsg.includes('สำเร็จ') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {saveMsg}
            </span>
          ) : <div className="hidden sm:block" />}
          
          <div className="flex items-center gap-2 justify-end w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={handleClearFormConfirm}
              disabled={saving}
              className="text-xs font-semibold px-3 py-2.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="ล้างข้อมูลการบันทึกทั้งหมดของเคสนี้"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างข้อมูลบันทึก</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors text-center cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-bold px-5 py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
