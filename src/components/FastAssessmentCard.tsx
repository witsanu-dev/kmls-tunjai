import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Siren, Info, Zap, RotateCcw, Search } from 'lucide-react';

interface FastAssessmentProps {
  face: boolean;
  setFace: (v: boolean) => void;
  arm: boolean;
  setArm: (v: boolean) => void;
  speech: boolean;
  setSpeech: (v: boolean) => void;
  onset: string;
  setOnset: (v: string) => void;
  nihssTotal: number | null;
  setNihssTotal: (v: number | null) => void;
  nihssSeverity: string | null;
  setNihssSeverity: (v: string | null) => void;
}

const NIHSS_ITEMS = [
  { key: '1a', title: '1a · ระดับความรู้สึกตัว', options: [[0,'รู้สึกตัวดี ตอบสนองปกติ'],[1,'ซึม ปลุกตื่นด้วยการกระตุ้นเล็กน้อย'],[2,'ซึมมาก ต้องกระตุ้นความเจ็บปวด'],[3,'ไม่รู้สึกตัว ตอบสนองแบบรีเฟล็กซ์']] },
  { key: '1b', title: '1b · ถามเดือนและอายุ', options: [[0,'ตอบถูกทั้ง 2 ข้อ'],[1,'ตอบถูก 1 ข้อ'],[2,'ตอบผิดทั้ง 2 ข้อ']] },
  { key: '1c', title: '1c · สั่งหลับตา-ลืมตา / กำมือ-แบมือ', options: [[0,'ทำถูกต้องทั้ง 2 คำสั่ง'],[1,'ทำถูกต้อง 1 คำสั่ง'],[2,'ทำไม่ได้ทั้ง 2 คำสั่ง']] },
  { key: '2', title: '2 · การกลอกตา (Best Gaze)', options: [[0,'ปกติ'],[1,'กลอกตาผิดปกติบางส่วน'],[2,'กลอกตาผิดปกติสมบูรณ์']] },
  { key: '3', title: '3 · ลานสายตา (Visual Fields)', options: [[0,'ปกติ'],[1,'สูญเสียลานสายตาบางส่วน'],[2,'สูญเสียลานสายตาสมบูรณ์ข้างเดียว'],[3,'สูญเสียลานสายตาทั้งสองข้าง']] },
  { key: '4', title: '4 · กล้ามเนื้อใบหน้าอ่อนแรง', options: [[0,'ปกติ'],[1,'อ่อนแรงเล็กน้อย มุมปากตกเล็กน้อย'],[2,'อ่อนแรงชัดเจนบางส่วน'],[3,'อัมพาตสมบูรณ์ครึ่งซีก']] },
  { key: '5a', title: '5a · แขนอ่อนแรง (ซ้าย)', options: [[0,'ยกค้างได้ 10 วิ ไม่ตก'],[1,'ยกได้แต่ตกก่อน 10 วิ'],[2,'ต้านแรงโน้มถ่วงได้แต่ตกเร็ว'],[3,'ขยับได้แต่ยกต้านแรงโน้มถ่วงไม่ได้'],[4,'ไม่มีการเคลื่อนไหวเลย']] },
  { key: '5b', title: '5b · แขนอ่อนแรง (ขวา)', options: [[0,'ยกค้างได้ 10 วิ ไม่ตก'],[1,'ยกได้แต่ตกก่อน 10 วิ'],[2,'ต้านแรงโน้มถ่วงได้แต่ตกเร็ว'],[3,'ขยับได้แต่ยกต้านแรงโน้มถ่วงไม่ได้'],[4,'ไม่มีการเคลื่อนไหวเลย']] },
  { key: '6a', title: '6a · ขาอ่อนแรง (ซ้าย)', options: [[0,'ยกค้างได้ 5 วิ ไม่ตก'],[1,'ยกได้แต่ตกก่อน 5 วิ'],[2,'ต้านแรงโน้มถ่วงได้แต่ตกเร็ว'],[3,'ขยับได้แต่ยกต้านแรงโน้มถ่วงไม่ได้'],[4,'ไม่มีการเคลื่อนไหวเลย']] },
  { key: '6b', title: '6b · ขาอ่อนแรง (ขวา)', options: [[0,'ยกค้างได้ 5 วิ ไม่ตก'],[1,'ยกได้แต่ตกก่อน 5 วิ'],[2,'ต้านแรงโน้มถ่วงได้แต่ตกเร็ว'],[3,'ขยับได้แต่ยกต้านแรงโน้มถ่วงไม่ได้'],[4,'ไม่มีการเคลื่อนไหวเลย']] },
  { key: '7', title: '7 · การประสานงานแขนขา (Ataxia)', options: [[0,'ไม่มี'],[1,'พบใน 1 แขน/ขา'],[2,'พบตั้งแต่ 2 แขน/ขาขึ้นไป']] },
  { key: '8', title: '8 · การรับความรู้สึก (Sensory)', options: [[0,'ปกติ'],[1,'สูญเสียเล็กน้อยถึงปานกลาง'],[2,'สูญเสียมากหรือไม่รับรู้เลย']] },
  { key: '9', title: '9 · ภาษา (Aphasia)', options: [[0,'ปกติ ไม่มี aphasia'],[1,'พูด/เข้าใจลำบากเล็กน้อยถึงปานกลาง'],[2,'พูด/เข้าใจลำบากมาก'],[3,'พูดไม่ได้เลยหรือเข้าใจภาษาไม่ได้เลย']] },
  { key: '10', title: '10 · พูดไม่ชัด (Dysarthria)', options: [[0,'ปกติ'],[1,'ไม่ชัดเล็กน้อยถึงปานกลาง'],[2,'ไม่ชัดมากจนฟังไม่เข้าใจ']] },
  { key: '11', title: '11 · การละเลยครึ่งซีก (Neglect)', options: [[0,'ปกติ ไม่มีการละเลย'],[1,'ละเลยบางส่วน'],[2,'ละเลยสมบูรณ์มากกว่า 1 ด้าน']] },
];

