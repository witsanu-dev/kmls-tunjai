import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Siren, ArrowRight, Volume2, VolumeX } from 'lucide-react';
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
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>ลงชื่อเข้าสู่ระบบ (Sign In)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              กรุณาระบุบัญชีผู้ใช้งานที่ได้รับอนุมัติเพื่อเข้าถึงระบบ
            </p>
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
          </form>
        </div>
      </div>
    </div>
  );
};
