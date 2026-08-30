import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Siren, ArrowRight, Volume2, VolumeX, Terminal } from 'lucide-react';
import { playEmergencySirenSound } from '../components/AudioAlert';
import Swal from 'sweetalert2';

export const LoginPage: React.FC<{ onLoginSuccess?: () => void }> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
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
                  placeholder="ป้อนชื่อผู้ใช้งาน..."
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
                  placeholder="••••••••"
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
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-md shadow-xs active:scale-[0.99] transition-all cursor-pointer bg-white border border-teal-200 hover:bg-teal-50 hover:border-teal-300"
            >
              <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                ยืนยันตัวตนเข้าสู่ระบบด้วย
              </span>
              <img
                src="https://provider.id.th/assets/Plogo-f6506bc1.png"
                alt="Provider ID"
                className="h-8 object-contain"
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
    </div>
  );
};
