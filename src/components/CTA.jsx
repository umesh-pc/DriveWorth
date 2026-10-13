import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-16 sm:py-20 md:py-32 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative">
        
        {/* Deep ambient glow underlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[140%] bg-gradient-to-r from-brand-primary/15 via-brand-accent/8 to-transparent rounded-full blur-[100px] -z-10" />

        {/* CTA Glass Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="glass-panel-heavy rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-10 md:p-14 lg:p-16 text-center max-w-5xl mx-auto relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
        >
          {/* Subtle top border reflection */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Sparkles icon container */}
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 sm:mb-6 shadow-inner">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand-accent animate-pulse" />
          </div>

          {/* Heading */}
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight max-w-3xl mx-auto leading-[1.12] sm:leading-[1.05]">
            Ready to Know Your <span className="text-gradient-accent">Car's True Worth?</span>
          </h2>

          {/* Description */}
          <p className="text-secondary-text text-xs sm:text-base mt-3 sm:mt-4 max-w-xl mx-auto leading-relaxed font-normal">
            Estimate used car resale values based on vehicle specifications and historical dataset patterns.
          </p>

          {/* Action Button */}
          <div className="mt-6 sm:mt-8 flex justify-center">
            <button 
              type="button"
              onClick={() => navigate('/predict')}
              className="w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4.5 min-h-[48px] btn-glow-primary rounded-full cursor-pointer flex items-center justify-center space-x-2.5 text-xs sm:text-sm font-bold tracking-wide transition-all active:scale-95"
            >
              <span>Predict Resale Price</span>
              <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>

          {/* Subtext telemetry */}
          <p className="text-[10px] sm:text-[11px] text-secondary-text/60 mt-4 sm:mt-5 font-mono px-2">
            Direct used-car resale price prediction. PDF appraisal report included.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
