import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, Sparkles, AlertCircle, ArrowRight, PlayCircle } from 'lucide-react';
import GlowCard from './GlowCard';

export default function LiveDemo() {
  const [mode, setMode] = useState('buyer'); // 'buyer' or 'seller'
  const [sellerPrice, setSellerPrice] = useState(22000000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [progressText, setProgressText] = useState('Initializing Appraisal...');
  const [priceCount, setPriceCount] = useState(0);

  const predictedValue = 21500000;
  
  // Custom count up animation for predicted value
  useEffect(() => {
    if (!showResult) return;
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();
    
    const update = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOut
      setPriceCount(Math.floor(easeProgress * predictedValue));
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }, [showResult]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setShowResult(false);
    
    const phases = [
      { text: 'Simulating mock database queries...', delay: 0 },
      { text: 'Evaluating sample pricing deviations...', delay: 500 },
      { text: 'Calibrating odometer benchmarks...', delay: 1000 }
    ];

    phases.forEach((p) => {
      setTimeout(() => {
        setProgressText(p.text);
      }, p.delay);
    });

    setTimeout(() => {
      setIsCalculating(false);
      setShowResult(true);
    }, 1600);
  };

  // Smart Deal Logic calculations
  const diff = sellerPrice - predictedValue;
  const percentDiff = (diff / predictedValue) * 100;
  
  let status = '';
  let statusBadgeColor = ''; // border + text
  let statusIndicator = ''; // 🟢 / 🟡 / 🔴
  let recommendation = '';

  const formattedDiff = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(diff));

  if (mode === 'buyer') {
    if (sellerPrice < predictedValue) {
      status = 'Good Deal';
      statusBadgeColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      statusIndicator = '🟢';
      recommendation = `The seller is asking ${formattedDiff} below the estimated market value. This represents an excellent opportunity for purchasing.`;
    } else if (Math.abs(percentDiff) <= 3) {
      status = 'Fair Deal';
      statusBadgeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      statusIndicator = '🟡';
      recommendation = `The seller is asking ${formattedDiff} above the estimated market value. Consider negotiating before purchasing.`;
    } else {
      status = 'Overpriced';
      statusBadgeColor = 'text-rose-400 border-rose-500/25 bg-rose-500/5';
      statusIndicator = '🔴';
      recommendation = `The seller is asking ${formattedDiff} above the estimated market value. Consider negotiating before purchasing.`;
    }
  } else {
    // Seller Mode
    if (sellerPrice > predictedValue * 1.03) {
      status = 'Good Selling Price';
      statusBadgeColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      statusIndicator = '🟢';
      recommendation = `Your asking price is ${formattedDiff} above the estimated market value. Buyers may negotiate, but this is a reasonable asking price.`;
    } else if (Math.abs(percentDiff) <= 3) {
      status = 'Competitive Price';
      statusBadgeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      statusIndicator = '🟡';
      recommendation = `Your asking price is close to the estimated market value. This is a competitive market price that should attract buyers.`;
    } else {
      status = 'Consider Increasing Price';
      statusBadgeColor = 'text-rose-400 border-rose-500/25 bg-rose-500/5';
      statusIndicator = '🔴';
      recommendation = `Your asking price is significantly below the estimated market value. Consider increasing it to avoid losing money.`;
    }
  }

  return (
    <section id="live-demo" className="py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20"
          >
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
              INTERACTIVE DEMO
            </span>
          </motion.div>
          
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            See the Prediction in Action
          </h2>
          
          <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto">
            Test a sample evaluation template for a pre-owned vehicle to see how DriveWorth calculates and cross-examines pricing deviations.
          </p>
        </div>

        {/* Layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Left Card: Vehicle Input Form */}
          <div className="lg:col-span-6">
            <GlowCard className="h-full" glowColor="rgba(37, 99, 235, 0.08)">
              <div className="flex flex-col justify-between h-full space-y-6 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4.5 h-4.5 text-brand-primary" />
                    <h3 className="font-display font-bold text-base text-white">Vehicle Specifications</h3>
                  </div>
                  <p className="text-xs text-secondary-text">
                    Review specifications for a pre-owned vehicle to benchmark market value.
                  </p>
                </div>

                {/* Form fields grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-secondary-text/80 uppercase">Brand / Model</label>
                    <div className="py-2 px-3 bg-white/2.5 border border-white/5 rounded-lg text-xs font-semibold text-white">
                      Ferrari 458 Italia
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-secondary-text/80 uppercase">Model Year</label>
                    <div className="py-2 px-3 bg-white/2.5 border border-white/5 rounded-lg text-xs font-semibold text-white">
                      2018
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-secondary-text/80 uppercase">Fuel Type</label>
                    <div className="py-2 px-3 bg-white/2.5 border border-white/5 rounded-lg text-xs font-semibold text-white">
                      Petrol
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-secondary-text/80 uppercase">Transmission</label>
                    <div className="py-2 px-3 bg-white/2.5 border border-white/5 rounded-lg text-xs font-semibold text-white">
                      Automatic
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-mono font-bold text-secondary-text/80 uppercase">Distance Driven (KM)</label>
                    <div className="py-2 px-3 bg-white/2.5 border border-white/5 rounded-lg text-xs font-semibold text-white font-mono">
                      45,000 km
                    </div>
                  </div>
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-mono font-bold text-secondary-text/80 uppercase block h-3.5 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={mode}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="block"
                        >
                          {mode === 'buyer' ? 'Seller Asking Price' : 'Your Asking Price'}
                        </motion.span>
                      </AnimatePresence>
                    </label>
                    <input 
                      type="number" 
                      value={sellerPrice}
                      onChange={(e) => setSellerPrice(parseInt(e.target.value) || 0)}
                      className="w-full py-2 px-3 bg-white/2.5 border border-white/10 rounded-lg text-xs font-semibold text-brand-primary font-mono focus:outline-none focus:border-brand-primary/50"
                    />
                  </div>
                </div>

                {/* Calculate Trigger Button */}
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full py-3.5 btn-glow-primary rounded-xl text-xs font-bold text-white flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing specs data...</span>
                    </>
                  ) : (
                    <>
                      <span>Predict Resale Value</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </GlowCard>
          </div>

          {/* Right Card: Output Screen */}
          <div className="lg:col-span-6">
            <GlowCard className="h-full" glowColor="rgba(16, 185, 129, 0.08)">
              <div className="flex flex-col justify-center items-center h-full min-h-[300px] relative text-center">
                
                {/* 1. Placeholder State */}
                {!isCalculating && !showResult && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center space-y-4 p-6"
                  >
                    <PlayCircle className="w-12 h-12 text-secondary-text/40 animate-pulse" />
                    <h4 className="font-display font-bold text-sm text-white">Appraisal Console Idle</h4>
                    <p className="text-xs text-secondary-text max-w-xs leading-relaxed">
                      Click the "Predict Resale Value" button on the left spec sheet to run the mock appraiser simulation.
                    </p>
                  </motion.div>
                )}

                {/* 2. Loading State */}
                {isCalculating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center space-y-5 p-6"
                  >
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-brand-primary animate-spin" />
                      <Sparkles className="w-6 h-6 text-brand-primary animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-bold text-xs uppercase tracking-widest text-white">Simulating Appraisal</h4>
                      <p className="text-[10px] text-secondary-text font-mono transition-all duration-300">
                        {progressText}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 3. Output Result State */}
                <AnimatePresence mode="wait">
                  {showResult && !isCalculating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full p-6 flex flex-col justify-between h-full text-left space-y-5"
                    >
                      {/* Smooth Segmented Toggle Mode Selector */}
                      <div className="relative flex p-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setMode('buyer')}
                          className={`relative flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors z-10 ${
                            mode === 'buyer' ? 'text-white' : 'text-secondary-text'
                          }`}
                        >
                          {mode === 'buyer' && (
                            <motion.div
                              layoutId="mode-indicator"
                              className="absolute inset-0 bg-brand-primary rounded-lg -z-10"
                              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            />
                          )}
                          Buyer Mode
                        </button>
                        <button
                          onClick={() => setMode('seller')}
                          className={`relative flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors z-10 ${
                            mode === 'seller' ? 'text-white' : 'text-secondary-text'
                          }`}
                        >
                          {mode === 'seller' && (
                            <motion.div
                              layoutId="mode-indicator"
                              className="absolute inset-0 bg-brand-primary rounded-lg -z-10"
                              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            />
                          )}
                          Seller Mode
                        </button>
                      </div>

                      {/* Clean Output Details */}
                      <div className="space-y-4">
                        
                        {/* Estimated Market Value */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold text-secondary-text uppercase tracking-widest">Estimated Market Value</span>
                          <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-gradient-primary">
                            ₹{priceCount.toLocaleString('en-IN')}
                          </h3>
                        </div>

                        {/* Seller Asking Price & Price Difference */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="bg-white/2.5 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-secondary-text/70 uppercase block h-3.5 overflow-hidden">
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={mode}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.15 }}
                                  className="block"
                                >
                                  {mode === 'buyer' ? 'Seller Asking Price' : 'Your Asking Price'}
                                </motion.span>
                              </AnimatePresence>
                            </span>
                            <span className="text-white font-bold text-sm mt-1">
                              ₹{sellerPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="bg-white/2.5 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
                            <span className="text-[9px] font-mono text-secondary-text/70 uppercase">Price Difference</span>
                            <span className="text-white font-bold text-xs mt-1">
                              {diff === 0 ? (
                                'Matches Estimated Value'
                              ) : diff > 0 ? (
                                `${formattedDiff} Above Estimated Value`
                              ) : (
                                `${formattedDiff} Below Estimated Value`
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Deal Rating Status */}
                        <div className={`border rounded-xl p-3 flex items-center justify-between transition-all duration-300 ${statusBadgeColor}`}>
                          <span className="text-[9px] font-mono uppercase font-bold">Status</span>
                          <span className="font-bold text-xs sm:text-sm flex items-center space-x-1.5">
                            <span className="text-sm shrink-0">{statusIndicator}</span>
                            <span>{status}</span>
                          </span>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-[#050816]/60 border border-white/5 rounded-xl p-3.5 flex items-start space-x-2.5">
                          <AlertCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                          <div className="space-y-0.5 text-left">
                            <span className="text-[8px] font-mono font-bold text-secondary-text uppercase block">Recommendation</span>
                            <p className="text-[10px] text-white/90 leading-relaxed font-sans font-medium">
                              "{recommendation}"
                            </p>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </GlowCard>
          </div>

        </div>

      </div>
    </section>
  );
}
