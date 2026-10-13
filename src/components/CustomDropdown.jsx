import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X, ChevronLeft, ChevronRight, Sparkles, LayoutGrid, Disc } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [desktopView, setDesktopView] = useState('radial'); // 'radial' or 'list'
  const dropdownRef = useRef(null);

  // Detect mobile viewport (< 640px) for layout adaptation
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Reset pagination when search query or options change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, options]);

  // Radial Ring layout: 8 options per page on desktop
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

  // Close when clicking outside dropdown trigger container (when not in modal)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Handled inside modal via backdrop click
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard accessibility (Escape key) and body scroll locking
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
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

      {/* Trigger Button in Form (Accessible min 44px touch height) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full min-h-[44px] py-2.5 px-3.5 bg-white/[0.03] border rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer select-none ${
          disabled
            ? 'border-white/5 text-secondary-text/40 opacity-40 cursor-not-allowed'
            : isOpen
            ? 'border-brand-primary text-white bg-white/[0.06] shadow-[0_0_15px_rgba(37,99,235,0.2)]'
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

      {/* MODAL / SELECTION DIALOG (Zero horizontal overflow across all viewports) */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-x-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-[92vw] sm:max-w-md bg-[#050816] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(37,99,235,0.25)] text-center overflow-hidden flex flex-col items-center max-h-[90vh]"
            >
              {/* Header Bar */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider truncate">
                    {label || 'SELECT SPECIFICATION'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* View switch on desktop */}
                  {!isMobile && (
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setDesktopView('radial')}
                        title="Radial View"
                        className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                          desktopView === 'radial'
                            ? 'bg-brand-primary text-white'
                            : 'text-secondary-text hover:text-white'
                        }`}
                      >
                        <Disc className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDesktopView('list')}
                        title="List View"
                        className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                          desktopView === 'list'
                            ? 'bg-brand-primary text-white'
                            : 'text-secondary-text hover:text-white'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Close button with 44px touch area */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close specification modal"
                    className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-secondary-text hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Bar Input (Accessible height) */}
              {(searchable || normalizedOptions.length > 5) && (
                <div className="w-full my-3 relative shrink-0">
                  <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${label ? label.toLowerCase() : 'options'}...`}
                    className="w-full min-h-[42px] py-2 pl-9 pr-8 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-secondary-text/50 focus:outline-none focus:border-brand-primary font-sans"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search query"
                      className="w-8 h-8 absolute right-1 top-1/2 -translate-y-1/2 text-secondary-text hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* CONTENT BODY: ADAPTIVE RESPONSIVE (Mobile List/Grid vs Desktop Radial HUD) */}
              {isMobile || desktopView === 'list' ? (
                /* MOBILE & LIST VIEW: Touch-friendly card list (zero clipping, min 44px tap targets) */
                <div className="w-full my-2 overflow-y-auto max-h-[55vh] pr-1 space-y-1.5 scrollbar-thin">
                  {filteredOptions.length === 0 ? (
                    <div className="py-8 text-xs font-mono text-secondary-text">
                      No matching options found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {filteredOptions.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                          <button
                            key={String(opt.value)}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-brand-primary text-white font-bold border border-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                : 'bg-white/[0.03] border border-white/10 text-white hover:border-brand-primary/50 hover:bg-white/[0.07] active:scale-[0.99]'
                            }`}
                          >
                            <span className="truncate text-left">
                              {opt.label}
                              {suffix ? ` ${suffix}` : ''}
                            </span>
                            {isSelected ? (
                              <Check className="w-4 h-4 text-white shrink-0 ml-2" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-white/10 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* DESKTOP RADIAL HUD CANVAS (Sized strictly within modal bounds) */
                <div className="relative w-[320px] h-[320px] flex items-center justify-center my-2 shrink-0">
                  {/* Concentric Circular Guides */}
                  <div className="absolute inset-4 rounded-full border border-brand-primary/20 bg-brand-primary/[0.02] shadow-[0_0_30px_rgba(37,99,235,0.08)] pointer-events-none" />
                  <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />

                  {/* Center Informational Hub */}
                  <div className="absolute z-10 w-[105px] h-[105px] rounded-full bg-[#050816] border border-brand-primary/40 shadow-[0_0_20px_rgba(37,99,235,0.3)] flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                    {selectedOption ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 mb-0.5" />
                        <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider truncate max-w-[85px]">
                          {selectedOption.label}
                        </span>
                        <span className="text-[8px] font-mono text-emerald-400 uppercase mt-0.5">
                          Selected
                        </span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-brand-primary mb-0.5" />
                        <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-wider truncate max-w-[85px]">
                          {label || 'OPTION'}
                        </span>
                        <span className="text-[8px] font-mono text-secondary-text/70 uppercase mt-0.5">
                          Select an option
                        </span>
                      </>
                    )}
                  </div>

                  {/* 8 Radial Buttons Mathematically Positioned */}
                  {filteredOptions.length === 0 ? (
                    <div className="relative z-20 text-xs font-mono text-secondary-text">
                      No matching options found
                    </div>
                  ) : (
                    currentRingOptions.map((opt, idx) => {
                      const count = currentRingOptions.length;
                      const radius = 118; // Contained within bounds

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
                            className={`px-3 py-1.5 min-h-[32px] rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer max-w-[120px] truncate ${
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
              )}

              {/* FOOTER: PAGINATION & ITEM COUNT */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-secondary-text border-t border-white/10 pt-3 mt-1 shrink-0">
                <span className="text-[10px]">
                  {isMobile || desktopView === 'list'
                    ? `${filteredOptions.length} Options`
                    : `Showing ${currentRingOptions.length} of ${filteredOptions.length}`}
                </span>

                {!isMobile && desktopView === 'radial' && totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      aria-label="Previous page of options"
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer flex items-center justify-center"
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
                      aria-label="Next page of options"
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer flex items-center justify-center"
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
