import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Search, Cpu, TrendingUp, FileText } from 'lucide-react';

export default function Solution() {
  const steps = [
    {
      id: 1,
      title: 'Enter Vehicle Details',
      desc: 'Select vehicle attributes including brand, model, age, kilometres driven, fuel type, transmission, engine capacity, power, and mileage.',
      icon: <Sliders className="w-5 h-5 text-brand-primary group-hover:rotate-12 transition-transform duration-300" />,
      color: 'from-brand-primary/20 to-brand-primary/5',
      glow: 'shadow-[0_0_20px_rgba(37,99,235,0.2)]',
      time: 'Step 1'
    },
    {
      id: 2,
      title: 'Validate Vehicle Specs',
      desc: 'Vehicle specifications are verified and processed to determine valuation criteria.',
      icon: <Search className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />,
      color: 'from-indigo-500/20 to-indigo-500/5',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.2)]',
      time: 'Step 2'
    },
    {
      id: 3,
      title: 'Valuation Estimation',
      desc: 'Calculates the estimated resale value based on patterns from historical used-car dataset records.',
      icon: <Cpu className="w-5 h-5 text-violet-400 group-hover:pulse transition-transform duration-300" />,
      color: 'from-violet-500/20 to-violet-500/5',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
      time: 'Step 3'
    },
    {
      id: 4,
      title: 'Display Prediction Result',
      desc: 'View the predicted resale value alongside a comprehensive summary of configured vehicle specifications.',
      icon: <TrendingUp className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform duration-300" />,
      color: 'from-brand-accent/20 to-brand-accent/5',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
      time: 'Step 4'
    },
    {
      id: 5,
      title: 'Download PDF Report',
      desc: 'Instantly download an official PDF appraisal document containing vehicle details and predicted resale value.',
      icon: <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />,
      color: 'from-emerald-500/20 to-emerald-500/5',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      time: 'Step 5'
    }
  ];

  return (
    <section id="solution" className="py-20 md:py-28 relative z-10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[350px] bg-gradient-to-r from-brand-primary/10 via-indigo-500/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Asymmetric Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 text-left">
          <div className="space-y-3 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20"
            >
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest font-mono">
                PREDICTION PIPELINE
              </span>
            </motion.div>
            
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-[1.08]">
              How DriveWorth <span className="text-gradient-primary">Works.</span>
            </h2>
          </div>

          <p className="text-secondary-text text-sm max-w-md leading-relaxed font-normal">
            A clear and structured prediction process that transforms vehicle specifications into an accurate resale value estimate.
          </p>
        </div>

        {/* Pipeline container */}
        <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-4 mt-4">
          
          {/* Glowing connector line behind steps */}
          <div className="hidden lg:block absolute top-[32px] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-brand-primary/40 via-indigo-500/40 via-violet-500/40 via-brand-accent/40 to-emerald-500/40 -z-10" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 relative group"
            >
              
              {/* Step indicator circle */}
              <div className="relative flex items-center justify-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${step.color} border border-white/10 flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 ${step.glow}`}>
                  {step.icon}
                </div>
                
                {/* Numeric index overlay */}
                <span className="absolute -top-2.5 -right-2.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#050816] border border-white/15 text-white shadow-md">
                  0{step.id}
                </span>
              </div>

              {/* Text Blocks */}
              <div className="space-y-1.5 px-2 lg:px-0">
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-brand-primary transition-colors duration-300">
                    {step.title}
                  </h4>
                </div>
                <span className="inline-block text-[9px] font-mono text-secondary-text/60 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
                  {step.time}
                </span>
                <p className="text-xs text-secondary-text leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Step Connector Line (Mobile only) */}
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
