import { m, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export function CustomSelect({ options, value, onChange, label, disabledOptions = [] }: { options: string[], value: string, onChange: (val: string) => void, label: string, disabledOptions?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const controlId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="relative w-full" ref={ref}>
      <label htmlFor={controlId} className="block text-xs font-bold text-[#30005C] mb-1">{label}</label>
      <button 
        id={controlId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-[#30005C] font-black tracking-wide flex justify-between items-center cursor-pointer hover:border-[#30005C]/30 transition-colors shadow-sm"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {(() => {
                const disabledSet = new Set(disabledOptions);
                return options.map((option) => {
                  const isDisabled = disabledSet.has(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isDisabled) {
                          onChange(option);
                          setIsOpen(false);
                        }
                      }}
                      onClick={() => {
                        if (!isDisabled) {
                          onChange(option);
                          setIsOpen(false);
                        }
                      }}
                    className={`w-full text-left px-4 py-3 font-semibold text-sm transition-colors ${
                      isDisabled 
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed' 
                        : value === option
                          ? 'bg-[#C00040] text-white'
                          : 'text-[#30005C] hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    {option}
                  </button>
                  );
                });
              })()}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
