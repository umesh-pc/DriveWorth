import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Car, Calendar, Fuel, Settings, Compass, Award, Tag, FileText } from 'lucide-react';
import ThreeCar from './ThreeCar';

export default function Hero() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 16,
      },
    },
  };

  const bullets = [
    'Resale Price Prediction',
    'Data-Driven Valuation',
    'Instant PDF Report Download'
  ];

  return (
    <section id="home" className="relative pt-36 md:pt-44 pb-12 overflow-hidden flex flex-col items-center">
      {/* Ambient spotlight glow behind header */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[80%] h-[450px] bg-gradient-to-b from-brand-primary/12 via-brand-primary/2 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full text-center relative z-10">

        {/* Main Content Group */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center max-w-4xl mx-auto space-y-7"
        >
          {/* Brand Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md hover:border-brand-primary/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase font-mono">
              AUTOMOTIVE APPRAISAL PLATFORM
            </span>
            <span className="w-1 h-1 rounded-full bg-brand-primary/40" />
            <span className="text-[10px] font-bold text-emerald-400 font-mono">
              RESALE VALUATION
            </span>
          </motion.div>

          {/* Core H1 */}
          <motion.h1
            variants={itemVariants}
            className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[0.98] text-white"
          >
            Know Your Car's <br />
            <span className="text-gradient-primary">True Worth.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-secondary-text max-w-2xl leading-relaxed font-normal"
          >
            Estimate a used car's resale value based on its vehicle specifications and historical dataset patterns.
          </motion.p>

          {/* Action Button */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto pt-2"
          >
            <button
              onClick={() => navigate('/predict')}
              className="w-full sm:w-auto px-8 py-4 btn-glow-primary rounded-full cursor-pointer flex items-center justify-center space-x-2.5 text-xs font-bold tracking-wide"
            >
              <span>Predict Resale Price</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Bullet Ticks */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 pt-4 mt-2 border-t border-white/5 w-full max-w-xl"
          >
            {bullets.map((bullet) => (
              <div key={bullet} className="flex items-center space-x-2 text-xs text-secondary-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white/90">{bullet}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Centerpiece 3D Interactive Car Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
          className="w-full relative mt-12 md:mt-16 lg:mt-20 flex flex-col items-center justify-center"
        >
          {/* Radial aura glow directly beneath model */}
          <div className="absolute w-[80%] md:w-[60%] h-[250px] top-[40%] left-1/2 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[100px] -z-10 pointer-events-none" />

          {/* 3D Car Canvas */}
          <div className="w-full max-w-5xl relative">
            <ThreeCar />

            {/* Left HUD Panel - Vehicle Information (Desktop Only) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="absolute left-[-10%] xl:left-[-18%] top-[15%] hidden lg:flex flex-col space-y-4 w-72 text-left z-20 -translate-x-10 transition-all duration-300"
            >
              <div className="glass-panel border border-white/10 bg-[#050816]/80 backdrop-blur-md rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
                
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                  <span className="text-[21px] font-bold text-white font-sans tracking-tight flex items-center gap-2">
                    <Car className="w-5.5 h-5.5 text-brand-primary" />
                    Vehicle Info
                  </span>
                  <span className="text-[10px] font-mono text-brand-primary font-bold bg-brand-primary/10 px-2 py-0.5 rounded-full border border-brand-primary/20">SPEC SHEET</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[13.5px] font-medium text-secondary-text/90 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      Brand
                    </span>
                    <span className="text-[16.5px] font-bold text-white block">Ferrari</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[13.5px] font-medium text-secondary-text/90 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      Model
                    </span>
                    <span className="text-[16.5px] font-bold text-white block">458 Italia</span>
                  </div>
                  <div className="space-y-0.5 border-t border-white/[0.05] pt-3 col-span-2 sm:col-span-1">
                    <span className="text-[13.5px] font-medium text-secondary-text/90 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      Age
                    </span>
                    <span className="text-[16.5px] font-bold text-white block">8 Years</span>
                  </div>
                  <div className="space-y-0.5 border-t border-white/[0.05] pt-3 col-span-2 sm:col-span-1">
                    <span className="text-[13.5px] font-medium text-secondary-text/90 flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      Fuel
                    </span>
                    <span className="text-[16.5px] font-bold text-white block">Petrol</span>
                  </div>
                  <div className="space-y-0.5 border-t border-white/[0.05] pt-3 col-span-2 sm:col-span-1">
                    <span className="text-[13.5px] font-medium text-secondary-text/90 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      Gearbox
                    </span>
                    <span className="text-[16.5px] font-bold text-white block">Automatic</span>
                  </div>
                  <div className="space-y-0.5 border-t border-white/[0.05] pt-3 col-span-2 sm:col-span-1">
                    <span className="text-[13.5px] font-medium text-secondary-text/90 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      Driven
                    </span>
                    <span className="text-[16.5px] font-bold text-white block font-mono">45,000 km</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right HUD Panel - Valuation Summary (Desktop Only) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="absolute right-[-10%] xl:right-[-18%] top-[15%] hidden lg:flex flex-col space-y-4 w-72 text-left z-20 translate-x-8 transition-all duration-300"
            >
              <div className="glass-panel border border-white/10 bg-[#050816]/80 backdrop-blur-md rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />
                
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                  <span className="text-[21px] font-bold text-white font-sans tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" />
                    Valuation
                  </span>
                  <span className="text-[10px] font-mono text-brand-accent font-bold bg-brand-accent/10 px-2 py-0.5 rounded-full border border-brand-accent/20">VALUATION ENGINE</span>
                </div>

                <div className="space-y-4 pt-2 font-sans">
                  
                  {/* Vehicle details */}
                  <div className="flex justify-between items-center">
                    <span className="text-[13.5px] font-medium text-secondary-text/90">Vehicle</span>
                    <span className="text-[16.5px] font-bold text-white font-sans">Ferrari 458</span>
                  </div>

                  {/* Estimated Value Block */}
                  <div className="flex flex-col space-y-1 border-t border-white/[0.05] pt-3">
                    <span className="text-[13.5px] font-medium text-secondary-text/90">Predicted Resale Value</span>
                    <span className="text-[44px] font-bold text-brand-primary leading-none tracking-tight">
                      ₹2,15,00,000
                    </span>
                  </div>

                  {/* Report Download Badge */}
                  <div className="flex justify-between items-center bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-3">
                    <span className="text-[13.5px] font-medium text-secondary-text/90">Appraisal PDF</span>
                    <span className="text-brand-primary font-bold text-[13px] flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Ready to Export</span>
                    </span>
                  </div>

                </div>

                <div className="flex items-center space-x-1.5 pt-3.5 text-[11px] text-secondary-text/80 font-mono border-t border-white/10 mt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">Valuation Engine Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
