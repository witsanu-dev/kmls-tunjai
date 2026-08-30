import React, { useState, useRef } from 'react';
import {
  Camera, Upload, Trash2, Eye, ShieldCheck,
  CreditCard, Lock, Images, Plus, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const MAX_EXTRA_PHOTOS = 10;

export interface PhotoUploaderProps {
  idPhotoUrl: string | null;
  setIdPhotoUrl: (url: string | null) => void;
  additionalPhotos?: string[];
  setAdditionalPhotos?: (photos: string[]) => void;
}

/**
 * Client-side secure image compression.
 * Reduces image dimensions to max 1200px and compresses to JPEG quality 0.75
 * Ensures fast real-time transmission and compliant memory footprint.
 */
function compressImage(file: File, maxDim = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          reject(new Error('Canvas context error'));
        }
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  idPhotoUrl,
  setIdPhotoUrl,
  additionalPhotos = [],
  setAdditionalPhotos,
}) => {
  const [loadingId, setLoadingId] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraCameraRef = useRef<HTMLInputElement>(null);
  const extraFileRef = useRef<HTMLInputElement>(null);

  /* ── ID Card photo ── */
  const processIdFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      MySwal.fire({ icon: 'error', title: 'รูปแบบไฟล์ไม่ถูกต้อง', text: 'กรุณาเลือกไฟล์ภาพถ่าย (JPG, PNG) เท่านั้น', confirmButtonColor: '#0d9488' });
      return;
    }
    setLoadingId(true);
    try {
      const compressed = await compressImage(file, 1200, 0.75);
      setIdPhotoUrl(compressed);
    } catch {
      MySwal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถประมวลผลรูปถ่ายได้ กรุณาลองใหม่', confirmButtonColor: '#0d9488' });
    } finally {
      setLoadingId(false);
    }
  };

  /* ── Additional photos ── */
  const processExtraFiles = async (files: FileList | null) => {
    if (!files || !setAdditionalPhotos) return;
    const remaining = MAX_EXTRA_PHOTOS - additionalPhotos.length;
    if (remaining <= 0) {
      MySwal.fire({ icon: 'warning', title: `ครบจำนวนสูงสุดแล้ว`, text: `สามารถอัปโหลดภาพเพิ่มเติมได้สูงสุด ${MAX_EXTRA_PHOTOS} ภาพต่อเคส`, confirmButtonColor: '#0d9488' });
      return;
    }
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remaining);
    if (validFiles.length === 0) return;
    setLoadingExtra(true);
    try {
      const compressed = await Promise.all(validFiles.map(f => compressImage(f, 1200, 0.75)));
      setAdditionalPhotos([...additionalPhotos, ...compressed]);
    } catch {
      MySwal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่', confirmButtonColor: '#0d9488' });
    } finally {
      setLoadingExtra(false);
    }
  };

  const removeExtra = (index: number) => {
    if (!setAdditionalPhotos) return;
    setAdditionalPhotos(additionalPhotos.filter((_, i) => i !== index));
  };

  const openPreview = (url: string, title: string) => {
    MySwal.fire({
      title,
      imageUrl: url,
      imageAlt: title,
      confirmButtonText: 'ปิดหน้าต่าง',
      confirmButtonColor: '#0d9488',
      customClass: { image: 'rounded-md max-h-[70vh] object-contain border border-slate-200 shadow-md' },
    });
  };

  const canAddMore = additionalPhotos.length < MAX_EXTRA_PHOTOS;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-4">

      {/* ── Section Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <CreditCard className="w-4 h-4 text-teal-600 shrink-0" />
          <span>รูปถ่ายบัตรประชาชน / ภาพประกอบเคส</span>
        </label>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>เข้ารหัส PDPA</span>
        </span>
      </div>

      {/* ══════════════════════════════════════════════
          PART 1 — ID Card Photo (CR80 aspect ratio)
          Thai ID card: 85.6 × 54 mm → ratio 1.585:1
          Preview area: w-52 (208px) × h-[131px]
          ══════════════════════════════════════════════ */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5 text-teal-600" />
          รูปถ่ายบัตรประชาชน / ใบหน้าผู้ป่วย
        </p>

        <div className="flex items-start gap-4 flex-wrap">
          {/* ID Card Preview — CR80 ratio */}
          {idPhotoUrl ? (
            <div className="relative group shrink-0 rounded-md overflow-hidden border-2 border-teal-500 shadow-sm"
              style={{ width: '208px', height: '131px' }}>
              <img
                src={idPhotoUrl}
                alt="บัตรประชาชน / ผู้ป่วย"
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-[1.02]"
                onClick={() => openPreview(idPhotoUrl, 'รูปถ่ายบัตรประชาชน / ผู้ป่วย')}
              />
              <div className="absolute inset-0 bg-slate-900/50 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                <button
                  type="button"
                  onClick={() => openPreview(idPhotoUrl, 'รูปถ่ายบัตรประชาชน / ผู้ป่วย')}
                  className="p-1.5 bg-white text-slate-800 rounded-full hover:bg-slate-100 shadow-sm"
                  title="ขยายดูรูปภาพ"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIdPhotoUrl(null)}
                  className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-sm"
                  title="ลบรูปภาพ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty state — ID card shaped placeholder */
            <div
              className="shrink-0 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400"
              style={{ width: '208px', height: '131px' }}
            >
              <CreditCard className="w-8 h-8 text-slate-300" />
              <span className="text-[10px] font-semibold text-slate-400 text-center leading-tight px-2">
                ภาพถ่ายบัตรประชาชน
              </span>
            </div>
          )}

          {/* Capture / Upload Buttons + Security info */}
          <div className="flex-1 min-w-[200px] space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={loadingId}
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white text-xs font-bold px-3.5 py-2 rounded-md transition-colors shadow-sm cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{loadingId ? 'กำลังประมวลผล...' : 'ถ่ายจากกล้อง'}</span>
              </button>
              <button
                type="button"
                disabled={loadingId}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 disabled:bg-slate-100 text-xs font-semibold px-3.5 py-2 rounded-md transition-colors shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>เลือกจากคลัง</span>
              </button>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={e => { processIdFile(e.target.files![0]); e.target.value = ''; }} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { processIdFile(e.target.files![0]); e.target.value = ''; }} className="hidden" />

            <div className="bg-slate-50 border border-slate-200 rounded-md p-2 text-[11px] text-slate-600 space-y-1">
              <p className="flex items-center gap-1 font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                มาตรฐานความปลอดภัยทางการแพทย์
              </p>
              <ul className="list-disc list-inside text-slate-500 space-y-0.5 pl-1">
                <li>บีบอัดบนอุปกรณ์ก่อนส่ง (Client-Side Compression)</li>
                <li>ส่งผ่าน SSL/TLS 256-bit ปลอดภัย</li>
                <li>ใช้เพื่อยืนยันตัวตนผู้ป่วยฉุกเฉินเท่านั้น</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          PART 2 — Additional Photos (max 10)
          ══════════════════════════════════════════════ */}
      {setAdditionalPhotos && (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Images className="w-3.5 h-3.5 text-slate-500" />
              รูปภาพเพิ่มเติม
              <span className="text-slate-400 font-normal">
                ({additionalPhotos.length}/{MAX_EXTRA_PHOTOS} ภาพ)
              </span>
            </p>
            {canAddMore && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={loadingExtra}
                  onClick={() => extraCameraRef.current?.click()}
                  title="ถ่ายภาพเพิ่มเติม"
                  className="inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">กล้อง</span>
                </button>
                <button
                  type="button"
                  disabled={loadingExtra}
                  onClick={() => extraFileRef.current?.click()}
                  title="เลือกภาพจากคลัง"
                  className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 disabled:bg-slate-100 text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มภาพ</span>
                </button>
              </div>
            )}
          </div>

          <input ref={extraCameraRef} type="file" accept="image/*" capture="environment" multiple onChange={e => { processExtraFiles(e.target.files); e.target.value = ''; }} className="hidden" />
          <input ref={extraFileRef} type="file" accept="image/*" multiple onChange={e => { processExtraFiles(e.target.files); e.target.value = ''; }} className="hidden" />

          {additionalPhotos.length === 0 ? (
            <div
              className="w-full border-2 border-dashed border-slate-200 rounded-md bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-slate-400 cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors"
              style={{ minHeight: '80px' }}
              onClick={() => extraFileRef.current?.click()}
            >
              <Images className="w-6 h-6 text-slate-300" />
              <span className="text-[11px] font-medium text-slate-400">คลิกเพื่อเพิ่มรูปภาพเพิ่มเติม (สูงสุด {MAX_EXTRA_PHOTOS} ภาพ)</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {additionalPhotos.map((url, idx) => (
                <div key={idx} className="relative group rounded-md overflow-hidden border border-slate-200 shadow-sm aspect-square">
                  <img
                    src={url}
                    alt={`ภาพที่ ${idx + 1}`}
                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => openPreview(url, `ภาพประกอบที่ ${idx + 1}`)}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeExtra(idx); }}
                      className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-sm"
                      title="ลบภาพนี้"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-white drop-shadow">
                    {idx + 1}
                  </span>
                </div>
              ))}

              {/* Add more tile */}
              {canAddMore && (
                <div
                  className="rounded-md border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors aspect-square"
                  onClick={() => extraFileRef.current?.click()}
                >
                  <Plus className="w-5 h-5 text-slate-300" />
                  <span className="text-[9px] text-slate-400 font-medium text-center leading-tight px-1">
                    เพิ่ม<br />ภาพ
                  </span>
                </div>
              )}
            </div>
          )}

          {!canAddMore && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ครบจำนวนสูงสุด {MAX_EXTRA_PHOTOS} ภาพต่อเคสแล้ว — ลบภาพเก่าก่อนเพิ่มภาพใหม่
            </p>
          )}

          {loadingExtra && (
            <p className="text-[11px] text-teal-700 font-medium animate-pulse">กำลังประมวลผลภาพ...</p>
          )}
        </div>
      )}
    </div>
  );
};
