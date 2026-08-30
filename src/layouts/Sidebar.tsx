import React from 'react';
import { Send, Hospital as HospitalIcon, Table, BarChart3, ShieldCheck, X, Users, History, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'fr' | 'hospital' | 'history' | 'analytics' | 'users' | 'audit-logs' | 'moph-notify';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeCount: number;
  mobileOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeCount,
  mobileOpen,
  onCloseMobileMenu,
}) => {
  const { user, hasRole } = useAuth();

  const allMenuItems = [
    {
      id: 'fr' as ActiveTab,
      label: 'แจ้งเหตุภาคสนาม',
      desc: 'สำหรับกู้ชีพ / อสม. แจ้งเคสใหม่',
      icon: Send,
      badge: null,
      roles: ['admin', 'fr_dispatch', 'er_staff'],
    },
    {
      id: 'hospital' as ActiveTab,
      label: 'ห้องฉุกเฉิน (ER Monitor)',
      desc: 'มอนิเตอร์เคสเรียลไทม์',
      icon: HospitalIcon,
      badge: activeCount > 0 ? activeCount : null,
      roles: ['admin', 'er_staff', 'fr_dispatch', 'director'],
    },
    {
      id: 'history' as ActiveTab,
      label: 'ประวัติเคส',
      desc: 'ค้นหา กรอง และส่งออกข้อมูล',
      icon: Table,
      badge: null,
      roles: ['admin', 'er_staff', 'director'],
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'สถิติและรายงาน',
      desc: 'แดชบอร์ดสรุปผลการรับผู้ป่วย',
      icon: BarChart3,
      badge: null,
      roles: ['admin', 'director', 'er_staff'],
    },
    {
      id: 'users' as ActiveTab,
      label: 'จัดการผู้ใช้งาน',
      desc: 'กำหนดสิทธิบทบาท (User Control)',
      icon: Users,
      badge: null,
      roles: ['admin'],
    },
    {
      id: 'moph-notify' as ActiveTab,
      label: 'ตั้งค่า MOPH Notify API',
      desc: 'LINE Group Notification Config',
      icon: BellRing,
      badge: null,
      roles: ['admin'],
    },
    {
      id: 'audit-logs' as ActiveTab,
      label: 'ประวัติเข้าใช้งานระบบ',
      desc: 'Audit Logs และการบันทึกข้อมูล',
      icon: History,
      badge: null,
      roles: ['admin', 'director'],
    },
  ];

  const visibleMenuItems = allMenuItems.filter((item) => {
    if (!user) return true;
    return item.roles.includes(user.role);
  });

  const content = (
    <nav className="p-4 space-y-2">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
        เมนูหลักระบบ
      </div>

      {visibleMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item.id);
              onCloseMobileMenu();
            }}
            className={`w-full p-3 rounded-md text-left flex items-start justify-between transition-all cursor-pointer ${
              isActive
                ? 'bg-teal-600 text-white shadow-sm font-semibold'
                : 'text-slate-700 hover:bg-slate-100 font-medium'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <div>
                <div className="text-sm leading-tight">{item.label}</div>
                <div className={`text-[11px] mt-0.5 ${isActive ? 'text-teal-100' : 'text-slate-500'}`}>
                  {item.desc}
                </div>
              </div>
            </div>

            {item.badge !== null && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ml-2 ${
                  isActive ? 'bg-white text-teal-700' : 'bg-rose-500 text-white siren-badge-pulse'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="pt-4 border-t border-slate-200 mt-4 px-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/80 p-2.5 rounded-md border border-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>คุ้มครองข้อมูล PDPA</span>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onCloseMobileMenu} />
          <div className="relative bg-white w-4/5 max-w-sm h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-800 text-sm">เมนูระบบ Stroke Alert</span>
              <button
                type="button"
                onClick={onCloseMobileMenu}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};

