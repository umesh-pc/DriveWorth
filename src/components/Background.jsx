import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Background() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate static particle locations on mount to avoid hydration mismatch
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 4,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 bg-luxury-bg overflow-hidden select-none pointer-events-none">
      {/* Aurora Ambient Glow Layers */}
      <div className="absolute inset-0 bg-aurora-glow opacity-70" />
      
      {/* Animated Mesh Glow Background */}
      <div className="absolute inset-0 animated-mesh-glow opacity-40" />

      {/* Premium Dots Grid */}
      <div className="absolute inset-0 bg-grid-dots opacity-40" />

      {/* Cyber Grid for tech feeling, blended softly */}
      <div className="absolute inset-0 bg-grid-cyber opacity-10" />

      {/* Radial Blur Spheres (Soft SaaS Glows) */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-brand-primary/10 blur-[130px] pulse-circle"
      />

      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-brand-accent/5 blur-[160px] pulse-circle"
      />

      {/* Center ambient glow underneath content focus */}
      <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* Subtle Light Rays / Top Spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[500px] bg-gradient-to-b from-brand-primary/20 via-brand-primary/5 to-transparent blur-[2px] opacity-60" />
      <div className="absolute top-0 left-[49%] -translate-x-1/2 w-[3px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-[6px] opacity-40" />

      {/* Floating Sparkles/Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, Math.random() * 15 - 7.5, 0],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
