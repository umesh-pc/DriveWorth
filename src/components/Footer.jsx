import React from 'react';
import { Activity, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Overview', href: '#home' },
    { name: 'How It Works', href: '#solution' },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: <Github className="w-4 h-4" />, href: 'https://github.com' },
    { name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, href: 'https://linkedin.com' },
  ];

  return (
    <footer className="relative z-10 bg-[#03050d] pt-12 pb-8 border-t border-white/10 overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[150px] bg-gradient-to-t from-brand-primary/5 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Main Footer Layout */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-8">
          
          {/* Left Column: Brand Logo, Description, Social Icons */}
          <div className="space-y-3.5 max-w-md text-left">
            <a href="#home" className="flex items-center space-x-2.5 group w-fit">
              <div className="w-8.5 h-8.5 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/30 group-hover:border-brand-primary/60 transition-all">
                <Activity className="w-4.5 h-4.5 text-brand-primary" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Drive<span className="text-brand-primary">Worth</span>
              </span>
            </a>
            
            <p className="text-secondary-text text-xs leading-relaxed font-normal">
              DriveWorth is a used car resale value estimation platform that estimates price from vehicle attributes and historical dataset patterns.
            </p>

            <div className="flex items-center space-x-2.5 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-secondary-text hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Navigation Links */}
          <div className="flex flex-col space-y-3 text-left md:text-right">
            <h4 className="text-white font-display font-semibold text-xs tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-secondary-text hover:text-white transition-colors duration-200 text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Thin Divider & Subtle Copyright */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs text-secondary-text/60 font-sans">
          <p>© 2026 DriveWorth. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
