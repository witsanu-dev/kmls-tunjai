import React from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

export function playEmergencySirenSound() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Helper to generate a piercing medical-grade tone combining waveforms
    const playTone = (freq: number, startTime: number, duration: number, vol: number) => {
      const oscSine = ctx.createOscillator();
      const oscSquare = ctx.createOscillator();
      const gain = ctx.createGain();

      oscSine.type = 'sine';
      oscSquare.type = 'square';
      
      oscSine.frequency.value = freq;
      // Slightly detune the square wave to create an alarming, penetrating resonance
      oscSquare.frequency.value = freq + 2;

      // Sharp attack, sustained loud body, and quick release to prevent clicking
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.02);
      gain.gain.setValueAtTime(vol, ctx.currentTime + startTime + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

      // Mix sine for body and square for sharp edge
      const sineGain = ctx.createGain();
      sineGain.gain.value = 0.7;
      oscSine.connect(sineGain);
      sineGain.connect(gain);

      const squareGain = ctx.createGain();
      squareGain.gain.value = 0.3;
      oscSquare.connect(squareGain);
      squareGain.connect(gain);

      gain.connect(ctx.destination);

      oscSine.start(ctx.currentTime + startTime);
      oscSquare.start(ctx.currentTime + startTime);
      oscSine.stop(ctx.currentTime + startTime + duration);
      oscSquare.stop(ctx.currentTime + startTime + duration);
    };

    // Standard High-Priority Medical Alarm (IEC 60601-1-8 style): 
    // 3 short beeps, short pause, 2 short beeps
    const baseFreq = 950; // High, piercing frequency standard for critical alerts
    const duration = 0.18; // Short, sharp burst
    const vol = 0.65; // Loud and clear (0 to 1 scale)

    let timeOffset = 0;
    
    // Play the full 5-beep sequence twice to ensure ER staff hears it clearly
    for (let loop = 0; loop < 2; loop++) {
      playTone(baseFreq, timeOffset, duration, vol);
      timeOffset += 0.25;
      
      playTone(baseFreq, timeOffset, duration, vol);
      timeOffset += 0.25;

      playTone(baseFreq, timeOffset, duration, vol);
      timeOffset += 0.55; // Noticeable pause between 3-beep and 2-beep

      playTone(baseFreq, timeOffset, duration, vol);
      timeOffset += 0.25;

      playTone(baseFreq, timeOffset, duration, vol);
      timeOffset += 1.2; // Longer pause before repeating the entire sequence
    }

  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

interface AudioAlertProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AudioAlert: React.FC<AudioAlertProps> = ({ soundEnabled, onToggleSound }) => {
  const handleToggle = () => {
    onToggleSound();
    // If it was currently disabled, turning it on should play a test sound
    if (!soundEnabled) {
      playEmergencySirenSound();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors shadow-xs shrink-0 cursor-pointer ${
        soundEnabled
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
          : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
      }`}
      title={soundEnabled ? 'เสียงเตือนภัย: เปิดอยู่ (กดเพื่อปิด)' : 'เสียงเตือนภัย: ปิดอยู่ (กดเพื่อเปิดและทดสอบเสียง)'}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5 text-emerald-700 shrink-0 animate-pulse" />
      ) : (
        <VolumeX className="w-5 h-5 text-slate-500 shrink-0" />
      )}
    </button>
  );
};

