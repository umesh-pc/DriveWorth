import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function CustomDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = '[ Select Option ]',
  disabled = false,
  searchable = false,
  required = false,
  suffix = '',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const dropdownRef = useRef(null);

  // Normalize options to array of { label, value }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null && 'value' in opt) {
        return { label: String(opt.label || opt.value), value: opt.value };
      }
      return { label: String(opt), value: opt };
    });
  }, [options]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [normalizedOptions, searchQuery]);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, options]);

  // Max 8 visible options per radial ring page
  const ITEMS_PER_RING = 8;
  const totalPages = Math.ceil(filteredOptions.length / ITEMS_PER_RING) || 1;
  const currentRingOptions = useMemo(() => {
    const start = currentPage * ITEMS_PER_RING;
    return filteredOptions.slice(start, start + ITEMS_PER_RING);
  }, [filteredOptions, currentPage]);

  // Find currently selected option object
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard accessibility (Escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`space-y-1 relative text-left ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-mono font-bold text-secondary-text uppercase block tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Trigger Button in Form */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2.5 px-3.5 bg-white/[0.03] border rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer select-none ${
          disabled
            ? 'border-white/5 text-secondary-text/40 opacity-40 cursor-not-allowed'
            : isOpen
            ? 'border-brand-primary text-white bg-white/[0.06]'
            : 'border-white/10 text-white hover:border-white/25 hover:bg-white/[0.05]'
        }`}
      >
        <span className="truncate">
          {selectedOption
            ? `${selectedOption.label}${suffix ? ` ${suffix}` : ''}`
            : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-secondary-text transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-brand-primary' : ''
          }`}
        />
      </button>

      {/* RADIAL / CIRCULAR SELECTION MODAL */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-[#050816] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(37,99,235,0.25)] text-center overflow-hidden flex flex-col items-center"
            >
              {/* Header Bar */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {label || 'SELECT SPECIFICATION'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-secondary-text hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar Input */}
              {(searchable || normalizedOptions.length > 6) && (
                <div className="w-full my-3 relative">
                  <Search className="w-3.5 h-3.5 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${label ? label.toLowerCase() : 'options'}...`}
                    className="w-full py-2 pl-9 pr-8 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-secondary-text/50 focus:outline-none focus:border-brand-primary font-sans"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* RADIAL SELECTION CANVAS */}
              <div className="relative w-[310px] sm:w-[340px] h-[310px] sm:h-[340px] flex items-center justify-center my-2">
                
                {/* Concentric Circular Positioning Guides */}
                <div className="absolute inset-4 rounded-full border border-brand-primary/20 bg-brand-primary/[0.02] shadow-[0_0_30px_rgba(37,99,235,0.08)] pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />

                {/* INFORMATIONAL CENTER HUB */}
                <div className="absolute z-10 w-[110px] h-[110px] rounded-full bg-[#050816] border border-brand-primary/40 shadow-[0_0_20px_rgba(37,99,235,0.3)] flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                  {selectedOption ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 mb-0.5" />
                      <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider truncate max-w-[90px]">
                        {selectedOption.label}
                      </span>
                      <span className="text-[8px] font-mono text-emerald-400 uppercase mt-0.5">
                        Selected
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-brand-primary mb-0.5" />
                      <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-wider truncate max-w-[90px]">
                        {label || 'OPTION'}
                      </span>
                      <span className="text-[8px] font-mono text-secondary-text/70 uppercase mt-0.5">
                        Select an option
                      </span>
                    </>
                  )}
                </div>

                {/* 8 OPTION CARDS MATHEMATICALLY POSITIONED AROUND THE RING */}
                {filteredOptions.length === 0 ? (
                  <div className="relative z-20 text-xs font-mono text-secondary-text">
                    No matching options found
                  </div>
                ) : (
                  currentRingOptions.map((opt, idx) => {
                    const count = currentRingOptions.length;
                    // Radius for circle positioning (130px desktop, 110px mobile)
                    const radius = window.innerWidth < 640 ? 110 : 130;

                    // Angle calculation: starts at -90deg (12 o'clock) and rotates evenly
                    const angleDeg = -90 + idx * (360 / count);
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const x = Math.round(radius * Math.cos(angleRad));
                    const y = Math.round(radius * Math.sin(angleRad));

                    const isSelected = String(opt.value) === String(value);

                    return (
                      <div
                        key={String(opt.value)}
                        className="absolute z-20"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer max-w-[130px] truncate ${
                            isSelected
                              ? 'bg-brand-primary text-white font-bold border border-brand-primary shadow-[0_0_18px_rgba(37,99,235,0.6)]'
                              : 'bg-[#050816] border border-white/20 text-white hover:border-brand-primary hover:bg-brand-primary/20 shadow-md'
                          }`}
                        >
                          <span className="truncate">
                            {opt.label}
                            {suffix ? ` ${suffix}` : ''}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                        </button>
                      </div>
                    );
                  })
                )}

              </div>

              {/* FOOTER: PAGINATION & ITEM COUNT */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-secondary-text border-t border-white/10 pt-3 mt-1">
                <span className="text-[10px]">
                  Showing {currentRingOptions.length} of {filteredOptions.length} Options
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      className="p-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-white px-1">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      className="p-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
