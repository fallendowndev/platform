'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const DEFAULT_OPTIONS = [
  { value: 'all', label: 'جميع السنوات' },
  { value: 'اولى ثانوي', label: 'أولى ثانوي' },
  { value: 'تانية ثانوي', label: 'تانية ثانوي' },
  { value: 'تانية بكالوريا', label: 'تانية بكالوريا' },
];

export default function GradeFilterDropdown({ value, onChange, options = DEFAULT_OPTIONS, className = '' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full select-none ${className}`} ref={containerRef}>
      {/* Trigger Button - Full Width */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 hover:border-slate-400 hover:bg-slate-50/50 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0 focus:border-slate-300 active:border-slate-300 focus-visible:outline-none focus-visible:ring-0 shadow-xs"
      >
        <span className="truncate">{selectedOption?.label || 'اختر السنة'}</span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Hand-made Full Width Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 inset-x-0 w-full min-w-full z-50 bg-white border border-slate-300 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 overflow-hidden"
          >
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={15} className="text-white shrink-0" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
