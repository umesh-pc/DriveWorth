import React, { useRef } from 'react';

/**
 * Reusable GlowCard component for premium SaaS styling.
 * When tilt=false or interactive=false, cards remain stationary without mouse tracking or lifting.
 */
export default function GlowCard({ 
  children, 
  className = '', 
  glowColor = 'rgba(37, 99, 235, 0.08)',
  tilt = false,
  interactive = false,
  variant = 'default', // 'primary', 'secondary', 'minimal', or 'default'
  ...props 
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!interactive || !tilt) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    if (tilt && variant !== 'minimal') {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleMouseLeave = () => {
    if (!interactive || !tilt) return;
    const card = cardRef.current;
    if (!card) return;
    if (tilt && variant !== 'minimal') {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`glass-card-minimal rounded-2xl sm:rounded-3xl overflow-hidden box-border ${className}`} {...props}>
        <div className="relative z-10 w-full h-full box-border">
          {children}
        </div>
      </div>
    );
  }

  // Stationary Glass Container variant
  return (
    <div
      ref={cardRef}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      className={`glass-panel-stationary rounded-2xl sm:rounded-3xl overflow-hidden box-border ${className}`}
      {...props}
    >
      <div className="relative z-10 w-full h-full box-border">
        {children}
      </div>
    </div>
  );
}
