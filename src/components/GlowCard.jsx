import React, { useRef } from 'react';

/**
 * Reusable GlowCard component for premium SaaS styling.
 * Supports mouse tracking cursor glow and 3D tilting.
 */
export default function GlowCard({ 
  children, 
  className = '', 
  glowColor = 'rgba(37, 99, 235, 0.08)',
  tilt = true,
  ...props 
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 6; // Max 6 degrees of tilt
      const rotateY = ((x - centerX) / centerX) * 6; // Max 6 degrees of tilt

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    if (tilt) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease, box-shadow 0.5s ease';
    }
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    if (tilt) {
      card.style.transition = 'border-color 0.5s ease, box-shadow 0.5s ease';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`glow-card-container ${className}`}
      style={{ '--glow-color': glowColor }}
      {...props}
    >
      <div className="glow-card-inner">
        <div className="glow-card-glow" />
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
