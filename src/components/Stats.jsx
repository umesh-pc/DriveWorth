import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Database, BrainCircuit, ShieldCheck, Cpu } from 'lucide-react';

function AnimatedCounter({ value, duration = 1.5, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) {
      setCount(value);
      return;
    }

    const totalMs = duration * 1000;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalMs, 1);
      
      // Smooth easeOutQuad
      const easeProgress = progress * (2 - progress);

      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, value, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export default function Stats() {
  const stats = [
    {
      id: 1,
      icon: <Database className="w-4 h-4 text-brand-primary" />,
      number: '12500',
      suffix: '+',
      label: 'Appraisals Generated',
    },
    {
      id: 2,
      icon: <Cpu className="w-4 h-4 text-indigo-400" />,
      number: '3',
      suffix: '',
      label: 'Core Ensemble Models',
    },
    {
      id: 3,
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      number: '95',
      suffix: '.8%',
      label: 'Valuation Precision',
    },
    {
      id: 4,
      icon: <BrainCircuit className="w-4 h-4 text-brand-accent" />,
      number: '12',
      suffix: 'ms',
      label: 'Inference Speed',
    },
  ];

  return (
    <section id="stats" className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Sleek dashboard statistics ribbon */}
        <div className="glass-panel border border-white/5 bg-[#050816]/40 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:py-8 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 relative overflow-hidden">
          
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
          
          {stats.map((stat, index) => (
            <React.Fragment key={stat.id}>
              {/* Stat Node */}
              <div className="flex items-center space-x-4 md:flex-1 md:justify-center">
                
                {/* Micro Icon Container */}
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  {stat.icon}
                </div>

                {/* Info block */}
                <div className="flex flex-col text-left">
                  <span className="text-white font-display font-extrabold text-xl md:text-2xl leading-none">
                    <AnimatedCounter value={stat.number} suffix={stat.suffix} />
                  </span>
                  <span className="text-[10px] md:text-xs font-semibold text-secondary-text tracking-tight mt-1">
                    {stat.label}
                  </span>
                </div>

              </div>

              {/* Vertical divider on desktop, horizontal on mobile */}
              {index < stats.length - 1 && (
                <>
                  <div className="hidden md:block w-[1px] h-8 bg-gradient-to-b from-white/5 via-white/15 to-white/5 shrink-0" />
                  <div className="md:hidden w-full h-[1px] bg-gradient-to-r from-white/2 via-white/10 to-white/2" />
                </>
              )}
            </React.Fragment>
          ))}

        </div>
        
      </div>
    </section>
  );
}
