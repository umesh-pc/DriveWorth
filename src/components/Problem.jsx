import React from 'react';
import { motion } from 'framer-motion';
import GlowCard from './GlowCard';

export default function Problem() {
  const cards = [
    {
      id: 1,
      title: 'Overpriced Listings',
      desc: 'Many buyers pay more than a vehicle is actually worth due to inflated dealer markups and market speculation.',
      glow: 'rgba(239, 68, 68, 0.08)', // Soft red glow
      illustration: (
        <svg viewBox="0 0 200 100" className="w-full h-24 text-rose-500 overflow-visible mt-4">
          {/* Base Beam */}
          <line x1="20" y1="80" x2="180" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          {/* Fulcrum */}
          <polygon points="100,80 90,95 110,95" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          
          {/* Tilted Scale Line */}
          <motion.g
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '100px', originY: '60px' }}
          >
            {/* Balance Bar */}
            <line x1="40" y1="60" x2="160" y2="60" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="100" cy="60" r="4" fill="currentColor" />
            
            {/* Left Hanging Plate (Higher - Less Weight/Value) */}
            <line x1="40" y1="60" x2="40" y2="78" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <path d="M25 78 L55 78 L48 83 L32 83 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" />
            {/* MSRP Label */}
            <text x="40" y="52" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" textAnchor="middle">VALUE</text>

            {/* Right Hanging Plate (Lower - Heavy Overpriced) */}
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
      glow: 'rgba(249, 115, 22, 0.08)', // Soft orange glow
      illustration: (
        <svg viewBox="0 0 200 100" className="w-full h-24 text-brand-accent overflow-visible mt-4">
          {/* Wallet Container */}
          <rect x="65" y="35" width="70" height="45" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <path d="M125 45 L135 45 C138 45, 140 47, 140 50 L140 65 C140 68, 138 70, 135 70 L125 70 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" />
          <circle cx="132" cy="57" r="2.5" fill="rgba(255,255,255,0.3)" />

          {/* Falling Coins/Notes (Leakage) */}
          <g>
            {/* Note slipping out */}
            <motion.path
              d="M75 42 L115 25"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 2"
              fill="none"
              animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Falling coin 1 */}
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
            {/* Falling coin 2 */}
            <motion.circle 
              cx="115" 
              cy="65" 
              r="3.5" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="1.2"
              animate={{ y: [0, 22, 0], opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1.2 }}
            />
            {/* Downward indicator */}
            <path d="M100 50 L100 70 M95 65 L100 70 L105 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
          </g>
        </svg>
      )
    },
    {
      id: 3,
      title: 'Time-Consuming Research',
      desc: 'Checking multiple websites, comparing inconsistent listings, and calculating averages manually takes hours.',
      glow: 'rgba(59, 130, 246, 0.08)', // Soft blue glow
      illustration: (
        <svg viewBox="0 0 200 100" className="w-full h-24 text-brand-primary overflow-visible mt-4">
          {/* Mini cards floating */}
          <rect x="25" y="25" width="45" height="25" rx="4" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.06)" />
          <line x1="30" y1="32" x2="45" y2="32" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="30" y1="38" x2="55" y2="38" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="30" y1="42" x2="50" y2="42" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          <rect x="130" y="50" width="45" height="25" rx="4" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.06)" />
          <line x1="135" y1="57" x2="150" y2="57" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="135" y1="63" x2="160" y2="63" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Centered Hourglass */}
          <g>
            {/* Upper half */}
            <path d="M85 30 L115 30 L100 50 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            {/* Lower half */}
            <path d="M85 70 L115 70 L100 50 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            
            {/* Spinning/pulsing sand dots */}
            <motion.circle 
              cx="100" 
              cy="48" 
              r="2" 
              fill="currentColor"
              animate={{ y: [0, 10], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.circle 
              cx="100" 
              cy="62" 
              r="3.5" 
              fill="currentColor"
              animate={{ scale: [0.7, 1.2, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            {/* Hourglass frames */}
            <line x1="80" y1="28" x2="120" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="72" x2="120" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        </svg>
      )
    }
  ];

  return (
    <section id="problem" className="py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Decorative Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3.5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25"
          >
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              THE USED CAR DILEMMA
            </span>
          </motion.div>
          
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Buying or Selling a Used Car Shouldn't Be Guesswork
          </h2>
          
          <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto">
            Traditional pricing methods leave both buyers and sellers vulnerable to financial loss. DriveWorth fixes the imbalance.
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <GlowCard
              key={card.id}
              glowColor={card.glow}
              className="min-h-[280px]"
            >
              <div className="flex flex-col justify-between h-full space-y-4 text-left">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-white">
                    {card.title}
                  </h3>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                {/* SVG Illustration */}
                <div className="w-full flex items-center justify-center p-2 rounded-xl bg-white/[0.01] border border-white/[0.02]">
                  {card.illustration}
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* Decorative Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent mt-12" />
      </div>
    </section>
  );
}
