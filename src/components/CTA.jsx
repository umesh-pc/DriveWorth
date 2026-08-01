import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section id="cta" className="py-20 md:py-32 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        
        {/* Deep ambient glow underlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[140%] bg-gradient-to-r from-brand-primary/15 via-brand-accent/8 to-transparent rounded-full blur-[100px] -z-10" />

        {/* CTA Glass Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="glass-panel-heavy rounded-3xl border border-white/10 p-10 sm:p-14 lg:p-16 text-center max-w-5xl mx-auto relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
        >
          {/* Subtle top border reflection */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Sparkles icon container */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            <Sparkles className="w-6 h-6 text-brand-accent animate-pulse" />
          </div>

          {/* Heading */}
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight max-w-3xl mx-auto leading-[1.05]">
            Ready to Know Your <span className="text-gradient-accent">Car's True Worth?</span>
          </h2>

          {/* Description */}
          <p className="text-secondary-text text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed font-normal">
            Start predicting resale values and make smarter buying or selling decisions. Empower your automotive appraisal today.
          </p>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <a 
              href="#live-demo"
              className="px-9 py-4.5 btn-glow-primary rounded-full cursor-pointer flex items-center space-x-2.5 text-sm font-bold tracking-wide transition-all"
            >
              <span>Start Free Prediction</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </a>
          </div>

          {/* Subtext telemetry */}
          <p className="text-[11px] text-secondary-text/60 mt-5 font-mono">
            No registration fee. PDF Appraisal Certificate generation included.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
