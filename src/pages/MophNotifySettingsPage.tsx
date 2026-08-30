import React, { useState, useEffect } from 'react';
import { MophNotifyConfig } from '../types/emergency';
import { fetchMophNotifyConfig, saveMophNotifyConfig, testSendMophNotify } from '../services/api';
import { BellRing, ShieldCheck, Key, Server, Send, Eye, EyeOff, Save, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, ZoomIn, X } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const MophNotifySettingsPage: React.FC = () => {
  const [config, setConfig] = useState<MophNotifyConfig>({
    moph_notify_enabled: 'true',
    moph_notify_env: 'PROD',
    moph_notify_endpoint: 'https://morpromt2f.moph.go.th/api/notify/send',
    moph_notify_client_key: 'd6078e5cf778468032ea725035b0181e2bfbf9ae',
    moph_notify_secret_key: '3O3N65YXG7U3WQRO4GBAQV3EC3SY',
    moph_notify_hospital_line1: 'โรงพยาบาล',
    moph_notify_hospital_line2: 'กมลาไสย (Stroke Fast Track)',
    moph_notify_hospital_logo: 'https://morpromt2c.moph.go.th/image/image_3771a3e8-57d0-4fe0-b0f8-3c97427eb201.png',
    moph_notify_header_image: 'https://cdns.yellow-idea.com/moph/20250602/moph-flex-header-1.png',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showClientKey, setShowClientKey] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchMophNotifyConfig();
    setConfig(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (field: keyof MophNotifyConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.moph_notify_client_key || !config.moph_notify_secret_key) {
      MySwal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณาระบุ Client Key และ Secret Key ของ MOPH Notify',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setSaving(true);
    const success = await saveMophNotifyConfig(config);
    setSaving(false);

    if (success) {
      MySwal.fire({
        icon: 'success',
        title: 'บันทึกการตั้งค่าสำเร็จ',
        text: 'ปรับปรุงข้อมูล API MOPH Notify และบันทึกสู่ฐานข้อมูลเรียบร้อยแล้ว',
        timer: 1800,
        showConfirmButton: false,
      });
    } else {
      MySwal.fire({
        icon: 'error',
        title: 'ไม่สามารถบันทึกได้',
        text: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล โปรดลองอีกครั้ง',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const handleTestSend = async () => {
    setTesting(true);
    const res = await testSendMophNotify(config.moph_notify_hospital_line2);
    setTesting(false);

    if (res?.result?.status === 200 || res?.result?.data?.message_code === 200 || res?.result?.data?.message === 'Success') {
      MySwal.fire({
        icon: 'success',
        title: 'ส่งการแจ้งเตือนทดสอบสำเร็จ!',
        html: `
          <div className="text-left text-xs space-y-1.5 p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
            <div><b>Status Code:</b> 200 OK</div>
            <div><b>Message:</b> Success</div>
            <div><b>ปลายทาง:</b> หมอพร้อม (MOPH Notify Group)</div>
          </div>
        `,
        confirmButtonColor: '#0d9488',
      });
    } else {
      const code = res?.result?.data?.message_code || res?.result?.status || 401;
      const msg = res?.result?.data?.message || 'ส่งข้อความไม่สำเร็จ หรือ API Key ไม่ถูกต้อง';
      MySwal.fire({
        icon: 'error',
        title: `การส่งข้อความทดสอบไม่สำเร็จ [${code}]`,
        text: msg,
        confirmButtonColor: '#ef4444',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600">กำลังโหลดการตั้งค่า MOPH Notify API...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md border border-teal-200 uppercase tracking-wide">
            Admin System Configuration · API Integration
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-teal-600" />
            <span>ตั้งค่าระบบแจ้งเตือน MOPH Notify (หมอพร้อม)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ส่งสัญญาณแจ้งเตือนอัตโนมัติเข้า LINE Group Chats เมื่อมีเคส FAST Track แจ้งเหตุใหม่
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestSend}
            disabled={testing || config.moph_notify_enabled !== 'true'}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:bg-slate-300 text-white font-bold text-xs px-3.5 py-2 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className={`w-4 h-4 ${testing ? 'animate-bounce' : ''}`} />
            <span>{testing ? 'กำลังส่งทดสอบ...' : 'ทดสอบการแจ้งเตือน'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Section 1: Activation & Environment */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                <Server className="w-4.5 h-4.5 text-teal-600" style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">
                  สถานะการใช้งานและระบบปลายทาง
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Endpoint &amp; Environment Configuration</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5 flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              ความปลอดภัยสูงสุด
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Card: Enable Toggle */}
            <div className={`rounded-xl border-2 p-5 flex flex-col gap-4 transition-all ${config.moph_notify_enabled === 'true'
              ? 'border-emerald-300 bg-emerald-50/60'
              : 'border-slate-200 bg-slate-50/60'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${config.moph_notify_enabled === 'true'
                  ? 'bg-emerald-100'
                  : 'bg-slate-200'
                  }`}>
                  {config.moph_notify_enabled === 'true' ? '🟢' : '🔴'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    เปิดการใช้งานการแจ้งเตือน MOPH Notify
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    เมื่อกู้ชีพแจ้งเหตุใหม่ ระบบจะส่ง Flex Message<br />
                    เข้ากลุ่ม LINE หมอพร้อมทันที
                  </p>
                </div>
              </div>
              <select
                value={config.moph_notify_enabled}
                onChange={(e) => handleChange('moph_notify_enabled', e.target.value)}
                className={`w-full text-sm font-bold rounded-lg px-4 py-2.5 border-2 outline-none cursor-pointer transition-all ${config.moph_notify_enabled === 'true'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 focus:border-emerald-500'
                  : 'bg-white text-slate-600 border-slate-300 focus:border-slate-400'
                  }`}
              >
                <option value="true">🟢 เปิดใช้งาน (Active)</option>
                <option value="false">🔴 ปิดใช้งาน (Disabled)</option>
              </select>
            </div>

            {/* Card: Environment */}
            <div className={`rounded-xl border-2 p-5 flex flex-col gap-4 transition-all ${config.moph_notify_env === 'PROD'
              ? 'border-blue-200 bg-blue-50/40'
              : 'border-amber-200 bg-amber-50/40'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-black text-xs ${config.moph_notify_env === 'PROD'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
                  }`}>
                  {config.moph_notify_env === 'PROD' ? '🌐' : '🚀'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    สภาพแวดล้อมระบบ (Environment)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    เลือก PROD หรือ UAT<br />
                    ตามเซิร์ฟเวอร์กระทรวงสาธารณสุข
                  </p>
                </div>
              </div>
              <select
                value={config.moph_notify_env}
                onChange={(e) => {
                  const env = e.target.value;
                  const endpoint =
                    env === 'PROD'
                      ? 'https://morpromt2f.moph.go.th/api/notify/send'
                      : 'https://morpromt2f-uat.moph.go.th/api/notify/send';
                  setConfig((prev) => ({ ...prev, moph_notify_env: env, moph_notify_endpoint: endpoint }));
                }}
                className={`w-full text-sm font-bold rounded-lg px-4 py-2.5 border-2 outline-none cursor-pointer transition-all ${config.moph_notify_env === 'PROD'
                  ? 'bg-blue-100 text-blue-800 border-blue-300 focus:border-blue-500'
                  : 'bg-amber-100 text-amber-800 border-amber-300 focus:border-amber-500'
                  }`}
              >
                <option value="PROD">🌐 PROD (Production)</option>
                <option value="UAT">🚀 UAT (Testing Server)</option>
              </select>
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                URL Endpoint
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.moph_notify_env === 'PROD'
                ? 'text-blue-700 bg-blue-50 border-blue-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                Method: POST · {config.moph_notify_env}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs">🔗</span>
              </div>
              <input
                type="text"
                value={config.moph_notify_endpoint}
                onChange={(e) => handleChange('moph_notify_endpoint', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono rounded-lg pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                placeholder="https://morpromt2f.moph.go.th/api/notify/send"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              URL จะถูกอัปเดตอัตโนมัติเมื่อเปลี่ยน Environment ด้านบน
            </p>
          </div>
        </div>

        {/* Section 2: API Keys Configuration */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b pb-2.5 border-slate-100">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-600" />
              <span>ข้อมูลคีย์ยืนยันตัวตน (Client Key & Secret Key)</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              ได้จากเมนูหน่วยบริการใน CMS MOPH Notify
            </span>
          </h3>

          <div className="space-y-3">
            {/* Client Key */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Client Key (client-key)
              </label>
              <div className="relative">
                <input
                  type={showClientKey ? 'text' : 'password'}
                  value={config.moph_notify_client_key}
                  onChange={(e) => handleChange('moph_notify_client_key', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-md pl-3 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  placeholder="ป้อน Client Key จาก MOPH CMS..."
                />
                <button
                  type="button"
                  onClick={() => setShowClientKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showClientKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Secret Key (secret-key)
              </label>
              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={config.moph_notify_secret_key}
                  onChange={(e) => handleChange('moph_notify_secret_key', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-md pl-3 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  placeholder="ป้อน Secret Key จาก MOPH CMS..."
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Flex Message Template Header Branding */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-sm flex items-center justify-between border-b pb-2.5 border-slate-100">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>ปรับแต่งรูปส่วนหัว (Header Banner) และโลโก้บนการ์ดแจ้งเตือน (Flex Message)</span>
            </span>
          </h3>

          {/* Header Banner Image URL with Live Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              URL รูปภาพส่วนหัวการ์ด (Header Banner Image)
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={config.moph_notify_header_image || ''}
                onChange={(e) => handleChange('moph_notify_header_image', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://example.com/flex-header-banner.png"
              />

              {/* Banner Preview Box (Aspect Ratio Standard ~3.5:1) */}
              <div className="relative w-full rounded-lg border border-slate-300 bg-slate-900/5 overflow-hidden group shadow-inner">
                <div className="aspect-[35/10] w-full flex items-center justify-center relative">
                  {config.moph_notify_header_image ? (
                    <img
                      src={config.moph_notify_header_image}
                      alt="Header Banner Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">🖼️ ตัวอย่างรูป Banner ส่วนหัว (แนะนำอัตราส่วน 3.5 : 1)</span>
                  )}
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    {config.moph_notify_header_image && (
                      <button
                        type="button"
                        onClick={() => setModalImage(config.moph_notify_header_image)}
                        className="bg-white/90 hover:bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
                      >
                        <ZoomIn className="w-4 h-4 text-teal-600" />
                        <span>ขยายดูขนาดเต็ม</span>
                      </button>
                    )}
                  </div>

                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded backdrop-blur-sm shadow-sm pointer-events-none">
                    Aspect Ratio 3120 : 885 (มาตรฐาน LINE)
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              รูปแบนเนอร์ด้านบนสุดของการ์ด Flex Message (ขนาดแนะนำ 3120×885px หรืออัตราส่วน 3.5:1) • เลื่อนเมาส์ไปที่รูปแล้วคลิก <span className="font-bold text-teal-700">"ขยายดูขนาดเต็ม"</span> เพื่อตรวจสอบ
            </p>
          </div>

          {/* Logo URL with Preview */}
          <div className="space-y-2 border-t pt-4 border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              URL โลโก้โรงพยาบาล (แสดงบนการ์ดแจ้งเตือน)
            </label>
            <div className="flex items-center gap-4">
              {/* Preview Circle */}
              <div
                onClick={() => config.moph_notify_hospital_logo && setModalImage(config.moph_notify_hospital_logo)}
                className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shadow-sm relative group cursor-pointer"
                title="คลิกเพื่อขยายดูรูปโลโก้"
              >
                {config.moph_notify_hospital_logo ? (
                  <>
                    <img
                      src={config.moph_notify_hospital_logo}
                      alt="โลโก้ รพ."
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </>
                ) : (
                  <span className="text-2xl">🏥</span>
                )}
              </div>
              <input
                type="url"
                value={config.moph_notify_hospital_logo || ''}
                onChange={(e) => handleChange('moph_notify_hospital_logo', e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://example.com/hospital-logo.png"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              ใส่ URL รูปโลโก้สาธารณะ (jpg/png) ขนาดแนะนำ 200×200px ขึ้นไป • คลิกที่รูปวงกลมเพื่อขยายดูขนาดเต็ม
            </p>
          </div>

          {/* Line 1 & Line 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                บรรทัดที่ 1 (ตัวหนาบนการ์ด)
              </label>
              <input
                type="text"
                value={config.moph_notify_hospital_line1}
                onChange={(e) => handleChange('moph_notify_hospital_line1', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                placeholder="โรงพยาบาล..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                บรรทัดที่ 2 (ชื่อโรงพยาบาล/ศูนย์)
              </label>
              <input
                type="text"
                value={config.moph_notify_hospital_line2}
                onChange={(e) => handleChange('moph_notify_hospital_line2', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                placeholder="กมลาไสย..."
              />
            </div>
          </div>
        </div>

        {/* Submit & Action Row */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 active:scale-[0.99] disabled:bg-slate-300 text-white font-bold text-sm px-6 py-2.5 rounded-md shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า MOPH Notify'}</span>
          </button>
        </div>
      </form>

      {/* Lightbox Image Preview Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-200 animate-fadeIn"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full border border-slate-200 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <ZoomIn className="w-4 h-4 text-teal-600" />
                <span>ตัวอย่างรูปภาพขนาดเต็ม (Full Resolution Preview)</span>
              </div>
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col items-center justify-center bg-slate-900/5 min-h-[300px] max-h-[80vh] overflow-auto">
              <img
                src={modalImage}
                alt="Full preview"
                className="max-w-full max-h-[70vh] object-contain rounded shadow-md border border-slate-200"
              />
              <div className="mt-3 text-center">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 break-all select-all">
                  {modalImage}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setModalImage(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-md transition-all"
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
