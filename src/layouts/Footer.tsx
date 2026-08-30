import React from 'react';
import { Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-2.5 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">

        {/* Left: Developer Credit */}
        <div className="flex items-center gap-2.5">
          {/* Terminal Icon Badge - Black Gradient */}
          <div
            className="flex items-center justify-center p-1.5 rounded-md shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
          >
            <Terminal className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
          </div>

          {/* Developer Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase hidden sm:inline">
              Dev by
            </span>
            <span className="text-xs font-black text-slate-800 tracking-tight whitespace-nowrap">
              วิษณุ ศรีโยธา
            </span>
            <div className="w-px h-3 bg-slate-300 hidden sm:block" />
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline whitespace-nowrap">
              นักวิชาการคอมพิวเตอร์
            </span>
            <div className="w-px h-3 bg-slate-300 hidden md:block" />
            <span className="text-[10px] font-medium text-slate-400 hidden md:inline whitespace-nowrap">
              กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลกมลาไสย
            </span>
          </div>
        </div>

        {/* Right: Version & Copyright */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider whitespace-nowrap">
            © 2026
          </span>
          <div className="w-px h-3 bg-slate-200" />
          <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider whitespace-nowrap">
            v69.8.1.31
          </span>
        </div>

      </div>
    </footer>
  );
};
