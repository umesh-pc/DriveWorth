import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Activity } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/#solution' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-[#050816]/85 backdrop-blur-xl border-b border-white/5 shadow-2xl'
            : 'py-4 sm:py-5 bg-[#050816]/40 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 group min-h-[44px] min-w-[44px]"
            aria-label="DriveWorth Home"
          >
            <div className="relative w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-primary/10 flex items-center justify-center border border-white/10 group-hover:border-brand-primary/40 transition-all duration-300">
              <Activity className="w-4.5 h-4.5 text-brand-primary group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 rounded-xl bg-brand-primary/15 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-white/90 transition-colors duration-300">
              Drive<span className="text-brand-primary">Worth</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 bg-white/[0.02] border border-white/5 px-6 py-2 rounded-full backdrop-blur-md">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative text-xs font-semibold text-secondary-text hover:text-white transition-colors duration-300 group py-1"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-brand-primary group-hover:w-full transition-all duration-300 ease-out" />
              </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => navigate('/predict')}
              className="px-5 py-2.5 min-h-[44px] text-xs font-bold text-white btn-glow-primary rounded-full cursor-pointer flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <span>Predict Resale Price</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle (Accessible 44x44px Touch Target) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/10 text-secondary-text hover:text-white hover:border-white/20 transition-all cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer & Backdrop Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              id="mobile-navigation-drawer"
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed top-[60px] sm:top-[68px] left-0 w-full z-40 bg-[#050816]/98 backdrop-blur-2xl border-b border-white/10 px-5 sm:px-6 py-6 flex flex-col space-y-4 shadow-2xl lg:hidden max-h-[calc(100vh-68px)] overflow-y-auto"
            >
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] flex items-center text-sm sm:text-base font-semibold text-secondary-text hover:text-white transition-colors duration-200 px-2 rounded-lg hover:bg-white/[0.04]"
                >
                  {item.name}
                </a>
              ))}

              <hr className="border-white/10" />

              <div className="flex flex-col space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/predict');
                  }}
                  className="w-full min-h-[48px] py-3 text-center text-xs sm:text-sm font-bold text-white btn-glow-primary rounded-xl cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Predict Resale Price</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
