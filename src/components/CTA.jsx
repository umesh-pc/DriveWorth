import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section id="cta" className="py-14 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        
        {/* Glow underlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[120%] bg-radial-gradient from-brand-primary/15 via-brand-accent/5 to-transparent rounded-full blur-[80px] -z-10" />

        {/* CTA Glass Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="glass-panel-heavy rounded-3xl border border-white/10 p-8 sm:p-12 lg:p-14 text-center max-w-5xl mx-auto relative overflow-hidden"
        >
          {/* Subtle top border reflection */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Sparkles icon */}
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-brand-accent animate-pulse" />
          </div>

          {/* Heading */}
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to Know Your <span className="text-gradient-accent">Car's Worth?</span>
          </h2>

          {/* Description */}
          <p className="text-secondary-text text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Start predicting resale values and make smarter buying or selling decisions.
          </p>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <a 
              href="#live-demo"
              className="px-8 py-4 btn-glow-primary rounded-full cursor-pointer flex items-center space-x-2 text-base font-semibold"
            >
              <span>Start Prediction</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Subtext */}
          <p className="text-xs text-secondary-text/60 mt-4 font-mono">
            No credit card required. Instantly exportable PDF reports included.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
