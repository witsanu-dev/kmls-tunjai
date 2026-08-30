import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-600">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Stroke Alert v2.0 (React + Vite + TypeScript) · System Online</span>
        </div>

        <div className="flex items-center gap-1">
          <span>พัฒนาด้วยความใส่ใจเพื่อช่วยชีวิตผู้ป่วยวิกฤต</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </div>
      </div>
    </footer>
  );
};
