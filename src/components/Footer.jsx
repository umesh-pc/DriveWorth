import React from 'react';
import { Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Predict', href: '#live-demo' },
    { name: 'Compare Cars', href: '#why-choose' },
    { name: 'Dashboard', href: '#why-choose' },
  ];

  const coreBenefits = [
    'Accurate Resale Value Prediction',
    'Compare Multiple Vehicles',
    'Secure Prediction History',
    'Download Prediction Reports'
  ];

  return (
    <footer className="relative z-10 bg-[#050816] pt-16 pb-10 border-t border-white/5 overflow-hidden">
      {/* Subtle blue gradient glow behind the footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[160px] bg-gradient-to-t from-brand-primary/10 via-brand-primary/2 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 pb-12">
          
          {/* LEFT COLUMN: Logo, Description, Button */}
          <div className="md:col-span-5 flex flex-col space-y-5 text-left">
            <a href="#home" className="flex items-center space-x-2.5">
              <div className="w-8.5 h-8.5 rounded-lg bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                <Activity className="w-4.5 h-4.5 text-brand-primary" />
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-white">
                Drive<span className="text-brand-primary">Worth</span>
              </span>
            </a>
            <p className="text-secondary-text text-xs leading-relaxed max-w-sm font-medium">
              Helping buyers and sellers make informed decisions with accurate used car resale value predictions through an intelligent cloud-based web application.
            </p>
            <div className="pt-2">
              <a 
                href="#live-demo"
                className="w-fit inline-flex items-center space-x-2 px-5 py-2.5 btn-glow-primary rounded-full cursor-pointer text-xs font-bold text-white transition-all duration-300"
              >
                <span>Start Prediction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* MIDDLE COLUMN: Quick Links */}
          <div className="md:col-span-3 flex flex-col space-y-4 text-left">
            <h4 className="text-white font-display font-semibold text-xs tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="flex flex-col space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="relative text-secondary-text hover:text-white transition-colors duration-200 text-xs py-1 group font-medium flex items-center w-fit"
                  >
                    <span>{link.name}</span>
                    {/* Blue glowing underline on hover */}
                    <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT COLUMN: Why DriveWorth? Checklist */}
          <div className="md:col-span-4 flex flex-col space-y-4 text-left">
            <h4 className="text-white font-display font-semibold text-xs tracking-wider uppercase">
              Why DriveWorth?
            </h4>
            <ul className="flex flex-col space-y-3">
              {coreBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-secondary-text">
                  {/* Animated check circle */}
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 transition-transform duration-300 hover:scale-110" />
                  <span className="font-medium text-white/95">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR: Divider & Centered Copyright */}
        <div className="pt-6 border-t border-white/5 text-center text-[10px] text-secondary-text/60 font-mono">
          <p>© 2026 DriveWorth | MCA Mini Project</p>
        </div>
      </div>
    </footer>
  );
}
