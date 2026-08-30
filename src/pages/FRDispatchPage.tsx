import React, { useState, useEffect } from 'react';
import { Send, User, Calendar, MapPin, AlertTriangle, CheckCircle, CheckCircle2, Siren, Globe, FileText } from 'lucide-react';
import { MapPicker } from '../components/MapPicker';
import { PhotoUploader } from '../components/PhotoUploader';
import { FastAssessmentCard } from '../components/FastAssessmentCard';
import { SearchableSelect } from '../components/SearchableSelect';
import { Hospital, NewCasePayload, CaseRecord } from '../types/emergency';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import { useAuth } from '../context/AuthContext';

const MySwal = withReactContent(Swal);

interface FRDispatchPageProps {
  hospitals: Hospital[];
  onSubmitCase: (payload: NewCasePayload) => Promise<CaseRecord>;
  onNavigateToMonitor: () => void;
}

export const FRDispatchPage: React.FC<FRDispatchPageProps> = ({
  hospitals,
  onSubmitCase,
  onNavigateToMonitor,
}) => {
  const { user } = useAuth();
  const [frName, setFrName] = useState('');

  useEffect(() => {
    if (user) {
      const formattedName = `${user.full_name}${user.agency_name ? ` (${user.agency_name})` : ''}`;
      setFrName(formattedName);
    }
  }, [user]);
  const [patientName, setPatientName] = useState('');
  const [idType, setIdType] = useState<'thai' | 'foreigner'>('thai');
  const [patientCid, setPatientCid] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('ชาย');
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);

  // Thai National ID Checksum Validator
  const checkThaiIdValid = (id: string): boolean => {
    const clean = id.replace(/\D/g, '');
    if (clean.length !== 13) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(clean.charAt(i), 10) * (13 - i);
    }
    return (11 - (sum % 11)) % 10 === parseInt(clean.charAt(12), 10);
  };

  // Thai ID Formatter (X-XXXX-XXXXX-XX-X)
  const formatThaiId = (val: string): string => {
    const clean = val.replace(/\D/g, '').slice(0, 13);
    if (clean.length <= 1) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 1)}-${clean.slice(1)}`;
    if (clean.length <= 10) return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-${clean.slice(5)}`;
    if (clean.length <= 12) return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10)}`;
    return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12)}`;
  };

  const handleAgeStep = (delta: number) => {
    const current = parseInt(age, 10) || 60;
    const next = Math.max(1, Math.min(120, current + delta));
    setAge(String(next));
  };

  // Location state
  const [locationText, setLocationText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Default Hospital: โรงพยาบาลกมลาไสย (code: 11078)
  const defaultKalasinHospital: Hospital = {
    id: 1,
    code: '11078',
    name: 'โรงพยาบาลกมลาไสย',
    level: 'โรงพยาบาลชุมชน (F2)',
    phone: '043-891008',
  };

  const [selectedHospital, setSelectedHospital] = useState<Hospital>(
    hospitals.find(h => h.code === '11078') || hospitals[0] || defaultKalasinHospital
  );

  // Sync default hospital when hospitals prop updates
  useEffect(() => {
    if (hospitals.length > 0) {
      const found = hospitals.find(h => h.code === '11078');
      if (found) setSelectedHospital(found);
    }
  }, [hospitals]);

  // FAST & NIHSS state
  const [face, setFace] = useState(false);
  const [arm, setArm] = useState(false);
  const [speech, setSpeech] = useState(false);
  const [onset, setOnset] = useState('');
  const [nihssTotal, setNihssTotal] = useState<number | null>(null);
  const [nihssSeverity, setNihssSeverity] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const fastCount = [face, arm, speech].filter(Boolean).length;
  const canSubmit = Boolean(onset) && locationText.trim().length > 0 && fastCount >= 1 && frName.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      MySwal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณาระบุชื่อผู้แจ้งเหตุ, ตำแหน่งที่พบผู้ป่วย, เวลาที่พบอาการปกติล่าสุด และประเมิน FAST อย่างน้อย 1 ข้อ',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    const confirmRes = await MySwal.fire({
      title: 'ยืนยันการส่งสัญญาณเตือนด่วน?',
      html: `
        <div class="text-left text-xs space-y-1.5 p-2 bg-slate-50 rounded border border-slate-200">
          <div><b>ผู้แจ้งเหตุ:</b> ${frName}</div>
          <div><b>ผู้ป่วย:</b> ${patientName || 'ไม่ทราบชื่อ'} (อายุ ${age || '-'} ปี, ${sex})</div>
          <div><b>โรงพยาบาลปลายทาง:</b> ${selectedHospital.name}</div>
          <div><b>อาการ FAST:</b> ${fastCount}/3 ข้อ</div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันส่งสัญญาณเตือน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (!confirmRes.isConfirmed) return;

    setSubmitting(true);
    try {
      const createdCase = await onSubmitCase({
        fr_name: frName.trim(),
        patient_name: patientName.trim() || 'ไม่ทราบชื่อ',
        age: age.trim(),
        sex,
        id_photo_url: idPhotoUrl,
        additional_photos: additionalPhotos,
        location: locationText.trim(),
        latitude: lat,
        longitude: lng,
        hospital_id: selectedHospital.id,
        hospital_name: selectedHospital.name,
        face,
        arm,
        speech,
        onset_iso: new Date(onset).toISOString(),
        nihss_total: nihssTotal,
        nihss_severity: nihssSeverity,
      });

      MySwal.fire({
        icon: 'success',
        title: 'ส่งสัญญาณเตือนเรียบร้อยแล้ว!',
        text: `รหัสอ้างอิงเคส: ${createdCase.id} - สัญญาณแจ้งเตือนถูกส่งไปยังห้องฉุกเฉิน ${selectedHospital.name} แล้ว`,
        confirmButtonText: 'ดูหน้าจอห้องฉุกเฉิน รพ.',
        confirmButtonColor: '#0d9488',
      }).then(() => {
        onNavigateToMonitor();
      });
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
        text: 'โปรดลองใหม่อีกครั้ง หรือติดต่อศูนย์รับแจ้งเหตุทางโทรศัพท์',
        confirmButtonColor: '#ef4444',
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 text-white rounded-md p-5 shadow-md flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold bg-teal-800/80 px-2.5 py-1 rounded-md border border-teal-500/30 uppercase tracking-wide">
            FR Dispatch Module · ภาคสนาม
          </span>
          <h2 className="text-xl font-bold mt-1">แบบฟอร์มแจ้งเหตุวิกฤต FAST Track</h2>
          <p className="text-xs text-teal-100 mt-0.5">
            ระบุข้อมูลผู้ป่วยและพิกัด GPS เพื่อแจ้งเตือน ER โรงพยาบาลปลายทาง
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-md text-right text-xs">
          <div className="font-bold">ศูนย์รับแจ้งเหตุ 24 ชม.</div>
          <div className="text-[11px] text-teal-200">System: Active</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Responder & Patient Info */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b pb-2 border-slate-100">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              ข้อมูลผู้แจ้งเหตุและผู้ป่วย (Medical Record)
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              มาตรฐานการแพทย์ EMS
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Responder Name locked from Auth System for transparency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อเจ้าหน้าที่ผู้แจ้งเหตุ / หน่วยบริการกู้ชีพ
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={frName || 'ผู้ใช้งานในระบบ'}
                  className="w-full bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold rounded-md pl-3 pr-24 py-2 outline-none cursor-default"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                  <span>ยืนยันตัวตนแล้ว</span>
                </span>
              </div>
            </div>

            {/* Patient Name with Quick Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  ชื่อ-นามสกุล ผู้ป่วย
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientName('ไม่ทราบชื่อ');
                      setSex('ชาย');
                    }}
                    className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded font-medium transition-colors"
                  >
                    + ไม่ทราบชื่อ (ชาย)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientName('ไม่ทราบชื่อ');
                      setSex('หญิง');
                    }}
                    className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded font-medium transition-colors"
                  >
                    + ไม่ทราบชื่อ (หญิง)
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="เช่น นายสมศักดิ์ รุ่งเรือง หรือกดปุ่มไม่ทราบชื่อ"
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              />
            </div>

            {/* Patient ID / Passport Field (Compact 1-Column Layout) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {idType === 'thai' ? 'เลขบัตรประชาชน (13 หลัก)' : 'เลขพาสปอร์ต / ต่างด้าว'}
                </label>

                {/* Compact ID Type Switcher */}
                <button
                  type="button"
                  onClick={() => {
                    setIdType(idType === 'thai' ? 'foreigner' : 'thai');
                    setPatientCid('');
                  }}
                  className="text-[10px] text-teal-700 font-bold bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="คลิกเพื่อสลับระหว่างสัญชาติไทยและชาวต่างชาติ"
                >
                  {idType === 'thai' ? (
                    <>
                      <FileText className="w-3 h-3 text-teal-600" />
                      <span>ต่างชาติ/พาสปอร์ต</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 text-teal-600" />
                      <span>บัตรประชาชนไทย</span>
                    </>
                  )}
                </button>
              </div>

              {idType === 'thai' ? (
                <div className="relative">
                  <input
                    type="text"
                    maxLength={17}
                    value={formatThaiId(patientCid)}
                    onChange={(e) => setPatientCid(e.target.value.replace(/\D/g, '').slice(0, 13))}
                    placeholder="x-xxxx-xxxxx-xx-x"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none font-mono font-semibold tracking-wider"
                  />
                  {patientCid.length === 13 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{checkThaiIdValid(patientCid) ? 'ถูกต้อง' : '13 หลัก'}</span>
                    </span>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={patientCid}
                  onChange={(e) => setPatientCid(e.target.value.toUpperCase())}
                  placeholder="เช่น Passport No. A12345678"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none font-mono font-bold uppercase tracking-wider"
                />
              )}
            </div>

            {/* Age with Stepper & Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อายุโดยประมาณ (ปี)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAgeStep(-5)}
                  className="w-9 h-9 rounded bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0"
                  title="-5 ปี"
                >
                  -5
                </button>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="เช่น 65"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 text-center font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAgeStep(5)}
                  className="w-9 h-9 rounded bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0"
                  title="+5 ปี"
                >
                  +5
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">กดเลือกอายุ:</span>
                {[45, 55, 65, 75, 85].map((presetAge) => (
                  <button
                    key={presetAge}
                    type="button"
                    onClick={() => setAge(String(presetAge))}
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-teal-600 hover:text-white border border-slate-200 rounded font-semibold text-slate-600 transition-colors"
                  >
                    {presetAge} ปี
                  </button>
                ))}
              </div>
            </div>

            {/* Sex Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เพศผู้ป่วย
              </label>
              <div className="flex gap-2">
                {['ชาย', 'หญิง', 'ไม่ระบุ'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className={`flex-1 py-2 text-xs font-bold rounded-md border transition-colors shadow-xs ${sex === s
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Photo Uploader */}
        <PhotoUploader
          idPhotoUrl={idPhotoUrl}
          setIdPhotoUrl={setIdPhotoUrl}
          additionalPhotos={additionalPhotos}
          setAdditionalPhotos={setAdditionalPhotos}
        />

        {/* Section 3: Interactive Leaflet Map Picker */}
        <MapPicker
          locationText={locationText}
          setLocationText={setLocationText}
          lat={lat}
          setLat={setLat}
          lng={lng}
          setLng={setLng}
        />

        {/* Section 4: Searchable Select Hospital */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
          <SearchableSelect
            hospitals={hospitals}
            selectedHospitalId={selectedHospital.id}
            onSelectHospital={(h) => setSelectedHospital(h)}
          />
        </div>

        {/* Section 5: FAST Assessment Checklist & Onset Time */}
        <FastAssessmentCard
          face={face} setFace={setFace}
          arm={arm} setArm={setArm}
          speech={speech} setSpeech={setSpeech}
          onset={onset} setOnset={setOnset}
          nihssTotal={nihssTotal} setNihssTotal={setNihssTotal}
          nihssSeverity={nihssSeverity} setNihssSeverity={setNihssSeverity}
        />

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 px-6 rounded-md text-white font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all ${canSubmit
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-400 cursor-not-allowed opacity-75'
              }`}
          >
            <Siren className={`w-5 h-5 ${submitting ? 'animate-bounce' : ''}`} />
            <span>{submitting ? 'กำลังส่งสัญญาณเตือนภัย...' : 'ส่งสัญญาณเตือนด่วน ไปยัง รพ. ปลายทาง'}</span>
          </button>

          {!canSubmit && (
            <p className="text-center text-xs text-rose-500 mt-2 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              กรุณากรอกชื่อผู้แจ้ง, ตำแหน่งที่พบผู้ป่วย, เวลา Onset และประเมิน FAST อย่างน้อย 1 ข้อ
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
