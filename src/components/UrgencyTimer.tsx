import React from 'react';
import { UrgencyInfo } from '../types/emergency';

const WINDOW_MIN = 270; // 4.5 hours tPA Golden Window

export function getUrgency(onsetISO: string, nowMs: number): UrgencyInfo {
  const onset = new Date(onsetISO).getTime();
  if (Number.isNaN(onset)) return { remainingMin: null, pct: 0, level: 'expired' };
  
  const elapsedMs = nowMs - onset;
  const remainingMs = (WINDOW_MIN * 60000) - elapsedMs;
  const remainingMin = remainingMs / 60000;
  const pct = Math.max(0, Math.min(1, remainingMs / (WINDOW_MIN * 60000)));
  
  let level: UrgencyInfo['level'];
  if (remainingMs <= 0) level = 'expired';
  else if (pct <= 0.2) level = 'red';
  else if (pct <= 0.5) level = 'amber';
  else level = 'green';
  
  return { remainingMin, pct, level };
}

export function fmtRemaining(min: number | null): string {
  if (min === null || min === undefined) return '--:--:--';
  const remainingMs = Math.max(0, min * 60000);
  const totalSeconds = Math.floor(remainingMs / 1000);
  
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface RingProps {
  pct: number;
  level: UrgencyInfo['level'];
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}

export const UrgencyRing: React.FC<RingProps> = ({ pct, level, size = 120, stroke = 10, children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = level === 'expired' ? c : c * pct;
  
  let colorClass = 'stroke-emerald-500';
  let pulseClass = '';

  if (level === 'amber') colorClass = 'stroke-amber-500';
  else if (level === 'red') {
    colorClass = 'stroke-red-500';
    pulseClass = 'pulse-red-ring';
  } else if (level === 'expired') {
    colorClass = 'stroke-slate-400';
  }

  return (
    <div className={`relative flex items-center justify-center ${pulseClass}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="stroke-slate-200"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={`${colorClass} transition-all duration-700 ease-in-out`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - dash}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        {children}
      </div>
    </div>
  );
};