function getNihssSeverity(total: number | null): string {
  if (total === null) return '';
  if (total === 0) return 'ไม่มีอาการ';
  if (total <= 4) return 'เล็กน้อย (Minor)';
  if (total <= 15) return 'ปานกลาง (Moderate)';
  if (total <= 20) return 'ปานกลางถึงรุนแรง (Moderate to Severe)';
  return 'รุนแรงมาก (Severe)';
}

export const FastAssessmentCard: React.FC<FastAssessmentProps> = ({
  face, setFace,
  arm, setArm,
  speech, setSpeech,
  onset, setOnset,
  nihssTotal, setNihssTotal,
  nihssSeverity, setNihssSeverity
}) => {
  const [nihssOpen, setNihssOpen] = useState(false);
  const [nihssScores, setNihssScores] = useState<Record<string, string>>({});
  const [nihssSearch, setNihssSearch] = useState('');

  const fastCount = [face, arm, speech].filter(Boolean).length;

  const getNowLocal = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Set default onset time to current time if empty
  React.useEffect(() => {
    if (!onset) {
      setOnset(getNowLocal());
    }
  }, [onset, setOnset]);

  const setOnsetTimeMinusMinutes = (mins: number) => {
    const d = new Date(Date.now() - mins * 60000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setOnset(formatted);
  };

  const handleNihssChange = (key: string, val: string) => {
    const next = { ...nihssScores, [key]: val };
    setNihssScores(next);
    
    const answeredKeys = Object.keys(next).filter(k => next[k] !== '');
    if (answeredKeys.length > 0) {
      const sum = answeredKeys.reduce((acc, k) => acc + Number(next[k]), 0);
      setNihssTotal(sum);
      setNihssSeverity(getNihssSeverity(sum));
    } else {
      setNihssTotal(null);
      setNihssSeverity(null);
    }
  };

  const handleClearSingleNihss = (key: string) => {
    handleNihssChange(key, '');
  };

  const handleClearAllNihssToZero = () => {
    const allZero: Record<string, string> = {};
    NIHSS_ITEMS.forEach(item => {
      allZero[item.key] = '0';
    });
    setNihssScores(allZero);
    setNihssTotal(0);
    setNihssSeverity(getNihssSeverity(0));
  };

  const filteredNihssItems = NIHSS_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(nihssSearch.toLowerCase()) ||
    item.key.toLowerCase().includes(nihssSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* FAST Score Card & Real-time Analysis */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-4">
        {/* Card Header & Dynamic Assessment Status */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600 shrink-0" />
              <span>การประเมินอาการ FAST (Stroke Fast Assessment)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              เครื่องมือประเมินความเสี่ยงโรคหลอดเลือดสมองเฉียบพลันตามมาตรฐานสากล
            </p>
          </div>

          <span
            className={`text-xs px-3 py-1.5 rounded-md font-bold shadow-xs transition-colors flex items-center gap-1.5 ${
              fastCount >= 1
                ? 'bg-rose-600 text-white siren-badge-pulse'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {fastCount >= 1 ? (
              <>
                <AlertCircle className="w-4 h-4 text-white shrink-0" />
                <span>FAST Positive ({fastCount}/3) · STROKE ALERT</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>FAST Normal (0/3)</span>
              </>
            )}
          </span>
        </div>

        {/* Real-time Medical Banner (No emojis, icons only) */}
        <div
          className={`p-3 rounded-md border text-xs leading-relaxed transition-all ${
            fastCount >= 1
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="font-bold text-sm mb-0.5 flex items-center gap-1.5">
            {fastCount >= 1 ? (
              <span className="text-rose-700 font-extrabold flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ผลการวิเคราะห์: พบสัญญาณเสี่ยงโรคหลอดเลือดสมอง (Stroke Positive)</span>
              </span>
            ) : (
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>ผลการวิเคราะห์: ยังไม่พบสัญญาณเสี่ยง (โปรดเลือกประเมิน F-A-S ด้านล่าง)</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600">
            {fastCount >= 1
              ? 'ผู้ป่วยมีอาการเข้าได้กับภาวะสมองขาดเลือดเฉียบพลัน ต้องนำส่งโรงพยาบาลที่มี Stroke Center ทันทีเพื่อรับยาละลายลิ่มเลือด (tPA)'
              : 'ประเมิน 3 สัญญาณเตือนหลัก: ใบหน้าเบี้ยว (Face), แขนขาอ่อนแรง (Arm), และพูดไม่ชัด (Speech)'}
          </p>
        </div>

        {/* FAST 3 Item Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFace(!face)}
            className={`p-3.5 rounded-md text-left transition-all border ${
              face
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm ring-1 ring-rose-400'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">F · Facial Droop</span>
              {face ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-slate-400" />}
            </div>
            <div className="font-semibold text-xs text-slate-800 mb-0.5">ใบหน้าเบี้ยว / มุมปากตก</div>
            <p className="text-[11px] text-slate-500 leading-tight">ยิ้มยิงฟันแล้วปากเบี้ยว หรือมุมปากตกข้างใดข้างหนึ่ง</p>
          </button>

          <button
            type="button"
            onClick={() => setArm(!arm)}
            className={`p-3.5 rounded-md text-left transition-all border ${
              arm
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm ring-1 ring-rose-400'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">A · Arm Weakness</span>
              {arm ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-slate-400" />}
            </div>
            <div className="font-semibold text-xs text-slate-800 mb-0.5">แขนขาอ่อนแรงครึ่งซีก</div>
            <p className="text-[11px] text-slate-500 leading-tight">หลับตายกแขนสองข้างค้างไว้ 10 วินาที แล้วแขนตกลงมา</p>
          </button>

          <button
            type="button"
            onClick={() => setSpeech(!speech)}
            className={`p-3.5 rounded-md text-left transition-all border ${
              speech
                ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm ring-1 ring-rose-400'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">S · Speech Difficulty</span>
              {speech ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-slate-400" />}
            </div>
            <div className="font-semibold text-xs text-slate-800 mb-0.5">พูดไม่ชัด / พูดไม่ได้</div>
            <p className="text-[11px] text-slate-500 leading-tight">พูดออกเสียงไม่ชัด ลิ้นแข็ง สับสน นึกคำพูดไม่ออก</p>
          </button>
        </div>

        {/* Section 3: Time of Onset with Shortcuts */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="block text-xs font-bold text-slate-800">
              T · Time of Onset (เวลาที่พบอาการปกติครั้งสุดท้าย / Last Known Well) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              ดึงวันที่ปัจจุบันอัตโนมัติ
            </span>
          </div>

          <input
            type="datetime-local"
            value={onset}
            max={getNowLocal()}
            onChange={(e) => setOnset(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-xs"
          />

          {/* Quick Onset Shortcuts */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">ปุ่มเลือกเวลาด่วน (Quick Time Shortcuts):</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'เมื่อสักครู่', min: 0 },
                { label: '15 นาทีที่แล้ว', min: 15 },
                { label: '30 นาทีที่แล้ว', min: 30 },
                { label: '1 ชั่วโมงที่แล้ว', min: 60 },
                { label: '2 ชั่วโมงที่แล้ว', min: 120 },
                { label: '3 ชั่วโมงที่แล้ว', min: 180 },
              ].map((sc) => (
                <button
                  key={sc.min}
                  type="button"
                  onClick={() => setOnsetTimeMinusMinutes(sc.min)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-teal-600 hover:text-white border border-slate-200 transition-colors"
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optional NIHSS Accordion with Quick Presets & Searchable Inputs */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setNihssOpen(!nihssOpen)}
          className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <div>
            <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>ประเมิน NIHSS Score (ทางเลือกสำหรับทีมกู้ชีพขั้นสูง / Advanced EMS)</span>
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">
              {nihssTotal !== null ? `คะแนนรวมปัจจุบัน: ${nihssTotal}/42 (${nihssSeverity})` : 'คลิกเพื่อขยายแบบประเมินรายละเอียด 11 ข้อ'}
            </span>
          </div>
          {nihssOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </button>

        {nihssOpen && (
          <div className="p-4 space-y-4 border-t border-slate-200 bg-white">
            {/* Search Filter & Global Reset Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              {/* Searchable Input Filter */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nihssSearch}
                  onChange={(e) => setNihssSearch(e.target.value)}
                  placeholder="ค้นหาข้อประเมิน NIHSS (เช่น แขน, ขา, ภาษา, 1a)..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-md pl-8 pr-3 py-1.5 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleClearAllNihssToZero}
                className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-bold rounded-md transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>ตั้งค่าทุกข้อเป็นปกติ (0 คะแนน)</span>
              </button>
            </div>

            {/* NIHSS Grid with Individual Reset Icon Per Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredNihssItems.map((item) => {
                const hasVal = (nihssScores[item.key] ?? '') !== '';
                return (
                  <div key={item.key} className="p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-xs font-bold text-slate-700 block truncate">{item.title}</label>
                      {hasVal && (
                        <button
                          type="button"
                          onClick={() => handleClearSingleNihss(item.key)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="ล้างค่าข้อนี้"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <select
                      value={nihssScores[item.key] ?? ''}
                      onChange={(e) => handleNihssChange(item.key, e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                    >
                      <option value="">-- เลือกประเมินข้อนี้ --</option>
                      {item.options.map(([val, desc]) => (
                        <option key={val} value={val}>
                          {val} คะแนน · {desc}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-md text-center text-xs font-bold text-teal-800">
              {nihssTotal !== null ? (
                <>รวมคะแนน NIHSS: {nihssTotal}/42 คะแนน · ระดับความรุนแรง: {nihssSeverity}</>
              ) : (
                'ยังไม่ได้เลือกคำนวณคะแนน NIHSS'
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
