import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Building2, MapPin } from 'lucide-react';
import { Hospital } from '../types/emergency';

export interface SubdistrictItem {
  tambon: string;
  amphoe: string;
}

interface SearchableSubdistrictSelectProps {
  items: SubdistrictItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  label?: string;
  selectedSubdistrict?: SubdistrictItem;
  onAddNew?: () => void;
}

export const SearchableSubdistrictSelect: React.FC<SearchableSubdistrictSelectProps> = ({
  items,
  selectedKey,
  onSelect,
  label = 'ตำบลในพื้นที่เกิดเหตุ',
  selectedSubdistrict,
  onAddNew,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(
    (item) =>
      item.tambon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.amphoe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-slate-700">
          {label}
          {selectedSubdistrict && (
            <span className="ml-1 font-normal text-slate-500">(อำเภอ{selectedSubdistrict.amphoe})</span>
          )}
        </label>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>เพิ่มตำบลใหม่</span>
          </button>
        )}
      </div>

      {/* Selected Box Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-semibold text-xs text-slate-800 truncate">
            {selectedSubdistrict ? `ตำบล${selectedSubdistrict.tambon}` : 'เลือกตำบล...'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-[999] mt-1 w-full bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์ค้นหาตำบล หรือ อำเภอ..."
                className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 py-1">
            {filteredItems.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                ไม่พบข้อมูลตำบลที่ค้นหา
              </div>
            ) : (
              filteredItems.map((item) => {
                const key = `${item.tambon}|${item.amphoe}`;
                const isSelected = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onSelect(key);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full p-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50 text-teal-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-xs text-slate-800">
                        ตำบล{item.tambon}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        อำเภอ{item.amphoe}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export interface SearchableSelectProps {
  hospitals: Hospital[];
  selectedHospitalId?: number;
  selectedHospitalName?: string;
  onSelectHospital: (hospital: Hospital) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  onAddNewHospital?: () => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  hospitals,
  selectedHospitalId,
  selectedHospitalName,
  onSelectHospital,
  label = 'โรงพยาบาลปลายทางรับตัวผู้ป่วย',
  placeholder = 'เลือกโรงพยาบาล...',
  required = false,
  onAddNewHospital,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedHospital = hospitals.find(h =>
    (selectedHospitalId && h.id === selectedHospitalId) ||
    (selectedHospitalName && h.name === selectedHospitalName)
  ) || (selectedHospitalId ? hospitals[0] : null);

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-700">
            {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
          {onAddNewHospital && (
            <button
              type="button"
              onClick={onAddNewHospital}
              className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>เพิ่มโรงพยาบาลปลายทาง</span>
            </button>
          )}
        </div>
      )}

      {/* Selected Box Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="text-left truncate">
            {selectedHospital ? (
              <>
                <div className="font-semibold flex items-center gap-1.5 text-slate-800 text-xs truncate">
                  <span className="truncate">{selectedHospital.name}</span>
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-mono px-1.5 py-0.2 rounded border border-teal-200 shrink-0">
                    {selectedHospital.code}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate">
                  {selectedHospital.level}{selectedHospital.phone ? ` · Tel: ${selectedHospital.phone}` : ''}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
      </button>

      {/* Dropdown Options Container */}
      {isOpen && (
        <div className="absolute z-[999] mt-1 w-full bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input inside Dropdown */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ รพ., รหัสหน่วยบริการ (เช่น 11078)..."
                className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
            </div>
          </div>

          {/* List Options */}
          <div className="overflow-y-auto divide-y divide-slate-100 py-1">
            {filteredHospitals.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                ไม่พบข้อมูลโรงพยาบาลที่ค้นหา
              </div>
            ) : (
              filteredHospitals.map((h) => {
                const isSelected = selectedHospital?.id === h.id || selectedHospitalName === h.name;
                return (
                  <button
                    key={h.id || h.code}
                    type="button"
                    onClick={() => {
                      onSelectHospital(h);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full p-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50 text-teal-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <span>{h.name}</span>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.2 rounded border border-slate-200 font-bold">
                          {h.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{h.level} {h.phone ? `· ${h.phone}` : ''}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
