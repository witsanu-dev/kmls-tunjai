import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Siren, ArrowRight, Volume2, VolumeX, Terminal, UserPlus, ShieldCheck, CheckCircle2, Building2, Phone, UserCheck, X, PlusSquare, Download } from 'lucide-react';
import { playEmergencySirenSound } from '../components/AudioAlert';
import { Hospital, UserRole } from '../types/emergency';
import { registerApi } from '../services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ROLE_OPTIONS: { id: UserRole; name: string }[] = [
  { id: 'fr_dispatch', name: 'เจ้าหน้าที่ภาคสนาม (FR Dispatch / EMS / กู้ชีพ)' },
  { id: 'er_staff', name: 'พยาบาล/แพทย์ ห้องฉุกเฉิน (ER Staff)' },
  { id: 'director', name: 'ผู้บริหาร/ผู้อำนวยการ (Director)' },
];

export const LoginPage: React.FC<{ onLoginSuccess?: () => void; hospitals?: Hospital[] }> = ({ onLoginSuccess, hospitals = [] }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // PWA Install Prompt
  const deferredPromptRef = useRef<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect if already installed as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Always show install button on web browser
    setShowInstallBtn(true);

    // Detect iOS
    const ua = navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    if (iosDevice) {
      setIsIos(true);
    }

    // Android / Chrome / Edge — capture beforeinstallprompt event safely
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Hide when already installed
    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setIsInstalled(true);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    // 1. Direct Native Install Prompt (Android / Chrome / Edge / Desktop)
    if (deferredPromptRef.current) {
      try {
        deferredPromptRef.current.prompt();
        const choiceResult = await deferredPromptRef.current.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setShowInstallBtn(false);
        }
      } catch (err) {
        console.warn('PWA Prompt Error:', err);
      } finally {
        deferredPromptRef.current = null;
      }
      return;
    }

    // 2. Clear instructions popup for iOS or browsers where prompt event is unavailable
    MySwal.fire({
      title: isIos ? '📲 ติดตั้ง TUNJAI บน iPhone / iPad' : '📱 ติดตั้งแอป TUNJAI บนหน้าจอมือถือ',
      imageUrl: 'icon-192.png',
      imageWidth: 64,
      imageHeight: 64,
      imageAlt: 'TUNJAI Icon',
      html: isIos ? `
        <div class="text-left text-sm space-y-3 text-slate-700">
          <p class="font-medium">ทำตามขั้นตอนง่ายๆ เพื่อสร้างไอคอนแอปบนหน้าจอโฮม:</p>
          <ol class="space-y-2 list-decimal list-inside bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs sm:text-sm">
            <li>เปิดเว็บนี้ด้วย <strong>Safari Browser</strong></li>
            <li>กดปุ่ม <strong>แชร์</strong> (📤) บริเวณแถบเมนูด้านล่าง</li>
            <li>เลื่อนลงแล้วเลือก <strong>"เพิ่มที่หน้าจอโฮม" (Add to Home Screen)</strong></li>
          </ol>
        </div>
      ` : `
        <div class="text-left text-sm space-y-3 text-slate-700">
          <p class="font-medium">ทำตามขั้นตอนเพื่อเพิ่มทางลัดแอปไปยังหน้าจอหลัก:</p>
          <ol class="space-y-2 list-decimal list-inside bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs sm:text-sm">
            <li>กดไอคอน <strong>เมนู 3 จุด (⋮)</strong> ที่มุมขวาบนเบราว์เซอร์</li>
            <li>เลือก <strong>"ติดตั้งแอป" (Install app)</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong></li>
            <li>กด <strong>"เพิ่ม / ติดตั้ง"</strong> เพื่อยืนยัน</li>
          </ol>
        </div>
      `,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#0d9488',
      customClass: {
        image: 'rounded-xl shadow-md border border-slate-100',
      }
    });
  };

  // Register Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('fr_dispatch');
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [regAgencyName, setRegAgencyName] = useState('');
  const [regHospitalId, setRegHospitalId] = useState<number | 'other'>(hospitals[0]?.id || 1);
  const [regCustomHospital, setRegCustomHospital] = useState('');
  const [hospSearchTerm, setHospSearchTerm] = useState('');
  const [isHospDropdownOpen, setIsHospDropdownOpen] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอก ชื่อผู้ใช้งาน และ รหัสผ่าน',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      Swal.fire({
        icon: 'success',
        title: 'เข้าสู่ระบบสำเร็จ',
        timer: 1200,
        showConfirmButton: false,
      });
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: err.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regUsername || !regPassword) {
      MySwal.fire({
        icon: 'warning',
        title: 'กรอกข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอก ชื่อ-นามสกุล, Username และ รหัสผ่าน',
        confirmButtonColor: '#0d9488',
      });
      return;
    }

    let hospId: number | null = null;
    let hospName = '';

    if (regHospitalId === 'other') {
      hospName = regCustomHospital.trim() || 'อื่นๆ';
    } else {
      const selectedHosp = hospitals.find(h => h.id === Number(regHospitalId)) || hospitals[0];
      if (selectedHosp) {
        hospId = selectedHosp.id;
        hospName = selectedHosp.name;
      }
    }

    setRegSubmitting(true);
    try {
      await registerApi({
        full_name: regFullName,
        username: regUsername,
        password: regPassword,
        role: regRole,
        agency_name: regAgencyName,
        hospital_id: hospId,
        hospital_name: hospName,
        phone: regPhone,
      });

      setShowRegisterModal(false);
      // Reset form
      setRegFullName('');
      setRegUsername('');
      setRegPassword('');
      setRegAgencyName('');
      setRegPhone('');
      setRegCustomHospital('');
      setRegHospitalId(hospitals[0]?.id || 1);

      MySwal.fire({
        icon: 'success',
        title: 'ลงทะเบียนสำเร็จเรียบร้อย',
        html: `
          <div class="text-center text-xs space-y-1.5 p-2 bg-teal-50 rounded-md border border-teal-200 text-slate-800 font-medium">
            <p>คำขอลงทะเบียนบัญชี <b class="text-teal-900">${regUsername}</b> ถูกส่งเข้าสู่ระบบแล้ว</p>
            <p class="text-slate-600 text-[11px]">การเปิดใช้งานบัญชีต้องได้รับการตรวจสอบและอนุมัติโดยผู้ดูแลระบบ</p>
          </div>
        `,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0d9488',
      });
    } catch (err: any) {
      MySwal.fire({
        icon: 'error',
        title: 'ลงทะเบียนไม่สำเร็จ',
        text: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setRegSubmitting(false);
    }
  };

  const selectedHospitalDisplay = regHospitalId === 'other' 
    ? 'อื่นๆ (ระบุชื่อโรงพยาบาล)' 
    : (hospitals.find(h => h.id === Number(regHospitalId))?.name || 'เลือกโรงพยาบาล...');

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(hospSearchTerm.toLowerCase()) || 
    (h.code && h.code.toLowerCase().includes(hospSearchTerm.toLowerCase()))
  );

  const filteredRoles = ROLE_OPTIONS.filter(r => 
    r.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md space-y-4">
        {/* Header & Logo Banner - Light Theme Standard */}
        <div className="bg-white border border-slate-200 rounded-md p-6 text-center shadow-sm relative overflow-visible">
          {/* Logo & Main App Title in Same Row - Navbar Matching Style */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white p-3.5 rounded-md shadow-sm flex items-center justify-center shrink-0 self-center">
              <Siren className="w-10 h-10 animate-pulse" />
            </div>
            <div className="flex flex-col justify-center text-left my-auto">
              <div className="flex items-center gap-2 leading-none">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent leading-none inline-block py-0.5">
                  ทันใจ
                </h1>
                <span className="text-slate-300 font-light text-xl">|</span>
                <span className="text-emerald-600 animate-pulse font-black text-2xl sm:text-3xl tracking-wider uppercase inline-block">
                  TUNJAI
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled((v) => !v);
                    if (!soundEnabled) playEmergencySirenSound();
                  }}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-0.5"
                  title={soundEnabled ? 'ทดสอบเปิดเสียงเตือน' : 'ปิดเสียงเตือน'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-emerald-600 animate-pulse" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 leading-none flex-nowrap shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider uppercase whitespace-nowrap shrink-0">
                  STROKE ALERT
                </span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200 uppercase tracking-wider shrink-0 leading-none whitespace-nowrap">
                  FAST Track
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-2.5 mt-2">
            <p className="text-xs text-teal-800 font-bold">
              ระบบแจ้งเตือนและส่งต่อผู้ป่วยโรคหลอดเลือดสมองวิกฤต
            </p>
          </div>
        </div>

        {/* Login Card - Light Theme Standard */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Title */}
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>ลงชื่อเข้าสู่ระบบ (Sign In)</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 pl-5">
                  กรุณาระบุบัญชีผู้ใช้งานที่ได้รับอนุมัติเพื่อเข้าถึงระบบ
                </p>
              </div>
              {/* Right: MOPH Logo */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <img
                  src="https://bdh.moph.go.th/site/wp-content/uploads/2022/12/cropped-logo-MOPH.png"
                  alt="กระทรวงสาธารณสุข"
                  className="w-10 h-10 object-contain rounded-md"
                  title="กระทรวงสาธารณสุข"
                />
                <span className="text-[8px] font-semibold text-slate-400 tracking-wide text-center leading-tight whitespace-nowrap">
                  รพ.กมลาไสย
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-md pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none font-semibold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-md pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none font-mono transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.99] disabled:bg-slate-300 text-white font-bold text-sm py-3 rounded-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                หรือ เข้าสู่ระบบด้วย Provider ID
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Provider ID Button */}
            <button
              type="button"
              onClick={() => {
                Swal.fire({
                  icon: 'info',
                  title: 'Provider ID',
                  text: 'ฟังก์ชันนี้อยู่ระหว่างการพัฒนา',
                  confirmButtonColor: '#0d9488',
                });
              }}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-md shadow-xs active:scale-[0.99] transition-all duration-300 cursor-pointer border border-teal-200/90 bg-gradient-to-r from-teal-100 via-teal-50 to-white hover:from-teal-200 hover:via-teal-100 hover:to-slate-50 hover:border-teal-300 hover:shadow-sm focus:ring-2 focus:ring-teal-400 focus:outline-none"
            >
              <span className="text-sm font-bold text-teal-950 whitespace-nowrap">
                ยืนยันตัวตนเข้าสู่ระบบด้วย
              </span>
              <img
                src="https://provider.id.th/assets/Plogo-f6506bc1.png"
                alt="Provider ID"
                className="h-8 object-contain drop-shadow-xs"
              />
            </button>
          </form>
        </div>

        {/* Developer Footer Card */}
        <div className="bg-white border border-slate-200 rounded-md px-5 py-4 shadow-sm text-center space-y-2.5">
          {/* Terminal Badge + Title */}
          <div className="flex items-center justify-center gap-2">
            <div
              className="flex items-center justify-center p-1.5 rounded-md shadow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f4c4c 0%, #0d9488 100%)' }}
            >
              <Terminal className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
              DEVELOPMENT BY
            </span>
          </div>

          {/* Developer Name & Position */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-sm font-black text-teal-700 tracking-tight">วิษณุ ศรีโยธา</span>
            <div className="w-px h-3.5 bg-slate-300" />
            <span className="text-xs font-semibold text-slate-600">นักวิชาการคอมพิวเตอร์</span>
          </div>

          {/* Agency */}
          <p className="text-[11px] text-slate-500 font-medium">
            กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลกมลาไสย จังหวัดกาฬสินธุ์
          </p>

          {/* Version & Copyright */}
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider pt-0.5 border-t border-slate-100">
            © 2026 • VERSION 69.8.1.31
          </p>
        </div>

      </div>

      {/* Responsive Floating Action Buttons (FAB) for Register + PWA Install */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5">

        {/* PWA Install Button */}
        {showInstallBtn && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallPwa}
            className="flex items-center gap-2 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 sm:px-5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer border border-slate-500/40 animate-in fade-in slide-in-from-right-4 duration-500"
            title={isIos ? 'วิธีติดตั้งแอปไปหน้าจอ (iOS)' : 'ติดตั้ง TUNJAI ไว้ที่หน้าจอ'}
          >
            <img
              src="icon-192.png"
              alt="TUNJAI App Icon"
              className="w-5 h-5 sm:w-5 sm:h-5 rounded-md object-contain shrink-0 shadow-xs border border-white/20"
            />
            <span className="tracking-wide">ติดตั้ง</span>
          </button>
        )}

        {/* Register Button */}
        <button
          type="button"
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 sm:px-5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer border border-teal-400/30"
          title="ลงทะเบียนขอใช้งานระบบ"
        >
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
          <span className="tracking-wide">ลงทะเบียน</span>
        </button>
      </div>

      {/* Registration Modal Dialog */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-md">
                  <UserPlus className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">ลงทะเบียนใช้งานระบบ</h3>
                  <p className="text-[11px] text-teal-200">TUNJAI Registration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Approval Notice Alert - Attached under header */}
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>เงื่อนไขการอนุมัติ : ตรวจสอบและอนุมัติโดยผู้ดูแลระบบ</span>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล ผู้ขอลงทะเบียน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 pr-2.5 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 pr-2.5 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    กำหนดรหัสผ่าน (Password) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Searchable Role Select */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ประเภทสิทธิ์ผู้ใช้งาน (Requested Role) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoleDropdownOpen(!isRoleDropdownOpen);
                        setIsHospDropdownOpen(false);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md px-2.5 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800 truncate">
                        {ROLE_OPTIONS.find(r => r.id === regRole)?.name || 'เลือกสิทธิ์ผู้ใช้งาน...'}
                      </span>
                      <span className="text-[10px] text-slate-400">▼</span>
                    </button>

                    {/* Searchable Role Dropdown Popover */}
                    {isRoleDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <input
                            type="text"
                            value={roleSearchTerm}
                            onChange={(e) => setRoleSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-teal-500"
                            autoFocus
                          />
                        </div>

                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {filteredRoles.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setRegRole(r.id);
                                setIsRoleDropdownOpen(false);
                                setRoleSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 transition-colors cursor-pointer ${
                                regRole === r.id ? 'bg-teal-50 font-bold text-teal-800' : 'text-slate-700'
                              }`}
                            >
                              <span>{r.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Searchable Hospital Select */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    โรงพยาบาลสังกัด / ปลายทางหลัก
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsHospDropdownOpen(!isHospDropdownOpen);
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md pl-8 pr-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <span className="font-semibold text-slate-800 truncate">
                          {selectedHospitalDisplay}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">▼</span>
                    </button>

                    {/* Searchable Hospital Dropdown Popover */}
                    {isHospDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <input
                            type="text"
                            value={hospSearchTerm}
                            onChange={(e) => setHospSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-teal-500"
                            autoFocus
                          />
                        </div>

                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {filteredHospitals.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => {
                                setRegHospitalId(h.id);
                                setIsHospDropdownOpen(false);
                                setHospSearchTerm('');
                              }}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 transition-colors cursor-pointer ${
                                regHospitalId === h.id ? 'bg-teal-50 font-bold text-teal-800' : 'text-slate-700'
                              }`}
                            >
                              <span>{h.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{h.code}</span>
                            </button>
                          ))}

                          {/* "อื่นๆ (ระบุ)" Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setRegHospitalId('other');
                              setIsHospDropdownOpen(false);
                              setHospSearchTerm('');
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors cursor-pointer border-t border-slate-100 ${
                              regHospitalId === 'other' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            อื่นๆ (ระบุชื่อโรงพยาบาล)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Hospital Input Field if "อื่นๆ" selected - Standard Simple Input */}
              {regHospitalId === 'other' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ระบุชื่อโรงพยาบาลอื่นๆ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regCustomHospital}
                    onChange={(e) => setRegCustomHospital(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ชื่อหน่วยงาน / ทีมกู้ชีพ / แผนกงาน
                </label>
                <input
                  type="text"
                  value={regAgencyName}
                  onChange={(e) => setRegAgencyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-2 text-xs text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.99] disabled:bg-slate-300 rounded-md shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{regSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอลงทะเบียน'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
