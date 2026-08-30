import React from 'react';
import { Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">

          {/* Developer Badge with Terminal Icon */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white p-1.5 rounded-md shadow-sm flex items-center justify-center shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">
              DEVELOPMENT BY
            </span>
          </div>

          {/* Developer Name & Position */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-sm font-black text-teal-700 tracking-tight">
              วิษณุ ศรีโยธา
            </span>
            <div className="w-px h-4 bg-slate-300 hidden sm:block" />
            <span className="text-xs font-semibold text-slate-600">
              นักวิชาการคอมพิวเตอร์
            </span>
          </div>

          {/* Agency */}
          <p className="text-[11px] text-slate-500 font-medium text-center">
            กลุ่มงานสุขภาพดิจิทัล โรงพยาบาลกมลาไสย จังหวัดกาฬสินธุ์
          </p>

          {/* Version & Copyright */}
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
            © 2026 • VERSION 69.8.1.31
          </p>

        </div>
      </div>
    </footer>
  );
};
