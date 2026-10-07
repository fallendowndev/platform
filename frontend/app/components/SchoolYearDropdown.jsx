'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, GraduationCap, Check } from 'lucide-react';

const YEARS = [
  { value: 'اولى ثانوي',    label: 'أولى ثانوي' },
  { value: 'تانية ثانوي',   label: 'تانية ثانوي' },
  { value: 'تانية بكالوريا', label: 'تانية بكالوريا' },
];

export default function SchoolYearDropdown({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = YEARS.find((y) => y.value === value) || null;

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = YEARS.findIndex((y) => y.value === value);
      onChange(YEARS[(idx + 1) % YEARS.length].value);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = YEARS.findIndex((y) => y.value === value);
      onChange(YEARS[(idx - 1 + YEARS.length) % YEARS.length].value);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={handleKey}
        onClick={() => setOpen((o) => !o)}
        className={[
          'w-full flex items-center justify-between gap-2',
          'pr-4 pl-4 py-3.5 rounded-xl border bg-white',
          'text-base cursor-pointer transition-colors duration-150',
          'focus:outline-none focus:ring-2',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : open
            ? 'border-neutral-800 ring-2 ring-black/10'
            : 'border-neutral-300 hover:border-neutral-400 focus:border-neutral-800 focus:ring-black/10',
          selected ? 'text-neutral-900' : 'text-neutral-400',
        ].join(' ')}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <GraduationCap size={18} className={selected ? 'text-neutral-500 shrink-0' : 'text-neutral-300 shrink-0'} />
          <span className={selected ? 'font-semibold truncate' : 'truncate'}>
            {selected ? selected.label : 'اختر السنة الدراسية'}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={[
            'text-neutral-400 shrink-0 transition-transform duration-300',
            open ? 'rotate-180' : 'rotate-0',
          ].join(' ')}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.ul
            key="dropdown"
            role="listbox"
            initial={{ height: 0, y: -6, opacity: 0 }}
            animate={{ height: 'auto', y: 0, opacity: 1 }}
            exit={{ height: 0, y: -6, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+8px)] right-0 left-0 z-50 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden p-2 flex flex-col gap-2 m-0 list-none"
          >
            {YEARS.map((year) => {
              const isSelected = value === year.value;
              return (
                <li
                  key={year.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(year.value); setOpen(false); }}
                  className={[
                    'flex items-center justify-between gap-3 px-4 py-3 rounded-lg cursor-pointer select-none',
                    'transition-colors duration-150',
                    isSelected
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-800 hover:bg-neutral-200 hover:text-black active:bg-neutral-300',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">{year.label}</span>
                  {isSelected && <Check size={16} className="text-white shrink-0" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
