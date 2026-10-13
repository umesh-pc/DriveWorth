import React from 'react';
import { Zap, ShieldCheck, Cpu, FileText } from 'lucide-react';

export default function Stats() {
  const stats = [
    {
      id: 1,
      icon: <Zap className="w-4.5 h-4.5 text-brand-primary" />,
      title: 'Resale Value Prediction',
      sublabel: 'Estimate used car prices from specifications',
    },
    {
      id: 2,
      icon: <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />,
      title: 'Input Validation Engine',
      sublabel: 'Validates vehicle attribute completeness',
    },
    {
      id: 3,
      icon: <Cpu className="w-4.5 h-4.5 text-brand-accent" />,
      title: 'Data-Driven Valuation',
      sublabel: 'Comprehensive used-car market analytics',
    },
    {
      id: 4,
      icon: <FileText className="w-4.5 h-4.5 text-indigo-400" />,
      title: 'PDF Valuation Reports',
      sublabel: 'Download appraisal reports immediately',
    },
  ];

  return (
    <section id="stats" className="py-6 md:py-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Value metrics ribbon */}
        <div className="glass-panel border border-white/10 bg-[#050816]/60 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 sm:p-5 md:py-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />
          
          {stats.map((stat) => (
            <div 
              key={stat.id} 
              className="flex items-center space-x-3 sm:space-x-4"
            >
              
              {/* Icon Container */}
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                {stat.icon}
              </div>

              {/* Info block */}
              <div className="flex flex-col text-left min-w-0">
                <span className="font-display font-bold text-sm md:text-base text-white leading-tight truncate">
                  {stat.title}
                </span>
                <span className="text-[11px] text-secondary-text font-normal mt-0.5 line-clamp-2">
                  {stat.sublabel}
                </span>
              </div>

            </div>
          ))}

        </div>
        
      </div>
    </section>
  );
}
