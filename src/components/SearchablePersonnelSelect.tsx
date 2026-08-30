import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, UserCheck, Plus } from 'lucide-react';
import { Personnel } from '../types/emergency';

interface SearchablePersonnelSelectProps {
  personnelList: Personnel[];
  selectedValue?: string;
  onSelectPersonnel: (nameWithAgency: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const SearchablePersonnelSelect: React.FC<SearchablePersonnelSelectProps> = ({
  personnelList,
  selectedValue = '',
  onSelectPersonnel,
  label = 'ผู้บันทึกข้อมูล / เจ้าหน้าที่ผู้แจ้งเหตุ',
  placeholder = 'เลือกหรือพิมพ์ค้นหาชื่อเจ้าหน้าที่...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredPersonnel = personnelList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.agency && p.agency.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.role && p.role.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleSelect = (person: Personnel) => {
    const formatted = person.agency ? `${person.name} (${person.agency})` : person.name;
    onSelectPersonnel(formatted);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomInput = () => {
    if (searchTerm.trim()) {
      onSelectPersonnel(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Selected Box Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <div className="text-left truncate">
            {selectedValue ? (
              <span className="font-semibold text-slate-800 text-xs truncate block">
                {selectedValue}
              </span>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomInput();
                  }
                }}
                placeholder="ค้นหาชื่อ, หน่วยงาน หรือระบุชื่อเอง..."
                className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
            </div>
          </div>

          {/* List Options */}
          <div className="overflow-y-auto divide-y divide-slate-100 py-1">
            {/* Direct write-in custom option if typing */}
            {searchTerm.trim() && (
              <button
                type="button"
                onClick={handleCustomInput}
                className="w-full p-2.5 text-left flex items-center gap-2 bg-teal-50/60 hover:bg-teal-100/70 text-teal-800 transition-colors cursor-pointer border-b border-teal-100"
              >
                <Plus className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold">
                  ใช้ชื่อนี้: <span className="underline">"{searchTerm.trim()}"</span>
                </span>
              </button>
            )}

            {filteredPersonnel.length === 0 && !searchTerm.trim() ? (
              <div className="p-3 text-center text-xs text-slate-500">
                ไม่พบข้อมูลเจ้าหน้าที่ (พิมพ์เพื่อระบุชื่อใหม่ได้)
              </div>
            ) : (
              filteredPersonnel.map((p) => {
                const formattedName = p.agency ? `${p.name} (${p.agency})` : p.name;
                const isSelected = selectedValue === formattedName || selectedValue === p.name;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`w-full p-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50 text-teal-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5 flex-wrap">
                        <span>{p.name}</span>
                        {p.role && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded border border-slate-200">
                            {p.role}
                          </span>
                        )}
                      </div>
                      {p.agency && <div className="text-[11px] text-slate-500 mt-0.5">{p.agency}</div>}
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
