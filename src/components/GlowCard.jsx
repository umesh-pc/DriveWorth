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
  variant = 'default', // 'primary', 'secondary', 'minimal', or 'default'
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

    if (tilt && variant !== 'minimal') {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 5; // Max 5 degrees of tilt
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    if (tilt && variant !== 'minimal') {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s ease, box-shadow 0.5s ease';
    }
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    if (tilt && variant !== 'minimal') {
      card.style.transition = 'border-color 0.5s ease, box-shadow 0.5s ease';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'glass-card-primary p-6 md:p-8';
      case 'secondary':
        return 'glass-card-secondary p-6';
      case 'minimal':
        return 'glass-card-minimal p-0';
      default:
        return 'glow-card-container';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`glass-card-minimal ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${variant !== 'default' ? getVariantStyles() : 'glow-card-container'} ${className}`}
      style={{ '--glow-color': glowColor }}
      {...props}
    >
      {variant === 'default' ? (
        <div className="glow-card-inner">
          <div className="glow-card-glow" />
          <div className="relative z-10 w-full h-full">
            {children}
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
}
