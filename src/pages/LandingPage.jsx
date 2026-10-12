import React from 'react';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Problem from '../components/Problem';
import Solution from '../components/Solution';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-luxury-bg font-sans selection:bg-brand-primary/30 selection:text-white">
      {/* Premium Futuristic Animated Background */}
      <Background />

      {/* Transparent Scroll-Adaptive Navbar */}
      <Navbar />

      {/* Main Narrative Content Flow */}
      <main className="relative z-10">
        {/* 1. Fullscreen Hero Section */}
        <Hero />

        {/* 2. Live Telemetry & Statistics Ribbon */}
        <Stats />

        {/* 3. The Problem Section */}
        <Problem />

        {/* 4. The Solution / How It Works Section */}
        <Solution />

        {/* 5. Call To Action Banner */}
        <CTA />
      </main>

      {/* Premium Minimal Footer */}
      <Footer />
    </div>
  );
}
