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
      {/* Soft Edge Vignette for depth */}
      <div className="absolute inset-0 bg-vignette z-10 pointer-events-none" />

      {/* Layered Radial Glows */}
      <div className="absolute inset-0 bg-aurora-glow opacity-60" />
      
      {/* Animated Subtle Mesh Glow */}
      <div className="absolute inset-0 animated-mesh-glow opacity-30" />

      {/* Faint Grid Texture */}
      <div className="absolute inset-0 bg-grid-dots opacity-30" />
      <div className="absolute inset-0 bg-grid-cyber opacity-05" />

      {/* Deep Radial Glow Spheres */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -25, 25, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[-15%] left-[-10%] w-[65vw] h-[65vw] rounded-full bg-brand-primary/10 blur-[150px] pulse-circle"
      />

      <motion.div
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-[-15%] right-[-10%] w-[75vw] h-[75vw] rounded-full bg-brand-accent/5 blur-[180px] pulse-circle"
      />

      {/* Center ambient glow underneath content focus */}
      <div className="absolute top-[35%] left-[25%] w-[50%] h-[40%] rounded-full bg-indigo-500/5 blur-[160px] pointer-events-none" />

      {/* Subtle Top Spotlight Ray */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-brand-primary/10 via-brand-primary/2 to-transparent blur-[90px] opacity-70" />

      {/* Floating Ambient Particles */}
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
            y: [0, -50, 0],
            x: [0, Math.random() * 12 - 6, 0],
            opacity: [0.05, 0.4, 0.05],
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
