import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Search, Cpu, ArrowUpRight, CheckCircle } from 'lucide-react';

export default function Solution() {
  const steps = [
    {
      id: 1,
      title: 'Enter Vehicle Details',
      desc: 'Provide basic parameters like brand, model year, odometer reading, and region.',
      icon: <Sliders className="w-5 h-5 text-brand-primary" />,
      color: 'from-brand-primary/20 to-brand-primary/5',
      glow: 'shadow-[0_0_15px_rgba(37,99,235,0.15)]'
    },
    {
      id: 2,
      title: 'Analyze Information',
      desc: 'Our engine compiles transactions, listings, and localized market indicators.',
      icon: <Search className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-500/5',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]'
    },
    {
      id: 3,
      title: 'Estimate Market Value',
      desc: 'Establish true valuation curves based on supply patterns and condition tiers.',
      icon: <Cpu className="w-5 h-5 text-violet-400" />,
      color: 'from-violet-500/20 to-violet-500/5',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]'
    },
    {
      id: 4,
      title: 'Compare Prices',
      desc: 'Calculate variations between seller ask prices and fair market estimates.',
      icon: <ArrowUpRight className="w-5 h-5 text-brand-accent" />,
      color: 'from-brand-accent/20 to-brand-accent/5',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]'
    },
    {
      id: 5,
      title: 'Receive Instant Result',
      desc: 'Export a digital appraisal report highlighting deal ratings and saving profiles.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-500/5',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    }
  ];

  return (
    <section id="solution" className="py-14 relative z-10 overflow-hidden">
      {/* Background aurora flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[300px] bg-gradient-to-r from-indigo-500/5 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20"
          >
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
              VALUATION PIPELINE
            </span>
          </motion.div>
          
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            How DriveWorth Works
          </h2>
          
          <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto">
            A comprehensive, transparent appraisal process that handles heavy market computing behind the scenes to deliver instant values.
          </p>
        </div>

        {/* Pipeline container (Horizontal steps on large screen, Vertical on mobile) */}
        <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-4 mt-8">
          
          {/* Connector line behind steps (Desktop only) */}
          <div className="hidden lg:block absolute top-[28px] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-brand-primary/30 via-indigo-500/30 via-violet-500/30 via-brand-accent/30 to-emerald-500/30 -z-10" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 relative group"
            >
              
              {/* Step indicator circle */}
              <div className="relative flex items-center justify-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} border border-white/10 flex items-center justify-center z-10 transition-transform duration-300 group-hover:scale-110 group-hover:border-white/20 ${step.glow}`}>
                  {step.icon}
                </div>
                
                {/* Numeric index overlay */}
                <span className="absolute -top-2 -right-2 text-[10px] font-mono font-bold w-5 h-5 rounded-full bg-[#050816] border border-white/10 flex items-center justify-center text-white">
                  0{step.id}
                </span>
              </div>

              {/* Text Blocks */}
              <div className="space-y-1 px-4 lg:px-0">
                <h4 className="font-display font-bold text-sm text-white group-hover:text-brand-primary transition-colors duration-300">
                  {step.title}
                </h4>
                <p className="text-xs text-secondary-text leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Step Connector Arrow (Mobile only) */}
              {index < steps.length - 1 && (
                <div className="lg:hidden w-[2px] h-8 bg-gradient-to-b from-white/10 to-white/2 my-2 shrink-0 self-center" />
              )}
            </motion.div>
          ))}
          
        </div>
      </div>
    </section>
  );
}
