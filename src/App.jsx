import React from 'react';
import Background from './components/Background';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Problem from './components/Problem';
import Solution from './components/Solution';
import LiveDemo from './components/LiveDemo';
import Features from './components/Features';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-luxury-bg font-sans selection:bg-brand-primary/30 selection:text-white">
      {/* Premium Futuristic Animated Background */}
      <Background />

      {/* Transparent Scroll-Adaptive Navbar */}
      <Navbar />

      {/* Main Narrative Content Flow */}
      <main className="relative z-10">
        {/* 1. Fullscreen Hero Section with 3D sports car centerpiece */}
        <Hero />

        {/* 2. Live Telemetry & Statistics Ribbon */}
        <Stats />

        {/* 3. The Problem Section */}
        <Problem />

        {/* 3. The Solution / How It Works Section */}
        <Solution />

        {/* 4. Interactive Live Demo Estimation */}
        <LiveDemo />

        {/* 5. Why Choose DriveWorth Bento Grid Section */}
        <Features />

        {/* 6. Call To Action Banner */}
        <CTA />
      </main>

      {/* Premium Minimal Footer */}
      <Footer />
    </div>
  );
}
