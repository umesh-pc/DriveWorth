import React from 'react';
import { motion } from 'framer-motion';
import GlowCard from './GlowCard';

export default function Problem() {
  const cards = [
    {
      id: 1,
      title: 'Overpriced Listings',
      desc: 'Many buyers pay more than a vehicle is actually worth due to inflated dealer markups and market speculation.',
      glow: 'rgba(239, 68, 68, 0.08)',
      variant: 'secondary',
      tag: 'Buyer Friction',
      illustration: (
        <svg viewBox="0 0 200 100" className="w-full h-20 text-rose-500 overflow-visible mt-2">
          <line x1="20" y1="80" x2="180" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <polygon points="100,80 90,95 110,95" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <motion.g
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '100px', originY: '60px' }}
          >
            <line x1="40" y1="60" x2="160" y2="60" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="100" cy="60" r="4" fill="currentColor" />
            <line x1="40" y1="60" x2="40" y2="78" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <path d="M25 78 L55 78 L48 83 L32 83 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" />
            <text x="40" y="52" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" textAnchor="middle">VALUE</text>
            <line x1="160" y1="60" x2="160" y2="85" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <path d="M145 85 L175 85 L168 90 L152 90 Z" fill="rgba(239, 68, 68, 0.1)" stroke="currentColor" />
            <text x="160" y="52" fill="currentColor" fontSize="8" fontFamily="monospace" textAnchor="middle" className="font-bold">PRICE</text>
          </motion.g>
        </svg>
      )
    },
    {
      id: 2,
      title: 'Undervalued Cars',
      desc: 'Sellers often lose hundreds of thousands by setting prices too low, unaware of localized demand spikes.',
      glow: 'rgba(249, 115, 22, 0.08)',
      variant: 'minimal',
      tag: 'Seller Loss',
      illustration: (
        <svg viewBox="0 0 200 100" className="w-full h-20 text-brand-accent overflow-visible mt-2">
          <rect x="65" y="35" width="70" height="45" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <path d="M125 45 L135 45 C138 45, 140 47, 140 50 L140 65 C140 68, 138 70, 135 70 L125 70 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" />
          <circle cx="132" cy="57" r="2.5" fill="rgba(255,255,255,0.3)" />
          <g>
            <motion.path
              d="M75 42 L115 25"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 2"
              fill="none"
              animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle 
              cx="80" 
              cy="70" 
              r="4.5" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="1.5"
              animate={{ y: [0, 18, 0], opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            <path d="M100 50 L100 70 M95 65 L100 70 L105 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
          </g>
        </svg>
      )
    },
    {
      id: 3,
      title: 'Time-Consuming Research',
      desc: 'Checking multiple websites, comparing inconsistent listings, and calculating averages manually takes hours.',
      glow: 'rgba(59, 130, 246, 0.08)',
      variant: 'secondary',
      tag: 'Efficiency Drain',
      illustration: (
        <svg viewBox="0 0 200 100" className="w-full h-20 text-brand-primary overflow-visible mt-2">
          <rect x="25" y="25" width="45" height="25" rx="4" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.06)" />
          <line x1="30" y1="32" x2="45" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <rect x="130" y="50" width="45" height="25" rx="4" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.06)" />
          <g>
            <path d="M85 30 L115 30 L100 50 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <path d="M85 70 L115 70 L100 50 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <motion.circle 
              cx="100" 
              cy="48" 
              r="2" 
              fill="currentColor"
              animate={{ y: [0, 10], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <line x1="80" y1="28" x2="120" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="72" x2="120" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      )
    }
  ];

  return (
    <section id="problem" className="py-20 md:py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Asymmetric 2-Column Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Editorial Statement (Container-less text block) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 text-left space-y-6 lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">
                THE USED CAR DILEMMA
              </span>
            </div>

            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-[1.08]">
              Buying or Selling a Used Car Shouldn't Be <span className="text-gradient-accent">Guesswork.</span>
            </h2>

            <p className="text-secondary-text text-sm sm:text-base leading-relaxed font-normal">
              Traditional pricing methods leave both buyers and sellers vulnerable to financial loss. Arbitrary dealer markups and inconsistent online listings create an opaque market.
            </p>

            {/* Stat Callout Quote (Containerless minimal block) */}
            <div className="pt-4 border-l-2 border-rose-500/40 pl-5 space-y-1">
              <span className="text-2xl font-extrabold text-white font-display">68%</span>
              <p className="text-xs text-secondary-text leading-normal">
                of pre-owned car buyers unknowingly overpay due to unstandardized regional pricing models.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Staggered Problem Cards */}
          <div className="lg:col-span-7 space-y-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={index === 1 ? 'lg:translate-x-4' : ''}
              >
                <GlowCard
                  glowColor={card.glow}
                  variant={card.variant}
                  className={card.variant === 'minimal' ? 'p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10' : ''}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-left">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider">{card.tag}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg text-white">
                        {card.title}
                      </h3>
                      <p className="text-xs text-secondary-text leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    {/* SVG Illustration */}
                    <div className="w-full sm:w-44 shrink-0 flex items-center justify-center p-2 rounded-xl bg-white/[0.01]">
                      {card.illustration}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
