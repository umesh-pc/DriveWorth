import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  GitCompare, 
  History, 
  LayoutDashboard, 
  FileText, 
  CheckSquare 
} from 'lucide-react';
import GlowCard from './GlowCard';

export default function Features() {
  const cards = [
    {
      id: 1,
      title: 'Accurate Valuation',
      desc: 'Estimate the resale value of your vehicle based on its specifications and market trends.',
      colSpan: 'md:col-span-2',
      glow: 'rgba(37, 99, 235, 0.12)',
      variant: 'primary',
      badge: 'Primary Feature',
      icon: <ShieldCheck className="w-5 h-5 text-brand-primary" />,
      mockup: (
        <div className="mt-5 border border-white/10 bg-[#050816]/70 rounded-xl p-4.5 space-y-3 font-mono text-[10px] text-left">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/10 text-[9px] text-secondary-text font-bold uppercase">
            <span>Valuation Checklist</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Appraisal Verified
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-white">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span>Odometer Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span>Year Checked</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span>Fuel & Transmission</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span>Location Factors Checked</span>
            </div>
          </div>
          <div className="pt-1.5">
            <div className="w-full py-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-center font-bold text-white text-[9px] uppercase tracking-wider">
              Ready for Appraisal Estimate
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Compare Vehicles',
      desc: 'Compare two cars side by side to understand their estimated resale values and choose the better option.',
      colSpan: 'md:col-span-1',
      glow: 'rgba(249, 115, 22, 0.08)',
      variant: 'secondary',
      badge: 'Comparison',
      icon: <GitCompare className="w-4.5 h-4.5 text-brand-accent" />,
      mockup: (
        <div className="mt-4 border border-white/5 bg-[#050816]/60 rounded-xl p-3.5 space-y-2 font-mono text-[9px] text-left">
          <div className="grid grid-cols-3 text-secondary-text pb-1.5 border-b border-white/5 uppercase font-bold text-[8px]">
            <span>Spec</span>
            <span>Car A</span>
            <span>Car B</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/[0.02]">
            <span className="text-secondary-text">Year</span>
            <span className="text-white">2021</span>
            <span className="text-white">2021</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-white/[0.02]">
            <span className="text-secondary-text">Rating</span>
            <span className="text-emerald-400">Excellent</span>
            <span className="text-cyan-400">Good</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-secondary-text">Valuation</span>
            <span className="text-white font-bold">₹12.4 Lakhs</span>
            <span className="text-white font-bold">₹10.8 Lakhs</span>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Prediction History',
      desc: 'Securely save and revisit your previous vehicle valuations anytime.',
      colSpan: 'md:col-span-1',
      glow: 'rgba(16, 185, 129, 0.08)',
      variant: 'secondary',
      badge: 'Persistence',
      icon: <History className="w-4.5 h-4.5 text-emerald-400" />,
      mockup: (
        <div className="mt-4 space-y-2 text-[9px] font-mono text-left">
          {[
            { name: 'Hyundai Creta', date: '2 hours ago', val: '₹6.95L' },
            { name: 'Toyota Fortuner', date: 'Yesterday', val: '₹31.5L' }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex flex-col">
                <span className="text-white font-bold">{item.name}</span>
                <span className="text-[7px] text-secondary-text/80">{item.date}</span>
              </div>
              <span className="text-emerald-400 font-bold">{item.val}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 4,
      title: 'Analytics Dashboard',
      desc: 'View your saved predictions and monitor your valuation activity.',
      colSpan: 'md:col-span-1',
      glow: 'transparent',
      variant: 'minimal',
      badge: 'Dashboard',
      icon: <LayoutDashboard className="w-4.5 h-4.5 text-violet-400" />,
      mockup: (
        <div className="mt-4 grid grid-cols-2 gap-2 text-left font-mono text-[9px]">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-secondary-text">Total Valued</span>
            <span className="text-sm font-bold text-white mt-1">12</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex flex-col justify-between">
            <span className="text-secondary-text">Watchlists</span>
            <span className="text-sm font-bold text-white mt-1">4</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex flex-col justify-between col-span-2">
            <span className="text-secondary-text">Recent Appraisals Trend</span>
            <span className="text-emerald-400 font-semibold mt-1">Steady Activity</span>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Download Reports',
      desc: 'Generate professional PDF reports containing your prediction results.',
      colSpan: 'md:col-span-1',
      glow: 'transparent',
      variant: 'minimal',
      badge: 'Exports',
      icon: <FileText className="w-4.5 h-4.5 text-indigo-400" />,
      mockup: (
        <div className="mt-4 border border-white/5 bg-[#050816]/40 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden select-none text-left">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500" />
          <div className="space-y-1 text-[7px] font-mono text-secondary-text">
            <div className="flex justify-between items-center pb-1 border-b border-white/5">
              <span className="text-[8px] font-bold text-white">DRIVEWORTH CERTIFICATE</span>
            </div>
            <div className="flex justify-between">
              <span>Model ID:</span>
              <span className="text-white font-semibold">Creta 2020</span>
            </div>
            <div className="flex justify-between">
              <span>Appraisal:</span>
              <span className="text-white font-semibold">₹6,95,000 INR</span>
            </div>
          </div>
          <div className="mt-2.5 w-full py-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-center font-bold text-white text-[8px]">
            Export PDF Appraisal
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="why-choose" className="py-20 md:py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20"
          >
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              BENEFITS & CAPABILITIES
            </span>
          </motion.div>
          
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-[1.08]">
            Why Choose <span className="text-gradient-primary">DriveWorth?</span>
          </h2>
          
          <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto">
            DriveWorth helps buyers and sellers make informed decisions with fast, transparent, and reliable used car valuations.
          </p>
        </div>

        {/* Bento Grid with Tier Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={card.colSpan}
            >
              <GlowCard
                variant={card.variant}
                glowColor={card.glow}
                className={`h-full min-h-[240px] ${
                  card.variant === 'minimal' 
                    ? 'p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10' 
                    : ''
                }`}
              >
                <div className="flex flex-col justify-between h-full space-y-4 text-left">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8.5 h-8.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                          {card.icon}
                        </div>
                        <h3 className="font-display font-bold text-base text-white">
                          {card.title}
                        </h3>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.02]">
                        {card.badge}
                      </span>
                    </div>
                    
                    {/* Desc */}
                    <p className="text-xs text-secondary-text leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* UI Mockup */}
                  {card.mockup}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
