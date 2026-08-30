import React, { useState, useRef, useEffect } from 'react';
import { Siren, Menu, Database, User, LogOut, ShieldCheck, ChevronDown, Building2, Phone, KeyRound, Volume2, VolumeX } from 'lucide-react';
import { AudioAlert, playEmergencySirenSound } from '../components/AudioAlert';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDbConnected: boolean;
  activeAlertCount: number;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  isDbConnected,
  activeAlertCount,
  onOpenMobileMenu,
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutConfirm = async () => {
    setDropdownOpen(false);
    const res = await Swal.fire({
      title: 'ยืนยันออกจากระบบ?',
      text: `ผู้ใช้งาน: ${user?.full_name || user?.username}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });
    if (res.isConfirmed) {
      await logout();
      Swal.fire({
        icon: 'success',
        title: 'ออกจากระบบแล้ว',
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const getRoleLabel = (r?: string) => {
    switch (r) {
      case 'admin':
        return 'ผู้ดูแลระบบ';
      case 'fr_dispatch':
        return 'เจ้าหน้าที่แจ้งเหตุ';
      case 'er_staff':
        return 'เจ้าหน้าที่ ER';
      case 'director':
        return 'ผู้บริหาร';
      default:
        return 'ผู้ใช้งาน';
    }
  };

  const getRoleBadgeStyle = (r?: string) => {
    switch (r) {
      case 'admin':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'fr_dispatch':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'er_staff':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'director':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: Mobile Menu Button & Brand Header */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2 sm:mr-4">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white p-1.5 sm:p-2 rounded-md shadow-sm flex items-center justify-center shrink-0 self-center">
              <Siren className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="flex flex-col justify-center text-left my-auto shrink-0">
              <div className="flex items-center gap-1.5 leading-none flex-nowrap">
                <h1 className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent leading-none inline-block py-0.5 whitespace-nowrap">
                  ทันใจ
                </h1>
                <span className="text-slate-300 font-light text-xs sm:text-base">|</span>
                <span className="text-emerald-600 animate-pulse font-black text-sm sm:text-xl tracking-wider uppercase inline-block whitespace-nowrap">
                  TUNJAI
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onToggleSound();
                    if (!soundEnabled) playEmergencySirenSound();
                  }}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-0.5"
                  title={soundEnabled ? 'ปิดเสียงเตือน' : 'เปิดเสียงเตือน'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 animate-pulse" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 mt-1 leading-none flex-nowrap shrink-0">
                <span className="text-[9px] sm:text-xs font-bold text-slate-700 tracking-wider uppercase whitespace-nowrap shrink-0">
                  STROKE ALERT
                </span>
                <span className="bg-rose-100 text-rose-800 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-rose-200 uppercase tracking-wider shrink-0 leading-none whitespace-nowrap">
                  FAST Track
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Active Cases Badge */}
          {activeAlertCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 siren-badge-pulse text-white border border-rose-400 px-3 py-1.5 rounded-md text-xs font-bold shadow-xs h-9">
              <Siren className="w-3.5 h-3.5 animate-pulse text-white shrink-0" />
              <span>{activeAlertCount} เคสรอรับตัว</span>
            </div>
          )}

          {/* User Profile Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-md px-3 py-1.5 h-9 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 bg-teal-600 text-white rounded-md flex items-center justify-center shadow-xs shrink-0">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] font-semibold text-teal-700 leading-tight">
                    {getRoleLabel(user.role)}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-teal-600' : ''}`} />
              </button>

              {/* Dropdown Menu Card (Positioned top-full mt-2 for perfect non-overlapping positioning) */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-md shadow-xl z-50 p-3 space-y-3">
                  {/* User Profile Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 leading-tight">
                        {user.full_name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium space-y-1 pt-1 border-t border-slate-200">
                      {user.agency_name && (
                        <div className="flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{user.agency_name}</span>
                        </div>
                      )}
                      {user.hospital_name && (
                        <div className="flex items-start gap-1.5 text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{user.hospital_name}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Username: {user.username}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sound Alert Settings Row inside Dropdown */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                      <span>เสียงแจ้งเตือนภัย</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSound();
                        if (!soundEnabled) playEmergencySirenSound();
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer border ${
                        soundEnabled
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {soundEnabled ? 'เปิดอยู่' : 'ปิดอยู่'}
                    </button>
                  </div>

                  {/* Logout Button inside Dropdown */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogoutConfirm}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 border border-rose-200 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sound Alert Toggle Icon Button */}
          <AudioAlert soundEnabled={soundEnabled} onToggleSound={onToggleSound} />

          {/* Logout Icon Button (Height matches profile & sound alert button h-9) */}
          {user && (
            <button
              type="button"
              onClick={handleLogoutConfirm}
              className="flex items-center justify-center w-9 h-9 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 border border-rose-200 rounded-md transition-colors shadow-xs cursor-pointer shrink-0"
              title="ออกจากระบบ (Sign Out)"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
